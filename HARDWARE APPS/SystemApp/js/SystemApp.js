window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var cards = document.querySelectorAll(".focusable");
  var content = document.getElementById("content");
  var currentY = 0;

  function setFocus(y) {
    // 1. Quitar focos previos
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.remove("focus");
    }

    // 2. Aplicar nuevo foco
    currentY = y;
    var activeItem = cards[currentY];
    if (activeItem) {
      activeItem.classList.add("focus");
      activeItem.focus();

      // 3. SCROLL MATEMÁTICO (La solución definitiva)
      // Calculamos la posición del elemento respecto al contenedor
      var itemTop = activeItem.offsetTop;
      var itemHeight = activeItem.offsetHeight;
      var contentHeight = content.offsetHeight;

      // Esta fórmula centra el elemento en el visor de 2.4 pulgadas
      var scrollPos = itemTop - contentHeight / 2 + itemHeight / 2;

      content.scrollTop = scrollPos;
    }
  }

  function getBatteryData() {
    var b = navigator.battery || navigator.mozBattery;
    var el = document.getElementById("val-0");
    if (b) {
      el.textContent =
        Math.round(b.level * 100) +
        "% (" +
        (b.charging ? "Cargando" : "OK") +
        ")";
    } else {
      el.textContent = "Error API";
    }
  }

  function getNetworkData() {
    var c = navigator.connection || navigator.mozConnection;
    var el = document.getElementById("val-1");
    if (c) {
      el.textContent = (c.type || "Conectado").toUpperCase();
    } else {
      el.textContent = navigator.onLine ? "ONLINE" : "OFFLINE";
    }
  }

  function getStorageData() {
    var el = document.getElementById("val-2");
    if (!navigator.getDeviceStorage) {
      el.textContent = "No soportado";
      return;
    }
    var s = navigator.getDeviceStorage("sdcard");
    var req = s.freeSpace();
    el.textContent = "Calculando...";
    req.onsuccess = function () {
      el.textContent = (this.result / (1024 * 1024)).toFixed(2) + " MB Libres";
    };
    req.onerror = function () {
      el.textContent = "SD No Lista";
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
        if (currentY < cards.length - 1) setFocus(currentY + 1);
        break;
      case "Enter":
        if (navigator.vibrate) navigator.vibrate(40);
        if (currentY === 0) getBatteryData();
        else if (currentY === 1) getNetworkData();
        else if (currentY === 2) getStorageData();
        break;
      case "SoftRight":
      case "Backspace":
        event.preventDefault();
        window.close();
        break;
    }
  });

  // Inicio limpio
  setFocus(0);
});
