# System App

---

## :video_game: 1. Functionality

The **SystemApp** (commercially named *KaiSystem*) is a manual diagnostic tool designed to extract and display real-time hardware and network metrics from the device. 

Instead of relying on a background daemon that continuously drains the battery, this application gives the user direct control over hardware polling. Using the physical D-Pad, users can navigate between different hardware modules (Battery, Network, SD Storage) and press the center key (`SELECT`) to query the hardware sensors and APIs instantly, displaying the results directly on the active card.

<details>
  <summary><b>:camera: Interface & Video Demo</b></summary>
   <p align="center">
    <img src="Images/SystemApp.png" alt="SystemApp Interface" width="240"><br><br>
    <a href="../../VIDEOS/KaiSystem%20App.mp4">
      <img src="https://img.shields.io/badge/Watch-Video_Demo-red?style=for-the-badge&logo=video" alt="Watch Video Demo">
    </a>
  </p>
</details>

---

## :triangular_ruler: 2. Architectural Approach

The app interfaces directly with Mozilla's proprietary WebAPIs and standard DOM APIs, bridging the gap between the web runtime layer (Gecko) and the Linux kernel (Gonk).

1. **Hardware part:** In KaiOS 2.5 (Gecko 48), many standard APIs were still experimental or heavily prefixed. The application implements safe fallbacks to query hardware data:
   - *Battery:* Checks for `navigator.battery` or falls back to `navigator.mozBattery`.
   - *Network:* Evaluates `navigator.connection` or `navigator.mozConnection` to determine the connection type (e.g., cellular, wifi), defaulting to a simple `navigator.onLine` boolean check if the detailed API is restricted.
2. **DOMRequests:** Unlike modern JavaScript environments that rely on `Promises` (`async/await`), querying the physical disk in Gecko 48 returns a `DOMRequest` object. The application binds `.onsuccess` and `.onerror` callbacks to gracefully handle the response delay when calculating the SD card's free bytes via `navigator.getDeviceStorage('sdcard').freeSpace()`.

---

## :zap: 3. Unique Features

- **Privileged Storage Access:** The application operates as a `privileged` packaged app. By explicitly declaring `"device-storage:sdcard": { "access": "readonly" }` in the `manifest.webapp`, the Gecko engine bypasses standard web sandboxing, granting the JavaScript runtime native read access to the physical hardware partitions.
- **On-Demand Energy Efficiency:** By design, low-end Smart Feature Phones suffer from severe battery drain if applications constantly poll hardware APIs. This app employs an "On-Demand" architecture. The sensors remain completely dormant until the user explicitly triggers a hardware interrupt by pressing the `Enter` key on a specific UI card.

---

## :rocket: 4. Derived Application Ideas

By leveraging the sensor and storage APIs demonstrated in this codebase, developers can architect highly requested utilities for the KaiStore:

- **Battery Health & Alarm Monitor:** A background service that checks the `mozBattery` API and triggers a native notification (or alarm sound) when the battery drops below 15% or reaches a full 100% charge to prevent battery degradation.
- **Data Quota Manager:** An application that reads `navigator.connection.type`. If it detects the user is on a "cellular" network instead of "wifi", it can warn the user before they attempt to download large files, helping users in emerging markets save money on limited data plans.
- **Smart Disk Cleaner:** Expanding the `getDeviceStorage` API using the `sdcard` or `pictures` directories (using `enumerate()`). The app could automatically find and delete duplicate files or old voice notes to free up space setting a limmit of 4GB internal storage.