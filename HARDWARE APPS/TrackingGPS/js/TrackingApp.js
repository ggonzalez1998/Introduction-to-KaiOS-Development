window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  let appInitialized = false;

  function initApp() {
    if (appInitialized) return;

    // 1. Verificamos que los elementos existen antes de hacer nada
    const getPosBtn = document.getElementById("get-pos-btn");
    if (!getPosBtn) {
      console.error("No se encontró el botón de posición. Reintentando...");
      setTimeout(initApp, 100);
      return;
    }

    appInitialized = true;
    console.log("App Initialized correctamente");

    const navMap = [[getPosBtn]];
    let currentY = 0;
    let currentX = 0;

    function setFocus(y, x) {
      const items = document.querySelectorAll(".focusable");
      if (items.length === 0) return;

      items.forEach((el) => el.classList.remove("focus"));

      const activeItem = navMap[y][x];
      if (activeItem) {
        activeItem.classList.add("focus");
        activeItem.focus(); // Forzamos el foco del sistema
        activeItem.scrollIntoView({ behavior: "auto", block: "center" });
      }
    }

    function updateLocation() {
      const statusText = document.getElementById("status-text");
      const latText = document.getElementById("lat-val");
      const lonText = document.getElementById("lon-val");

      statusText.textContent = "Iniciando GPS...";

      // CONFIGURACIÓN CLAVE:
      // 1. enableHighAccuracy: false (Permite usar antenas de telefonía/WiFi si el GPS falla)
      // 2. timeout: 30000 (Damos 30 segundos, el GPS de KaiOS es lento)
      // 3. maximumAge: Infinity (Si tiene una posición reciente, que la use para no bloquearse)
      const options = {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: Infinity,
      };

      console.log("Solicitando ubicación...");

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("¡Ubicación recibida!", pos);
          statusText.textContent = "Ubicación encontrada";
          latText.textContent = pos.coords.latitude.toFixed(6);
          lonText.textContent = pos.coords.longitude.toFixed(6);
        },
        (err) => {
          console.error("Error detallado:", err);
          // Si falla con HighAccuracy false, el problema suele ser global del sistema
          switch (err.code) {
            case 1:
              statusText.textContent = "Error: Permiso denegado por sistema";
              break;
            case 2:
              statusText.textContent =
                "Error: Buscando señal (Sal al exterior)";
              break;
            case 3:
              statusText.textContent = "Error: Tiempo agotado (30s)";
              break;
          }
        },
        options
      );
    }

    document.addEventListener("keydown", function (event) {
      switch (event.key) {
        case "Enter":
          if (navMap[currentY][currentX].id === "get-pos-btn") {
            updateLocation();
          }
          break;
        case "SoftRight":
        case "Backspace":
          event.preventDefault();
          window.close();
          break;
      }
    });

    setFocus(0, 0);
  }

  // Inicialización segura
  if (navigator.mozL10n) {
    navigator.mozL10n.once(initApp);
  } else {
    initApp();
  }
});
