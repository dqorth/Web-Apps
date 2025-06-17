---
Bug ID: BUG-20250610-Tutorial-Buttons-Not-Working
Status: In Progress
Date Reported: 2025-06-10
Date Updated: 2025-06-15
Reported By: System (from user observation)
Severity: Medium
Project: Toody's TipSplit Deluxe
Version: Refactor Phase
Assigned To: Copilot
Target Resolution Date:
Tags: UI, Tutorial, Button, Event Handling
---

## Bug Description
The "how-to" tutorial buttons located within collapsible sections (e.g., "How to Use This Section") do not perform their intended action (e.g., display a modal with help, navigate to a tutorial section) when clicked.

## Steps to Reproduce
1. Open `index.html` in a web browser.
2. Navigate to a section containing a "how-to" button (e.g., within a collapsible help section).
3. Click on one of these tutorial buttons.

## Expected Result
The button click should trigger the display of tutorial information or a related interactive guide.

## Actual Result
The buttons do not appear to do anything functional. The browser console logs the following message:
`index.html:237 APP_LOG: Clicked tutorial button, preventing collapse.`
This suggests an event listener is capturing the click but not executing the tutorial-specific logic, possibly only preventing the parent collapsible section from closing.

## Environment
- OS: All
- Browser: All
- Application Version: Refactor Phase

## Attachments/Screenshots
N/A

## Notes
The issue seems to be related to event handling for these specific buttons. The `preventDefault()` or `stopPropagation()` might be correctly preventing the collapse of the parent accordion/collapsible element, but the actual function to show the tutorial content is either missing or not being called.

## Attempt Log
---
### Attempt #1 (2025-06-13)
**Issue:** Tutorial buttons inside collapsible sections in `index.html` were not triggering the tutorial. Event listeners in `index.html` were capturing clicks, but the delegated listener in `js/events.js` was not firing.
**Fix Applied:**
1. Modified `index.html` to directly call `window.globalHandleStartTutorial(tutorialKey)` when a tutorial button is clicked. This bypasses the event delegation issue.
2. Exposed `handleStartTutorial` as `window.globalHandleStartTutorial` in `js/events.js`.
3. Refactored `showTutorialStep` in `js/ui.js` to correctly access tutorial step data, use DOM selectors, and display tutorial content. Fixed argument order in calls to `showTutorialStep` in `js/events.js`.
4. Corrected the reference to the tutorial step counter in `js/ui.js` from `domElements.tutorialStepIndicator` to `domElements.tutorialStepCounter` to match `js/domElements.js`.
**Result:** The tutorial now starts correctly when buttons within collapsible sections are clicked. The tutorial modal displays, highlights the correct element, and shows the step title, text, and step count.
**Files Modified:**
- `index.html`
- `js/events.js`
- `js/ui.js`
### Attempt #2 (2025-06-15)
**Issue:** Console error `Uncaught (in promise) TypeError: state.getTutorialData is not a function` occurred when trying to start a tutorial.
**Fix Applied:**
1.  In `js/state.js`:
    *   Added a `getTutorialData(key)` function that returns an object `{ key: key, steps: tutorials[key] }` or `null`.
    *   Refactored `setCurrentTutorial(tutorialKey, stepIndex)` to use `getTutorialData` and store the steps array in `currentTutorialSteps` and the index in `currentTutorialStepIndex`.
    *   Refactored `getCurrentTutorial()` to reconstruct an object `{ key: tutorialKey, steps: currentTutorialSteps, currentStepIndex: currentTutorialStepIndex }`. It attempts to find the `tutorialKey` by comparing the `currentTutorialSteps` array reference with those in the main `tutorials` object.
    *   `clearCurrentTutorial()` remains largely the same, clearing `currentTutorialSteps` and `currentTutorialStepIndex`.
2.  In `js/events.js`:
    *   Updated `handleStartTutorial`, `handleNextTutorialStep`, and `handlePrevTutorialStep` to use the new `state.getTutorialData()` and `state.getCurrentTutorial()` functions.
    *   Ensured that `tutorialData.steps` (the array of step objects) is passed to `ui.showTutorialStep`.
**Result:** The `state.getTutorialData is not a function` error should be resolved. The tutorial system should now correctly fetch and manage tutorial data.
**Files Modified:**
- `js/state.js`
- `js/events.js`
### Attempt #3 (2025-06-15)
**Issue:** Tutorial steps may target elements within main application sections that are not currently visible, or within collapsed sections. Highlighting needs to be smoother.
**Fix Applied:**
1.  **Section Switching (`js/ui.js` - `showTutorialStep`):
    *   Added logic to check if a tutorial step specifies a `targetSection` (e.g., Lineup, Daily Scoop).
    *   If the target section is not active/visible, the corresponding navigation tab (from `domElements.navTabs`) is clicked.
    *   The function now waits for the section (from `domElements.mainSections`) to become visible using `ensureElementIsReady` before proceeding.
