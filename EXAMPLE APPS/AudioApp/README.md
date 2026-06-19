# Audio App

---

## :video_game: 1. Functionality

The **AudioApp** (commercially named *KaiVoice*) is a fully functional voice recording application by joining the gap between hardware microphone capture and persistent physical storage. 

Designed for non-touch interfaces, the user can navigate via the D-Pad to toggle microphone recording, playback the captured audio buffer in real-time, and securely export the encoded media file directly to the device's internal memory or SD card.

<details>
  <summary><b>:camera: Interface & Video Demo</b></summary>
   <p align="center">
    <img src="Images/AudioApp.png" alt="AudioApp Interface" width="240"><br><br>
    <a href="../../VIDEOS/KaiVoice%20App.mp4">
      <img src="https://img.shields.io/badge/Watch-Video_Demo-red?style=for-the-badge&logo=video" alt="Watch Video Demo">
    </a>
  </p>
</details>

---

## :triangular_ruler: 2. Architectural Approach

This application demonstrates how to handle media streams with file system access.

1. **Hardware Media Bridging (The getUserMedia Fallback):** Accessing the microphone on KaiOS 2.5 reveals heavy fragmentation. Modern JavaScript relies on the `navigator.mediaDevices.getUserMedia`. However, earlier versions of Gecko 48 lack this standard. The architecture implements other fallback sequence: it attempts the modern API, and if undefined, it uses `navigator.mozGetUserMedia` using standard callbacks.
2. **Blob Encoding and Storage:** Once the audio stream is captured, the `MediaRecorder` API save the data into an `audio/ogg` Blob. To persist this data under the session's RAM limits, the app invokes the `DeviceStorage` API (`navigator.getDeviceStorage("music")`). This write the operation (`addNamed()`) that drops the file directly into the user's physical media folder.

---

## :zap: 3. Unique Features

- **Privileged File System Access:** By declaring `"device-storage:music": { "access": "readwrite" }` and `"audio-capture"` in the `manifest.webapp`, the application allows the web runtime to bypass standard browser sandboxing and interact with the underlying Linux file system partitions.
- **Feedback Integration:** To compensate for the lack of visual touch responses, the app utilizes the `navigator.vibrate()` API. It triggers vibration patterns when a recording successfully starts or when a file is successfully written to the disk, providing vital physical feedback to the user.

---

## :rocket: 4. Derived Application Ideas

The architecture and APIs utilized in this repository can serve as the baseline for several advanced KaiStore applications:

- **Offline Dictaphone / Lecture Recorder:** Expanding the app to include a `File Explorer` view that reads the `.ogg` files from the SD card, allowing students or journalists to organize, rename, and playback past recordings.
- **Walkie-Talkie (Push-to-Talk) App:** Combining the `getUserMedia` microphone capture with `WebRTC` data channels or `WebSockets`. Instead of saving the Blob to the disk, the audio chunks could be streamed over a 4G/Wi-Fi connection to another KaiOS device in real-time.
- **Language Pronunciation Coach:** An educational tool where users listen to a native word, hold a button to record their own pronunciation, and play it back immediately to compare the results, leveraging the fast RAM-to-Blob conversion shown in this codebase.