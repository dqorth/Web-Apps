<!-- filepath: c:\Users\orthd\OneDrive\Documents\CodeMonkeez\Projects\Toody-Tip-Deluxe-Refactor\bug_tracker\01_open\BUG-20250610-inline-script-collapsible-sections.md -->
---
id: BUG-20250610-inline-script-collapsible-sections
title: Inline script for collapsible sections in index.html
status: fixed
severity: low
date_reported: 2025-06-10
date_fixed: 2025-06-16
reporter: Copilot
assigned_to: Unassigned
description: |
  The `index.html` file contains an inline script for `initializeCollapsibleSections`. This might deviate from the modular refactoring goal if this functionality is intended to be part of the JavaScript modules. Consider moving this to an appropriate JS module (e.g., `ui.js` or `events.js`) and calling it from `main.js`.
steps_to_reproduce: |
  1. Inspect the `<body>` section of `index.html` towards the end.
  2. Observe the inline `<script>` tag containing the `initializeCollapsibleSections` function and its call.
expected_behavior: |
  All JavaScript logic, including UI interactions like collapsible sections, should be handled by external JS modules as per the refactoring goals to maintain separation of concerns and modularity.
actual_behavior: |
  An inline script handles the collapsible sections functionality.
affected_files:
  - index.html
  - js/ui/ui-core.js
  - js/main.js
related_issues:
  - REFACTORING_PLAN.md (General principle of modularization)
---

## Attempt Log
*This section is the living history of the bug, which you will maintain.*

### Post-Refactoring Update (2025-06-15)
The `initializeCollapsibleSections` function, originally in `js/ui.js`, has been refactored and moved to `js/ui/ui-core.js`.
The core issue of the inline script in `index.html` still needs to be addressed. The script should either be removed and its functionality triggered from `main.js` (which would call the new `js/ui/ui-core.js` module), or the inline script itself needs to be updated if it directly calls a global function (though the aim was to avoid globals).
The bug's relevance is confirmed.

**2025-06-16: Attempt 1 (Fixed)**
- **Action:**
  1. Modified `js/ui/ui-core.js`:
     - Ensured `initializeCollapsibleSections` correctly uses `window.handleStartTutorial`, `window.triggerDailyScoopCalculation`, and `window.triggerWeeklyRewindCalculation` for callbacks triggered by user interaction within the collapsible sections. `applyMasonryLayoutToRoster` is called directly as it's imported.
     - Adjusted the logic for determining the initial collapsed state: `lineupContent` defaults to open, `dataManagementContent` defaults to closed if no state is found in `localStorage`. Other sections default to collapsed.
  2. Modified `js/main.js`:
     - Imported `initializeCollapsibleSections` from `js/ui/ui-core.js`.
     - Called `initializeCollapsibleSections()` within the `init()` function.
     - Passed a callback function to `initializeCollapsibleSections` that specifically calls `applyMasonryLayoutToRoster()` when the `lineupContent` section is expanded. Imported `applyMasonryLayoutToRoster` from `js/ui/ui-roster.js` for this purpose.
  3. Modified `index.html`:
     - Removed the entire inline `<script>` block that defined and called `initializeCollapsibleSections`.
- **Result:** The inline script has been successfully removed from `index.html`. The collapsible sections are now initialized and managed by `js/ui/ui-core.js`, called from `js/main.js`. The functionality, including tutorial invocation and dynamic content loading/refresh (like daily scoop, weekly rewind, and roster masonry layout), remains operational and correctly tied to the expansion of relevant sections.
- **Status:** Marked as Fixed.
