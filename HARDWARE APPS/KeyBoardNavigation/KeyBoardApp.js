document.addEventListener("DOMContentLoaded", function () {
  // --- Helper Function: Update Softkeys ---
  window.updateSoftkeys = function (lsk = "", csk = "", rsk = "") {
    document.getElementById("softkey-lsk").textContent = lsk;
    document.getElementById("softkey-csk").textContent = csk;
    document.getElementById("softkey-rsk").textContent = rsk;
  };

  // --- Navigation Management ---

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
    // Prevent the browser's default D-Pad behavior (scrolling the page)
    event.preventDefault();

    switch (event.key) {
      case "ArrowUp":
        if (currentY === 0) {
          // In vertical list
          const newY = Math.max(0, currentX - 1); // Move up the list
          setFocus(0, newY);
        } else if (currentY === 1) {
          // In horizontal list
          // Move up to the vertical list (last selected item)
          setFocus(0, verticalItems.length - 1);
        }
        break;

      case "ArrowDown":
        if (currentY === 0) {
          // In vertical list
          const newY = Math.min(verticalItems.length - 1, currentX + 1);
          if (newY === verticalItems.length - 1) {
            // Reached bottom
            setFocus(0, newY); // Focus last item
          } else {
            setFocus(0, newY); // Move down the list
          }
        }
        // Optional: Move from vertical list to horizontal
        // if (currentX === verticalItems.length -1) { setFocus(1, 0) }
        break;

      case "ArrowLeft":
        if (currentY === 1) {
          // In horizontal list
          const newX = Math.max(0, currentX - 1);
          setFocus(1, newX);
        } else if (currentY === 0) {
          // In vertical list
          // Move from vertical list to horizontal
          setFocus(1, 0);
        }
        break;

      case "ArrowRight":
        if (currentY === 1) {
          // In horizontal list
          const newX = Math.min(horizontalItems.length - 1, currentX + 1);
          setFocus(1, newX);
        } else if (currentY === 0) {
          // In vertical list
          // Move from vertical list to horizontal
          setFocus(1, 0);
        }
        break;

      case "Enter":
      case "Accept":
        // Get the currently focused item and do something with it
        const selectedItem = navMap[currentY][currentX];
        alert("You selected: " + selectedItem.textContent);
        break;

      case "Backspace":
        event.preventDefault();
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
