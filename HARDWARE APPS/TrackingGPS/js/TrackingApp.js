window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  console.log("DOM Cargado - Iniciando script...");

  var appInitialized = false;
  var watchId = null;

  function initApp() {
    if (appInitialized) return;

    var getPosBtn = document.getElementById("get-pos-btn");

    if (!getPosBtn) {
      console.error("Botón no encontrado, reintentando...");
      setTimeout(initApp, 100);
      return;
    }

    appInitialized = true;
    console.log("App inicializada correctamente.");

    var navMap = [[getPosBtn]];
    var currentY = 0;
    var currentX = 0;

    function setFocus(y, x) {
      var items = document.querySelectorAll(".focusable");
      for (var i = 0; i < items.length; i++) {
        items[i].classList.remove("focus");
      }

      var activeItem = navMap[y][x];
      if (activeItem) {
        activeItem.classList.add("focus");
        activeItem.focus();
        if (typeof activeItem.scrollIntoView === "function") {
          activeItem.scrollIntoView({ behavior: "auto", block: "center" });
        }
      }
    }

    // Función para convertir coordenadas en dirección física
    function getAddress(lat, lon) {
      var addressText = document.getElementById("address-val");
      addressText.textContent = "Buscando calle...";

      var url =
        "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" +
        lat +
        "&lon=" +
        lon;

      // mozSystem: true permite usar el permiso systemXHR del manifest
      var xhr = new XMLHttpRequest({ mozSystem: true });
      xhr.open("GET", url, true);

      // La API de Nominatim requiere un User-Agent identificativo
      xhr.setRequestHeader("User-Agent", "KaiTrackingApp-TFG");

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              var response = JSON.parse(xhr.responseText);
              var fullAddress =
                response.display_name || "Dirección no encontrada";
              addressText.textContent = fullAddress;
              console.log("Dirección obtenida: " + fullAddress);
            } catch (e) {
              addressText.textContent = "Error al procesar dirección";
            }
          } else {
            addressText.textContent = "Error de conexión (API)";
          }
        }
      };
      xhr.send();
    }

    function updateLocation() {
      var statusText = document.getElementById("status-text");
      var latText = document.getElementById("lat-val");
      var lonText = document.getElementById("lon-val");
      var addressText = document.getElementById("address-val");

      latText.textContent = "-";
      lonText.textContent = "-";
      addressText.textContent = "-";

      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      statusText.textContent = "Buscando satélites (Máx. 2 min)...";

      var options = {
        enableHighAccuracy: true,
        timeout: 120000,
        maximumAge: 0,
      };

      watchId = navigator.geolocation.watchPosition(
        function (pos) {
          console.log("Ubicación encontrada.");
          statusText.textContent = "Ubicación fijada";

          var lat = pos.coords.latitude.toFixed(6);
          var lon = pos.coords.longitude.toFixed(6);

          latText.textContent = lat;
          lonText.textContent = lon;

          // Llamamos a la API de dirección
          getAddress(lat, lon);

          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        },
        function (err) {
          console.error("Error GPS:", err);
          if (err.code === 1)
            statusText.textContent = "Error: Permiso denegado";
          else if (err.code === 2)
            statusText.textContent = "Error: Sin señal (Sal fuera)";
          else if (err.code === 3)
            statusText.textContent = "Error: Tiempo agotado";
          else statusText.textContent = "Error desconocido";

          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        },
        options
      );
    }

    document.addEventListener("keydown", function (event) {
      switch (event.key) {
        case "Enter":
          updateLocation();
          break;
        case "ArrowUp":
        case "ArrowDown":
          event.preventDefault();
          break;
        case "SoftRight":
        case "Backspace":
          event.preventDefault();
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
          }
          window.close();
          break;
      }
    });

    setFocus(0, 0);
  }

  if (navigator.mozL10n) {
    navigator.mozL10n.once(initApp);
  } else {
    initApp();
  }
});
