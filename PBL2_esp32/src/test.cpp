#include <ESP32Servo.h>

Servo myServo;

const int servoPin = 18;

void setup() {
  // PWM制御の初期化
  myServo.setPeriodHertz(50);
  myServo.attach(servoPin, 500, 2500);

  // 中立位置
  myServo.writeMicroseconds(1500);
  delay(1000);
}

void loop() {
  // 少しずつ位置を変えて動作確認
  myServo.writeMicroseconds(500);
  delay(1000);

  myServo.writeMicroseconds(1500);
  delay(1000);

  myServo.writeMicroseconds(1700);
  delay(1000);

  myServo.writeMicroseconds(2300);
  delay(1000);
}
