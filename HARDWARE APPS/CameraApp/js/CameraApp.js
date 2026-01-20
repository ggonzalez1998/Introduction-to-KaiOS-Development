"use strict";

window.onload = function () {
  console.log("App iniciada");

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

  // --- NAVEGACIÓN SEGURA ---
  function setFocus(y) {
    if (!cards[y]) return;
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.remove("focus");
    }
    currentY = y;
    var activeItem = cards[currentY];
    activeItem.classList.add("focus");
    activeItem.focus();

    // Scroll Matemático Manual
    var scrollPos =
      activeItem.offsetTop -
      content.offsetHeight / 2 +
      activeItem.offsetHeight / 2;
    content.scrollTop = scrollPos;
  }

  // --- CONTROL DE CÁMARA ---
  function stopStream() {
    if (streamInstance) {
      var tracks = streamInstance.getTracks();
      for (var i = 0; i < tracks.length; i++) {
        tracks[i].stop();
      }
      streamInstance = null;
    }
  }

  function startCamera() {
    status.textContent = "Cargando...";
    var constraints = { video: { width: 320, height: 240 }, audio: false };

    var onSuccess = function (stream) {
      streamInstance = stream;
      // Triple comprobación de compatibilidad para el visor
      if ("srcObject" in video) {
        video.srcObject = stream;
      } else if (video.mozSrcObject !== undefined) {
        video.mozSrcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(stream);
      }

      video.style.display = "block";
      img.style.display = "none";
      video.play();
      isStreaming = true;
      btnCam.textContent = "CAPTURAR FOTO";
      status.textContent = "EN VIVO";
    };

    var onError = function (err) {
      status.textContent = "Error: " + err.name;
      alert("Error cámara: " + err.name);
    };

    // Navigator getUserMedia con prefijos para KaiOS 2.5
    var gum =
      navigator.mozGetUserMedia ||
      navigator.webkitGetUserMedia ||
      (navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(onSuccess)
          .catch(onError);
      } else {
        navigator.mozGetUserMedia(constraints, onSuccess, onError);
      }
    } catch (e) {
      status.textContent = "Error API";
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
      stopStream();
      isStreaming = false;
      btnCam.textContent = "REPETIR FOTO";
      status.textContent = "VISTA PREVIA";
    }, "image/jpeg");
  }

  // --- EVENTOS ---
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
          if (!isStreaming) startCamera();
          else capture();
        } else if (currentY === 1) {
          if (!capturedBlob) {
            alert("Haz una foto primero");
          } else {
            savePhoto();
          }
        }
        break;
      case "Backspace":
      case "SoftRight":
        e.preventDefault();
        stopStream();
        window.close();
        break;
    }
  });

  function savePhoto() {
    var storage = navigator.getDeviceStorage("pictures");
    var filename = "IMG_" + Date.now() + ".jpg";
    var req = storage.addNamed(capturedBlob, filename);
    req.onsuccess = function () {
      alert("Guardada!");
    };
    req.onerror = function () {
      alert("Error disco");
    };
  }

  // Foco inicial
  setFocus(0);
};
