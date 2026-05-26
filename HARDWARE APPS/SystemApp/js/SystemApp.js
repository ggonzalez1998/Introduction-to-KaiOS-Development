window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // DOM elements and application state variables.
  var cards = document.querySelectorAll(".focusable");
  var content = document.getElementById("content");
  var currentY = 0;

  // Manages visual focus and applies the "Mathematical Scroll" for D-Pad navigation.
  function setFocus(y) {
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.remove("focus");
    }

    currentY = y;
    var activeItem = cards[currentY];
    if (activeItem) {
      activeItem.classList.add("focus");
      activeItem.focus();
      // --- MATHEMATICAL SCROLL ---
      var itemTop = activeItem.offsetTop;
      var itemHeight = activeItem.offsetHeight;
      var contentHeight = content.offsetHeight;
      // Calculates the position to keep the focused element perfectly centered.
      var scrollPos = itemTop - contentHeight / 2 + itemHeight / 2;

      content.scrollTop = scrollPos;
    }
  }

  // Retrieves battery status and charging state using legacy Mozilla APIs.
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

  // Checks the current network connection type and online status.
  function getNetworkData() {
    var c = navigator.connection || navigator.mozConnection;
    var el = document.getElementById("val-1");
    if (c) {
      el.textContent = (c.type || "Conectado").toUpperCase();
    } else {
      el.textContent = navigator.onLine ? "ONLINE" : "OFFLINE";
    }
  }

  // Asynchronously calculates available free space on the SD card using privileged APIs.
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

  // D-Pad keydown event listener for navigation, data fetching, and app closure.
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

  setFocus(0);
});
