document.addEventListener("DOMContentLoaded", function () {
  const messageElement = document.getElementById("message");
  let clickCount = 0;

  function handleKeyDown(event) {
    switch (event.key) {
      case "Enter":
        clickCount++;
        messageElement.textContent =
          "¡I´ve press Enter " + clickCount + " times!";
        break;

      case "Backspace":
        window.close();
        break;
    }
  }
  document.addEventListener("keydown", handleKeyDown);
});
