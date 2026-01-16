window.onload = function () {
  "use strict";

  // Aviso de inicio (Lo quitaremos cuando todo funcione)
  alert("¡App Iniciada!");

  let isTorchOn = false;
  const btn = document.getElementById("flashlight-btn");
  const cskText = document.getElementById("softkey-csk");

  // Función segura para la linterna
  function hardwareControl(state) {
    try {
      // MÉTODO 1: API Certificada estándar
      if (navigator.mozFlashlight) {
        navigator.mozFlashlight.enabled = state;
        console.log("Hardware: mozFlashlight usado");
      }
      // MÉTODO 2: API de MediaDevices (común en KaiOS 2.5+)
      else if (navigator.mediaDevices && navigator.mediaDevices.setTorch) {
        navigator.mediaDevices.setTorch(state);
        console.log("Hardware: setTorch usado");
      }
    } catch (e) {
      console.warn("Error controlado al acceder al LED: ", e);
    }
  }

  function toggle() {
    isTorchOn = !isTorchOn;

    // 1. VIBRACIÓN (Siempre debe funcionar)
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    // 2. CAMBIO VISUAL (Siempre debe funcionar)
    if (isTorchOn) {
      btn.classList.add("on");
      cskText.textContent = "APAGAR";
    } else {
      btn.classList.remove("on");
      cskText.textContent = "ENCENDER";
    }

    // 3. HARDWARE (Si falla, no rompe la app)
    hardwareControl(isTorchOn);
  }

  // SINCRONIZACIÓN CON BOTÓN FÍSICO
  // Solo si la API mozFlashlight existe, vigilamos el botón lateral
  setInterval(() => {
    try {
      if (
        navigator.mozFlashlight &&
        navigator.mozFlashlight.enabled !== isTorchOn
      ) {
        isTorchOn = navigator.mozFlashlight.enabled;

        if (navigator.vibrate) navigator.vibrate(100);

        if (isTorchOn) {
          btn.classList.add("on");
          cskText.textContent = "APAGAR";
        } else {
          btn.classList.remove("on");
          cskText.textContent = "ENCENDER";
        }
      }
    } catch (e) {}
  }, 800);

  // MANEJADOR DE TECLAS
  document.addEventListener("keydown", function (e) {
    switch (e.key) {
      case "Enter":
      case "Accept":
      case "KeyCenter":
        toggle();
        break;
      case "Backspace":
      case "SoftRight":
        e.preventDefault();
        // Aseguramos apagado al salir
        hardwareControl(false);
        window.close();
        break;
    }
  });

  // FOCO INICIAL
  btn.focus();
  btn.classList.add("focus");
};
