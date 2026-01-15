window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  let appInitialized = false;

  function initApp() {
    if (appInitialized) return;
    appInitialized = true;

    // Elementos de la lista vertical
    const verticalItems = Array.from(
      document.querySelectorAll("#vertical-list .focusable")
    );
    // Elementos del bloque de texto
    const inputElement = document.getElementById("main-input");
    const actionButton = document.getElementById("alert-btn");

    // Mapa de navegación: termina en el botón de acción
    const navMap = [
      ...verticalItems.map((item) => [item]),
      [inputElement],
      [actionButton],
    ];

    let currentY = 0;
    let currentX = 0;

    function setFocus(y, x) {
      document
        .querySelectorAll(".focusable")
        .forEach((el) => el.classList.remove("focus"));
      currentY = y;
      currentX = x;

      const activeItem = navMap[currentY][currentX];
      if (activeItem) {
        activeItem.classList.add("focus");

        if (activeItem.tagName === "INPUT") {
          activeItem.focus();
        } else {
          if (document.activeElement.tagName === "INPUT") {
            document.activeElement.blur();
          }
        }

        // Scroll instantáneo para máxima compatibilidad móvil
        activeItem.scrollIntoView({ behavior: "auto", block: "center" });
      }
    }

    function handleKeyDown(event) {
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          if (currentY > 0) setFocus(currentY - 1, 0);
          break;
        case "ArrowDown":
          event.preventDefault();
          if (currentY < navMap.length - 1) setFocus(currentY + 1, 0);
          break;
        case "ArrowLeft":
          if (currentX > 0) setFocus(currentY, currentX - 1);
          break;
        case "ArrowRight":
          if (currentX < navMap[currentY].length - 1)
            setFocus(currentY, currentX + 1);
          break;
        case "Enter":
          const selected = navMap[currentY][currentX];
          // Acción específica para el botón
          if (selected.id === "alert-btn") {
            const val = document.getElementById("main-input").value;
            alert("Has escrito: " + (val || "Nada"));
          } else if (selected.tagName !== "INPUT") {
            alert("Seleccionado: " + selected.textContent);
          }
          break;
        case "SoftRight":
        case "Backspace":
          if (document.activeElement.tagName !== "INPUT") {
            event.preventDefault();
            window.close();
          }
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    setFocus(0, 0);
  }

  if (navigator.mozL10n) {
    navigator.mozL10n.once(initApp);
  } else {
    setTimeout(initApp, 500);
  }
});
