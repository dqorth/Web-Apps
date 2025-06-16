import { domElements } from '../domElements.js';
// import { someUtilFunction } from '../utils.js'; // Example if needed

// Helper function (potentially to be moved to a shared utils.js if more broadly used)
async function ensureElementIsReady(selector, timeout = 500, attempt = 1) {
    console.log(`APP_LOG: ensureElementIsReady - Attempt ${attempt} for selector: ${selector}, timeout: ${timeout}`);
    return new Promise((resolve) => {
        let elapsedTime = 0;
        const intervalTime = 50; // Check more frequently initially

        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element && (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0)) {
                const style = window.getComputedStyle(element);
                if (style.visibility !== 'hidden' && style.display !== 'none' && style.opacity !== '0') {
                     console.log(`APP_LOG: ensureElementIsReady - Element found and visible: ${selector}`, element);
                    resolve(element);
                    return;
                } else {
                    console.log(`APP_LOG: ensureElementIsReady - Element found but not visible (hidden, display:none, or opacity:0): ${selector}`, style.visibility, style.display, style.opacity);
                }
            }
            
            elapsedTime += intervalTime;
            if (elapsedTime < timeout) {
                setTimeout(checkElement, intervalTime);
            } else {
                console.warn(`APP_LOG: ensureElementIsReady - Timeout. Element not found or not visible: ${selector}`);
                resolve(null); // Timeout
            }
        };
        setTimeout(checkElement, 50); // Initial delay
    });
}

