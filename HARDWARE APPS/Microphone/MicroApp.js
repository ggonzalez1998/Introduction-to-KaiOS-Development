document.addEventListener("DOMContentLoaded", function () {
  // --- Helper Function: Update Softkeys ---
  window.updateSoftkeys = function (lsk = "", csk = "", rsk = "") {
    document.getElementById("softkey-lsk").textContent = lsk;
    document.getElementById("softkey-csk").textContent = csk;
    document.getElementById("softkey-rsk").textContent = rsk;
  };

  // --- UI Elements ---
  const statusEl = document.getElementById("status");

  // --- App State ---
  let appState = "idle"; // 'idle' | 'recording' | 'recorded'
  let mediaRecorder;
  let audioChunks = [];
  let audioBlob = null;
  let audioUrl = null;
  let playbackAudio = new Audio();
  let mediaStream = null;

  // --- MediaRecorder Logic ---

  /**
   * Start recording audio
   */
  async function startRecording() {
    // 1. Check for API support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Error: getUserMedia API not supported.");
      return;
    }

    try {
      // 2. Request microphone access
      statusEl.textContent = "Requesting permission...";
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      mediaStream = stream; // Store the stream to stop it later

      // 3. Setup MediaRecorder
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = []; // Clear previous recording chunks

      // 4. Set event listener for when data is available
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      // 5. Set event listener for when recording stops
      mediaRecorder.onstop = () => {
        // Create a blob from all the chunks
        audioBlob = new Blob(audioChunks, { type: "audio/webm" });

        // Create a URL for the blob
        audioUrl = URL.createObjectURL(audioBlob);
        playbackAudio.src = audioUrl;

        // Stop the media stream tracks (turns off the mic)
        stream.getTracks().forEach((track) => track.stop());

        // Update UI and state
        appState = "recorded";
        statusEl.textContent = "Recording finished. Ready to play.";
        statusEl.classList.remove("recording");
        updateSoftkeys("Play", "Record", "Clear");
      };

      // 6. Start recording and update UI
      mediaRecorder.start();
      appState = "recording";
      statusEl.textContent = "Recording...";
      statusEl.classList.add("recording");
      updateSoftkeys("", "Stop", "Back");
    } catch (err) {
      console.error("Error starting recording:", err);
      statusEl.textContent = "Error: Mic permission denied.";
      statusEl.classList.remove("recording");
      appState = "idle";
    }
  }

  /**
   * Stop the recording
   */
  function stopRecording() {
    if (mediaRecorder && appState === "recording") {
      mediaRecorder.stop();
    }
  }

  /**
   * Play the recorded audio
   */
  function playRecording() {
    if (appState === "recorded" && audioUrl) {
      playbackAudio.play();
    }
  }

  /**
   * Clear the recorded audio and free memory
   */
  function clearRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl); // Free memory
    }
    audioBlob = null;
    audioUrl = null;
    audioChunks = [];
    appState = "idle";

    statusEl.textContent = "Press [ENTER] to Record";
    updateSoftkeys("", "Record", "Back");
  }

  // --- Global Key Handler ---
  function handleKeyDown(event) {
    switch (event.key) {
      case "Enter":
      case "Accept":
        if (appState === "idle") {
          startRecording();
        } else if (appState === "recording") {
          stopRecording();
        } else if (appState === "recorded") {
          // 'Enter' on a recorded state = record new
          clearRecording();
          startRecording();
        }
        break;

      case "SoftLeft":
        if (appState === "recorded") {
          playRecording();
        }
        break;

      case "SoftRight":
        if (appState === "idle" || appState === "recording") {
          // Default 'Back' action
          handleBackspace();
        } else if (appState === "recorded") {
          // Becomes 'Clear'
          clearRecording();
        }
        break;

      case "Backspace":
        event.preventDefault();
        handleBackspace();
        break;
    }
  }

  /**
   * Handle exit logic
   */
  function handleBackspace() {
    // Stop any media streams and recording before closing
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (appState === "recording") {
      mediaRecorder.stop();
    }
    // Free memory
    clearRecording();
    window.close();
  }

  // Add the key listener to the document
  document.addEventListener("keydown", handleKeyDown);

  // --- App Initialization ---
  updateSoftkeys("", "Record", "Back");
  console.log("App: Microphone Initialized.");
});
