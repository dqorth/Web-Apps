---
ID: 1718544060000
Status: Open
Severity: High
Date Reported: 2025-06-16
---

## Bug Description
Data Management tutorial does not automatically expand the collapsible "Settings & Data Management" section before attempting to highlight elements inside it, causing element targeting to fail.

## Steps to Reproduce
1. Load the application with all sections collapsed
2. Click the "How-To" button in the "Settings & Data Management" section header
3. Observe that the tutorial starts but cannot highlight the download/load buttons

## Expected Behavior
The tutorial should automatically expand the "Settings & Data Management" section before highlighting the first element (#downloadStateBtn).

## Actual Behavior
The tutorial attempts to target elements inside a collapsed section, causing the tutorial to fail to highlight the correct elements.

---

## Attempt Log
*This section is the living history of the bug, which you will maintain.*

**Attempt 2025-06-16 14:30** - By: AI - **Result:** Failure
> **Action Taken:**
> Modified js/state.js data tutorial definition to add actionsBefore configuration to first step targeting #downloadStateBtn. Also changed second step target from '#loadStateFile' (hidden input) to 'label[for="loadStateFile"]' (visible label). Added actionsBefore: [{ type: 'expandCollapsible', trigger: '#dataManagementSection h2.collapsible-header', checkTarget: '#dataManagementContent' }].
> 
> **Reasoning:**
> Attempted to solve the section expansion issue by adding actionsBefore metadata to the tutorial step definition, and fixed the targeting issue by pointing to the visible label instead of hidden input. However, the actionsBefore mechanism itself is not functioning, so the section expansion still fails.

**Attempt 2025-06-16 16:25** - By: AI - **Result:** Failure
> **Action Taken:**
> Conducted live testing using bug-fix-verification.html. Data Management tutorial still fails to auto-expand the "Settings & Data Management" section before highlighting elements. Despite fixing property names in actionsBefore (triggerSelector/contentSelector), the mechanism is not executing during actual tutorial runs.
> 
> **Reasoning:**
> Even though the actionsBefore configuration appears correct in the code, the actual tutorial execution is not triggering the expansion mechanism. This indicates there may be an issue with how tutorials are initiated, how handleDynamicStepActions is called, or timing issues in the tutorial execution flow.

**Attempt 2025-06-16 16:50** - By: AI - **Result:** RESOLVED
> **Action Taken:**
> Fixed via the actionsBefore mechanism repair (BUG-20250616-actionsBefore-not-executing). User testing confirms the Data Management tutorial now correctly auto-expands the "Settings & Data Management" section before highlighting elements. The tutorial completes successfully with proper section expansion behavior.
> 
> **Reasoning:**
> This bug was a symptom of the underlying actionsBefore mechanism failure. Once the root cause was fixed (missing step.actionsBefore in the condition check), all tutorial section expansion issues were resolved. The data tutorial now works as intended.
