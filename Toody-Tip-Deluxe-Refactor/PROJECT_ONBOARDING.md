# Project Onboarding & Resumption Briefing

**To the AI assistant reading this file:** This document contains the current status of a large, ongoing refactoring project. Your objective is to use this briefing to get up to speed on our complex file structure, our multiple protocols, and our immediate task. A full and deep understanding of this document is required before any action is taken.

## 1. Core Project Protocols & Sources of Truth

This project is governed by **multiple** "source-of-truth" documents, each with a specific domain of authority. You must read, understand, and adhere to all of them. They are categorized as follows:

**A. General Specifications:**
* `REFACTORING_SPECIFICATION.md`: This is the master blueprint for the application's required end-state. It defines all business logic, data structures, and user-facing functionality. When in doubt about *what* the application should do, this is the final authority.

**B. Refactoring Plans:**
These documents outline the strategic approach for deconstructing the original monolithic codebase into a clean, modular architecture.
* `REFACTORING_PLAN.md`: The general, high-level plan that orchestrates the entire refactoring process.
* `REFACTORING_UI_PLAN.md`: A more granular plan that focuses specifically on separating UI rendering logic into dedicated components and files.
* `REFACTORING_EVENTS_PLAN.md`: The detailed plan for decoupling all event listeners and their handler functions from the main application logic.

**C. Process Protocols:**
These documents govern our day-to-day workflow and must be followed precisely.
* `BUG_TRACKING_PROTOCOL.md`: The strict, file-based rules for creating, managing, and closing all bug reports. Adherence to this ensures we maintain a clear history of issues and resolutions.
* `TUTORIAL_SYSTEM_REMEDIATION_PROTOCOL.md`: A special, high-priority protocol that temporarily overrides the general bug-tracking rules. It is currently active and provides specific instructions for fixing the complex tutorial system.

**Golden Rule:** The `original_app.html` file is a historical artifact and is strictly **READ-ONLY**. It serves only as the source material from which the new application is being built. Do not, under any circumstances, modify this file.

---

## 2. Current Project Status

**A. Codebase Structure:**
The application has been significantly refactored from a single file into a modern, modular structure. This separation of concerns is a core principle of the project.
* **JavaScript (`/js/`)** is now highly organized. The main directory contains foundational files (`main.js`, `state.js`, etc.), while logic is further divided into logical subdirectories: `/ui/` for all DOM manipulation functions, and `/events/` for all event handling logic. This architecture is crucial for maintainability.
* **CSS (`/css/`)** contains all styling in a single `styles.css` file, completely decoupled from the HTML.
* **HTML (`index.html`)** serves as the clean structural entry point, containing no inline styles or scripts, and linking to all external assets.

**B. Immediate Task & Active Protocol:**
Our current and immediate focus is resolving a critical bug within the application's interactive tutorial system. This task is considered high-priority as it impacts user onboarding.
* **Active Bug File:** `BUG-20250610-Tutorial-Buttons-Not-Working.md`, located in the `/bug_tracker/02_in_progress/` folder. This file contains the full history of our attempts to fix this issue.
* **Active Governing Protocol:** All work on this bug is strictly governed by the rules outlined in **`TUTORIAL_SYSTEM_REMEDIATION_PROTOCOL.md`**. You must consult this document before proposing any changes, as it contains specific strategies and constraints for this particular problem. This protocol takes precedence over the general bug tracking protocol for our current task.

---

## 3. Next Steps & Your First Task

Your first task is to fully synchronize with our active workstream by demonstrating a comprehensive understanding of the immediate context. This is a critical verification step.

- Open and perform a deep analysis of the active bug file: `bug_tracker/02_in_progress/BUG-20250610-Tutorial-Buttons-Not-Working.md`. Pay close attention to the "Attempt Log" to understand what has already been tried.
- Open and perform a deep analysis of the governing protocol for this task: `TUTORIAL_SYSTEM_REMEDIATION_PROTOCOL.md`. Understand the specific rules and objectives it outlines.
- **Confirm you are fully onboarded and ready by responding to the user with the following three points:**
    * A one-sentence summary of the "Tutorial Buttons Not Working" bug, based on its description.
    * A one-sentence summary of the primary goal of the "Tutorial System Remediation Protocol".
    * A one-sentence statement acknowledging the last failed attempt listed in the bug's "Attempt Log" to show you will not repeat previous errors.

Do not proceed with any other action or code suggestion until this confirmation is complete and the user has given you the command to proceed.
