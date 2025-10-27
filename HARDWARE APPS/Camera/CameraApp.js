document.addEventListener("DOMContentLoaded", function () {
  // --- Helper Function: Update Softkeys ---
  window.updateSoftkeys = function (lsk = "", csk = "", rsk = "") {
    document.getElementById("softkey-lsk").textContent = lsk;
    document.getElementById("softkey-csk").textContent = csk;
    document.getElementById("softkey-rsk").textContent = rsk;
  };

  // --- UI Elements ---
  const placeholder = document.getElementById("image-placeholder");
  const preview = document.getElementById("image-preview");
  let currentImageBlob = null; // To store the image file data
  let currentImageUrl = null; // To store the temporary URL

  // --- Web Activity Logic ---

  /**
   * Function to open the camera
   */
  function takePhoto() {
    // 1. Check if MozActivity API exists
    if (typeof MozActivity === "undefined") {
      alert("Error: Web Activities are not supported.");
      return;
    }

    // 2. Create the Activity object
    const activity = new MozActivity({
      // The name of the activity: we want to "pick" a file
      name: "pick",

      // Data payload for the activity
      data: {
        type: ["image/jpeg", "image/png", "image/gif"], // What we want
      },
    });

    // 3. Handle the success event (user took a photo)
    activity.onsuccess = function () {
      // The result is in 'activity.result'
      // It contains a 'blob' property with the image file
      if (activity.result.blob) {
        clearPhoto(); // Clear any previous photo first

        currentImageBlob = activity.result.blob;

        // Use URL.createObjectURL to create a temporary URL
        // that the <img> tag can display.
        currentImageUrl = URL.createObjectURL(currentImageBlob);

        // Update the UI
        preview.src = currentImageUrl;
        preview.style.display = "block"; // Show the image
        placeholder.style.display = "none"; // Hide the placeholder

        // Update softkeys to give new options
        updateSoftkeys("Clear", "New Photo", "Back");
      }
    };

    // 4. Handle the error event (user cancelled or an error occurred)
    activity.onerror = function () {
      console.warn("Camera activity failed or was cancelled:", this.error);
      // No user-facing error needed, they likely just hit "Back"
    };
  }

  /**
   * Function to clear the current photo and free memory
   */
  function clearPhoto() {
    if (currentImageBlob && currentImageUrl) {
      // This is VERY important to prevent memory leaks!
      URL.revokeObjectURL(currentImageUrl);
    }

    currentImageBlob = null;
    currentImageUrl = null;

    preview.src = "";
    preview.style.display = "none"; // Hide the image
    placeholder.style.display = "block"; // Show the placeholder

    updateSoftkeys("", "Take Photo", "Back");
  }

  // --- Global Key Handler ---
  function handleKeyDown(event) {
    switch (event.key) {
      case "Enter":
      case "Accept":
        // 'Enter' will always trigger taking a new photo
        takePhoto();
        break;

      case "SoftLeft":
        // The LSK will be "Clear" only after a photo is taken
        if (currentImageBlob) {
          clearPhoto();
        }
        break;

      case "Backspace":
        event.preventDefault();
        // Clean up the blob URL before closing
        clearPhoto();
        window.close();
        break;
    }
  }

  // Add the key listener to the document
  document.addEventListener("keydown", handleKeyDown);

  // --- App Initialization ---
  updateSoftkeys("", "Take Photo", "Back");
  console.log("App: Camera Initialized.");
});
