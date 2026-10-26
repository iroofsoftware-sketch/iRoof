# I Roofing Mobile Application

Executive Flutter mobile application built for **I Roofing** field operations, sales consultation, and project engineering management.

---

## 📱 Generated Release APK
The compiled, production-ready Android APK is located at:
- **`mobile/release/iRoofing-v1.0.0-release.apk`**
- **`mobile/build/app/outputs/flutter-apk/app-release.apk`**

To install on an Android phone:
1. Transfer the `.apk` file to the device (via USB cable, Google Drive, WhatsApp, or local download).
2. Tap the APK file to install (allow "Install from unknown sources" if prompted).
3. Open **iRoofing** from the app drawer.

---

## 👥 Multi-Role Authentication

The application features unified executive authentication with customized dashboards and security permissions for 3 distinct roles:

### 1. 👷 Site Visitor (Sales & Technical Field Consultant)
Built specifically for staff visiting potential customer sites, warehouses, and industrial grounds:
- **Quick Engineering Estimator**:
  - Computes arc radius, arc curve length, roof surface area (sq.ft), structural steel tonnage, and commercial quote estimates in real time.
  - Interactive profile gauge selectors ($0.60\text{ mm}$, $0.80\text{ mm}$, $1.00\text{ mm}$).
- **4-Step On-Site Inspection & Consultation Form**:
  - **Client & Site Profile**: Client name, contact phone, site location address, expected timeline.
  - **Roof Geometry & Measurements**: Clear span ($m$), arch length ($m$), rise height ($m$) with live instantaneous quote generation.
  - **Substructure Assessment**: RCC Girders, Steel Stanchions, Masonry Wall Plates, or Greenfield foundations. Road access and crane clearance checklist.
  - **Consultant Recommendation**: Technical observations, custom notes, and one-tap submission.
- **Offline Resilience Mode**:
  - Full structural calculations execute locally on-device without needing cellular connectivity when visiting remote sites.

### 2. 📋 Project Manager (Field Execution)
- **7-Gate Work Order Tracker**:
  - Live tracking of projects through all execution milestones (Engineering Review $\to$ Steel Coil Procurement $\to$ On-Site Roll Forming $\to$ Arch Seaming $\to$ Crane Hoisting $\to$ Flashings $\to$ Final Handover).
- Status filtering, completion percentages, and milestone updates.

### 3. 🛡️ Admin (Executive Oversight)
- Pipeline overview of total active project valuations and active work orders.
- Direct access to site consult logs, quick estimators, and system gateways.

---

## 🌐 Backend Gateway Configuration

Tap the **Network Settings** icon on the login screen to configure the backend server endpoint:
- **Android Emulator**: `http://10.0.2.2:5000`
- **Local Office Wi-Fi**: `http://<your-computer-ip>:5000` (e.g. `http://192.168.1.100:5000`)
- **Cloud Production**: `https://api.yourdomain.com`

---

## 🛠️ Build & Development Commands

```bash
# Analyze code for quality and standards
flutter analyze

# Run on connected device or emulator
flutter run

# Build release APK
flutter build apk --release

# Clean build artifacts
flutter clean
```

---

## 🎨 Design System
- **Colors**:
  - Obsidian Navy: `#081A36`
  - Deep Dark: `#040D1B`
  - Arch Gold Accent: `#C9940A`
  - Emerald Green: `#10B981`
- **Attribution**: Powered by [Auxzon](https://auxzons.com)
