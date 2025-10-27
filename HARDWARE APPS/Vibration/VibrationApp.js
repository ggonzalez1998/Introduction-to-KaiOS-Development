// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // --- Helper Function: Update Softkeys ---
  window.updateSoftkeys = function (lsk = "", csk = "", rsk = "") {
    document.getElementById("softkey-lsk").textContent = lsk;
    document.getElementById("softkey-csk").textContent = csk;
    document.getElementById("softkey-rsk").textContent = rsk;
  };

  // --- Global Key Handler ---
  function handleKeyDown(event) {
    // First, check if the Vibration API is supported at all
    if (!("vibrate" in navigator)) {
      console.warn("Vibration API not supported on this device.");
      return; // Exit if not supported
    }

    switch (event.key) {
      case "Enter":
      case "Accept": // 'Accept' is often the key for CSK/Enter
        console.log("Vibrating: 200ms");
        // A single, short buzz.
        navigator.vibrate(200);
        break;

      case "ArrowUp":
        console.log("Vibrating: 1000ms");
        // A single, long buzz.
        navigator.vibrate(1000);
        break;

      case "ArrowDown":
        // A pattern: [vibrate, pause, vibrate, pause, ...]
        // This is an S.O.S. pattern (3 short, 3 long, 3 short)
        const sosPattern = [
          100,
          50,
          100,
          50,
          100, // S
          200, // Pause
          300,
          50,
          300,
          50,
          300, // O
          200, // Pause
          100,
          50,
          100,
          50,
          100, // S
        ];
        console.log("Vibrating: S.O.S pattern");
        navigator.vibrate(sosPattern);
        break;

      case "SoftLeft":
        // Calling vibrate with 0 or an empty array stops
        // any current or queued vibration.
        console.log("Stopping all vibration");
        navigator.vibrate(0);
        break;

      case "Backspace":
        event.preventDefault(); // Stop browser default action (e.g., "back")
        navigator.vibrate(0); // Stop any vibration before closing
        window.close();
        break;
    }
  }

  // Add the key listener to the document
  document.addEventListener("keydown", handleKeyDown);

  // --- App Initialization ---

  // Set initial softkeys
  updateSoftkeys("Stop", "Test", "Back");

  // Check for API support on load and inform the user if it's missing
  if (!("vibrate" in navigator)) {
    document.getElementById("content").innerHTML =
      '<p style="color: red;">Vibration API not supported on this device.</p>';
    updateSoftkeys("", "", "Back"); // Only 'Back' is active
  } else {
    console.log("App: Vibration Initialized. API is available.");
  }
});
