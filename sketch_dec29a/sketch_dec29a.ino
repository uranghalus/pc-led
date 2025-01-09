#include <Ethernet.h>
#include <LiquidCrystal_I2C.h>
#include <SPI.h>
#include <EthernetICMP.h>
#include <EthernetClient.h>

// === KONFIGURASI ===
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192, 168, 15, 5);
IPAddress subnet(255, 255, 240, 0);
IPAddress gateway(192, 168, 10, 1); // Perbaikan gateway
EthernetServer server(80);

IPAddress pingAddr(192, 168, 15, 6);
SOCKET pingSocket = 0;

const int relays[] = {2, 3, 4, 5};
LiquidCrystal_I2C lcd(0x27, 16, 2);
EthernetICMPPing ping(pingSocket, (uint16_t)random(0, 255));
bool isOnline = false;

unsigned long lastCheckTime = 0;
const unsigned long checkInterval = 5000;

const char *serverIP = "192.168.15.10";
const int serverPort = 3000;

void sendResponse(EthernetClient &client, const char *message, int statusCode = 200) {
 client.print(F("HTTP/1.1 "));
  client.print(statusCode);
  client.println(F(" OK"));
  client.println(F("Content-Type: text/plain")); // Gunakan teks biasa
  client.println(F("Connection: close"));
  client.println();
  client.println(message); // Kirimkan hanya pesan teks
  client.stop(); // Pastikan koneksi ditutup
}

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.backlight();
  
  for (int relay : relays) {
    pinMode(relay, OUTPUT);
    digitalWrite(relay, HIGH);
  }

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F("Connecting..."));
  delay(3000);

  Ethernet.begin(mac, ip, gateway, gateway, subnet); // Gunakan subnet
  server.begin();

  ipArduino();
}

void loop() {
  if (millis() - lastCheckTime >= checkInterval) {
    checkPcStatus();
    sendPcStatusToServer(isOnline);
    lastCheckTime = millis();
    ipArduino();
  }
  EthernetClient client = server.available();
  if (client) {
    String request = parseRequest(client);
    if (request.length() > 0) {
      handleRequest(client, request);
    }
    client.stop();
  }
  Ethernet.maintain();
}

String parseRequest(EthernetClient &client) {
  String request;
  unsigned long timeout = millis() + 5000; // Timeout 5 detik
  while (client.connected() && millis() < timeout) {
    if (client.available()) {
      request += (char)client.read();
      if (request.endsWith("\r\n\r\n")) break;
    }
  }
  return (request.length() > 512) ? "" : request;
}

void handleRequest(EthernetClient &client, const String &request) {
  lcd.clear();
  if (request.indexOf(F("GET /trigger/power_on")) >= 0) {
    trigger(relays[0]);
    sendResponse(client, "PC Powered On");
    lcd.print(F("PC Powered On"));
  } else if (request.indexOf(F("GET /trigger/power_off")) >= 0) {
    trigger(relays[0]);
    sendResponse(client, "PC Turning Off");
    lcd.print(F("PC Turning Off"));
  } else if (request.indexOf(F("GET /trigger/restart")) >= 0) {
    trigger(relays[1]);
    sendResponse(client, "PC Restarted");
    lcd.print(F("PC Restarted"));
  } else {
    sendResponse(client, "404 Not Found", 404);
    lcd.print(F("Request Error"));
  }
}

void checkPcStatus() {
  EthernetICMPEchoReply echoReply = ping(pingAddr, 4);
  isOnline = (echoReply.status == SUCCESS);
  String pcStatus = isOnline ? "Online" : "Offline";
  Serial.print(F("PC is "));
  Serial.println(pcStatus);
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F("PC Status:"));
  lcd.setCursor(0, 1);
  lcd.print(pcStatus);
}

void ipArduino() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F("Your IP:"));
  lcd.setCursor(0, 1);
  lcd.print(Ethernet.localIP());
  Serial.println(Ethernet.localIP());
}

void sendPcStatusToServer(bool isOnline) {
  EthernetClient client;
  if (!client.connect(serverIP, serverPort)) {
    Serial.println(F("Failed to connect to server"));
    return;
  }
  String url = "/api/update-status?status=" + String(isOnline ? "online" : "offline");
  client.print(F("GET "));
  client.print(url);
  client.print(F(" HTTP/1.1\r\n"));
  client.print(F("Host: "));
  client.print(serverIP);
  client.print(F("\r\n"));
  client.print(F("Connection: close\r\n"));
  client.print(F("\r\n"));
  client.stop();
}

void trigger(int relay) {
  digitalWrite(relay, LOW);
  delay(200);
  digitalWrite(relay, HIGH);
}
