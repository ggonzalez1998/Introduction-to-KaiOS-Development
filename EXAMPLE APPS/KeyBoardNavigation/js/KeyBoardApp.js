window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var appInitialized = false;

  // Initializes the main logic and interface.
  function initApp() {
    if (appInitialized) return;

    var content = document.getElementById("content");
    var verticalItems = document.querySelectorAll("#vertical-list .focusable");
    var inputElement = document.getElementById("main-input");
    var actionButton = document.getElementById("alert-btn");

    if (!content || !inputElement || !actionButton) {
      return;
    }

    appInitialized = true;

    // Builds a 2D navigation map dynamically from DOM elements.
    var navMap = [];
    for (var i = 0; i < verticalItems.length; i++) {
      navMap.push([verticalItems[i]]);
    }
    navMap.push([inputElement]);
    navMap.push([actionButton]);

    var currentY = 0;
    var currentX = 0;

    // Manages visual focus, handles input states, and applies the "Mathematical Scroll".
    function setFocus(y, x) {
      var allFocusables = document.querySelectorAll(".focusable");
      for (var j = 0; j < allFocusables.length; j++) {
        allFocusables[j].classList.remove("focus");
      }

      currentY = y;
      currentX = x;

      var activeItem = navMap[currentY][currentX];
      if (activeItem) {
        activeItem.classList.add("focus");

        // Explicitly handles focus for text input elements to trigger the system keyboard.
        if (activeItem.tagName === "INPUT") {
          activeItem.focus();
        } else {
          // Removes focus from input to hide the keyboard when navigating away.
          if (document.activeElement.tagName === "INPUT") {
            document.activeElement.blur();
          }
        }
        // --- MATHEMATICAL SCROLL ---
        var itemTop = activeItem.offsetTop;
        var itemHeight = activeItem.offsetHeight;
        var contentHeight = content.offsetHeight;
        // Calculates the position to keep the focused element perfectly centered.
        var scrollPos = itemTop - contentHeight / 2 + itemHeight / 2;
        content.scrollTop = scrollPos;
      }
    }

    // D-Pad keydown event listener for navigation and interactions.
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
          // Prevents app closure if the user is deleting text inside the input field.
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

  // Prevents startup conflicts by listening to l10n translations or using a 1-second timeout fallback.
  if (navigator.mozL10n) {
    navigator.mozL10n.once(initApp);
  }
  setTimeout(initApp, 1000);
});
