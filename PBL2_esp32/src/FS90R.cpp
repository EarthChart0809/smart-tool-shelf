// #include <Arduino.h>
// #include <WiFi.h>
// #include <WebServer.h>
// #include <ESP32Servo.h>

// const char* ssid = "kamei.ryo";
// const char* password = "10666397Kamei";

// WebServer server(80);
// Servo servo1;

// const int SERVO_PIN = 18;
// const int SERVO_STOP = 90;
// const int SERVO_UNLOCK = 60;

// void handleRoot() {
//     String html = R"rawliteral(
//     <!DOCTYPE html>
//     <html>
//     <head>
//         <meta charset="utf-8">
//         <title>スマート工具棚</title>
//         <meta name="viewport" content="width=device-width, initial-scale=1">
//         <script>
//             function send(path) {
//                 fetch(path, { method: "GET", cache: "no-store" });
//             }

//             function startUnlock() {
//                 send("/open");
//             }

//             function stopUnlock() {
//                 send("/stop");
//             }
//         </script>
//     </head>
//     <body>
//         <h1>スマート工具棚</h1>

//         <button type="button"
//                 onmousedown="startUnlock()"
//                 onmouseup="stopUnlock()"
//                 onmouseleave="stopUnlock()"
//                 ontouchstart="startUnlock()"
//                 ontouchend="stopUnlock()">
//             開錠
//         </button>

//         <p>押している間だけ回転し、離すと停止します。</p>
//     </body>
//     </html>
//     )rawliteral";

//     server.send(200, "text/html", html);
// }

// void handleOpen() {
//     servo1.write(SERVO_UNLOCK);
//     server.send(200, "text/plain", "unlock");
// }

// void handleStop() {
//     servo1.write(SERVO_STOP);
//     server.send(200, "text/plain", "stop");
// }

// void setup() {
//     Serial.begin(115200);

//     servo1.attach(SERVO_PIN);
//     servo1.write(SERVO_STOP);

//     WiFi.begin(ssid, password);

//     Serial.print("WiFi接続中");

//     while (WiFi.status() != WL_CONNECTED) {
//         delay(500);
//         Serial.print(".");
//     }

//     Serial.println();
//     Serial.print("IPアドレス: ");
//     Serial.println(WiFi.localIP());

//     server.on("/", handleRoot);
//     server.on("/open", handleOpen);
//     server.on("/stop", handleStop);

//     server.begin();
// }

// void loop() {
//     server.handleClient();
// }