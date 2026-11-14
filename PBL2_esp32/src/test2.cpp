// #include <Arduino.h>

// HardwareSerial ServoSerial(2);

// const int SERVO_RX_PIN = 16;
// const int SERVO_TX_PIN = 17;
// const int SERVO_ID = 1;

// const uint32_t SERVO_BAUDRATE = 1000000;

// // STS3215のレジスタ
// const uint8_t ADDR_TORQUE_ENABLE = 40;
// const uint8_t ADDR_GOAL_POSITION = 42;
// const uint8_t ADDR_GOAL_SPEED = 46;

// void writeRegister(uint8_t address, const uint8_t *data, uint8_t dataLength) {
//   uint8_t length = dataLength + 3;
//   uint8_t checksum = SERVO_ID + length + 0x03 + address;

//   for (uint8_t i = 0; i < dataLength; i++) {
//     checksum += data[i];
//   }

//   ServoSerial.write(0xFF);
//   ServoSerial.write(0xFF);
//   ServoSerial.write(SERVO_ID);
//   ServoSerial.write(length);
//   ServoSerial.write(0x03);
//   ServoSerial.write(address);

//   for (uint8_t i = 0; i < dataLength; i++) {
//     ServoSerial.write(data[i]);
//   }

//   ServoSerial.write(~checksum);
//   ServoSerial.flush();
// }

// void setTorque(bool enabled) {
//   uint8_t value = enabled ? 1 : 0;
//   writeRegister(ADDR_TORQUE_ENABLE, &value, 1);
// }

// void setSpeed(uint16_t speed) {
//   uint8_t data[2] = {
//     static_cast<uint8_t>(speed & 0xFF),
//     static_cast<uint8_t>((speed >> 8) & 0xFF)
//   };

//   writeRegister(ADDR_GOAL_SPEED, data, 2);
// }

// void setAngle(float angle) {
//   angle = constrain(angle, 0.0f, 360.0f);

//   // 0〜360度を0〜4095に変換
//   uint16_t position = static_cast<uint16_t>(angle * 4095.0f / 360.0f);

//   uint8_t data[2] = {
//     static_cast<uint8_t>(position & 0xFF),
//     static_cast<uint8_t>((position >> 8) & 0xFF)
//   };

//   writeRegister(ADDR_GOAL_POSITION, data, 2);
// }

// void setup() {
//   ServoSerial.begin(
//     SERVO_BAUDRATE,
//     SERIAL_8N1,
//     SERVO_RX_PIN,
//     SERVO_TX_PIN
//   );

//   delay(500);

//   setTorque(true);
//   setSpeed(200);
// }

// void loop() {
//   setAngle(0);
//   delay(3000);

//   setAngle(90);
//   delay(3000);

//   setAngle(180);
//   delay(3000);

//   setAngle(270);
//   delay(3000);

//   setAngle(360);
//   delay(3000);
// }