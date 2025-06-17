---
Bug ID: BUG-20250616-tutorial-textbox-animation-missing
Status: Open
Date Reported: 2025-06-16
Date Updated: 2025-06-16
Reported By: User
Severity: Medium
Project: Toody's TipSplit Deluxe
Version: Refactor Phase
Assigned To: Copilot
Target Resolution Date:
Tags: UI, Tutorial, Animation, Text Box, UX
---

## Bug Description
Tutorial text boxes are teleporting to their new positions instead of smoothly animating like the highlight boxes. The highlight boxes have smooth, sleek animations when repositioning, but the text boxes instantly jump to their new location, creating a jarring user experience.

## Steps to Reproduce
1. Start any tutorial in the application
2. Scroll the page or resize the window during the tutorial
3. Observe that highlight boxes smoothly animate to their new positions
4. Observe that text boxes instantly teleport/jump to their new positions without animation

## Expected Result
Tutorial text boxes should have smooth CSS transitions/animations when repositioning, similar to the highlight boxes, providing a cohesive and polished user experience.

## Actual Result
Text boxes instantly teleport to their new positions without any animation or transition effects, creating a disjointed experience compared to the smooth highlight box animations.

## Environment
- OS: All
- Browser: All
- Application Version: Refactor Phase

## Attachments/Screenshots
N/A

## Notes
This affects the overall polish and user experience of the tutorial system. The highlight boxes already have the desired smooth animation behavior that should be replicated for text boxes.

---

## Attempt Log
*This section is the living history of the bug, which you will maintain.*
