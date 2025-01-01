#include <Ethernet.h>
#include <LiquidCrystal_I2C.h>
#include <SPI.h>

// === KONFIGURASI ===
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192, 168, 15, 5);
IPAddress gateway(192, 168, 15, 1);
EthernetServer server(80);

const int relays[] = {2, 3, 4, 5}; // Konfigurasi Relay
LiquidCrystal_I2C lcd(0x27, 16, 2); // Konfigurasi LCD I2C

void sendResponse(EthernetClient &client, const char *message, int statusCode = 200) {
  client.print(F("HTTP/1.1 "));
  client.print(statusCode);
  client.println(F(" OK"));
  client.println(F("Content-Type: text/plain"));
  client.println(F("Access-Control-Allow-Origin: *"));
  client.println(F("Connection: close\n"));
  client.println(message);
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

  if (Ethernet.begin(mac) == 0) {
    Ethernet.begin(mac, ip, gateway);
  }

  server.begin();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F("Your IP:"));
  lcd.setCursor(0, 1);
  lcd.print(Ethernet.localIP());
  Serial.println(Ethernet.localIP());
}

void loop() {
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
  unsigned long timeout = millis() + 1000;
  while (client.connected() && millis() < timeout) {
    if (client.available()) {
      char c = client.read();
      request += c;
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

void trigger(int relay) {
  digitalWrite(relay, LOW);
  delay(80);
  digitalWrite(relay, HIGH);
}
