---
Bug ID: BUG-20250616-tutorial-textbox-dynamic-positioning
Status: Open
Date Reported: 2025-06-16
Date Updated: 2025-06-16
Reported By: User
Severity: Medium
Project: Toody's TipSplit Deluxe
Version: Refactor Phase
Assigned To: Copilot
Target Resolution Date:
Tags: UI, Tutorial, Dynamic Positioning, Scroll, Resize
---

## Bug Description
Tutorial text boxes should dynamically reposition during page scroll and window resize events, similar to how the highlight boxes currently behave. Currently, the text boxes remain in their initial position when the user scrolls or resizes the window, which can cause them to become misaligned with their target elements.

## Steps to Reproduce
1. Open `index.html` in a web browser
2. Start any tutorial that has multiple steps
3. Scroll the page up or down while the tutorial is active
4. Resize the browser window
5. Observe that the tutorial text box does not follow the highlighted element

## Expected Result
- Tutorial text box should reposition itself dynamically during scroll events
- Tutorial text box should reposition itself during window resize events
- Text box should maintain proper positioning relative to the highlighted element
- Behavior should match the dynamic repositioning of highlight boxes

## Actual Result
Tutorial text boxes remain in their initial position and become misaligned with target elements when the page is scrolled or window is resized.

## Environment
- OS: Windows
- Browser: All
- Application Version: Refactor Phase

## Attachments/Screenshots
N/A

## Notes
The highlight boxes already have dynamic repositioning implemented. The text boxes need similar event listeners and repositioning logic.

## Attempt Log
*This section is the living history of the bug, which you will maintain.*
