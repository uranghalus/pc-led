#include <Ethernet.h>
#include <LiquidCrystal_I2C.h>
#include <SPI.h>

// === KONFIGURASI ===
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192, 168, 15, 5);
IPAddress gateway(192, 168, 10, 1);
EthernetServer server(80);

// Konfigurasi Relay
const int relay1 = 2;
const int relay2 = 3;
const int relay3 = 4;
const int relay4 = 5;

// Konfigurasi LCD I2C
LiquidCrystal_I2C lcd(0x27, 16, 2);

// === FUNGSI UTAMA ===

void setup() {
  Serial.begin(9600);

  lcd.begin(16, 2);
  lcd.backlight();

  pinMode(relay1, OUTPUT);
  pinMode(relay2, OUTPUT);
  pinMode(relay3, OUTPUT);
  pinMode(relay4, OUTPUT);
  resetRelays();

  // Inisialisasi Ethernet
  if (Ethernet.begin(mac) == 0) {
    Ethernet.begin(mac, ip, gateway);
  }
  server.begin();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("IP: ");
  lcd.print(Ethernet.localIP());
  Serial.print("Server started at: ");
  Serial.println(Ethernet.localIP());
}

void loop() {
  EthernetClient client = server.available();
  if (client) {
    String request = parseRequest(client);
    handleRequest(client, request);
    client.stop();
  }

  // Memastikan koneksi Ethernet tetap terjaga
  Ethernet.maintain();
}

// Fungsi untuk membaca permintaan HTTP
String parseRequest(EthernetClient &client) {
  String line = "";
  while (client.connected()) {
    if (client.available()) {
      char c = client.read();
      line += c;
      if (c == '\n') {
        break;
      }
    }
  }
  return line;
}

// Fungsi untuk menangani permintaan HTTP
void handleRequest(EthernetClient &client, const String &request) {
  lcd.clear();
  if (request.indexOf("GET /trigger/power_on") >= 0) {
    trigger(relay1);
    sendResponse(client, "PC Powered On");
    lcd.print("PC Powered On");

  } else if (request.indexOf("GET /trigger/power_off") >= 0) {
    trigger(relay1);
    sendResponse(client, "PC Turning Off");
    lcd.print("PC Turning Off");

  } else if (request.indexOf("GET /trigger/restart") >= 0) {
    trigger(relay2);
    sendResponse(client, "PC Restarted");
    lcd.print("PC Restarted");

  } else {
    sendResponse(client, "404 Not Found", 404);
    lcd.print("Request Error");
  }
}

// Fungsi untuk mengirim respons HTTP
void sendResponse(EthernetClient &client, const char *message, int statusCode = 200) {
  client.println("HTTP/1.1 " + String(statusCode) + " OK");
  client.println("Content-Type: text/plain");
  client.println("Access-Control-Allow-Origin: *");
  client.println();
  client.println(message);
}

// Fungsi untuk memicu relay
void trigger(int relay) {
  Serial.print("Triggering relay on pin: ");
  Serial.println(relay);
  digitalWrite(relay, LOW);
  delay(800);
  digitalWrite(relay, HIGH);
}

// Fungsi untuk mereset semua relay
void resetRelays() {
  digitalWrite(relay1, HIGH);
  digitalWrite(relay2, HIGH);
  digitalWrite(relay3, HIGH);
  digitalWrite(relay4, HIGH);
}
