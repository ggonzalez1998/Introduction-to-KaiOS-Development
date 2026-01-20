window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var appInitialized = false;

  function initApp() {
    if (appInitialized) return;

    var content = document.getElementById("content");
    var verticalItems = document.querySelectorAll("#vertical-list .focusable");
    var inputElement = document.getElementById("main-input");
    var actionButton = document.getElementById("alert-btn");

    // Verificar que los elementos existan antes de continuar
    if (!content || !inputElement || !actionButton) {
      return;
    }

    appInitialized = true;

    // Mapa de navegación (ES5 compatible)
    var navMap = [];
    for (var i = 0; i < verticalItems.length; i++) {
      navMap.push([verticalItems[i]]);
    }
    navMap.push([inputElement]);
    navMap.push([actionButton]);

    var currentY = 0;
    var currentX = 0;

    function setFocus(y, x) {
      var allFocusables = document.querySelectorAll(".focusable");
      // Bucle for tradicional por compatibilidad con NodeList
      for (var j = 0; j < allFocusables.length; j++) {
        allFocusables[j].classList.remove("focus");
      }

      currentY = y;
      currentX = x;

      var activeItem = navMap[currentY][currentX];
      if (activeItem) {
        activeItem.classList.add("focus");

        if (activeItem.tagName === "INPUT") {
          activeItem.focus();
        } else {
          // Desenfocar el input si nos movemos a otro lado
          if (document.activeElement.tagName === "INPUT") {
            document.activeElement.blur();
          }
        }

        // --- SCROLL MATEMÁTICO ---
        var itemTop = activeItem.offsetTop;
        var itemHeight = activeItem.offsetHeight;
        var contentHeight = content.offsetHeight;
        var scrollPos = itemTop - contentHeight / 2 + itemHeight / 2;
        content.scrollTop = scrollPos;
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
        case "Enter":
          var selected = navMap[currentY][currentX];
          if (selected.id === "alert-btn") {
            var val = document.getElementById("main-input").value;
            alert("Has escrito: " + (val || "Nada"));
          } else if (selected.tagName !== "INPUT") {
            alert("Seleccionado: " + selected.textContent);
          }
          break;
        case "SoftRight":
        case "Backspace":
          // Solo cerramos si no estamos escribiendo
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

  // Fallback de inicio por si l10n falla
  if (navigator.mozL10n) {
    navigator.mozL10n.once(initApp);
  }

  // Si en 1 segundo no ha iniciado, forzamos inicio (evita pantalla congelada)
  setTimeout(initApp, 1000);
});