2.  **Improved Element Visibility Check (`js/ui.js` - `ensureElementIsReady`):
    *   Enhanced `ensureElementIsReady` to check `style.visibility`, `style.display`, and `style.opacity` in addition to dimensions, ensuring an element is truly interactive.
    *   Increased default timeout and added a small initial delay for stability after DOM changes.
3.  **Collapsible Handling (`js/ui.js` - `showTutorialStep`):
    *   The existing logic to expand `<details>` elements and click `collapsible-trigger` elements was reviewed. Added a 250ms delay after each expansion/click to allow for animations and DOM updates.
    *   Added a 150ms delay after a main section tab click to allow the new section to render.
4.  **Highlight Box Styling (`js/ui.js` - `positionHighlightBox`):
    *   Added a more distinct border, rounded corners, and a box shadow to the highlight box. Transition properties for smooth movement and resizing were already present.
5.  **Text Box Positioning & Transition (`js/ui.js` - `positionTextBox`):
    *   Added an opacity transition for a fade-in effect.
    *   Improved positioning logic to better handle screen edges and attempt to place the text box beside the highlighted element if above/below placement is not ideal. Uses `window.scrollY` for correct positioning on scrolled pages.
**Result:** Tutorials should now correctly switch to the required main application section. Element highlighting is more robust due to improved visibility checks and handling of collapsible/dynamic content. Highlight box and text box have smoother transitions and better visual cues.
**Files Modified:**
- `js/ui.js`
### Attempt #4 (2025-06-15)
**Issue:** Following Attempt #3, the tutorial highlight box is consistently missing, and the tutorial step window (text box) is not appearing in view for any tutorial steps, regardless of the section.
**Diagnosis (Hypothesis):
*   The enhanced visibility checks in `ensureElementIsReady` or the logic in `positionHighlightBox` / `positionTextBox` might be too strict or flawed, causing the elements to be considered hidden even when they should be visible.
*   The new section switching logic, despite the delays, might not be allowing enough time for content to render before visibility checks occur, or there might be an issue with how active tabs/sections are determined.
*   The added delays and asynchronous operations might be interacting in unexpected ways, leading to race conditions where elements are queried before they are fully ready or after they have been (incorrectly) hidden.
*   A JavaScript error introduced in the last set of changes could be halting script execution before the tutorial UI is fully rendered.
**Next Steps (When Resuming):
1.  Thoroughly review the console logs for any new JavaScript errors that might have been introduced.
2.  Simplify or temporarily disable parts of the new visibility/positioning logic in `js/ui.js` (`showTutorialStep`, `ensureElementIsReady`, `positionHighlightBox`, `positionTextBox`) to isolate the cause.
3.  Add more detailed logging around element selection, visibility checks, and positioning calculations to understand why the highlight box and text box are not being displayed.
4.  Verify that `domElements.tutorialHighlightBox` and `domElements.tutorialTextBox` are correctly referenced and exist in the DOM when `showTutorialStep` is called.
5.  Test with a very simple tutorial step that targets an always-visible, static element to rule out issues with complex selectors or dynamic content.
**Files Modified (in Attempt #3, potentially causing issues):
- `js/ui.js`
**Current Status:** Paused. The tutorial feature is currently non-functional due to the missing highlight box and text box.

### Post-Refactoring Update (2025-06-15)
Subsequent to the attempts logged above, the `js/events.js` and `js/ui.js` files were extensively refactored into smaller, more focused modules. The core logic related to the tutorial system is now located as follows:

-   **Event Handlers:** (`handleStartTutorial`, `handleNextTutorialStep`, `handlePrevTutorialStep`) are now in `js/events/events-tutorial.js`.
-   **UI Manipulation Functions:** (`showTutorialStep`, `positionHighlightBox`, `positionTextBox`, `closeTutorial`, `ensureElementIsReady`) are now in `js/ui/ui-tutorial.js`.
-   **State Management:** Tutorial data functions (`getTutorialData`, `setCurrentTutorial`, `getCurrentTutorial`, `clearCurrentTutorial`) remain in `js/state.js` but are now consumed by the new event and UI tutorial modules.
-   **DOM Element References:** (`domElements.tutorialOverlay`, `domElements.tutorialHighlightBox`, etc.) are still sourced from `js/domElements.js`.

The issues described in "Attempt #4" (missing highlight box and text box, tutorial non-functional) persist and need to be investigated within the context of these new module paths. The diagnostic steps outlined in Attempt #4 are still relevant but should target the functions in their new locations (e.g., `showTutorialStep` in `js/ui/ui-tutorial.js`).

**Files Modified by Refactor (relevant to this bug):**
- `js/events.js` -> `js/events/events-tutorial.js`
- `js/ui.js` -> `js/ui/ui-tutorial.js`
- `js/state.js` (consumers updated)
- `index.html` (if `window.globalHandleStartTutorial` was used, its source in `js/events/events-tutorial.js` needs to be re-verified for global exposure if that pattern is maintained).
