// #include <Arduino.h>
// #include <WiFi.h>
// #include <WebServer.h>
// #include <ESP32Servo.h>

// #include "secrets.h"

// WebServer server(80);
// Servo servos[4];

// const int SERVO_PINS[4] = {17, 18, 19, 21};
// const int SERVO_CLOSE_ANGLE = 0;
// const int SERVO_OPEN_ANGLE = 90;

// void setServoAngle(int index, int angle) {
//     if (index < 0 || index >= 4) {
//         return;
//     }

//     servos[index].write(angle);
// }

// void handleRoot() {
//     String html = R"rawliteral(
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="utf-8">
//         <title>スマート工具棚</title>
//         <meta name="viewport" content="width=device-width, initial-scale=1">
//         <style>
//             body {
//                 font-family: sans-serif;
//                 max-width: 720px;
//                 margin: 0 auto;
//                 padding: 24px;
//             }

//             .servo-card {
//                 border: 1px solid #ccc;
//                 border-radius: 12px;
//                 padding: 16px;
//                 margin-bottom: 16px;
//             }

//             .buttons {
//                 display: flex;
//                 gap: 12px;
//                 flex-wrap: wrap;
//             }

//             button {
//                 padding: 12px 16px;
//                 font-size: 16px;
//             }
//         </style>
//     </head>
//     <body>
//         <h1>スマート工具棚</h1>

//         <div class="servo-card">
//             <h2>サーボ1</h2>
//             <div class="buttons">
//                 <form action="/servo" method="get">
//                     <input type="hidden" name="index" value="1">
//                     <input type="hidden" name="action" value="open">
//                     <button type="submit">開錠</button>
//                 </form>
//                 <form action="/servo" method="get">
//                     <input type="hidden" name="index" value="1">
//                     <input type="hidden" name="action" value="close">
//                     <button type="submit">施錠</button>
//                 </form>
//             </div>
//         </div>

//         <div class="servo-card">
//             <h2>サーボ2</h2>
//             <div class="buttons">
//                 <form action="/servo" method="get">
//                     <input type="hidden" name="index" value="2">
//                     <input type="hidden" name="action" value="open">
//                     <button type="submit">開錠</button>
//                 </form>
//                 <form action="/servo" method="get">
//                     <input type="hidden" name="index" value="2">
//                     <input type="hidden" name="action" value="close">
//                     <button type="submit">施錠</button>
//                 </form>
//             </div>
//         </div>

//         <div class="servo-card">
//             <h2>サーボ3</h2>
//             <div class="buttons">
//                 <form action="/servo" method="get">
//                     <input type="hidden" name="index" value="3">
//                     <input type="hidden" name="action" value="open">
//                     <button type="submit">開錠</button>
//                 </form>
//                 <form action="/servo" method="get">
//                     <input type="hidden" name="index" value="3">
//                     <input type="hidden" name="action" value="close">
//                     <button type="submit">施錠</button>
//                 </form>
//             </div>
//         </div>

//         <div class="servo-card">
//             <h2>サーボ4</h2>
//             <div class="buttons">
//                 <form action="/servo" method="get">
//                     <input type="hidden" name="index" value="4">
//                     <input type="hidden" name="action" value="open">
//                     <button type="submit">開錠</button>
//                 </form>
//                 <form action="/servo" method="get">
//                     <input type="hidden" name="index" value="4">
//                     <input type="hidden" name="action" value="close">
//                     <button type="submit">施錠</button>
//                 </form>
//             </div>
//         </div>
//     </body>
//     </html>
//     )rawliteral";

//     server.send(200, "text/html", html);
// }

// void handleServo() {
//     if (!server.hasArg("index") || !server.hasArg("action")) {
//         server.send(400, "text/plain", "missing index or action");
//         return;
//     }

//     const int index = server.arg("index").toInt() - 1;
//     const String action = server.arg("action");

//     if (index < 0 || index >= 4) {
//         server.send(400, "text/plain", "invalid index");
//         return;
//     }

//     if (action == "open") {
//         setServoAngle(index, SERVO_OPEN_ANGLE);
//     } else if (action == "close") {
//         setServoAngle(index, SERVO_CLOSE_ANGLE);
//     } else {
//         server.send(400, "text/plain", "invalid action");
//         return;
//     }

//     server.sendHeader("Location", "/");
//     server.send(303);
// }

// void setup() {
//     Serial.begin(115200);

//     for (int i = 0; i < 4; i++) {
//         servos[i].attach(SERVO_PINS[i]);
//         servos[i].write(SERVO_CLOSE_ANGLE);
//     }

//     WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

//     Serial.print("WiFi接続中");

//     while (WiFi.status() != WL_CONNECTED) {
//         delay(500);
//         Serial.print(".");
//     }

//     Serial.println();
//     Serial.print("IPアドレス: ");
//     Serial.println(WiFi.localIP());

//     server.on("/", handleRoot);
//     server.on("/servo", handleServo);

//     server.begin();
// }

// void loop() {
//     server.handleClient();
// }