export async function showTutorialStep(stepIndex, tutorialData, domElementsInstance) {
    // Note: domElementsInstance is passed in, assuming it's already initialized
    // If domElements is globally available via its own module, direct import is also an option.
    // For this refactor, we'll assume domElements is passed if it was passed to the original ui.js functions.
    // If it was imported directly in ui.js, the new module should also import it directly.
    // Based on ui.js structure, it seems domElements is imported, so we'll use that.

    console.log(`APP_LOG: showTutorialStep called for stepIndex: ${stepIndex}`);
    if (!tutorialData || stepIndex < 0 || stepIndex >= tutorialData.length) {
        console.error("APP_LOG: Invalid tutorial data or step index.", tutorialData, stepIndex);
        closeTutorial(domElements); // Assuming domElements is accessible or passed correctly
        return;
    }

    const step = tutorialData[stepIndex]; 
    console.log("APP_LOG: Current tutorial step data:", step);

    if (!domElements || !domElements.tutorialOverlay || !domElements.tutorialHighlightBox || !domElements.tutorialTextBox) {
        console.error("APP_LOG: Tutorial DOM elements not found. Aborting.", domElements);
        return;
    }

    // Initial setup of overlay and textbox display state will be managed per case (target vs no target)
    // domElements.tutorialOverlay.style.display = 'block'; // Deferred
    // domElements.tutorialTextBox.style.display = 'block'; // Deferred

    let actualTargetElement = null;
    const primarySelector = step.element;
    const fallbackSelector = step.fallbackElement;

    // --- SECTION SWITCHING AND EXPANSION LOGIC (Still Disabled) ---

    if (primarySelector) {
        console.log("APP_LOG: Attempting to find primary target with selector:", primarySelector);
        actualTargetElement = await ensureElementIsReady(primarySelector, 750); // Increased timeout slightly
    }
    if (!actualTargetElement && fallbackSelector) {
        console.log("APP_LOG: Primary target not found or undefined, trying fallback with selector:", fallbackSelector);
        actualTargetElement = await ensureElementIsReady(fallbackSelector, 750); // Increased timeout slightly
    }

    if (actualTargetElement && (actualTargetElement.offsetWidth > 0 || actualTargetElement.offsetHeight > 0 || actualTargetElement.getClientRects().length > 0)) {
        console.log("APP_LOG: Target element confirmed visible after ensureElementIsReady:", actualTargetElement);
    } else {
        console.warn("APP_LOG: Target element NOT visible or found after ensureElementIsReady. Selector:", primarySelector || fallbackSelector);
        actualTargetElement = null; 
    }

    const stepTitle = step.title || "Tutorial Tip";
    const stepText = step.text || "No text for this step.";

    if (domElements.tutorialTitle) domElements.tutorialTitle.textContent = stepTitle;
    if (domElements.tutorialText) domElements.tutorialText.textContent = stepText;

    if (actualTargetElement) {
        domElements.tutorialOverlay.style.display = 'block';
        domElements.tutorialOverlay.style.backgroundColor = 'transparent'; // Overlay is clear, highlightbox shadow provides dimming
        domElements.tutorialTextBox.style.display = 'block'; // Show textbox, positioning will follow

        requestAnimationFrame(() => { 
            console.log("APP_LOG: showTutorialStep (rAF) - Positioning highlight box for:", actualTargetElement);
            positionHighlightBox(domElements.tutorialHighlightBox, actualTargetElement);

            const highlightBoxElement = domElements.tutorialHighlightBox;
            let highlightBoxRectForPositioning = null;

            if (highlightBoxElement && typeof highlightBoxElement.getBoundingClientRect === 'function' && window.getComputedStyle(highlightBoxElement).display !== 'none') {
                highlightBoxRectForPositioning = highlightBoxElement.getBoundingClientRect();
                console.log("APP_LOG: showTutorialStep (rAF) - Got highlightBoxRectForPositioning:", highlightBoxRectForPositioning);
            } else {
                console.warn("APP_WARN: showTutorialStep (rAF) - highlightBoxElement not valid for BoundingClientRect when preparing for positionTextBox.");
            }
            
            const stepDataForPositioning = step;
            const textBoxElementForPositioning = domElements.tutorialTextBox;

            if (!textBoxElementForPositioning || !stepDataForPositioning || !highlightBoxRectForPositioning) {
                console.error("APP_ERROR: showTutorialStep (rAF) - Critical args for positionTextBox invalid. Positioning textbox generically.", {
                    textBoxElementForPositioning: !!textBoxElementForPositioning,
                    stepDataForPositioning: !!stepDataForPositioning,
                    highlightBoxRectForPositioning: !!highlightBoxRectForPositioning
                });
                // Generic positioning for the text box if highlight failed or rect not available
                const textBox = domElements.tutorialTextBox;
                textBox.style.position = 'fixed'; 
                textBox.style.top = '20%';
                textBox.style.left = '50%';
                textBox.style.transform = 'translateX(-50%)';
                textBox.style.zIndex = '10001';
                textBox.style.opacity = '1';
                textBox.style.backgroundColor = 'white'; 
                textBox.style.color = 'black'; 
                textBox.style.padding = '1em';
                textBox.style.border = '2px solid black';
                textBox.style.right = 'auto';
                textBox.style.bottom = 'auto';
            } else {
                positionTextBox(textBoxElementForPositioning, stepDataForPositioning, highlightBoxRectForPositioning);
            }
        });
    } else {
        console.warn(`APP_LOG: No valid target element for step: \'${step.title}\'. Positioning text box generically.`);
        
        domElements.tutorialOverlay.style.display = 'block';
        domElements.tutorialOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Standard dim for generic message
        
        if (domElements.tutorialHighlightBox) {
            domElements.tutorialHighlightBox.style.display = 'none'; 
            domElements.tutorialHighlightBox.style.boxShadow = 'none'; // Clear any previous shadow
        }

        const textBox = domElements.tutorialTextBox;
        textBox.style.display = 'block'; 
        textBox.style.position = 'fixed'; 
        textBox.style.top = '20%';
        textBox.style.left = '50%';
        textBox.style.transform = 'translateX(-50%)';
        textBox.style.zIndex = '10001'; 
        textBox.style.opacity = '1';
        textBox.style.backgroundColor = 'white'; 
        textBox.style.color = 'black'; 
        textBox.style.padding = '1em';
        textBox.style.border = '2px solid black';
        textBox.style.right = 'auto';
        textBox.style.bottom = 'auto';
    }

    if (domElements.tutorialStepCounter) {
        domElements.tutorialStepCounter.textContent = `Step ${stepIndex + 1} of ${tutorialData.length}`;
    }
}

