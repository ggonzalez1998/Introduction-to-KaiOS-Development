window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var appInitialized = false;
  var watchId = null;
  var currentLat = null;
  var currentLon = null;

  function initApp() {
    if (appInitialized) return;

    var getPosBtn = document.getElementById("get-pos-btn");
    var sendSmsBtn = document.getElementById("send-sms-btn");

    if (!getPosBtn || !sendSmsBtn) {
      setTimeout(initApp, 100);
      return;
    }

    appInitialized = true;

    // Aunque estén separados físicamente, el mapa de navegación los une
    var navMap = [[getPosBtn], [sendSmsBtn]];
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
        // Centramos el botón en pantalla para ver el contexto
        activeItem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    function shareViaSMS() {
      if (!currentLat || !currentLon) {
        alert("Primero obtén tu ubicación");
        return;
      }
      var address = document.getElementById("address-val").textContent;
      var googleMapsUrl =
        "http://maps.google.com/maps?q=" + currentLat + "," + currentLon;
      var messageBody = "Mi ubicación: " + address + " " + googleMapsUrl;

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

    function getAddress(lat, lon) {
      var addressText = document.getElementById("address-val");
      addressText.textContent = "Buscando calle...";
      var url =
        "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" +
        lat +
        "&lon=" +
        lon;

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

    function updateLocation() {
      var statusText = document.getElementById("status-text");
      statusText.textContent = "Buscando satélites...";

      if (watchId !== null) navigator.geolocation.clearWatch(watchId);

      watchId = navigator.geolocation.watchPosition(
        function (pos) {
          currentLat = pos.coords.latitude.toFixed(6);
          currentLon = pos.coords.longitude.toFixed(6);
          document.getElementById("lat-val").textContent = currentLat;
          document.getElementById("lon-val").textContent = currentLon;
          statusText.textContent = "Ubicación fijada";
          getAddress(currentLat, currentLon);
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        },
        function (err) {
          statusText.textContent = "Error GPS: " + err.code;
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        },
        { enableHighAccuracy: true, timeout: 120000, maximumAge: 0 }
      );
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
          if (currentY === 0) updateLocation();
          else if (currentY === 1) shareViaSMS();
          break;
        case "SoftRight":
        case "Backspace":
          event.preventDefault();
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
          window.close();
          break;
      }
    });

    setFocus(0);
  }

  if (navigator.mozL10n) navigator.mozL10n.once(initApp);
  else initApp();
});
