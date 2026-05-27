# Contributing Guidelines

First of all, thank you for your interest in contributing to this guide! This is an open-source project focused on providing friendly guide and code examples for developing applications for KaiOS smart feature phones.

To maintain code quality and ensure the applications run smoothly on physical devices, we kindly ask you to follow these guidelines before submitting your changes.

---

## 1. How Can I Contribute?

### Reporting Bugs

If you find a bug in the application (such as coordinate capture failures or interface freezing), please open an _Issue_ on GitHub and include:

- **Device model** or an indication if you are using the official KaiOS emulator.
- **KaiOS version** of the device (KaiOS 2.5 / KaiOS 3.0).
- **Detailed steps** to reproduce the bug.
- **Expected behavior** versus the actual observed behavior.

### Proposing Enhancements or New Features

If you have ideas to optimize any app, improve battery consumption, or add a new feature:

1. Open an _Issue_ to discuss the proposal before writing any code.
2. Clearly explain the benefits of the enhancement and how it impacts performance on low-end hardware.

---

## 2. Git Workflow

To submit your code modifications, please follow this standard workflow:

1. **Fork** this repository.
2. Create a new branch with a descriptive name for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or for a bug fix:
   git checkout -b fix/bug-description
   ```
3. Implement your modifications, keeping the code style clean and well-structured.

4. Ensure your Git commit messages are clear and concise.

5. Push your branch to your remote repository (`git push origin feature/your-feature-name`) and open a Pull Request (PR) towards the `main` branch of this project.

---

## 3. Project Standards & Critical Rules

When developing for the KaiOS ecosystem, the code must strictly respect specific platform and architectural hardware limitations:

- **Physical Keyboard Navigation (D-Pad):** Any new interactive element added to the interface (`<button>`, `<input>`) must be correctly integrated. The application must remain 100% controlable using only directional keys, the Center button (`Enter`), and the Softkeys.

- **CSS Layouts:** Avoid heavy DOM selectors and complex layouts. The scrolling behavior of the `#content` container must remain fluid, lightweight, and performant.

- **Internationalization (l10n):** If you append a new UI text node in the HTML layout, remember to assign its corresponding `data-l10n-id` attribute and mandatory update both `locales/es.properties` and `locales/en.properties` files to maintain multi-language support.

---

## 4. Code Review Process

Once you submit your Pull Request:

- The code will be reviewed to ensure it does not introduce performance regressions or hardware deadlocks.

- Interface fluidness and responsiveness will be verified under the standard KaiOS screen resolution (240x320 pixels).

- If all checks pass successfully, your changes will be merged into the main branch.

---

**Thank you for your time and for helping us improve our guide!!**
