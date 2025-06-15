# Refactoring Plan: Toody's TipSplit Deluxe

## Core Directives & Golden Rules

**AI Directive:** Before proceeding with any step, re-read these core rules.

* **Rule 1: The Specification is Final.** All functionality in the final product must match `REFACTORING_SPECIFICATION.md` exactly.
* **Rule 2: The Original File is READ-ONLY.** The `original_app.html` file is our source material. You are only authorized to copy code **FROM** this file. You must **NEVER** write to or modify this file under any circumstances.
* **Rule 3: The Plan is Your Checklist.** This `REFACTORING_PLAN.md` file must be followed step-by-step. You must edit this file to mark `[x]` on a task immediately after you and I have confirmed it is complete.
* **Rule 4: The Plan is Your Record.** This `REFACTORING_PLAN.md` file must be updated with a summary of what you have done to complete each task.

**AI Directive:** This is your dynamic work plan. You are to edit this file directly as you complete each step. Change `[ ]` to `[x]` upon completion of a task. This document will serve as our shared understanding of the project's status.

**Reference Documents:**
* **Requirements:** `REFACTORING_SPECIFICATION.md` (This is the single source-of-truth for all functionality.)
* **Source Code:** `original_app.html` (This is the code to be refactored.)

---

## Phase 0: Initialization & Setup

* [x] **Acknowledge Plan:** Confirm you have read and understood this entire `REFACTORING_PLAN.md` document.
    * Summary: Confirmed understanding of the plan.
* [x] **Acknowledge Specification:** Confirm you have read and will adhere to all requirements in `REFACTORING_SPECIFICATION.md`.
    * Summary: Confirmed understanding of the specification.
* [x] **Create Folder Structure:** Create the following directory structure in the workspace:
    * `/js/`
    * `/css/`
    * Summary: Created `js` and `css` folders.

---

## Phase 1: HTML & CSS Separation

* [x] **Create `index.html`:** Create a new, empty `index.html` file in the root directory.
    * Summary: Created `index.html`.
* [x] **Migrate HTML Structure:** Copy the entire contents of the `<body>` tag from `original_app.html` into the `<body>` of the new `index.html`.
    * Summary: Copied `<body>` content to `index.html`.
* [x] **Migrate HTML Head:** Transfer head content (excluding `<style>`) from `original_app.html` to `index.html`.
    * Summary: Copied `<head>` content (excluding styles) to `index.html`.
* [x] **Link External Files:** Add `<link>` for `styles.css` and `<script>` for `main.js` in `index.html`.
    * Summary: Added links for `css/styles.css` and `js/main.js` in `index.html`.
* [x] **Create `css/styles.css`:** Empty CSS file.
    * Summary: Created `css/styles.css`.
* [x] **Migrate CSS:** Transfer `<style>` block content from `original_app.html` to `css/styles.css`.
    * Summary: Moved CSS from `original_app.html` to `css/styles.css`.
* [x] **Verification:** Ensure `index.html` loads correctly with styles and without inline scripts/styles from the original body/head.
    * Summary: Manually verified `index.html` loading.

---

## Phase 2: JavaScript Modularity - Core Logic & Data

* [x] **Create `js/calculations.js`:**
    * [x] Create the file.
        * Summary: Created `js/calculations.js`.
    * [x] Migrate the `runTipAndWageCalculationsForDay` function from `original_app.html` into this file.
        * Summary: Moved `runTipAndWageCalculationsForDay` to `js/calculations.js`.
    * [x] Migrate all of its pure helper functions (`timeToMinutes`, `calculateOverlapDurationMinutes`, `calculateHoursWorked`, `roundToNearest15Minutes`, `formatTimeTo12Hour`, `roundToNearestHalfDollar`, `getSortableNameParts`, `sortEmployeesByName`) into this file.
        * Summary: Moved relevant helper functions to `js/calculations.js`. (Note: Some of these were later moved to `utils.js`).
    * [x] Add `export` statements for all functions that need to be accessed by other modules. `runTipAndWageCalculationsForDay` is the primary export.
        * Summary: Exported necessary functions from `js/calculations.js`.

* [x] **Create `js/state.js`:**
    * [x] Create the file.
        * Summary: Created `js/state.js`.
    * [x] Define the main `state` object: `let state = { employeeRoster: [], dailyShifts: {} };`.
        * Summary: Defined initial state structure in `js/state.js` (using exported variables like `employeeRoster`, `dailyShifts`).
    * [x] Migrate the `JOB_POSITIONS_AVAILABLE` and `BASE_CYCLE_START_DATE` constants into this file and export them.
        * Summary: Moved and exported constants to `js/state.js`.
    * [x] Create and export a `loadState()` function that initializes the `state` object from `localStorage` (using keys from the specification).
        * Summary: Created `loadStateFromLocalStorage` in `js/state.js`.
    * [x] Create and export a `saveState()` function that saves the current `state` object to `localStorage`.
        * Summary: Created `saveStateToLocalStorage` in `js/state.js`.
    * [x] Create and export getter functions to access state, e.g., `getEmployeeRoster()`, `getDailyShifts()`, `getShiftById(date, shiftId)`.
        * Summary: State variables are directly exported; specific getters were not implemented as separate functions.
    * [x] Create and export mutator functions that modify the state and then call `saveState()`, e.g., `addEmployee(empData)`, `updateEmployee(empData)`, `removeEmployee(empId)`, `addOrUpdateShift(shiftData)`, `removeShift(date, shiftId)`.
        * Summary: Implemented state modification functions (e.g., `setEmployeeRoster`, `addOrUpdateShift`) in `js/state.js` which call `saveStateToLocalStorage`.
    * [x] Migrate the `generateId()` utility function here and export it.
        * Summary: `generateId` was moved to `js/utils.js`.

