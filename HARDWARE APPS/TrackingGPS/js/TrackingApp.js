window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var appInitialized = false;
  var watchId = null;
  var currentLat = null;
  var currentLon = null;

  // Helper function for dynamic runtime translations using Gaia's l10n.js
  function _(key, fallback) {
    if (navigator.mozL10n && navigator.mozL10n.get(key)) {
      return navigator.mozL10n.get(key);
    }
    return fallback;
  }

  function initApp() {
    if (appInitialized) return;

    var getPosBtn = document.getElementById("get-pos-btn");
    var sendSmsBtn = document.getElementById("send-sms-btn");

    if (!getPosBtn || !sendSmsBtn) {
      setTimeout(initApp, 100);
      return;
    }

    appInitialized = true;
    
    // 2D Navigation map for the D-Pad
    var navMap = [[getPosBtn], [sendSmsBtn]];
    var currentY = 0;

    // Manages visual focus and applies native-like scrolling behavior
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
        // Fallback simple scrolling for maximum Gecko 48 compatibility
        activeItem.scrollIntoView(false);
      }
    }

    // Invokes the native WebSMS application via MozActivity to share location
    function shareViaSMS() {
      if (!currentLat || !currentLon) {
        alert(_("alert_no_location", "Please get your location first"));
        return;
      }
      var address = document.getElementById("address-val").textContent;
      var googleMapsUrl =
        "http://maps.google.com/maps?q=" + currentLat + "," + currentLon;
      var messageBody = _("address_label", "Address: ") + " " + address + " " + googleMapsUrl;

      if (typeof MozActivity !== "undefined") {
        try {
          new MozActivity({
            name: "new",
            data: { type: "websms/sms", number: "", body: messageBody }
          });
        } catch (e) {
          alert(_("alert_sms_error", "Error opening SMS"));
        }
      }
    }

    // Uses OpenStreetMap Nominatim API for reverse geocoding (Coordinates to Street Address)
    function getAddress(lat, lon) {
      var addressText = document.getElementById("address-val");
      addressText.textContent = _("status_searching_street", "Searching address...");
      
      var url =
        "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" +
        lat +
        "&lon=" +
        lon;

      var xhr = new XMLHttpRequest({ mozSystem: true });
      xhr.open("GET", url, true);
      
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          try {
            var response = JSON.parse(xhr.responseText);
            addressText.textContent = response.display_name || _("status_not_found", "Not found");
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          } catch (e) {
            addressText.textContent = _("status_parsing_error", "Error parsing address");
          }
        }
      };
      xhr.send();
    }

    // Triggers the hardware GPS receiver via the Geolocation API
    function updateLocation() {
      var statusText = document.getElementById("status-text");
      statusText.textContent = _("status_searching_sat", "Searching satellites...");

      if (watchId !== null) navigator.geolocation.clearWatch(watchId);

      watchId = navigator.geolocation.watchPosition(
        function (pos) {
          currentLat = pos.coords.latitude.toFixed(6);
          currentLon = pos.coords.longitude.toFixed(6);
          document.getElementById("lat-val").textContent = currentLat;
          document.getElementById("lon-val").textContent = currentLon;
          statusText.textContent = _("status_location_fixed", "Location fixed");
          
          getAddress(currentLat, currentLon);
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        },
        function (err) {
          statusText.textContent = _("status_gps_error", "GPS Error: ") + err.code;
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        },
        // Strict Gecko 48 syntax (no trailing commas)
        { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 }
      );
    }

    // Maps KaiOS physical keys to UI actions
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
          if (currentY === 0) updateLocation();
          else if (currentY === 1) shareViaSMS();
          break;
        case "SoftRight":
        case "Backspace":
        case "BrowserBack":
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
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
    initApp();
  }
});