#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFiClientSecure.h>

// Konfigurasi Wi-Fi
const char* ssid = "Galaxy A50s2BEF";
const char* password = "jangansampai57";

// Inisialisasi LCD (alamat I2C: 0x27, jika tidak berfungsi coba 0x3F)
LiquidCrystal_I2C lcd(0x27, 16, 2);  // 16 karakter, 2 baris

// Server API
const char* serverUrl = "https://pc-led.vercel.app/api/relay";
const char* statusUrl = "https://pc-led.vercel.app/api/pusher/trigger";

// Pin relay
const int relay1Pin = D1;  // Untuk menghidupkan
const int relay2Pin = D2;  // Untuk restart

WiFiClientSecure wifiClient;  // Objek untuk HTTPS (dapat menggunakan WiFiClient jika HTTP)

// Fungsi Setup
void setup() {
  // Inisialisasi komunikasi I2C dengan pin custom (SDA = D6, SCL = D5)
  Wire.begin(D6, D5);

  // Inisialisasi LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Establishing");
  lcd.setCursor(0, 1);
  lcd.print("Connection...");

  // Inisialisasi relay
  pinMode(relay1Pin, OUTPUT);
  pinMode(relay2Pin, OUTPUT);
  digitalWrite(relay1Pin, HIGH);
  digitalWrite(relay2Pin, HIGH);

  // Serial dan Wi-Fi
  Serial.begin(115200);
  Serial.print("Menghubungkan ke Wi-Fi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  // Setelah terhubung ke Wi-Fi
  Serial.println("\nWi-Fi Connected");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Wi-Fi tersambung!");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());

  // Abaikan verifikasi sertifikat HTTPS sementara
  wifiClient.setInsecure();
}

// Fungsi untuk mengirim status ke server
void sendStatusToServer() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(wifiClient, statusUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"channel\": \"iot-status\", \"event\": \"status-update\", \"data\": {\"ip\": \"" + WiFi.localIP().toString() + "\", \"isConnected\": true}}";
    int httpCode = http.POST(payload);

    if (httpCode > 0) {
      Serial.printf("Response code: %d\n", httpCode);
      if (httpCode == HTTP_CODE_OK) {
        String response = http.getString();
        Serial.println("Response: " + response);
      }
    } else {
      Serial.println("Failed to send status");
    }

    http.end();
  } else {
    Serial.println("Wi-Fi tidak tersambung.");
  }
}

// Fungsi untuk mengambil dan memproses data dari server
void fetchDataFromServer() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(wifiClient, serverUrl);
    Serial.println("Requesting: " + String(serverUrl));
    int httpCode = http.GET();
    Serial.println("HTTP Response Code: " + String(httpCode));

    if (httpCode == HTTP_CODE_OK) {
      String payload = http.getString();
      Serial.println("Response: " + payload);

      // Kontrol relay 1
      if (payload.indexOf("\"relay1\":\"on\"") != -1) {
        triggerRelay(relay1Pin, "Relay 1 Aktif");
      }

      // Kontrol relay 2
      if (payload.indexOf("\"relay2\":\"restarting\"") != -1) {
        triggerRelay(relay2Pin, "Relay 2 Restart");
      }

    } else {
      Serial.printf("HTTP error: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
  } else {
    Serial.println("Wi-Fi tidak tersambung.");
  }
}

// Fungsi untuk mengaktifkan relay dan mematikannya kembali
void triggerRelay(int relayPin, String message) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(message);
  digitalWrite(relayPin, LOW);
  delay(100);  // Durasi aktivasi relay
  digitalWrite(relayPin, HIGH);
  Serial.println(message);
}

void loop() {
  sendStatusToServer();   // Mengirim status perangkat ke server
  fetchDataFromServer();  // Mengambil status relay dari server
  delay(1000);            // Interval pengecekan API
}
