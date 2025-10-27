document.addEventListener("DOMContentLoaded", function () {
  window.updateSoftkeys = function (lsk = "", csk = "", rsk = "") {
    document.getElementById("softkey-lsk").textContent = lsk;
    document.getElementById("softkey-csk").textContent = csk;
    document.getElementById("softkey-rsk").textContent = rsk;
  };

  // --- Handler of the global keys ---
  function handleKeyDown(event) {
    switch (event.key) {
      case "Backspace":
        event.preventDefault();
        if (window.accelerometer) {
          window.accelerometer.stop();
        }
        window.close();
        break;
    }
  }

  document.addEventListener("keydown", handleKeyDown);

  updateSoftkeys("", "", "Back");

  console.log("Accelerometer App Loaded");

  // --- ACCELEROMETER LOGIC ---

  const valX = document.getElementById("val-x");
  const valY = document.getElementById("val-y");
  const valZ = document.getElementById("val-z");

  try {
    // 'frequency: 1' means 1 reading per second.
    // Go up to 10 for most devices.
    const sensor = new Accelerometer({ frequency: 5 });

    window.accelerometer = sensor;

    sensor.onreading = () => {
      valX.textContent = sensor.x.toFixed(2);
      valY.textContent = sensor.y.toFixed(2);
      valZ.textContent = sensor.z.toFixed(2);
    };

    sensor.onerror = (event) => {
      console.error(
        "Accelerometer Error:",
        event.error.name,
        event.error.message
      );
      document.getElementById(
        "content"
      ).innerHTML = `<p style="color: red;">Error: ${event.error.name}</p>`;
    };

    sensor.start();
  } catch (error) {
    console.error("The sensor could not be initialized:", error);
    document.getElementById(
      "content"
    ).innerHTML = `<p style="color: orange;">Error: API not supported or permission denied.</p>`;
  }
});
