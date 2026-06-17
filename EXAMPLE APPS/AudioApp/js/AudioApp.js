window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var appInitialized = false;
  var mediaRecorder = null;
  var audioChunks = [];
  var audioBlob = null;
  var isRecording = false;

  // Helper function for dynamic runtime translations using Gaia's l10n.js
  function _(key, fallback) {
    if (navigator.mozL10n && navigator.mozL10n.get(key)) {
      return navigator.mozL10n.get(key);
    }
    return fallback;
  }

  function initApp() {
    if (appInitialized) return;

    var content = document.getElementById("content");
    var recordBtn = document.getElementById("record-btn");
    var playBtn = document.getElementById("play-btn");
    var saveBtn = document.getElementById("save-btn");
    var audioPlayer = document.getElementById("audio-player");
    var statusText = document.getElementById("status-text");

    if (!recordBtn || !playBtn || !saveBtn || !content) {
      setTimeout(initApp, 100);
      return;
    }

    appInitialized = true;

    // 1D array acting as a navigation map for the physical D-Pad
    var navMap = [[recordBtn], [playBtn], [saveBtn]];
    var currentY = 0;

    // Updates visual focus and centers the active element on screen (Mathematical Scroll)
    function setFocus(y) {
      var items = document.querySelectorAll(".focusable");
      for (var i = 0; i < items.length; i++) {
        items[i].classList.remove("focus");
      }

      currentY = y;
      var activeItem = navMap[currentY][0];

      if (activeItem) {
        activeItem.classList.add("focus");
        activeItem.focus();

        var itemTop = activeItem.offsetTop;
        var itemHeight = activeItem.offsetHeight;
        var contentHeight = content.offsetHeight;

        var scrollPos = itemTop - contentHeight / 2 + itemHeight / 2;
        content.scrollTop = scrollPos;
      }
    }

    // Uses the KaiOS DeviceStorage API to save the audio file to the physical SD/Internal storage
    function saveAudioToDisk() {
      if (!audioBlob) {
        statusText.textContent = _("status_nothing", "Nothing to save");
        return;
      }

      if (!navigator.getDeviceStorage) {
        alert(_("alert_storage_no_supp", "Storage not supported"));
        return;
      }

      var storage = navigator.getDeviceStorage("music");
      var fileName = "Rec_" + Date.now() + ".ogg";
      statusText.textContent = _("status_saving", "Saving...");

      var request = storage.addNamed(audioBlob, fileName);

      request.onsuccess = function () {
        statusText.textContent = _("status_saved_music", "Saved to Music");
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        alert(_("alert_saved", "Saved: ") + fileName);
      };

      request.onerror = function () {
        statusText.textContent = _("status_save_error", "Error saving");
        if (this.error.name === "SecurityError") {
          alert(_("alert_security_error", "Error: Disconnect USB or check permissions"));
        }
      };
    }

    // Handles microphone access via WebRTC (with legacy Gecko fallback) and MediaRecorder API
    function toggleRecording() {
      if (!isRecording) {
        var constraints = { audio: true };
        var onSuccess = function (stream) {
          mediaRecorder = new MediaRecorder(stream);
          audioChunks = [];
          
          mediaRecorder.ondataavailable = function (e) {
            audioChunks.push(e.data);
          };
          
          mediaRecorder.onstop = function () {
            audioBlob = new Blob(audioChunks, { type: "audio/ogg" });
            audioPlayer.src = URL.createObjectURL(audioBlob);
            statusText.textContent = _("status_rec_ready", "Recording ready");
          };
          
          mediaRecorder.start();
          isRecording = true;
          recordBtn.textContent = _("btn_stop", "STOP");
          statusText.textContent = _("status_recording", "RECORDING...");
          if (navigator.vibrate) navigator.vibrate(100);
        };

        var onError = function (err) {
          statusText.textContent = _("status_error", "Error: ") + err.name;
        };

        // Fallback for older KaiOS devices (Gecko 48) that don't support navigator.mediaDevices
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices
            .getUserMedia(constraints)
            .then(onSuccess)
            .catch(onError);
        } else {
          var gum = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
          gum.call(navigator, constraints, onSuccess, onError);
        }
      } else {
        if (mediaRecorder) mediaRecorder.stop();
        isRecording = false;
        recordBtn.textContent = _("btn_record", "RECORD");
      }
    }

    // Maps KaiOS physical keys (D-Pad, Center button, Softkeys) to UI actions
    document.addEventListener("keydown", function (event) {
      switch (event.key) {
        case "ArrowUp":
        case "Up":
          event.preventDefault();
          if (currentY > 0) setFocus(currentY - 1);
          break;
        case "ArrowDown":
        case "Down":
          event.preventDefault();
          if (currentY < navMap.length - 1) setFocus(currentY + 1);
          break;
        case "Enter":
          if (currentY === 0) toggleRecording();
          else if (currentY === 1) audioPlayer.play();
          else if (currentY === 2) saveAudioToDisk();
          break;
        case "SoftRight":
        case "Backspace":
        case "BrowserBack":
          event.preventDefault();
          window.close();
          break;
      }
    });

    setFocus(0);
  }

  // Ensures l10n translations are loaded before booting the app to prevent race conditions
  if (navigator.mozL10n) {
    navigator.mozL10n.once(initApp);
  }
  setTimeout(initApp, 1000);
});