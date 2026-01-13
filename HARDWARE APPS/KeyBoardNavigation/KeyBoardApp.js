document.addEventListener("DOMContentLoaded", function () {
  window.updateSoftkeys = function (lsk = "", csk = "", rsk = "") {
    document.getElementById("softkey-lsk").textContent = lsk;
    document.getElementById("softkey-csk").textContent = csk;
    document.getElementById("softkey-rsk").textContent = rsk;
  };

  // 1. Get all focusable items from the DOM
  const verticalItems = Array.from(
    document.querySelectorAll("#vertical-list li")
  );
  const horizontalItems = Array.from(
    document.querySelectorAll("#horizontal-list div")
  );

  // Create a 2D array for our navigation map
  // [ [Option 1, Option 2, Option 3, Option 4],
  //   [OK,       Edit,     Delete] ]
  const navMap = [verticalItems, horizontalItems];

  // 2. Keep track of our current position
  let currentY = 0; // Row index (0 = vertical, 1 = horizontal)
  let currentX = 0; // Column index

  // 3. Function to set the focus
  function setFocus(y, x) {
    // Remove .focus from the old item
    const oldItem = navMap[currentY][currentX];
    if (oldItem) {
      oldItem.classList.remove("focus");
    }

    // Update current position
    currentY = y;
    currentX = x;

    // Add .focus to the new item
    const newItem = navMap[currentY][currentX];
    if (newItem) {
      newItem.classList.add("focus");
      // This makes the list scroll to the item if it's off-screen
      newItem.scrollIntoView({ block: "nearest" });
    }
  }

  // --- Global Key Handler ---
  function handleKeyDown(event) {
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault(); // Evita scroll nativo
        if (currentY === 0) {
          setFocus(0, Math.max(0, currentX - 1));
        } else {
          setFocus(0, verticalItems.length - 1); // Sube de la horizontal a la vertical
        }
        break;

      case "ArrowDown":
        event.preventDefault();
        if (currentY === 0) {
          if (currentX < verticalItems.length - 1) {
            setFocus(0, currentX + 1); //Baja un elemento
          } else {
            setFocus(1, 0); //Al llegar al final del grupo 0, salta al primer elemento del grupo 1
          }
        }
        break;

      case "ArrowLeft":
        if (currentY === 1) {
          setFocus(1, Math.max(0, currentX - 1));
        }
        break;

      case "ArrowRight":
        if (currentY === 1) {
          setFocus(1, Math.min(horizontalItems.length - 1, currentX + 1));
        }
        break;

      case "SoftLeft":
        console.log("Acción izquierda"); // Por ejemplo: Abrir Opciones
        break;

      case "SoftRight":
        // En KaiOS, la derecha suele ser "Atrás" o "Cerrar"
        window.close();
        break;

      case "Enter":
        const selected = navMap[currentY][currentX];
        console.log("Ejecutando:", selected.textContent);
        break;

      case "Backspace":
        event.preventDefault(); // ¡IMPORTANTE! Si no, la app se cierra o vuelve a la anterior
        window.close();
        break;
    }
  }

  // Add the key listener to the document
  document.addEventListener("keydown", handleKeyDown);

  // --- App Initialization ---
  updateSoftkeys("", "SELECT", "Back");

  // Set the initial focus on the first item when the app loads
  setFocus(0, 0);

  console.log("App: Navigation Initialized.");
});
