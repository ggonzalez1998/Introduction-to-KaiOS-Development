window.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var cards = document.querySelectorAll(".focusable");
  var currentY = 0;

  function setFocus(y) {
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.remove("focus");
    }
    currentY = y;
    if (cards[currentY]) {
      cards[currentY].classList.add("focus");
      cards[currentY].focus();
      if (cards[currentY].scrollIntoView) {
        cards[currentY].scrollIntoView({ behavior: "auto", block: "center" });
      }
    }
  }

  // --- NUEVA LÓGICA: BATERÍA ---
  function updateBattery() {
    // navigator.battery es el estándar, navigator.mozBattery es para KaiOS 2.5
    var battery =
      navigator.battery || navigator.mozBattery || navigator.webkitBattery;

    if (battery) {
      var level = Math.round(battery.level * 100);
      var status = battery.charging ? "Cargando" : "Descargando";

      document.getElementById("batt-level").textContent = level;
      document.getElementById("batt-status").textContent = status;
      console.log("Batería actualizada: " + level + "%");
    } else {
      document.getElementById("batt-status").textContent = "No detectada";
    }
  }

  document.addEventListener("keydown", function (event) {
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        if (currentY > 0) setFocus(currentY - 1);
        break;
      case "ArrowDown":
        event.preventDefault();
        if (currentY < cards.length - 1) setFocus(currentY + 1);
        break;
      case "Enter":
        // Al pulsar Enter refrescamos la batería
        updateBattery();
        if (navigator.vibrate) navigator.vibrate(50);
        break;
      case "SoftRight":
      case "Backspace":
        event.preventDefault();
        window.close();
        break;
    }
  });

  // Ejecución inicial
  setFocus(0);
  updateBattery();
});
