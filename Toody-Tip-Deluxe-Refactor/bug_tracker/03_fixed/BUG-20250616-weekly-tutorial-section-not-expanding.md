---
ID: 1718544120000
Status: Open
Severity: High
Date Reported: 2025-06-16
---

## Bug Description
Weekly Report tutorial does not automatically expand the collapsible "The Weekly Rewind" section before attempting to highlight elements inside it, causing element targeting to fail.

## Steps to Reproduce
1. Load the application with all sections collapsed
2. Click the "How-To" button in "The Weekly Rewind" section header
3. Observe that the tutorial starts but cannot highlight navigation elements

## Expected Behavior
The tutorial should automatically expand "The Weekly Rewind" section before highlighting the first element (.week-navigation).

## Actual Behavior
The tutorial attempts to target elements inside a collapsed section, causing the tutorial to fail to highlight the correct elements.

---

## Attempt Log
*This section is the living history of the bug, which you will maintain.*

**Attempt 2025-06-16 14:30** - By: AI - **Result:** Failure
> **Action Taken:**
> Modified js/state.js weekly tutorial definition to add actionsBefore configuration to first step targeting '.week-navigation'. Added actionsBefore: [{ type: 'expandCollapsible', trigger: '#weeklyReportSection h2.collapsible-header', checkTarget: '#weeklyReportContent' }] to automatically expand "The Weekly Rewind" section.
> 
> **Reasoning:**
> Attempted to solve the section expansion issue by adding actionsBefore metadata to the tutorial step definition. However, the underlying actionsBefore execution mechanism in handleDynamicStepActions is not functioning, so the section expansion fails despite the configuration being present.

**Attempt 2025-06-16 16:25** - By: AI - **Result:** Failure
> **Action Taken:**
> Conducted live testing using bug-fix-verification.html. Weekly Report tutorial still fails to auto-expand "The Weekly Rewind" section before highlighting navigation elements. Despite fixing property names in actionsBefore (triggerSelector/contentSelector), the mechanism is not executing during actual tutorial runs.
> 
> **Reasoning:**
> Even though the actionsBefore configuration appears correct in the code, the actual tutorial execution is not triggering the expansion mechanism. This suggests the issue is in the tutorial execution flow, not just the property naming. Need to investigate how tutorials are started and how handleDynamicStepActions is invoked.

**Attempt 2025-06-16 16:50** - By: AI - **Result:** RESOLVED
> **Action Taken:**
> Fixed via the actionsBefore mechanism repair (BUG-20250616-actionsBefore-not-executing). User testing confirms the Weekly Report tutorial now correctly auto-expands "The Weekly Rewind" section before highlighting navigation elements. The tutorial completes successfully with proper section expansion behavior.
> 
> **Reasoning:**
> This bug was a symptom of the underlying actionsBefore mechanism failure. Once the root cause was fixed (missing step.actionsBefore in the condition check), all tutorial section expansion issues were resolved. The weekly tutorial now works as intended.
