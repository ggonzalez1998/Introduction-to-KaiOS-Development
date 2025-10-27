document.addEventListener("DOMContentLoaded", function () {
  // --- Helper Function: Update Softkeys ---
  window.updateSoftkeys = function (lsk = "", csk = "", rsk = "") {
    document.getElementById("softkey-lsk").textContent = lsk;
    document.getElementById("softkey-csk").textContent = csk;
    document.getElementById("softkey-rsk").textContent = rsk;
  };

  // --- UI Elements ---
  const statusEl = document.getElementById("status");
  const bodyEl = document.body;

  // --- App State ---
  let isFlashlightOn = false;
  let isApiReady = false;

  /**
   * Updates the UI text and softkeys based on the current state
   */
  function updateUi() {
    if (isFlashlightOn) {
      statusEl.textContent = "Flashlight is ON";
      bodyEl.classList.add("on");
      updateSoftkeys("", "Turn Off", "Back");
    } else {
      statusEl.textContent = "Flashlight is OFF";
      bodyEl.classList.remove("on");
      updateSoftkeys("", "Turn On", "Back");
    }
  }

  /**
   * Sets the flashlight state using the setTorch API
   * @param {boolean} state - true to turn on, false to turn off
   */
  async function setFlashlight(state) {
    if (!isApiReady) {
      console.warn("API is not ready or supported.");
      return;
    }

    try {
      // This is an async operation
      await navigator.mediaDevices.setTorch(state);
      // If successful, update our state
      isFlashlightOn = state;
      updateUi();
    } catch (err) {
      console.error("Error setting torch:", err);
      statusEl.textContent = `Error: ${err.name}`;
      statusEl.style.color = "red";
    }
  }

  /**
   * Toggles the flashlight on or off
   */
  function toggleFlashlight() {
    setFlashlight(!isFlashlightOn);
  }

  // --- Global Key Handler ---
  function handleKeyDown(event) {
    switch (event.key) {
      case "Enter":
      case "Accept":
        if (isApiReady) {
          toggleFlashlight();
        }
        break;

      case "Backspace":
        event.preventDefault();
        handleBackspace();
        break;
    }
  }

  /**
   * Handles the exit logic, ensuring the light is off.
   */
  async function handleBackspace() {
    // Make sure flashlight is off before we exit
    if (isFlashlightOn) {
      await setFlashlight(false);
    }
    window.close();
  }

  // Add the key listener to the document
  document.addEventListener("keydown", handleKeyDown);

  // --- App Initialization ---

  /**
   * Checks for API support on load
   */
  function init() {
    if (navigator.mediaDevices && "setTorch" in navigator.mediaDevices) {
      isApiReady = true;
      console.log("App: Flashlight Initialized. API is available.");
      updateUi();
    } else {
      console.error("setTorch API not supported");
      statusEl.textContent = "Error: Flashlight API not supported.";
      statusEl.style.color = "red";
      updateSoftkeys("", "", "Back"); // Nothing to do here
    }
  }

  init();
});
