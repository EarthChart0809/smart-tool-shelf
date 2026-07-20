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

// 解錠から何ミリ秒後に自動施錠するか
#define AUTO_LOCK_MS 8000

// 各ボックスが「今解錠中かどうか」と「解錠した時刻」を管理する
bool isUnlocked[4] = {false, false, false, false}; // index 1〜3を使う
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

    Serial.printf("box %d unlocked\n", id);
}

void lockBox(int id)
{
    Servo* s = servoFor(id);
    if (!s) return;

    s->write(0);
    isUnlocked[id] = false;

    Serial.printf("box %d auto-locked\n", id);
}

void lockAll()
{
    for (int id = 1; id <= 3; id++)
    {
        lockBox(id);
    }
}

// loop() から毎回呼ぶ。時間切れのボックスを自動施錠する
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

void handleUnlock()
{
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

    server.onNotFound([]() {
        server.send(404, "text/plain", "Not Found");
    });

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println(WiFi.localIP());

    server.on("/unlock", HTTP_POST, handleUnlock);

    server.begin();
}

void loop()
{
    server.handleClient();
    checkAutoLock();
}