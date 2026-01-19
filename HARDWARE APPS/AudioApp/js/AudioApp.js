window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var appInitialized = false;
  var mediaRecorder = null;
  var audioChunks = [];
  var audioBlob = null;
  var isRecording = false;

  function initApp() {
    if (appInitialized) return;

    var recordBtn = document.getElementById("record-btn");
    var playBtn = document.getElementById("play-btn");
    var saveBtn = document.getElementById("save-btn");
    var audioPlayer = document.getElementById("audio-player");
    var statusText = document.getElementById("status-text");

    if (!recordBtn || !playBtn || !saveBtn) {
      setTimeout(initApp, 100);
      return;
    }

    appInitialized = true;

    // Mapa de navegación con los 3 botones
    var navMap = [[recordBtn], [playBtn], [saveBtn]];
    var currentY = 0;

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
        if (activeItem.scrollIntoView) {
          activeItem.scrollIntoView({ behavior: "auto", block: "center" });
        }
      }
    }

    function saveAudioToDisk() {
      if (!audioBlob) {
        statusText.textContent =
          navigator.mozL10n.get("status_no_audio") || "Nada que guardar";
        return;
      }

      // Acceso al almacenamiento de música
      if (!navigator.getDeviceStorage) {
        alert("DeviceStorage no soportado");
        return;
      }

      var storage = navigator.getDeviceStorage("music");
      var fileName = "KaiOS_Rec_" + Date.now() + ".ogg";

      statusText.textContent = "Guardando...";

      var request = storage.addNamed(audioBlob, fileName);

      request.onsuccess = function () {
        statusText.textContent = "Guardado en Música";
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        alert("Archivo guardado: " + fileName);
      };

      request.onerror = function () {
        console.error("Error al guardar:", this.error);
        statusText.textContent = "Error al guardar";
        // Error común: El almacenamiento está ocupado por el USB
        if (this.error.name === "SecurityError") {
          alert("Error: Desconecta el USB o verifica permisos.");
        }
      };
    }

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
            statusText.textContent = "Grabación finalizada";
          };
          mediaRecorder.start();
          isRecording = true;
          recordBtn.textContent = "DETENER";
          statusText.textContent = "GRABANDO...";
          if (navigator.vibrate) navigator.vibrate(100);
        };
        var onError = function (err) {
          statusText.textContent = "Error: " + err.name;
        };

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices
            .getUserMedia(constraints)
            .then(onSuccess)
            .catch(onError);
        } else {
          var getUserMedia =
            navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
          getUserMedia.call(navigator, constraints, onSuccess, onError);
        }
      } else {
        if (mediaRecorder) mediaRecorder.stop();
        isRecording = false;
        recordBtn.textContent = "GRABAR";
      }
    }

    document.addEventListener("keydown", function (event) {
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          if (currentY > 0) setFocus(currentY - 1);
          break;
        case "ArrowDown":
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
          event.preventDefault();
          window.close();
          break;
      }
    });

    setFocus(0);
  }

  if (navigator.mozL10n) navigator.mozL10n.once(initApp);
  else initApp();
});
