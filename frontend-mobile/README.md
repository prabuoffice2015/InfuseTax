# InfuseTax Mobile POS Application (Flutter / Android & iOS) 📱

Cross-platform mobile counter POS terminal for **InfuseTax**, providing tax filing desks, Bluetooth thermal printing, and dynamic UPI QR wallet recharges on mobile and tablet devices.

---

## 🌟 Key Capabilities:

1. **Retailer POS Desks**:
   - GST Registration Wizard (Proprietorship, Partnership, Pvt Ltd).
   - Form 16 AI OCR Income Tax Optimizer.
   - PAN Card (Form 49A / Reprint / e-KYC).
   - Passport Seva Suvidha.
   - Dynamic Government Certificates.
2. **Dynamic NPCI UPI QR Instant Top-Up**:
   - Direct UPI deep-link integration launching Google Pay, PhonePe, Paytm, or BHIM.
3. **Hardware & Peripheral Support**:
   - **ESC/POS Bluetooth Thermal Printing**: 58mm & 80mm receipts for wireless handheld POS devices (Sunmi, NGX, Essae).
   - **Camera Document OCR Scanner**: Direct camera scanning of Form 16, Electricity Bills, and Aadhaar/PAN.
4. **Master Distributor Network Screen**:
   - Downline store balances and instant P2P wallet balance disbursals.

---

## 🛠️ How to Build & Run:

### 1. Install Dependencies:
```bash
cd frontend-mobile
flutter pub get
```

### 2. Run in Debug Mode:
```bash
flutter run
```

### 3. Build Production Android Release APK:
```bash
flutter build apk --release
```
*(The output APK will be saved at `build/app/outputs/flutter-apk/app-release.apk`)*

### 4. Build Production Google Play Store App Bundle (AAB):
```bash
flutter build appbundle --release
```

### 5. Build iOS App (macOS / Xcode required):
```bash
flutter build ipa --release
```
