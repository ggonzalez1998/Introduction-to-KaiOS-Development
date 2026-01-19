window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  console.log("AudioApp: DOM cargado");

  var appInitialized = false;
  var mediaRecorder = null;
  var audioChunks = [];
  var audioBlob = null;
  var isRecording = false;

  function initApp() {
    if (appInitialized) return;

    var recordBtn = document.getElementById("record-btn");
    var playBtn = document.getElementById("play-btn");
    var audioPlayer = document.getElementById("audio-player");
    var statusText = document.getElementById("status-text");

    if (!recordBtn || !playBtn) {
      console.error("AudioApp: Elementos no encontrados");
      setTimeout(initApp, 100);
      return;
    }

    appInitialized = true;
    console.log("AudioApp: Inicializada");

    var navMap = [[recordBtn], [playBtn]];
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
        // block: "center" es clave para que el scroll se active antes de llegar al borde
        if (activeItem.scrollIntoView) {
          activeItem.scrollIntoView({ behavior: "auto", block: "center" });
        }
      }
    }

    function toggleRecording() {
      if (!isRecording) {
        // Compatibilidad para KaiOS 2.5 (Gecko 48)
        var constraints = { audio: true };
        var onSuccess = function (stream) {
          mediaRecorder = new MediaRecorder(stream);
          audioChunks = [];

          mediaRecorder.ondataavailable = function (event) {
            audioChunks.push(event.data);
          };

          mediaRecorder.onstop = function () {
            audioBlob = new Blob(audioChunks, {
              type: "audio/ogg; codecs=opus",
            });
            var audioUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = audioUrl;
            statusText.textContent =
              navigator.mozL10n.get("status_saved") || "Audio listo";
          };

          mediaRecorder.start();
          isRecording = true;
          recordBtn.textContent =
            navigator.mozL10n.get("btn_stop") || "DETENER";
          statusText.textContent =
            navigator.mozL10n.get("status_recording") || "GRABANDO...";
          if (navigator.vibrate) navigator.vibrate(100);
        };

        var onError = function (err) {
          console.error("Error getUserMedia:", err);
          statusText.textContent = "Error micro: " + err.name;
        };

        // Intentar versión moderna y caer en la prefijada si falla
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices
            .getUserMedia(constraints)
            .then(onSuccess)
            .catch(onError);
        } else {
          var getUserMedia =
            navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
          if (getUserMedia) {
            getUserMedia.call(navigator, constraints, onSuccess, onError);
          } else {
            statusText.textContent = "API no soportada";
          }
        }
      } else {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
          // Detener tracks para apagar el hardware del micro
          if (mediaRecorder.stream) {
            var tracks = mediaRecorder.stream.getTracks();
            for (var i = 0; i < tracks.length; i++) {
              tracks[i].stop();
            }
          }
        }
        isRecording = false;
        recordBtn.textContent = navigator.mozL10n.get("btn_record") || "GRABAR";
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      }
    }

    function playAudio() {
      if (!audioBlob) {
        statusText.textContent =
          navigator.mozL10n.get("status_no_audio") || "Sin grabación";
        return;
      }
      statusText.textContent =
        navigator.mozL10n.get("status_playing") || "Reproduciendo...";
      audioPlayer.play();
      audioPlayer.onended = function () {
        statusText.textContent =
          navigator.mozL10n.get("status_saved") || "Audio listo";
      };
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
          else if (currentY === 1) playAudio();
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

  // Lanzamiento seguro
  if (navigator.mozL10n) {
    navigator.mozL10n.once(initApp);
  } else {
    initApp();
  }
});
