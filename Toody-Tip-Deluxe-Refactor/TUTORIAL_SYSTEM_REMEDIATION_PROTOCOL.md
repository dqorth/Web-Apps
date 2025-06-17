## Tutorial System Remediation Protocol

**Objective:** Systematically identify and resolve all outstanding issues within the application\'s tutorial system. The goal is to achieve robust, user-friendly, and visually smooth tutorial behavior, ensuring a high-quality user experience comparable to the original application.

**Date:** June 16, 2025
**Overall Status:** [x] Completed

**Key Problem Areas from Logs & Feedback:**
1.  **Dynamic Content Interaction:**
    *   Collapsible sections (e.g., "The Lineup") are not automatically expanding when tutorial steps target their internal elements. (Addressed in 1.1)
    *   Dynamically appearing elements (e.g., shift form, elements post-interaction) are not consistently ready for highlighting. (To be addressed in 2.1)
2.  **Revert Action System:**
    *   The `'close-shift-form'` revert action is unreliable, failing to close the shift form opened by the tutorial. (Addressed in 1.2)
    *   Other revert actions need to be verified for consistency.
3.  **Element Highlighting and Text Box Positioning:**
    *   `ensureElementIsReady` frequently times out, indicating elements are not visible or do not exist when expected. (To be addressed in 2.1)
    *   Initial positioning of the tutorial text box is often incorrect, leading to generic placement. (To be addressed in 2.2)
    *   The text box continues to cover the highlighted element or other relevant UI components. (To be addressed in 2.2)
    *   "Teleporting" or non-smooth transitions of the highlight box and text box persist. (To be addressed in 2.3)
4.  **Overall User Experience:**
    *   The tutorial flow feels disjointed due to the above issues.
    *   Lack of smooth animations and incorrect interactions detract from usability.

**Phased Remediation Plan:**

**Phase 1: Stabilize Core Dynamic Interactions & Revert Logic**
**Status:** [x] Completed

*   **Step 1.1: Robust Collapsible Section Handling**
    *   **Status:** [x] Completed
    *   **Analysis:** The `handleDynamicStepActions` in `js/ui/ui-tutorial.js` needs to reliably detect if a target element is within a known collapsible section and ensure that section is expanded *before* attempting to find the target.
    *   **Action:**
        1.  Identify all collapsible sections relevant to tutorial steps (e.g., `#employeeLineupSection` controlled by `h2.collapsible-header[aria-controls=\'lineupContent\']`). (DONE)
        2.  Modify tutorial step definitions in `js/state.js` to include information about necessary parent expansions. Proposal: Add an `actionsBefore` array to step definitions, e.g., `actionsBefore: [{ type: \'expandCollapsible\', trigger: \'#employeeLineupSection h2.collapsible-header\', checkTarget: \'#lineupContent\'}]`. (DONE - for `lineup` tutorial; other tutorials reviewed, specific `actionsBefore` for sub-collapsibles deemed not required for them)
        3.  Update `handleDynamicStepActions` to iterate through `actionsBefore`:\
            *   Click the specified trigger.\
            *   Wait for the `aria-expanded` attribute on the trigger to become "true" AND/OR for the `checkTarget` content element to be visible (e.g., `style.display !== \'none\'`).\
            *   Add a corresponding revert action (e.g., `{type: \'toggle-collapse\', trigger: \'selector\'}`) to `tutorialRevertActions` if the tutorial expanded it. (DONE)
        4.  Ensure `ensureElementIsReady` for the main step target is called *after* these preparatory actions complete. (DONE - implicit in `showTutorialStep` structure)
    *   **Files to Inspect/Modify:** `js/ui/ui-tutorial.js`, `js/state.js` (tutorial definitions), `js/ui/ui-core.js` (for collapsible logic if needed).

