// js/tutorial.js
window.tutorial = (() => {
    let dom = {
        tutorialOverlay: null,
        tutorialContent: null,
        nextButton: null,
        prevButton: null,
        closeButton: null,
        stepIndicator: null,
        // Add specific elements to highlight if needed
    };

    let currentStep = 0;
    const steps = [
        {
            title: "Welcome to Toody's Tip Deluxe!",
            content: "This quick tutorial will guide you through the main features of the application. Click \'Next\' to continue.",
            targetElement: null // No specific element for the welcome message
        },
        {
            title: "Navigation",
            content: "Use the main navigation links (Shifts, Employees, Reports, Settings) to switch between different sections of the app.",
            targetElement: 'nav ul' // CSS selector for the navigation bar
        },
        {
            title: "Managing Employees",
            content: "In the \'Employees\' section, you can add new employees, edit their details (name, default position, pay rate), and manage their active status. This list is used when adding new shifts.",
            targetElement: '#employeesLink' // Assuming nav link has ID or use href attribute selector
        },
        {
            title: "Adding & Editing Shifts",
            content: "The \'Shifts\' section is where you log daily work shifts. Select an employee, date, position, times, and enter tips. Existing shifts can be edited or deleted.",
            targetElement: '#shiftsLink'
        },
        {
            title: "Shift Form Details",
            content: "When adding or editing a shift, make sure to fill in all required fields. Hours worked and total pay are calculated automatically. Don\'t forget to mark shifts as paid!",
            targetElement: '#shiftForm' // Assuming the shift form has this ID
        },
        {
            title: "Generating Reports",
            content: "The \'Reports\' section allows you to generate summaries of hours, tips, and pay for different periods (weekly, pay period, custom range). Reports can be exported to Excel.",
            targetElement: '#reportsLink'
        },
        {
            title: "Application Settings",
            content: "In \'Settings\', you can define your pay period start/end dates, toggle dark mode, and manage data (save, clear all data). Auto-save is enabled by default.",
            targetElement: '#settingsLink'
        },
        {
            title: "Saving Your Data",
            content: "Your data is saved automatically to your browser\'s local storage. You can also manually save using the \'Save Data\' button in Settings. The indicator at the top shows if you have unsaved changes.",
            targetElement: '#saveDataButton' // or #unsavedChangesIndicator
        },
        {
            title: "Dark Mode",
            content: "Prefer a darker interface? Toggle Dark Mode using the button in the Settings or the quick toggle in the header.",
            targetElement: '#themeToggleButton'
        },
        {
            title: "Need Help Again?",
            content: "You can access this tutorial anytime by clicking the \'Help / Tutorial\' button in the header.",
            targetElement: '#helpButton'
        },
        {
            title: "You\'re All Set!",
            content: "You\'ve completed the tour. Start tracking your tips efficiently!",
            targetElement: null
        }
    ];

    function cacheDom() {
        dom.tutorialOverlay = document.getElementById('tutorialOverlay');
        dom.tutorialContent = document.getElementById('tutorialContentArea'); // Specific area for text
        dom.nextButton = document.getElementById('tutorialNextButton');
        dom.prevButton = document.getElementById('tutorialPrevButton');
        dom.closeButton = document.getElementById('tutorialCloseButton'); // This might be the same as ui.js closeTutorialButton
        dom.stepIndicator = document.getElementById('tutorialStepIndicator');
        // console.log("[tutorial.js] DOM cached:", dom);
    }

    function bindEvents() {
        if (dom.nextButton) dom.nextButton.addEventListener('click', nextStep);
        if (dom.prevButton) dom.prevButton.addEventListener('click', prevStep);
        // Close button might be handled by ui.js if it's the same element.
        // If it's a specific tutorial close button inside the tutorial content area:
        if (dom.closeButton && dom.closeButton !== window.ui.closeTutorialButton) { // Ensure it's a different button
             dom.closeButton.addEventListener('click', closeTutorial);
        }
        // console.log("[tutorial.js] Tutorial events bound.");
    }

    function renderStep() {
        if (!dom.tutorialOverlay || !dom.tutorialContent || currentStep < 0 || currentStep >= steps.length) return;

        const stepData = steps[currentStep];
        dom.tutorialContent.innerHTML = `<h3>${stepData.title}</h3><p>${stepData.content}</p>`;
        
        if (dom.stepIndicator) {
            dom.stepIndicator.textContent = `Step ${currentStep + 1} of ${steps.length}`;
        }

        if (dom.prevButton) dom.prevButton.disabled = currentStep === 0;
        if (dom.nextButton) {
            if (currentStep === steps.length - 1) {
                dom.nextButton.textContent = 'Finish';
            } else {
                dom.nextButton.textContent = 'Next';
            }
        }

        // Highlight element logic
        clearHighlights();
        if (stepData.targetElement) {
            try {
                const elementToHighlight = document.querySelector(stepData.targetElement);
                if (elementToHighlight) {
                    elementToHighlight.classList.add('tutorial-highlight');
                    // Scroll to element if it's off-screen
                    // elementToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    // console.warn(`[tutorial.js] Target element not found for highlight: ${stepData.targetElement}`);
                }
            } catch (e) {
                // console.warn(`[tutorial.js] Invalid selector for highlight: ${stepData.targetElement}`, e);
            }
        }
    }

    function clearHighlights() {
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
    }

    function nextStep() {
        if (currentStep < steps.length - 1) {
            currentStep++;
            renderStep();
        } else {
            closeTutorial(true); // Finish tutorial
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            renderStep();
        }
    }

    function startTutorial() {
        // console.log("[tutorial.js] Starting tutorial.");
        currentStep = 0;
        if (dom.tutorialOverlay) dom.tutorialOverlay.style.display = 'flex';
        renderStep();
        // Mark tutorial as started/active in appState if needed
        // window.appState.setState({ tutorialActive: true });
    }

    function closeTutorial(isFinished = false) {
        // console.log("[tutorial.js] Closing tutorial. Finished:", isFinished);
        if (dom.tutorialOverlay) dom.tutorialOverlay.style.display = 'none';
        clearHighlights();
        if (isFinished) {
            window.appState.setState({ tutorialCompleted: true });
            // console.log("[tutorial.js] Tutorial marked as completed in app state.");
            // Potentially save state here or rely on auto-save
        }
        // window.appState.setState({ tutorialActive: false });
    }

    function init() {
        // console.log("[tutorial.js] Initializing tutorial module...");
        cacheDom();
        bindEvents();
        // Tutorial is typically started by user action (e.g. help button in ui.js)
        // or automatically on first load (logic for that would be in main.js or ui.js)
        // console.log("[tutorial.js] Tutorial module initialized.");
    }

    // Public API
    return {
        init,
        startTutorial,
        closeTutorial // Expose if needed by other modules, e.g. ui.js close button
    };
})();

// Initialize tutorial module when the DOM is ready
// document.addEventListener('DOMContentLoaded', window.tutorial.init);
// This will be called from main.js

