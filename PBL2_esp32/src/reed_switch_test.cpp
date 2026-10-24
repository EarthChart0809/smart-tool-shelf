#include <Arduino.h>

const int REED_PIN = 18;

void setup() {
    Serial.begin(115200);

    pinMode(REED_PIN, INPUT_PULLUP);

    Serial.println("Reed switch test started.");
}

void loop() {
    int state = digitalRead(REED_PIN);

    if (state == LOW) {
        Serial.println("CLOSED: Magnet detected");
    } else {
        Serial.println("OPEN: Magnet not detected");
    }

    delay(200);
}
