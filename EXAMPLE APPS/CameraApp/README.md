# Camera App

---

## :video_game: 1. Functionality

The **CameraApp** (commercially named *KaiCam*) is a multimedia application that provides a live hardware viewfinder and allows users to capture still images. 

Designed specifically for non-touch interfaces, the user utilizes the D-Pad to initialize the camera hardware, capture a frame, review the photograph in a dedicated preview state, and securely write the resulting image file directly to the device's physical storage (Gallery/SD Card).

<details>
  <summary><b>:camera: Video Representative</b></summary>
   <p align="center">
    <img src="Images/CameraApp.png" alt="CameraApp Interface" width="240">
  </p>
</details>

---

## :triangular_ruler 2. Architectural Approach

Capturing high-quality still images in the legacy Gecko 48 environment requires an inventive pipeline, as modern `ImageCapture` APIs are not universally supported.

1. **Live Viewfinder Stream:** The application first requests access to the camera via `navigator.mozGetUserMedia` (or standard `mediaDevices` where available). The resulting `MediaStream` is injected directly into the `srcObject` of an HTML5 `<video>` element, providing a fluid, real-time viewfinder on the screen.
2. **The Hidden Canvas Extraction Pipeline:** To capture a photograph, the application relies on an invisible `<canvas>` element instantiated in the DOM. When the user presses the capture button, the script executes `ctx.drawImage(video, 0, 0)`, effectively "stealing" the current active frame from the video stream and painting it onto the canvas.
3. **Blob Conversion:** The canvas immediately processes the pixel data using the `canvas.toBlob(..., "image/jpeg")` method, converting the raw uncompressed frame into a standardized, compressed JPEG binary object ready for physical storage.

---

## :zap: 3. Unique Features

- **Strict Hardware Energy Optimization:** Smart Feature Phones have highly constrained battery capacities (often under 1500 mAh). Leaving the camera sensor active in the background drains power rapidly. This application implements a strict lifecycle: the moment a photo is captured and transitioning to the "Preview" state, the app actively iterates through `streamInstance.getTracks()` and invokes `.stop()`. This explicitly shuts down the physical camera sensor until the user requests to retake a photo.
- **Privileged Gallery Access:** By declaring `"device-storage:pictures": { "access": "readwrite" }` in the `manifest.webapp`, the application bypasses standard browser isolation. The generated JPEG Blob is passed to `navigator.getDeviceStorage("pictures").addNamed()`, making the photo instantly available in the native KaiOS Gallery app.
- **Real-Time State Translation:** The application shifts between distinct modes (Camera Off -> Loading -> Live -> Preview). The `_()` helper function intercepts these transitions, utilizing the Gaia `l10n.js` engine to dynamically translate the UI labels without reloading the DOM.

---

## :rocket: 4. Derived Application Ideas

By reusing the `<video>` to `<canvas>` extraction pipeline demonstrated in this repository, developers can build several advanced visual utilities for the KaiStore:

- **QR & Barcode Scanner:** Instead of saving the canvas frame as a JPEG, the application could periodically send the canvas image data (`ctx.getImageData`) to a lightweight JavaScript decoding library (like `jsQR`) to read URLs, Wi-Fi passwords, or product barcodes in real-time.
- **Stop-Motion Animation Creator:** An application that stores an array of captured Blobs in RAM. Once the user finishes taking a sequence of photos, the app compiles them into a simple animated GIF or rapid-playback gallery.
- **Document Scanner & Enhancer:** Capturing high-contrast frames of receipts or documents, utilizing standard HTML5 Canvas filters to convert the image to grayscale, increase contrast, and save it as a lightweight file for easy email or WhatsApp sharing.