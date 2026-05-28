### 📝 Description of Changes

Briefly explain what issues this PR fixes or what features it introduces.

### 📌 Technical Checklist (Mandatory for KaiOS)

Before requesting a review, please confirm that your changes strictly follow these platform guidelines:

- [ ] **Physical Navigation:** I have verified that all new interactive elements are 100% controllable using the D-Pad (directional keys), Center button, and Softkeys.
- [ ] **Performance:** The DOM tree remains lightweight, and the scrolling behavior within `#content` is fluid and not penalized.
- [ ] **Internationalization (l10n):** The `locales/es.properties` and `locales/en.properties` files have been updated with their corresponding `data-l10n-id`.
- [ ] **Resolution:** The UI layout scales and displays properly on standard 240x320 pixels screens.

### 🧪 Tests Performed

How did you test this change? (e.g., Tested on KaiOS 2.5 emulator / Verified on a physical Nokia device using keypad navigation).
