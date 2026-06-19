# KeyBoard App Navigation

---

## :video_game: 1. Functionality

The **KeyBoardApp** (commercially named *KaiNav Guide*) serves as the foundational reference implementation for non-touch spatial navigation within the KaiOS devices. On devices with low-end physical hardware, developers cannot rely on traditional mouse pointer events or touchscreen coordinates.

This application provides a fully operational, interactive user interface containing standard elements—such as vertical list items, a textual input field, and an action button—and demonstrates how a user can seamlessly traverse, focus, and interact with these components using exclusively the hardware Directional Pad (D-Pad) and the Center (Enter) key.

<details>
  <summary><b>:camera: Interface & Video Demo</b></summary>
   <p align="center">
    <img src="Images/KeyBoardApp.png" alt="KeyBoardApp Interface" width="240"><br><br>
    <a href="https://youtu.be/VpQ7VS9AOsE" target="_blank">
      <img src="https://img.shields.io/badge/Watch-YouTube_Demo-red?style=for-the-badge&logo=youtube" alt="Watch Video Demo">
    </a>
  </p>
</details>

---

## :triangular_ruler: 2. Architectural Approach

The architectural spine of this application relies on a **Vanilla JavaScript Two-Dimensional Matrix (NavMap)** combined with an automated DOM focus management subsystem.

1. **The NavMap Matrix:** Elements are mapped into a logical coordinate grid `[Y][X]`. Vertical rows represent distinct interactive levels, allowing complex interfaces to be structured programmatically:
   ```javascript
   var navMap = [
     [focusableItem1], // Row 0 (Option 1)
     [focusableItem2], // Row 1 (Option 2)
     [focusableItem3], // Row 2 (Option 3)
     [inputElement],   // Row 3 (Text Input)
     [actionButton]    // Row 4 (Submit Button)
   ];

2. Event Interception Loop: The application registers a low-level keydown event listener. When physical keys such as `ArrowUp` or `ArrowDown` are captured, the default browser scrolling behavior is immediately overridden via `event.preventDefault()`. The application then increments or decrements the internal `currentY` pointer and invokes the focus update pipeline.

---

## :zap: 3. Unique Features

Unlike modern web applications that rely on heavy polyfills or high-overhead CSS properties, KeyBoardApp introduces highly optimized strategies tailored for Gecko 48:

- **The "Mathematical Scroll" Algorithm:** Legacy layout engines struggle with modern CSS properties like `scroll-snap-type`, causing layout thrashing or input lag on a 1.28 GHz CPU. To guarantee a lightweight, 60 FPS performance, a custom algebraic formula calculates the vertical scroll offset in real-time, anchoring the focused element perfectly centered on the 2.4" QVGA screen:
```bash
    var scrollPos = activeItem.offsetTop - (contentHeight / 2) + (activeItem.offsetHeight / 2);
    content.scrollTop = scrollPos;
```
- **Implicit Input Field Activation:** When the spatial pointer lands on a row containing an `HTMLInputElement`, the script explicitly fires `.focus()` on the node. This forces the underlying KaiOS kernel (Gonk) to display the native system T9 IME keyboard helper. Conversely, moving away from the input automatically triggers `.blur()`, hiding the system keyboard and freeing up valuable screen real estate.

---

## :rocket: 4. Derived Application Ideas

By extending the 2D NavMap matrix and the Mathematical Scroll architecture engineered in this app, developers can build more complex software architectures:

- **D-Pad File Explorer:** Mapping directories and files into grid coordinates, using the scroll formula to reveal long lists of files while maintaining item centering.

- **Settings Dashboard Grid:** Creating multi-column option grids where `ArrowLeft` and `ArrowRight` navigate between toggles, checkboxes, and sliders on the same row.

- **Smart Feature Phone Launcher:** A 3x3 icon grid representing the main phone menu, utilizing bidirectional matrix navigation `([Y][X])` to handle edge limits.

- **Retro Gaming ROM Browser:** A visual list showcasing game titles and cover art, using the performant DOM focus mechanism to update previews without heap memory.   