window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  let appInitialized = false;

  function initApp() {
    if (appInitialized) return;
    appInitialized = true;

    // Selección de elementos enfocables
    const verticalItems = Array.from(
      document.querySelectorAll("#vertical-list .focusable")
    );
    const inputElement = document.getElementById("main-input");
    const actionButton = document.getElementById("alert-btn");
    const bottomButtons = Array.from(
      document.querySelectorAll("#horizontal-list .focusable")
    );

    // Mapa de navegación 2D: Cada elemento vertical es una "fila"
    const navMap = [
      ...verticalItems.map((item) => [item]), // Opciones 1, 2, 3
      [inputElement], // Campo de texto
      [actionButton], // Botón Enviar
      bottomButtons, // Fila de botones Aceptar/Atrás
    ];

    let currentY = 0;
    let currentX = 0;

    function setFocus(y, x) {
      // Limpiar focos previos
      document
        .querySelectorAll(".focusable")
        .forEach((el) => el.classList.remove("focus"));

      currentY = y;
      currentX = x;

      const activeItem = navMap[currentY][currentX];
      if (activeItem) {
        activeItem.classList.add("focus");

        // Manejo de foco real para el input
        if (activeItem.tagName === "INPUT") {
          activeItem.focus();
        } else {
          if (document.activeElement.tagName === "INPUT") {
            document.activeElement.blur();
          }
        }

        // Scroll suave asegurando que el elemento esté visible
        activeItem.scrollIntoView({ behavior: "smooth", block: "center" });
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

          // Acción específica para el botón de enviar
          if (selected.id === "alert-btn") {
            const val = document.getElementById("main-input").value;
            alert("Mensaje enviado: " + (val || "Texto vacío"));
          }
          // Acción para el resto de elementos que no son el input
          else if (selected.tagName !== "INPUT") {
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
    setFocus(0, 0); // Foco inicial
  }

  if (navigator.mozL10n) {
    navigator.mozL10n.once(initApp);
  } else {
    setTimeout(initApp, 500);
  }
});
