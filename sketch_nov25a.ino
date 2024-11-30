#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <WiFiClientSecure.h> // Untuk koneksi HTTPS

// Konfigurasi Wi-Fi
const char* ssid = "Ruang_MeetingBM";
const char* password = "Dutamall";

// Inisialisasi LCD (alamat I2C: 0x27, jika tidak berfungsi coba 0x3F)
LiquidCrystal_I2C lcd(0x27, 16, 2);  // 16 karakter, 2 baris

// Server API
const String serverUrl = "https://pc-led.vercel.app/api/relay";

// Pin relay
const int relay1Pin = D1;  // Untuk menghidupkan
const int relay2Pin = D2;  // Untuk restart

WiFiClientSecure wifiClientSecure;  // Objek WiFiClientSecure untuk HTTPS

void setup() {
  // Inisialisasi komunikasi I2C dengan pin custom (SDA = D6, SCL = D5)
  Wire.begin(D6, D5);

  // Inisialisasi LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Estabilishing");
  lcd.setCursor(0, 1);
  lcd.print("Connection...");

  // Inisialisasi relay
  pinMode(relay1Pin, OUTPUT);
  pinMode(relay2Pin, OUTPUT);

  // Set relay ke kondisi awal (mati)
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
  Serial.println("Wi-Fi Connected");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Wi-Fi tersambung!");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());
}

// Fungsi untuk mengirim status ke server
void sendStatusToServer() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(wifiClientSecure,"https://pc-led.vercel.app/api/pusher/trigger");
        http.addHeader("Content-Type", "application/json");

        String payload = "{\"channel\": \"iot-status\", \"event\": \"status-update\", \"data\": {\"ip\": \"" + WiFi.localIP().toString() + "\", \"isConnected\": true}}";
        int httpCode = http.POST(payload);

        if (httpCode > 0) {
            Serial.printf("Response code: %d\n", httpCode);
        } else {
            Serial.println("Failed to send status");
        }

        http.end();
    }
}

// Fungsi untuk mengambil dan memproses data dari server
void fetchDataFromServer() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Inisialisasi koneksi HTTPS
    wifiClientSecure.setInsecure();  // Membuat koneksi HTTPS tanpa verifikasi sertifikat
    http.begin(wifiClientSecure, serverUrl); // Gunakan WiFiClientSecure untuk HTTPS
    int httpCode = http.GET();

    // Periksa apakah permintaan berhasil
    if (httpCode == HTTP_CODE_OK) {
      String payload = http.getString();
      Serial.println("Response: " + payload);

      // Kontrol relay 1 (trigger sesaat untuk menghidupkan)
      if (payload.indexOf("\"relay1\":\"on\"") != -1) {
        triggerRelay(relay1Pin);
      }

      // Kontrol relay 2 (trigger sesaat untuk restart)
      if (payload.indexOf("\"relay2\":\"restarting\"") != -1) {
        triggerRelay(relay2Pin);
      }

    } else {
      Serial.print("HTTP request failed, error: ");
      Serial.println(http.errorToString(httpCode));
    }

    http.end();
  } else {
    Serial.println("Wi-Fi tidak tersambung. Coba ulang...");
  }
}


// Fungsi untuk mengaktifkan relay dan mematikannya kembali
void triggerRelay(int relayPin) {
  Serial.println("Trigger Relay");
  digitalWrite(relayPin, LOW);  // Aktifkan relay
  delay(100);                    // Tunggu 100 ms
  digitalWrite(relayPin, HIGH); // Nonaktifkan relay
}

void loop() {
  // Mengirim status ke server (jika diperlukan)
  sendStatusToServer();

  // Mengambil data dari server
  fetchDataFromServer();

  delay(2000);  // Interval pengecekan API
}
