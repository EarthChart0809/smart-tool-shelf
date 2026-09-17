#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>

#include "secrets.h"

WebServer server(80);

Servo servo1;
Servo servo2;
Servo servo3;

#define SERVO1_PIN 18
#define SERVO2_PIN 19
#define SERVO3_PIN 21
#define AUTO_LOCK_MS 8000

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
}

void loop()
{
    server.handleClient();
    checkAutoLock();
}