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

void unlockBox(int id)
{
    switch(id)
    {
        case 1:
            servo1.write(90);
            break;

        case 2:
            servo2.write(90);
            break;

        case 3:
            servo3.write(90);
            break;
    }
}

void lockAll()
{
    servo1.write(0);
    servo2.write(0);
    servo3.write(0);
}

void handleUnlock()
{
    if(!server.hasArg("plain"))
    {
        server.send(400,"text/plain","No Body");
        return;
    }

    DynamicJsonDocument doc(512);

    deserializeJson(doc,server.arg("plain"));

    JsonArray boxes = doc["boxes"];

    for(JsonVariant box : boxes)
    {
        unlockBox(box.as<int>());
    }

    server.send(200,"application/json","{\"success\":true}");
}

void setup()
{
    Serial.begin(115200);

    servo1.attach(SERVO1_PIN);
    servo2.attach(SERVO2_PIN);
    servo3.attach(SERVO3_PIN);

    lockAll();

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    server.onNotFound([]() {
    Serial.println("=== NOT FOUND ===");
    Serial.print("URI: ");
    Serial.println(server.uri());

    Serial.print("Method: ");
    Serial.println(server.method() == HTTP_GET ? "GET" : "POST");

    server.send(404, "text/plain", "Not Found");
    });

    while(WiFi.status()!=WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println(WiFi.localIP());

    server.on("/unlock",HTTP_POST,handleUnlock);

    server.begin();
}

void loop()
{
    server.handleClient();
}