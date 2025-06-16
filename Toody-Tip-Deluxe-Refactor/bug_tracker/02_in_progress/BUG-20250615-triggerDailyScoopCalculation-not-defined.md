---
ID: 1749984000000 
Status: Fixed
Severity: High
Date Reported: 2025-06-15
---

## Bug Description
The function `triggerDailyScoopCalculation` is not defined, leading to an error when certain UI elements that depend on it are interacted with. Specifically, this error occurs when the "payoutContent" collapsible section in `index.html` is expanded.

## Steps to Reproduce
1. Load `index.html`.
2. Click on the header for the "Daily Scoop" section (which has `aria-controls="payoutContent"`) to expand it.
3. Observe the JavaScript console for the error: `(index):266 Error: triggerDailyScoopCalculation function is not defined.`

## Expected Behavior
When the "Daily Scoop" section is expanded, the `triggerDailyScoopCalculation` function should be called without error, presumably to update or display data relevant to that section.

## Actual Behavior
An error `(index):266 Error: triggerDailyScoopCalculation function is not defined.` is thrown in the console. The content of the "Daily Scoop" section may not load or update correctly.

---

## Attempt Log
*This section is the living history of the bug, which you will maintain.*

**Attempt [2025-06-15 17:00]** - By: AI - **Result:** Success
> **Action Taken:**
> Modified `js/main.js` to import `triggerDailyScoopCalculation` and `triggerWeeklyRewindCalculation` from `js/events/events-app-logic.js`. These functions were then assigned to the `window` object (e.g., `window.triggerDailyScoopCalculation = triggerDailyScoopCalculation;`) to make them globally accessible.
> Modified `index.html` to explicitly call these functions via the `window` object (e.g., `window.triggerDailyScoopCalculation();`) within the inline `initializeCollapsibleSections` script. This was done for clarity, although direct calls would also work after exposing them on the `window` object.
>
> **Reasoning:**
> The error occurred because functions defined in ES6 modules are not directly accessible to inline scripts in HTML unless explicitly exposed to the global scope. Attaching them to the `window` object makes them available globally, resolving the `ReferenceError`.