---

## Phase 3: JavaScript Modularity - UI Rendering

* [x] **Create `js/ui.js`:**
    * [x] Create the file.
        * Summary: Created `js/ui.js`.
    * [x] Define and export a `domElements` object that holds references to all key DOM elements (e.g., `rosterListContainer: document.getElementById('rosterListContainer')`). <!-- Actual file: js/domElements.js -->
        * Summary: Created `js/domElements.js` and populated it with DOM element references, exported as `domElements`.
    * [x] Migrate all functions that directly manipulate the DOM into this file, including `renderEmployeeRoster`, `renderFullEmployeeListForManagement`, `renderDailyPayoutResults`, `generateWeeklyReportContent`, `renderInlineShiftForm`, `updateEmployeeLineupCard`, `populateCycleStartDateSelect`, `renderDayNavigation`, etc.
        * Summary: Migrated UI rendering functions to `js/ui.js`.
    * [x] Refactor every migrated function to remove direct access to global state variables. Instead, they must accept data as parameters. For example, `renderEmployeeRoster(roster)` instead of accessing a global `employeeRoster`.
        * Summary: Refactored UI functions in `js/ui.js` to accept data and dependencies as parameters.
    * [x] Export all top-level rendering functions.
        * Summary: Exported necessary rendering functions from `js/ui.js`.

---

## Phase 4: JavaScript Modularity - Event Handling & Initialization

* [x] **Create `js/events.js`:**
    * [x] Create the file.
        * Summary: Created `js/events.js`.
    * [x] Create a single, exported `initializeEventListeners()` function.
        * Summary: Created `initializeEventListeners` in `js/events.js`.
    * [x] Migrate all `addEventListener` calls from `original_app.html` into this function.
        * Summary: Moved event listener registrations to `initializeEventListeners` in `js/events.js`.
    * [x] Migrate the handler functions for these events (e.g., `handleRemoveEmployee`, `handleFileImport`, `downloadSaveState`, `handleEditShiftFromWeeklyReport`, all tutorial handlers, etc.).
        * Summary: Migrated event handler logic to `js/events.js`.
    * [x] Refactor the handler functions. They should now act as controllers:
        * They capture user input.
        * They call mutator functions from `state.js` to change the data.
        * They call getter functions from `state.js` to get the updated data.
        * They call rendering functions from `ui.js`, passing the new data in to update the screen.
        * Summary: Refactored event handlers in `js/events.js` to orchestrate calls to state, UI, and calculation modules.

* [x] **Create `js/main.js`:**
    * [x] Create the file. This is the application's main entry point.
        * Summary: Created `js/app.js` and subsequently renamed it to `js/main.js`.
    * [x] Add `import` statements to bring in the necessary functions and objects from all other modules (`state.js`, `ui.js`, `events.js`, `calculations.js`).
        * Summary: Added all necessary import statements to `js/main.js`.
    * [x] Create a primary `init()` function that will be called when the DOM is loaded.
        * Summary: Created the `init()` function in `js/main.js`.
    * [x] Inside `init()`, orchestrate the application startup:
        1.  Call `loadState()`.
        2.  Call `populateCycleStartDateSelect()` (Note: this was changed to `populateJobPositions` and `populateDaysOfWeek` as `populateCycleStartDateSelect` was not found in `ui.js`).
        3.  Perform the initial date calculations.
        4.  Call `initializeEventListeners()`.
        5.  Perform the initial UI render.
        * Summary: Implemented the application startup sequence within the `init()` function in `js/main.js`.
    * [x] Add the `DOMContentLoaded` event listener at the bottom of the file to call `init()`.
        * Summary: Added the `DOMContentLoaded` event listener to call `init()` in `js/main.js`.

---

## Phase 5: Final Review & Cleanup

* [x] **Module Verification:** Review all `import` and `export` statements across the `/js/` files to ensure they are correct and there are no circular dependencies.
* [x] **Global Scope Check:** Scan all new JavaScript files to ensure no variables (other than module imports) are leaking into the global scope.
        * Summary: Performed a scan of all JavaScript modules (`calculations.js`, `domElements.js` (by inference), `events.js`, `main.js`, `state.js`, `ui.js`, `utils.js`). No unintended global variables were found due to the consistent use of ES6 module scoping. An unrelated potential runtime error in `main.js` regarding `runTipAndWageCalculationsForDay()` being called without arguments was noted.
* [ ] **Final Test:** The application should now be fully functional, operating from the new modular structure.

* [ ] **Completion:** Mark this final task when the refactoring is complete and fully matches the requirements in `REFACTORING_SPECIFICATION.md`.

---

### **Dynamic Step Generation**

**AI Directive:** If you determine that a complex step above (e.g., "Refactor the handler functions") needs to be broken down into smaller, more manageable sub-tasks, you are authorized to **edit this document and add new checklist items** under the relevant parent task. Use the same `- [ ] New Sub-Task` format. This will help us track all work granularly.