document.addEventListener("DOMContentLoaded", function () {
  // --- Helper Function: Update Softkeys ---
  window.updateSoftkeys = function (lsk = "", csk = "", rsk = "") {
    document.getElementById("softkey-lsk").textContent = lsk;
    document.getElementById("softkey-csk").textContent = csk;
    document.getElementById("softkey-rsk").textContent = rsk;
  };

  // --- UI Elements ---
  const statusEl = document.getElementById("status");
  const latEl = document.getElementById("lat-value");
  const lonEl = document.getElementById("lon-value");
  const accEl = document.getElementById("acc-value");

  // --- Geolocation Logic ---

  /**
   * Called when location is successfully retrieved
   * @param {GeolocationPosition} position
   */
  function onLocationSuccess(position) {
    statusEl.textContent = "Location found!";
    statusEl.className = "success";

    const coords = position.coords;
    latEl.textContent = coords.latitude.toFixed(6); // 6 decimal places
    lonEl.textContent = coords.longitude.toFixed(6);
    accEl.textContent = `${coords.accuracy.toFixed(0)} meters`;
  }

  /**
   * Called when there's an error getting the location
   * @param {GeolocationPositionError} error
   */
  function onLocationError(error) {
    console.error("Geolocation Error:", error.code, error.message);
    statusEl.className = "error";

    switch (error.code) {
      case error.PERMISSION_DENIED:
        statusEl.textContent = "Error: Permission denied";
        break;
      case error.POSITION_UNAVAILABLE:
        statusEl.textContent = "Error: Position unavailable";
        break;
      case error.TIMEOUT:
        statusEl.textContent = "Error: Request timed out";
        break;
      default:
        statusEl.textContent = "Error: Unknown error";
        break;
    }
  }

  /**
   * Main function to request the device's location
   */
  function getLocation() {
    // Check if the Geolocation API is available
    if (!("geolocation" in navigator)) {
      statusEl.textContent = "Error: Geolocation not supported";
      statusEl.className = "error";
      updateSoftkeys("", "", "Back"); // No point in "Refresh"
      return;
    }

    // Update UI to show we are working
    statusEl.textContent = "Getting location...";
    statusEl.className = "loading";
    latEl.textContent = "-";
    lonEl.textContent = "-";
    accEl.textContent = "-";

    // Request the location
    // We enable high accuracy for GPS and set a 10-second timeout
    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0, // Don't use a cached position
    };

    navigator.geolocation.getCurrentPosition(
      onLocationSuccess,
      onLocationError,
      options
    );
  }

  // --- Global Key Handler ---
  function handleKeyDown(event) {
    switch (event.key) {
      case "Enter":
      case "Accept":
        getLocation(); // Refresh location on Enter
        break;

      case "Backspace":
        event.preventDefault();
        window.close();
        break;
    }
  }

  // Add the key listener to the document
  document.addEventListener("keydown", handleKeyDown);

  // --- App Initialization ---
  updateSoftkeys("", "Refresh", "Back");

  // Get the location as soon as the app starts
  getLocation();
});
