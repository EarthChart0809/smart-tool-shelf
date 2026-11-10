#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

#include "secrets.h"

WebServer server(80);

Servo servo1;
Servo servo2;
Servo servo3;

#define SERVO1_PIN 18
#define SERVO2_PIN 19
#define SERVO3_PIN 21
#define AUTO_LOCK_MS 8000

// --- リードスイッチ ---
// 配線: 片側をGPIO、もう片側をGND(内部プルアップを使うので外付け抵抗は不要)
// 磁石が近い(引き出しが閉じている)とスイッチがONになり、GPIOがLOWになる想定。
// 逆(開いているときにLOW)なら REED_CLOSED_LEVEL を HIGH にする。
#define REED_CLOSED_LEVEL LOW

const int REED_COUNT = 2;
const int REED_PINS[REED_COUNT] = {25, 26};   // 引き出し1, 2
const int REED_BOX_IDS[REED_COUNT] = {1, 2};  // アプリ側の boxId と一致させる

#define SENSOR_POLL_MS 50    // 読み取り間隔
#define DEBOUNCE_COUNT 3     // 同じ値が3回続いたら確定(チャタリング対策)
#define HEARTBEAT_MS 10000   // 変化がなくても10秒ごとに報告
#define RETRY_MS 1000        // 送信失敗時の再送間隔

bool isUnlocked[4] = {false, false, false, false};
unsigned long unlockedAt[4] = {0, 0, 0, 0};

Servo* servoFor(int id)
{
    switch (id)
    {
        case 1: return &servo1;
        case 2: return &servo2;
        case 3: return &servo3;
        default: return nullptr;
    }
}

void unlockBox(int id)
{
    Servo* s = servoFor(id);
    if (!s) return;

    s->write(90);
    isUnlocked[id] = true;
    unlockedAt[id] = millis();
}

void lockBox(int id)
{
    Servo* s = servoFor(id);
    if (!s) return;

    s->write(0);
    isUnlocked[id] = false;
}

void lockAll()
{
    for (int id = 1; id <= 3; id++) lockBox(id);
}

void checkAutoLock()
{
    unsigned long now = millis();
    for (int id = 1; id <= 3; id++)
    {
        if (isUnlocked[id] && (now - unlockedAt[id] >= AUTO_LOCK_MS))
        {
            lockBox(id);
        }
    }
}

// ブラウザ(操作端末)から直接叩かれるようになるため、CORSヘッダーを必ず付与する
void addCorsHeaders()
{
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    // Chrome の Private Network Access (PNA) 対策:
    // 「公開サイトからプライベートIPへのアクセスを許可する」ことを明示する
    server.sendHeader("Access-Control-Allow-Private-Network", "true");
}

// preflight (OPTIONS) リクエストへの応答
void handleOptions()
{
    addCorsHeaders();
    server.send(204);
}

void handleUnlock()
{
    addCorsHeaders();

    if (!server.hasArg("plain"))
    {
        server.send(400, "text/plain", "No Body");
        return;
    }

    DynamicJsonDocument doc(512);
    deserializeJson(doc, server.arg("plain"));

    JsonArray boxes = doc["boxes"];

    for (JsonVariant box : boxes)
    {
        unlockBox(box.as<int>());
    }

    server.send(200, "application/json", "{\"success\":true}");
}

bool postDrawerStates(const bool isOpen[])
{
    if (WiFi.status() != WL_CONNECTED) return false;

    WiFiClientSecure client;
    client.setInsecure(); // 学内PBL向けの簡易設定(証明書の検証を省略)

    HTTPClient http;
    http.setTimeout(5000);

    if (!http.begin(client, API_URL)) return false;

    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", DEVICE_API_KEY);

    JsonDocument doc;
    JsonObject drawers = doc["drawers"].to<JsonObject>();

    for (int i = 0; i < REED_COUNT; i++)
    {
        drawers[String(REED_BOX_IDS[i])] = isOpen[i];
    }

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);
    http.end();

    Serial.printf("sensor POST -> %d\n", code);

    return code == 200;
}

void sensorTask(void *)
{
    for (int i = 0; i < REED_COUNT; i++)
    {
        pinMode(REED_PINS[i], INPUT_PULLUP);
    }

    vTaskDelay(pdMS_TO_TICKS(100)); // プルアップが安定するのを待つ

    bool stableOpen[REED_COUNT];
    bool lastRaw[REED_COUNT];
    int sameCount[REED_COUNT];

    for (int i = 0; i < REED_COUNT; i++)
    {
        bool raw = (digitalRead(REED_PINS[i]) != REED_CLOSED_LEVEL);
        stableOpen[i] = raw;
        lastRaw[i] = raw;
        sameCount[i] = DEBOUNCE_COUNT;
    }

    bool needSend = true; // 起動直後に現在の状態を送る
    unsigned long lastAttempt = 0;

    for (;;)
    {
        for (int i = 0; i < REED_COUNT; i++)
        {
            bool raw = (digitalRead(REED_PINS[i]) != REED_CLOSED_LEVEL);

            if (raw == lastRaw[i])
            {
                if (sameCount[i] < DEBOUNCE_COUNT) sameCount[i]++;
            }
            else
            {
                lastRaw[i] = raw;
                sameCount[i] = 0;
            }

            if (sameCount[i] >= DEBOUNCE_COUNT && raw != stableOpen[i])
            {
                stableOpen[i] = raw;
                needSend = true;
                Serial.printf("drawer %d: %s\n", REED_BOX_IDS[i], raw ? "OPEN" : "CLOSED");
            }
        }

        unsigned long now = millis();
        unsigned long sinceAttempt = now - lastAttempt;

        if ((needSend && sinceAttempt >= RETRY_MS) || sinceAttempt >= HEARTBEAT_MS)
        {
            lastAttempt = now;

            if (postDrawerStates(stableOpen))
            {
                needSend = false;
            }
        }

        vTaskDelay(pdMS_TO_TICKS(SENSOR_POLL_MS));
    }
}

void setup()
{
    Serial.begin(115200);
    delay(2000);

    ESP32PWM::allocateTimer(0);
    ESP32PWM::allocateTimer(1);
    ESP32PWM::allocateTimer(2);
    ESP32PWM::allocateTimer(3);

    servo1.setPeriodHertz(50);
    servo2.setPeriodHertz(50);
    servo3.setPeriodHertz(50);

    servo1.attach(SERVO1_PIN, 500, 2400);
    servo2.attach(SERVO2_PIN, 500, 2400);
    servo3.attach(SERVO3_PIN, 500, 2400);

    lockAll();

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println(WiFi.localIP());

    server.on("/unlock", HTTP_POST, handleUnlock);
    server.on("/unlock", HTTP_OPTIONS, handleOptions); // preflight用

    server.onNotFound([]() {
        server.send(404, "text/plain", "Not Found");
    });

    server.begin();

    xTaskCreatePinnedToCore(
        sensorTask,   // 実行する関数
        "sensorTask", // タスク名
        8192,         // スタックサイズ(HTTPS通信には大きめが必要)
        nullptr,
        1,            // 優先度
        nullptr,
        0             // コア0で実行(loop()はコア1)
    );
}

void loop()
{
    server.handleClient();
    checkAutoLock();
}