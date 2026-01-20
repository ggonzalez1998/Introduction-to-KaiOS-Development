"use strict";

window.onload = function () {
  var cards = document.querySelectorAll(".focusable");
  var content = document.getElementById("content");
  var video = document.getElementById("viewfinder");
  var img = document.getElementById("photo-preview");
  var status = document.getElementById("status-label");
  var btnCam = document.getElementById("btn-0");

  var currentY = 0;
  var streamInstance = null;
  var capturedBlob = null;
  var isStreaming = false;

  function setFocus(y) {
    if (!cards[y]) return;
    for (var i = 0; i < cards.length; i++) cards[i].classList.remove("focus");

    currentY = y;
    var activeItem = cards[currentY];
    activeItem.classList.add("focus");
    activeItem.focus();

    // Scroll Matemático: Centra perfectamente el elemento activo
    var scrollPos =
      activeItem.offsetTop -
      content.offsetHeight / 2 +
      activeItem.offsetHeight / 2;
    content.scrollTop = scrollPos;
  }

  function startCamera() {
    status.textContent = "Cargando...";
    var constraints = { video: { width: 320, height: 240 }, audio: false };

    var onSuccess = function (stream) {
      streamInstance = stream;
      if ("srcObject" in video) video.srcObject = stream;
      else video.mozSrcObject = stream;

      video.style.display = "block";
      img.style.display = "none";
      video.play();
      isStreaming = true;
      btnCam.textContent = "CAPTURAR FOTO";
      status.textContent = "EN VIVO";

      // Auto-foco en el visor para que el scroll lo centre
      setFocus(1);
    };

    var onError = function (err) {
      status.textContent = "Error: " + err.name;
    };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(onSuccess)
        .catch(onError);
    } else {
      navigator.mozGetUserMedia(constraints, onSuccess, onError);
    }
  }

  function capture() {
    var canvas = document.getElementById("hidden-canvas");
    var ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 320, 240);

    canvas.toBlob(function (blob) {
      capturedBlob = blob;
      img.src = window.URL.createObjectURL(blob);
      img.style.display = "block";
      video.style.display = "none";

      // Detener stream
      if (streamInstance) {
        streamInstance.getTracks().forEach(function (t) {
          t.stop();
        });
        streamInstance = null;
      }

      isStreaming = false;
      btnCam.textContent = "REPETIR FOTO";
      status.textContent = "VISTA PREVIA";

      // Salto automático al botón de GUARDAR
      setFocus(2);
      if (navigator.vibrate) navigator.vibrate(60);
    }, "image/jpeg");
  }

  document.addEventListener("keydown", function (e) {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (currentY > 0) setFocus(currentY - 1);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (currentY < cards.length - 1) setFocus(currentY + 1);
        break;
      case "Enter":
        if (currentY === 0) {
          // Botón Cámara
          if (!isStreaming) startCamera();
          else capture();
        } else if (currentY === 1) {
          // Click en el visor directamente
          if (isStreaming) capture();
        } else if (currentY === 2) {
          // Botón Guardar
          savePhoto();
        }
        break;
      case "Backspace":
      case "SoftRight":
        e.preventDefault();
        if (streamInstance)
          streamInstance.getTracks().forEach(function (t) {
            t.stop();
          });
        window.close();
        break;
    }
  });

  function savePhoto() {
    if (!capturedBlob) {
      alert("Haz una foto primero");
      return;
    }
    var storage = navigator.getDeviceStorage("pictures");
    var filename = "IMG_" + Date.now() + ".jpg";
    var req = storage.addNamed(capturedBlob, filename);
    req.onsuccess = function () {
      alert("¡Guardada!");
    };
    req.onerror = function () {
      alert("Error disco");
    };
  }

  setFocus(0);
};
