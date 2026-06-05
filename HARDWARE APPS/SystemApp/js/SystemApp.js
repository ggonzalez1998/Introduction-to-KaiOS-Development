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
    var currentY = 0;

    if (!content || cards.length === 0) {
      setTimeout(initApp, 100);
      return;
    }

    appInitialized = true;

    // Manages visual focus and applies the "Mathematical Scroll" for D-Pad navigation
    function setFocus(y) {
      for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove("focus");
      }

      currentY = y;
      var activeItem = cards[currentY];
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

    // Retrieves battery status and charging state using legacy Mozilla APIs
    function getBatteryData() {
      var b = navigator.battery || navigator.mozBattery;
      var el = document.getElementById("val-0");
      if (b) {
        var statusStr = b.charging ? _("status_charging", "Charging") : _("status_ok", "OK");
        el.textContent = Math.round(b.level * 100) + "% (" + statusStr + ")";
      } else {
        el.textContent = _("status_api_error", "API Error");
      }
    }

    // Checks the current network connection type and online status
    function getNetworkData() {
      var c = navigator.connection || navigator.mozConnection;
      var el = document.getElementById("val-1");
      if (c) {
        var netType = c.type || _("status_connected", "CONNECTED");
        el.textContent = netType.toUpperCase();
      } else {
        el.textContent = navigator.onLine ? _("status_online", "ONLINE") : _("status_offline", "OFFLINE");
      }
    }

    // Asynchronously calculates available free space on the SD card using privileged DeviceStorage API
    function getStorageData() {
      var el = document.getElementById("val-2");
      if (!navigator.getDeviceStorage) {
        el.textContent = _("status_not_supported", "Not supported");
        return;
      }
      
      var s = navigator.getDeviceStorage("sdcard");
      var req = s.freeSpace();
      el.textContent = _("status_calculating", "Calculating...");
      
      req.onsuccess = function () {
        var mbFree = (this.result / (1024 * 1024)).toFixed(2);
        el.textContent = mbFree + " " + _("status_free_mb", "MB Free");
      };
      
      req.onerror = function () {
        el.textContent = _("status_sd_not_ready", "SD Not Ready");
      };
    }

    // D-Pad keydown event listener for navigation, data fetching, and app closure
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
  } else {
    setTimeout(initApp, 1000);
  }
});