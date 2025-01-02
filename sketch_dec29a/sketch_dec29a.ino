#include <Ethernet.h>
#include <LiquidCrystal_I2C.h>
#include <SPI.h>

// === KONFIGURASI ===
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
// IPAddress ip(192, 168, 15, 5);
// IPAddress gateway(192, 168, 15, 1);
EthernetClient client;

const char* server = "https://pc-led.vercel.app"; // URL aplikasi Anda
const int port = 80;

const int relays[] = {2, 3, 4, 5}; // Konfigurasi Relay
LiquidCrystal_I2C lcd(0x27, 16, 2); // Konfigurasi LCD I2C
bool isConnected = false; 

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

  // Inisialisasi relai
  for (int relay : relays) {
    pinMode(relay, OUTPUT);
    digitalWrite(relay, HIGH);
  }

  lcd.setCursor(0, 0);
  lcd.print(F("Connecting..."));

  // Inisialisasi Ethernet
  if (Ethernet.begin(mac) == 0) {
    // Ethernet.begin(mac, ip, gateway);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(F("DHCP Failed"));
    while (true); // Berhenti jika DHCP gagal
  }

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F("Your IP:"));
  lcd.setCursor(0, 1);
  lcd.print(Ethernet.localIP());
  Serial.print("Assigned IP: ");
  Serial.println(Ethernet.localIP());
}

void loop() {
 checkConnection();

  // Jika terkoneksi, poll server untuk perintah
  if (isConnected) {
    pollServer();
  } else {
    delay(5000); // Tunggu 5 detik sebelum mencoba lagi
  }
}

void checkConnection() {
  if (client.connect(server, port)) {
    isConnected = true;
    client.stop();

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(F("Status:"));
    lcd.setCursor(0, 1);
    lcd.print(F("Connected"));
    Serial.println("Connected to server");
  } else {
    isConnected = false;

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(F("Status:"));
    lcd.setCursor(0, 1);
    lcd.print(F("No Connection"));
    Serial.println("Failed to connect");
  }

  delay(5000); // Periksa koneksi setiap 5 detik
}

void pollServer() {
  if (client.connect(server, port)) {
    client.println("GET /api/command HTTP/1.1");
    client.println("Host: https://pc-led.vercel.app");
    client.println("Connection: close");
    client.println();

    while (client.connected() || client.available()) {
      if (client.available()) {
        String response = client.readStringUntil('\n');
        if (response.startsWith("{")) {
          String command = parseCommand(response);
          executeCommand(command);
        }
      }
    }
    client.stop();
  }
}

String parseCommand(String response) {
  int start = response.indexOf("command\":\"") + 10;
  int end = response.indexOf("\"", start);
  return response.substring(start, end);
}

void executeCommand(String command) {
  lcd.clear();
  if (command == "power_on") {
    trigger(relays[0]);
    lcd.print(F("Power On"));
    Serial.println("Power On Command Executed");
  } else if (command == "power_off") {
    trigger(relays[0]);
    lcd.print(F("Power Off"));
    Serial.println("Power Off Command Executed");
  } else if (command == "restart") {
    trigger(relays[1]);
    lcd.print(F("Restart"));
    Serial.println("Restart Command Executed");
  } else {
    lcd.print(F("Idle"));
    Serial.println("Idle");
  }
}

void trigger(int relay) {
  digitalWrite(relay, LOW);
  delay(80);
  digitalWrite(relay, HIGH);
}
