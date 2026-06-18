# Tracking GPS App

---

## :video_game: 1. Functionality

The **TrackingApp** (commercially named *KaiTracking*) is a real-time geolocation utility designed to pinpoint the device's physical coordinates, getting the street address, and share them via SMS.

Using exclusively the physical D-Pad, users can trigger the hardware GPS receiver to get their precise Latitude and Longitude. The application then get the geolocation address though a API request and allows the user to share their exact location via the system's SMS application.

<details>
  <summary><b>:camera: Video Representative</b></summary>
   <p align="center">
    <img src="Images/TrackingApp.png" alt="TrackingApp Interface" width="240">
  </p>
</details>

---

## :triangular_ruler 2. Architectural Approach

This application combines hardware sensors, Cross-Origin HTTP requests, and native OS intents.

1. **Hardware part:** The app utilizes `navigator.geolocation.watchPosition()` ensuring a high-accuracy satellite data. Once the coordinates are securely fixed, the callback invokes the `clearWatch()` method to shut down the GPS sensor, preserving the device's  battery.
2. **System XHR & Reverse Geocoding:** Standard web applications are bound by CORS (Cross-Origin Resource Sharing) policies. However, by declaring the `systemXHR` permission in the `manifest.webapp`, this app instantiates a privileged `XMLHttpRequest({ mozSystem: true })`. This allows the script to fetch JSON data from the external *OpenStreetMap (Nominatim)* API to translate raw coordinates into physical street addresses.
3. **Native Intent Bridging (MozActivity):** KaiOS 2.5 relies on `MozActivity` to bridge web apps with native OS components. Instead of building an SMS gateway from scratch, the app delegates a payload (containing the body text and Google Maps URL) directly to the system's native WebSMS application:
   ```javascript
   new MozActivity({
     name: "new",
     data: { type: "websms/sms", number: "", body: messageBody }
   });

---

## :zap: 3. Unique Features

- **Legacy Native Scrolling (`scrollIntoView`):** While previous applications utilized a custom algebraic "Mathematical Scroll" for complex grids, this specific app demonstrates a native fallback. By invoking `activeItem.scrollIntoView(false)`, it leverages the legacy Gecko 48 layout engine to keep the D-Pad focused element visible. This is a highly efficient alternative for simple vertical layouts.

- **State Localization:** Geolocating and network fetching are tasks that can take several seconds on a 3G/4G connection. The UI dynamically shifts through multiple states ("Searching satellites...", "Location fixed", "Searching address...").

- **Haptic Confirmations:** The app triggers `navigator.vibrate([100, 50, 100])` solely when the HTTP request to OpenStreetMap returns a valid `200 OK` status, providing the user with physical confirmation that the network task has successfully concluded.

---

## :rocket: 4. Derived Application Ideas

The combination of Geolocation, SystemXHR, and MozActivity demonstrated in this repository forms the backbone for highly requested utilities in emerging markets:

- **Emergency / SOS Broadcaster:** A background utility where holding a specific physical key on the keypad automatically fetches the GPS location and dispatches an SMS to a predefined family member or emergency service, crucial for industrial workers or elderly users.

- **Turn-by-Turn Navigation:** Integrating the GPS coordinate stream with a lightweight mapping library (like Leaflet.js) to build an offline-capable maps application, a highly demanded tool since Google Maps reduced its support for KaiOS.

- **Fleet Management Tracker:** Using the `systemXHR` API to periodically send the device's coordinates to a custom corporate server via HTTP POST, allowing logistics companies to track their delivery trucks using ultra-low-cost devices like the Blackview N1000.