export function positionHighlightBox(highlightBox, targetElement) {
    if (!highlightBox || !targetElement) {
        console.warn("APP_WARN: positionHighlightBox called with null highlightBox or targetElement");
        if (domElements.tutorialHighlightBox) {
            domElements.tutorialHighlightBox.style.display = 'none';
            domElements.tutorialHighlightBox.style.boxShadow = 'none'; // Clear shadow
        }
        return;
    }

    const rect = targetElement.getBoundingClientRect();
    console.log(`APP_LOG: positionHighlightBox - Target Element:`, targetElement, `Display: ${window.getComputedStyle(targetElement).display}`);
    console.log(`APP_LOG: positionHighlightBox - BoundingClientRect (targetElement, viewport-relative): ${JSON.stringify(rect)}`);
    
    // Ensure highlightBox is part of the overlay for correct absolute positioning context
    // This should ideally be handled in initTutorialUI, but double-check parentage if issues persist.
    // if (highlightBox.parentNode !== domElements.tutorialOverlay) {
    //     console.warn("APP_WARN: positionHighlightBox - HighlightBox not child of overlay. Appending.");
    //     domElements.tutorialOverlay.appendChild(highlightBox);
    // }

    highlightBox.style.position = 'absolute';
    highlightBox.style.display = 'block';
    highlightBox.style.border = 'none'; // No border for the cutout area
    highlightBox.style.backgroundColor = 'transparent'; // Highlighted area is clear
    highlightBox.style.zIndex = '10000'; 
    highlightBox.style.pointerEvents = 'none'; 
    highlightBox.style.boxSizing = 'border-box';
    highlightBox.style.margin = '0'; 
    highlightBox.style.padding = '0'; 
    highlightBox.style.transition = 'none'; // Ensure no transitions interfere

    // The highlightBox itself defines the clear area. Its dimensions match the target.
    highlightBox.style.width = rect.width + 'px';
    highlightBox.style.height = rect.height + 'px';
    highlightBox.style.top = rect.top + 'px';
    highlightBox.style.left = rect.left + 'px';

    // The boxShadow creates the overlay effect around the clear area
    const shadowSpread = Math.max(window.innerWidth, window.innerHeight, 500) * 2; // Ensure it covers viewport, min 500px radius
    highlightBox.style.boxShadow = `0 0 0 ${shadowSpread}px rgba(0, 0, 0, 0.7)`;
    
    console.log(`APP_LOG: positionHighlightBox - Cutout styles applied: {top: ${rect.top}, left: ${rect.left}, width: ${rect.width}, height: ${rect.height}}`);
    console.log(`APP_LOG: positionHighlightBox - Highlight box (as cutout) styled and displayed. OffsetParent:`, highlightBox.offsetParent);
}