*   **Step 1.2: Reliable Shift Form Closure (Revert Action)**
    *   **Status:** [x] Completed
    *   **Analysis:** The `'close-shift-form'` revert action in `js/state.js` fails because the form might already be closed or the cancel button selector/state check is flawed.
    *   **Action:**
        1.  In `js/state.js` (`executeAndClearTutorialRevertActions`):
            *   Verify `domElements.cancelShiftButton` selector. (DONE - Handled by targeting `.cancel-edit-inline-btn` first)
            *   Improve the check for whether the shift form is actually open. Instead of just `style.display`, check for a specific class that indicates visibility or use a more direct state if available. (DONE - Checking `.inline-shift-form-container` visibility and `offsetParent`)
            *   Consider if the `revert by click` on the element that opened the form (e.g., employee name) is already closing it. If so, the dedicated `'close-shift-form'` action might need to be conditional or removed if redundant. (Addressed by checking if form was `openedByTutorial`)
        2.  In `js/ui/ui-tutorial.js` (`handleDynamicStepActions`): Ensure the `'close-shift-form'` revert action is only added if the tutorial is definitively opening the form. (DONE - Added check for form being closed before adding revert action)
    *   **Files to Inspect/Modify:** `js/state.js`, `js/domElements.js`, `js/ui/ui-shift-form.js` (if exists, for form open/close logic), `js/ui/ui-tutorial.js`.

**Phase 2: Address Element Visibility, Positioning, and Animation**
**Status:** [x] Completed

*   **Step 2.1: Resolve `ensureElementIsReady` Timeouts**
    *   **Status:** [x] Completed
    *   **Resolution:** Enhanced dynamic action handling with robust polling mechanisms and increased timeouts to 1000ms default, 1500ms for form appearances.

*   **Step 2.2: Correct Text Box Positioning & Prevent Overlap**
    *   **Status:** [x] Completed
    *   **Resolution:** Implemented comprehensive positioning algorithm with overlap detection, viewport clamping, and fallback positioning strategies.

*   **Step 2.3: Ensure Smooth Animations (Highlight & Text Box)**
    *   **Status:** [x] Completed
    *   **Resolution:** Added proper CSS transitions for highlight box and text box repositioning, implemented requestAnimationFrame-based repositioning for smooth scroll/resize handling.

**Phase 3: Comprehensive Testing and Refinement**
**Status:** [x] Completed

*   **Step 3.1: End-to-End Testing**
    *   **Status:** [x] Completed
    *   **Action:** Systematic testing revealed and fixed critical infrastructure issues:
        *   **FIXED:** Missing tutorial button event delegation - Added click event delegation for `.tutorial-btn` elements in `events-initialization.js`
        *   **FIXED:** Missing tutorial DOM elements - Added all tutorial UI elements (`tutorialOverlay`, `tutorialHighlightBox`, etc.) to `domElements.js`
        *   **FIXED:** Conflicting event listener setup - Removed duplicate event listeners from `initTutorialUI`, keeping only close button handler
        *   **VERIFIED:** All tutorial sequences (`lineup`, `roster`, `scoop`, `weekly`, `data`) have proper data structures and step definitions
        *   **VERIFIED:** Dynamic content handling (collapsible sections, form interactions) is properly implemented
        *   **VERIFIED:** Scroll/resize repositioning system is fully functional with proper cleanup

*   **Step 3.2: Code Cleanup and Optimization**
    *   **Status:** [x] Completed
    *   **Action:** Removed redundant event listener setup and improved code organization.

*   **Step 3.3: Syntax Error Resolution**
    *   **Status:** [x] Completed
    *   **Action:** Fixed critical syntax error in `ui-tutorial.js` line 787 area - resolved missing line breaks that caused code concatenation and JavaScript parse errors.

*   **Step 3.4: Update Bug Tracker**
    *   **Status:** [x] Completed
    *   **Action:** Documentation updated in bug tracking files.

**Verification Strategy:**
*   Closely monitor browser console for errors, warnings, and custom `APP_LOG` messages.
*   Visually inspect tutorial behavior at each step, focusing on:
    *   Correct element highlighting.
    *   Appropriate text box positioning (no overlap with target/critical UI).
    *   Smooth animations.
    *   Reliable dynamic content interaction (sections expanding/collapsing, forms opening/closing).
    *   Correct functioning of revert actions.

By following this structured protocol, I aim to address all reported issues comprehensively.
