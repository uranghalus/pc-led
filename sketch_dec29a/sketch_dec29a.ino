#include <Ethernet.h>
#include <LiquidCrystal_I2C.h>
#include <SPI.h>

// === KONFIGURASI ===
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192, 168, 15, 5);
IPAddress gateway(192, 168, 10, 1);
EthernetServer server(80);

// Konfigurasi Relay
int relay1 = 2;
int relay2 = 3;
int relay3 = 4;
int relay4 = 5;

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
  digitalWrite(relay1, HIGH);
  digitalWrite(relay2, HIGH);
  digitalWrite(relay3, HIGH);
  digitalWrite(relay4, HIGH);

  // Inisialisasi Ethernet
  Ethernet.begin(mac, ip, gateway);
  server.begin();

  // Mengecek status koneksi Ethernet
  if (Ethernet.hardwareStatus() == EthernetNoHardware) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Ethernet not found");
    lcd.setCursor(0, 1);
    lcd.print("Check LAN cable");
    while (true);  // Menahan program jika Ethernet tidak terhubung
  } else {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Connected to LAN");
    lcd.setCursor(0, 1);
    lcd.print("IP: ");
    lcd.print(ip);
  }

  // Menampilkan IP di Serial Monitor
  Serial.print("Server started at: ");
  Serial.println(ip);
}

void loop() {
  EthernetClient client = server.available();
  if (client) {
    String request = "";
    boolean currentLineIsBlank = true;
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        request += c;

        if (c == '\n' && currentLineIsBlank) {
          handleRequest(client, request);  // Call the request handler function
          break;
        }

        if (c == '\n') {
          currentLineIsBlank = true;
        } else if (c != '\r') {
          currentLineIsBlank = false;
        }
      }
    }
    delay(1);
    client.stop();
    request = "";
  }
}

// Function to handle requests and trigger actions
void handleRequest(EthernetClient &client, String &request) {
  if (request.indexOf("GET /trigger/power_on") >= 0) {
    trigger(relay1);
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/plain");
    client.println("Access-Control-Allow-Origin: *");
    client.println();
    client.println("PC Powered On");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("PC Powered On");

  } else if (request.indexOf("GET /trigger/power_off") >= 0) {
    trigger(relay1);
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/plain");
    client.println("Access-Control-Allow-Origin: *");
    client.println();
    client.println("PC Turning Off");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("PC Turning Off");

  } else if (request.indexOf("GET /trigger/restart") >= 0) {
    trigger(relay3);  // Trigger restart relay
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/plain");
    client.println("Access-Control-Allow-Origin: *");
    client.println();
    client.println("PC Restarted");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("PC Restarted");

  } else if (request.indexOf("GET /trigger/relay2") >= 0) {
    trigger(relay2);
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/plain");
    client.println("Access-Control-Allow-Origin: *");
    client.println();
    client.println("Relay2 Triggered");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Relay2 Triggered");

  } else {
    client.println("HTTP/1.1 404 Not Found");
    client.println("Content-Type: text/plain");
    client.println("Access-Control-Allow-Origin: *");
    client.println();
    client.println("Not Found");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Request Error");
  }
}

// Function to trigger relay
void trigger(int relay) {
  Serial.print("Triggering relay on pin: ");
  Serial.println(relay);
  digitalWrite(relay, LOW);
  delay(800);
  digitalWrite(relay, HIGH);
}
