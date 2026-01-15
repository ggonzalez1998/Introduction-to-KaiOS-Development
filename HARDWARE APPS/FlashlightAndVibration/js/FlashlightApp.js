window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  let appInitialized = false;
  let isTorchOn = false;
  let torchTrack = null;

  function initApp() {
    if (appInitialized) return;
    appInitialized = true;

    const actionButton = document.getElementById("flashlight-btn");
    const statusText = document.getElementById("status-text");
    const cskText = document.getElementById("softkey-csk");

    // 1. Inicializar la cámara/linterna
    setupTorch();

    // 2. Mapa de navegación (Solo un elemento)
    const navMap = [[actionButton]];
    let currentY = 0;
    let currentX = 0;

    function setFocus(y, x) {
      document
        .querySelectorAll(".focusable")
        .forEach((el) => el.classList.remove("focus"));
      currentY = y;
      currentX = x;
      const activeItem = navMap[currentY][currentX];
      if (activeItem) activeItem.classList.add("focus");
    }

    async function setupTorch() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        const track = stream.getVideoTracks()[0];
        torchTrack = track;

        // Verificar estado inicial (Sincronización al abrir app)
        const capabilities = track.getCapabilities();
        if (capabilities.torch) {
          // Algunas versiones de KaiOS permiten leer el estado actual
          // Si no, asumimos apagado al arrancar.
        }
      } catch (err) {
        console.error("Error linterna:", err);
      }
    }

    async function toggleFlashlight(forceState = null) {
      // Decidir nuevo estado
      const newState = forceState !== null ? forceState : !isTorchOn;

      if (newState === isTorchOn) return; // Evitar vibración si el estado no cambió

      try {
        if (torchTrack) {
          await torchTrack.applyConstraints({
            advanced: [{ torch: newState }],
          });
          isTorchOn = newState;

          // --- VIBRACIÓN ---
          if ("vibrate" in navigator) {
            navigator.vibrate(150); // Vibración corta al cambiar
          }

          // --- ACTUALIZAR UI ---
          updateUI(newState);
        }
      } catch (e) {
        console.error("No se pudo cambiar la linterna", e);
      }
    }

    function updateUI(state) {
      if (state) {
        actionButton.classList.add("on");
        statusText.textContent =
          navigator.mozL10n.get("status_on") || "ENCENDIDO";
        cskText.textContent = navigator.mozL10n.get("sk_off") || "APAGAR";
      } else {
        actionButton.classList.remove("on");
        statusText.textContent =
          navigator.mozL10n.get("status_off") || "APAGADO";
        cskText.textContent = navigator.mozL10n.get("sk_on") || "ENCENDER";
      }
    }

    // --- SINCRONIZACIÓN BOTÓN FÍSICO ---
    // El Blackview N1000 suele enviar un evento de cambio de configuración
    // o podemos escuchar la tecla específica si el sistema lo permite.
    // Como fallback, usamos polling suave para chequear el estado.
    setInterval(async () => {
      if (torchTrack) {
        const settings = torchTrack.getSettings();
        if (settings.torch !== undefined && settings.torch !== isTorchOn) {
          // El hardware cambió fuera de la app (botón físico)
          isTorchOn = settings.torch;
          navigator.vibrate(150); // Vibrar por sincronización
          updateUI(isTorchOn);
        }
      }
    }, 800);

    function handleKeyDown(event) {
      switch (event.key) {
        case "Enter":
        case "Accept":
          toggleFlashlight();
          break;
        case "SoftRight":
        case "Backspace":
          event.preventDefault();
          // Apagar antes de salir si se desea, o dejar encendida
          window.close();
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    setFocus(0, 0);
  }

  // Inicialización l10n
  if (navigator.mozL10n) {
    navigator.mozL10n.once(initApp);
  } else {
    setTimeout(initApp, 500);
  }
});
