window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // Application state variables for GPS tracking.
  var appInitialized = false;
  var watchId = null;
  var currentLat = null;
  var currentLon = null;

  // Initializes the main logic and interface.
  function initApp() {
    if (appInitialized) return;

    var getPosBtn = document.getElementById("get-pos-btn");
    var sendSmsBtn = document.getElementById("send-sms-btn");

    if (!getPosBtn || !sendSmsBtn) {
      setTimeout(initApp, 100);
      return;
    }

    appInitialized = true;

    // Navigation map for the physical D-Pad directional keys.
    var navMap = [[getPosBtn], [sendSmsBtn]];
    var currentY = 0;

    // Manages visual focus for D-Pad navigation.
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
        // Uses native smooth scrolling to keep the element in view.
        activeItem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    // Uses native MozActivity to launch the system SMS app with pre-filled location data.
    function shareViaSMS() {
      if (!currentLat || !currentLon) {
        alert("Primero obtén tu ubicación");
        return;
      }
      var address = document.getElementById("address-val").textContent;
      var googleMapsUrl =
        "http://maps.google.com/maps?q=" + currentLat + "," + currentLon;
      var messageBody = "Mi ubicación: " + address + " " + googleMapsUrl;

      // MozActivity is a KaiOS/FirefoxOS exclusive API for inter-app communication.
      if (typeof MozActivity !== "undefined") {
        try {
          new MozActivity({
            name: "new",
            data: { type: "websms/sms", number: "", body: messageBody },
          });
        } catch (e) {
          alert("Error al abrir SMS");
        }
      }
    }

    // Performs reverse geocoding using OpenStreetMap via a privileged systemXHR request.
    function getAddress(lat, lon) {
      var addressText = document.getElementById("address-val");
      addressText.textContent = "Buscando calle...";
      var url =
        "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" +
        lat +
        "&lon=" +
        lon;
      // mozSystem: true bypasses CORS restrictions (requires 'systemXHR' permission in manifest).
      var xhr = new XMLHttpRequest({ mozSystem: true });
      xhr.open("GET", url, true);
      xhr.setRequestHeader("User-Agent", "KaiTrackingApp-TFG");
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          var response = JSON.parse(xhr.responseText);
          addressText.textContent = response.display_name || "No encontrada";
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
      };
      xhr.send();
    }

    // Requests high-accuracy GPS coordinates and clears the watcher once locked.
    function updateLocation() {
      var statusText = document.getElementById("status-text");

      statusText.setAttribute("data-l10n-id", "status_searching");
      statusText.textContent = "Esperando...";

      if (watchId !== null) navigator.geolocation.clearWatch(watchId);

      watchId = navigator.geolocation.watchPosition(
        function (pos) {
          currentLat = pos.coords.latitude.toFixed(6);
          currentLon = pos.coords.longitude.toFixed(6);
          document.getElementById("lat-val").textContent = currentLat;
          document.getElementById("lon-val").textContent = currentLon;

          statusText.setAttribute("data-l10n-id", "status_success");
          statusText.textContent = "Capturada";

          getAddress(currentLat, currentLon);

          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        },
        function (err) {
          statusText.setAttribute("data-l10n-id", "status_error");
          statusText.textContent = "Error al localizar";

          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    }

    // D-Pad keydown event listener for navigation and actions.
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
          if (currentY === 0) updateLocation();
          else if (currentY === 1) shareViaSMS();
          break;
        case "SoftRight":
        case "Backspace":
          event.preventDefault();
          // Ensures the GPS hardware is released if the user exits during a search.
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
          window.close();
          break;
      }
    });

    setFocus(0);
  }
  // Fallback to start the app if localization fails to load.
  if (navigator.mozL10n) navigator.mozL10n.once(initApp);
  else initApp();
});