export function positionTextBox(textBox, step, highlightRect) {
    if (!textBox || !step || !highlightRect) {
        console.warn("APP_WARN: positionTextBox called with null arguments", { textBox, step, highlightRect });
        if(textBox) textBox.style.display = 'none'; // Hide if we can't position
        return;
    }

    textBox.style.display = 'block'; 
    textBox.style.position = 'absolute'; 
    textBox.style.zIndex = '10001'; 
    textBox.style.transition = 'none'; 
    textBox.style.opacity = '0'; // Will be faded in

    textBox.style.backgroundColor = 'white'; 
    textBox.style.color = 'black'; 
    textBox.style.padding = '1em';
    textBox.style.border = '2px solid black';
    textBox.style.boxSizing = 'border-box';
    textBox.style.margin = '0';
    textBox.style.maxWidth = '400px'; // Prevent textbox from becoming too wide

    requestAnimationFrame(() => {
        const textBoxRect = textBox.getBoundingClientRect(); 
        let newTop, newLeft;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const options = {
            verticalMargin: 15, 
            horizontalMargin: 10,
            // Preferred position can be 'above', 'below', 'left', 'right' - future enhancement
            // For now, we primarily use 'above' or 'below' logic based on space.
        };

        console.log("APP_LOG: positionTextBox (rAF) - Inputs:", {
            textBoxRect: { width: textBoxRect.width, height: textBoxRect.height },
            highlightRect: { top: highlightRect.top, bottom: highlightRect.bottom, left: highlightRect.left, right: highlightRect.right, width: highlightRect.width, height: highlightRect.height },
            viewportWidth,
            viewportHeight,
            stepPreferredPosition: step.preferredPosition, // Log if present
            options
        });

        // --- Horizontal Positioning ---
        // Prefer to center textbox under/over highlightRect's horizontal center.
        newLeft = highlightRect.left + (highlightRect.width / 2) - (textBoxRect.width / 2);

        // Clamp horizontal position to be within viewport
        if (newLeft < options.horizontalMargin) {
            newLeft = options.horizontalMargin;
        }
        if (newLeft + textBoxRect.width > viewportWidth - options.horizontalMargin) {
            newLeft = viewportWidth - textBoxRect.width - options.horizontalMargin;
            if (newLeft < options.horizontalMargin) { // If textbox is wider than viewport
                 newLeft = options.horizontalMargin;
                 textBox.style.width = (viewportWidth - 2 * options.horizontalMargin) + 'px'; // Adjust width
            }
        }
        
        // --- Vertical Positioning ---
        const spaceBelow = viewportHeight - (highlightRect.bottom + options.verticalMargin);
        const fitsBelow = (textBoxRect.height <= spaceBelow);

        const spaceAbove = highlightRect.top - options.verticalMargin;
        const fitsAbove = (textBoxRect.height <= spaceAbove);

        let determinedPosition = '';

        if (step.preferredPosition === 'above') {
            if (fitsAbove) {
                newTop = highlightRect.top - textBoxRect.height - options.verticalMargin;
                determinedPosition = 'preferred-above';
            } else if (fitsBelow) {
                newTop = highlightRect.bottom + options.verticalMargin;
                determinedPosition = 'fallback-below (preferred-above-no-fit)';
            }
        } else if (step.preferredPosition === 'below') {
            if (fitsBelow) {
                newTop = highlightRect.bottom + options.verticalMargin;
                determinedPosition = 'preferred-below';
            } else if (fitsAbove) {
                newTop = highlightRect.top - textBoxRect.height - options.verticalMargin;
                determinedPosition = 'fallback-above (preferred-below-no-fit)';
            }
        }

        // Default logic if no preference or preferred didn't fit and fallback wasn't triggered
        if (!determinedPosition) {
            if (fitsBelow) {
                newTop = highlightRect.bottom + options.verticalMargin;
                determinedPosition = 'default-below';
            } else if (fitsAbove) {
                newTop = highlightRect.top - textBoxRect.height - options.verticalMargin;
                determinedPosition = 'default-above';
            }
        }
        
        // If neither above nor below fits well (or no position determined yet)
        if (!determinedPosition) {
            console.warn("APP_WARN: positionTextBox - Textbox cannot fit neatly above or below target. Trying to center in viewport.");
            newTop = (viewportHeight / 2) - (textBoxRect.height / 2);
            determinedPosition = 'fallback-center-viewport';

            // Clamp centered position to viewport edges
            if (newTop < options.verticalMargin) {
                newTop = options.verticalMargin;
            }
            if (newTop + textBoxRect.height > viewportHeight - options.verticalMargin) {
                // If still too tall, align to top and let it overflow (or set max-height on textbox)
                newTop = options.verticalMargin; 
                 if (textBoxRect.height > viewportHeight - 2 * options.verticalMargin) {
                    textBox.style.height = (viewportHeight - 2 * options.verticalMargin) + 'px';
                    textBox.style.overflowY = 'auto';
                 }
            }
        } else {
            // Final clamping for positions determined by above/below logic
            if (newTop < options.verticalMargin) {
                newTop = options.verticalMargin;
                 determinedPosition += '-clamped-top';
            }
            if (newTop + textBoxRect.height > viewportHeight - options.verticalMargin) {
                newTop = viewportHeight - textBoxRect.height - options.verticalMargin;
                // Ensure it doesn't go negative if textbox is too tall for viewport
                if (newTop < options.verticalMargin) newTop = options.verticalMargin;
                determinedPosition += '-clamped-bottom';
            }
        }

        textBox.style.top = newTop + 'px';
        textBox.style.left = newLeft + 'px';
        textBox.style.opacity = '1';

        console.log(`APP_LOG: positionTextBox (rAF) - Final calculated position (Top, Left): ${newTop.toFixed(2)}, ${newLeft.toFixed(2)}. Strategy: ${determinedPosition}`);
        console.log("APP_LOG: positionTextBox (rAF) - Text box styled and displayed.");
    });
}

export function closeTutorial(domElementsInstance) {
    // Using domElements via import
    console.log("APP_LOG: closeTutorial called.");
    if (domElements.tutorialOverlay) domElements.tutorialOverlay.style.display = 'none';
    if (domElements.tutorialHighlightBox) {
        domElements.tutorialHighlightBox.style.display = 'none';
        domElements.tutorialHighlightBox.style.boxShadow = 'none'; // Clear shadow
    }
    if (domElements.tutorialTextBox) domElements.tutorialTextBox.style.display = 'none';
}

