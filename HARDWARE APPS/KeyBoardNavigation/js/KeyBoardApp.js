window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  let appInitialized = false;

  function initApp() {
    if (appInitialized) return;
    appInitialized = true;

    const row0 = Array.from(document.querySelectorAll("#vertical-list li"));
    const row1 = [document.getElementById("main-input")];
    const row2 = [document.getElementById("action-btn")];
    const row3 = Array.from(document.querySelectorAll("#horizontal-list div"));

    const navMap = [row0, row1, row2, row3];
    let currentY = 0;
    let currentX = 0;

    function setFocus(y, x) {
      const oldItem = navMap[currentY][currentX];
      if (oldItem) oldItem.classList.remove("focus");

      currentY = y;
      currentX = x;

      const newItem = navMap[currentY][currentX];
      if (newItem) {
        newItem.classList.add("focus");
        if (newItem.tagName === "INPUT") {
          newItem.focus();
        } else {
          if (document.activeElement.tagName === "INPUT")
            document.activeElement.blur();
        }

        newItem.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }

    function handleKeyDown(event) {
      if (document.activeElement.tagName === "INPUT") {
        if (
          event.key !== "ArrowUp" &&
          event.key !== "ArrowDown" &&
          event.key !== "Enter"
        ) {
          return;
        }
      }

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
          if (navMap[currentY].length > 1) {
            setFocus(currentY, Math.max(0, currentX - 1));
          }
          break;

        case "ArrowRight":
          if (navMap[currentY].length > 1) {
            setFocus(
              currentY,
              Math.min(navMap[currentY].length - 1, currentX + 1)
            );
          }
          break;

        case "Enter":
          const activeEl = navMap[currentY][currentX];
          if (activeEl.id === "action-btn") {
            const inputVal = document.getElementById("main-input").value;
            document.getElementById("display-area").textContent =
              inputVal || "---";
          } else if (activeEl.tagName === "LI") {
            const msg =
              (navigator.mozL10n && navigator.mozL10n.get("alert_selected")) ||
              "Has seleccionado: ";
            alert(msg + activeEl.textContent);
          }
          break;

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

    const skSelect =
      (navigator.mozL10n && navigator.mozL10n.get("sk_select")) || "SELECT";
    const skExit =
      (navigator.mozL10n && navigator.mozL10n.get("sk_exit")) || "Salir";
    document.getElementById("softkey-csk").textContent = skSelect;
    document.getElementById("softkey-rsk").textContent = skExit;
  }

  if (navigator.mozL10n) {
    navigator.mozL10n.once(initApp);
  }
  setTimeout(function () {
    if (!appInitialized) initApp();
  }, 2000);
});
