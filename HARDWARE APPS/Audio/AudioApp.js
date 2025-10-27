document.addEventListener("DOMContentLoaded", function () {
  // --- Helper Function: Update Softkeys ---
  window.updateSoftkeys = function (lsk = "", csk = "", rsk = "") {
    document.getElementById("softkey-lsk").textContent = lsk;
    document.getElementById("softkey-csk").textContent = csk;
    document.getElementById("softkey-rsk").textContent = rsk;
  };

  // --- UI Elements ---
  const statusEl = document.getElementById("status");

  // --- Audio Logic ---
  let audioEl;

  try {
    // 1. Initialize the Audio object with the path to our sound file.
    // The path is relative to the app's root.
    audioEl = new Audio("sound.mp3");

    // 2. Add event listener for when playback starts
    audioEl.addEventListener("playing", () => {
      statusEl.textContent = "Playing...";
      statusEl.classList.add("playing");
    });

    // 3. Add event listener for when playback finishes
    audioEl.addEventListener("ended", () => {
      statusEl.textContent = "Press [ENTER] to play sound";
      statusEl.classList.remove("playing");
    });

    // 4. Handle any errors (e.g., file not found, corrupt file)
    audioEl.addEventListener("error", (e) => {
      console.error("Audio Error:", e);
      statusEl.textContent = "Error loading sound.";
      statusEl.style.color = "red";
      updateSoftkeys("", "", "Back"); // Disable 'Play'
    });
  } catch (e) {
    console.error("Failed to initialize Audio:", e);
    statusEl.textContent = "Audio API Error";
    statusEl.style.color = "red";
  }

  /**
   * Function to play the sound
   */
  function playSound() {
    if (!audioEl) return; // Guard against errors

    if (!audioEl.paused) {
      // If already playing, rewind to the start and play again
      audioEl.pause();
      audioEl.currentTime = 0;
    }
    audioEl.play();
  }

  // --- Global Key Handler ---
  function handleKeyDown(event) {
    switch (event.key) {
      case "Enter":
      case "Accept":
        playSound();
        break;

      case "Backspace":
        event.preventDefault();
        // Good practice to stop sound when exiting
        if (audioEl && !audioEl.paused) {
          audioEl.pause();
        }
        window.close();
        break;
    }
  }

  // Add the key listener to the document
  document.addEventListener("keydown", handleKeyDown);

  // --- App Initialization ---
  updateSoftkeys("", "Play", "Back");
  console.log("App: Audio Initialized.");
});