export function hideTutorial() { // Typically called by tutorialCloseButton
    if (domElements.tutorialOverlay) {
        domElements.tutorialOverlay.style.display = 'none';
        // No need to reset overlay background if it's managed by showTutorialStep logic
    }
    if (domElements.tutorialHighlightBox) {
        domElements.tutorialHighlightBox.style.display = 'none';
        domElements.tutorialHighlightBox.style.boxShadow = 'none'; // Clear shadow
    }
    if (domElements.tutorialTextBox) {
        domElements.tutorialTextBox.style.display = 'none';
    }
    // Reset current tutorial state if any
    // import { state, updateState } from '../state.js'; // Assuming state management
    // if (state.currentTutorial && state.currentTutorial.isActive) {
    // updateState({ currentTutorial: { ...state.currentTutorial, isActive: false, currentStep: 0 } });
    // }
    console.log("APP_LOG: hideTutorial executed.");
}

export function initTutorialUI() {
    if (!domElements.tutorialOverlay || !domElements.tutorialHighlightBox || !domElements.tutorialTextBox) {
        console.error("APP_ERROR: initTutorialUI - One or more core tutorial DOM elements are missing from domElements.");
        return;
    }

    const overlay = domElements.tutorialOverlay;
    const highlightBox = domElements.tutorialHighlightBox;
    const textBox = domElements.tutorialTextBox;

    // Ensure overlay is in the document body first
    if (!document.body.contains(overlay)) {
        console.log("APP_LOG: initTutorialUI - Overlay not in body. Appending.");
        document.body.appendChild(overlay);
    }

    // Style the overlay
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '9999';
    overlay.style.pointerEvents = 'none';
    overlay.style.display = 'block'; // Make it block temporarily for children layout

    // Append children to overlay if not already parented
    if (highlightBox.parentNode !== overlay) {
        console.log("APP_LOG: initTutorialUI - Appending highlightBox to overlay.");
        overlay.appendChild(highlightBox);
    }
    highlightBox.style.position = 'absolute';
    highlightBox.style.display = 'block'; // Important for offsetParent calculation

    if (textBox.parentNode !== overlay) {
        console.log("APP_LOG: initTutorialUI - Appending textBox to overlay.");
        overlay.appendChild(textBox);
    }
    textBox.style.position = 'absolute';
    textBox.style.display = 'block'; // Important for offsetParent calculation

    // Defer offsetParent checks and final setup to allow browser to process DOM/style changes
    requestAnimationFrame(() => {
        console.log("APP_LOG: initTutorialUI (rAF) - Checking offsetParents after DOM updates:");
        console.log("APP_LOG: initTutorialUI (rAF) - Overlay offsetParent:", overlay.offsetParent, "Computed Display:", window.getComputedStyle(overlay).display);
        console.log("APP_LOG: initTutorialUI (rAF) - HighlightBox offsetParent:", highlightBox.offsetParent, "Computed Display:", window.getComputedStyle(highlightBox).display);
        console.log("APP_LOG: initTutorialUI (rAF) - TextBox offsetParent:", textBox.offsetParent, "Computed Display:", window.getComputedStyle(textBox).display);

        // Now that children are hopefully correctly parented and laid out, hide the overlay until needed
        overlay.style.display = 'none';
        console.log("APP_LOG: initTutorialUI (rAF) - Overlay display set to none.");

        // Attach event listeners for tutorial buttons
        if (domElements.tutorialNextButton) {
            domElements.tutorialNextButton.removeEventListener('click', handleNextTutorialStep);
            domElements.tutorialNextButton.addEventListener('click', handleNextTutorialStep);
        } else {
            console.warn("APP_WARN: initTutorialUI - tutorialNextButton not found in domElements.");
        }
        // ... (similar for prev and close buttons) ...
        if (domElements.tutorialPrevButton) {
            domElements.tutorialPrevButton.removeEventListener('click', handlePrevTutorialStep);
            domElements.tutorialPrevButton.addEventListener('click', handlePrevTutorialStep);
        } else {
            console.warn("APP_WARN: initTutorialUI - tutorialPrevButton not found in domElements.");
        }
        if (domElements.tutorialCloseButton) {
            domElements.tutorialCloseButton.removeEventListener('click', hideTutorial);
            domElements.tutorialCloseButton.addEventListener('click', hideTutorial);
        } else {
            console.warn("APP_WARN: initTutorialUI - tutorialCloseButton not found in domElements.");
        }
        console.log("APP_LOG: initTutorialUI (rAF) - Event listeners attached.");
    });

    console.log("APP_LOG: initTutorialUI - Synchronous part complete, rAF scheduled.");
}
