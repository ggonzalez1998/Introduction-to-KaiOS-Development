window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var appInitialized = false;

  // Helper function for dynamic runtime translations using Gaia's l10n.js
  function _(key, fallback) {
    if (navigator.mozL10n && navigator.mozL10n.get(key)) {
      return navigator.mozL10n.get(key);
    }
    return fallback;
  }

  function initApp() {
    if (appInitialized) return;

    var cards = document.querySelectorAll(".focusable");
    var content = document.getElementById("content");
    var video = document.getElementById("viewfinder");
    var img = document.getElementById("photo-preview");
    var status = document.getElementById("status-label");
    var btnCam = document.getElementById("btn-0");

    if (!content || !video || cards.length === 0) {
      setTimeout(initApp, 100);
      return;
    }

    appInitialized = true;

    var currentY = 0;
    var streamInstance = null;
    var capturedBlob = null;
    var isStreaming = false;

    // Manages visual focus and applies the "Mathematical Scroll" for D-Pad navigation
    function setFocus(y) {
      if (!cards[y]) return;
      for (var i = 0; i < cards.length; i++) cards[i].classList.remove("focus");

      currentY = y;
      var activeItem = cards[currentY];
      activeItem.classList.add("focus");
      activeItem.focus();

      var scrollPos =
        activeItem.offsetTop -
        content.offsetHeight / 2 +
        activeItem.offsetHeight / 2;
      content.scrollTop = scrollPos;
    }

    // Initializes the camera hardware stream and binds it to the video viewfinder
    function startCamera() {
      status.textContent = _("status_loading", "Loading...");
      var constraints = { video: { width: 320, height: 240 }, audio: false };

      var onSuccess = function (stream) {
        streamInstance = stream;
        if ("srcObject" in video) video.srcObject = stream;
        else video.mozSrcObject = stream;

        video.style.display = "block";
        img.style.display = "none";
        video.play();
        isStreaming = true;
        
        // Dynamically translate UI elements upon state change
        btnCam.textContent = _("btn_capture", "TAKE PHOTO");
        status.textContent = _("status_live", "LIVE");

        setFocus(1);
      };

      var onError = function (err) {
        status.textContent = _("alert_error", "Error: ") + err.name;
      };

      // Fallback compatibility handling for legacy (Gecko 48) and modern media APIs
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(onSuccess)
          .catch(onError);
      } else {
        navigator.mozGetUserMedia(constraints, onSuccess, onError);
      }
    }

    // Captures the current video frame to a hidden canvas and generates a JPEG blob
    function capture() {
      var canvas = document.getElementById("hidden-canvas");
      var ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, 320, 240);

      canvas.toBlob(function (blob) {
        capturedBlob = blob;
        img.src = window.URL.createObjectURL(blob);
        img.style.display = "block";
        video.style.display = "none";

        // Stops the camera hardware tracks after taking the picture to save battery
        if (streamInstance) {
          streamInstance.getTracks().forEach(function (t) {
            t.stop();
          });
          streamInstance = null;
        }

        isStreaming = false;
        btnCam.textContent = _("btn_retry", "RETAKE PHOTO");
        status.textContent = _("status_preview", "PREVIEW");

        setFocus(2);
        if (navigator.vibrate) navigator.vibrate(60);
      }, "image/jpeg");
    }

    // Uses the KaiOS DeviceStorage API to save the JPEG blob to physical storage
    function savePhoto() {
      if (!capturedBlob) {
        alert(_("alert_take_first", "Take a photo first"));
        return;
      }
      var storage = navigator.getDeviceStorage("pictures");
      var filename = "IMG_" + Date.now() + ".jpg";
      var req = storage.addNamed(capturedBlob, filename);
      
      req.onsuccess = function () {
        alert(_("alert_saved", "Saved!"));
      };
      
      req.onerror = function () {
        alert(_("alert_disk_error", "Disk error"));
      };
    }

    // D-Pad keydown event listener for navigation and actions
    document.addEventListener("keydown", function (e) {
      switch (e.key) {
        case "ArrowUp":
        case "Up":
          e.preventDefault();
          if (currentY > 0) setFocus(currentY - 1);
          break;
        case "ArrowDown":
        case "Down":
          e.preventDefault();
          if (currentY < cards.length - 1) setFocus(currentY + 1);
          break;
        case "Enter":
          if (currentY === 0) {
            if (!isStreaming) startCamera();
            else capture();
          } else if (currentY === 1) {
            if (isStreaming) capture();
          } else if (currentY === 2) {
            savePhoto();
          }
          break;
        case "Backspace":
        case "SoftRight":
        case "BrowserBack":
          e.preventDefault();
          if (streamInstance) {
            streamInstance.getTracks().forEach(function (t) {
              t.stop();
            });
          }
          window.close();
          break;
      }
    });

    setFocus(0);
  }

  // Ensures l10n translations are loaded before booting the app to prevent race conditions
  if (navigator.mozL10n) {
    navigator.mozL10n.once(initApp);
  } else {
    setTimeout(initApp, 1000);
  }
});