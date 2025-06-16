import * as state from '../state.js';
import * as ui from '../ui/ui-tutorial.js'; // Assuming tutorial UI functions are in ui-tutorial.js
import { domElements } from '../domElements.js';

// --- Tutorial Event Handlers ---
async function handleStartTutorial(tutorialKey) {
    console.log("APP_LOG: [js/events/events-tutorial.js] handleStartTutorial called with key:", tutorialKey);
    const tutorialData = state.getTutorialData(tutorialKey); // Use the new getter
    if (!tutorialData || !tutorialData.steps || tutorialData.steps.length === 0) { // Check tutorialData.steps
        console.warn("APP_LOG: No tutorial data found or steps empty for key:", tutorialKey);
        return;
    }

    state.setCurrentTutorial(tutorialKey, 0);
    // Pass domElements to showTutorialStep
    // tutorialData.steps should be the array of step objects
    await ui.showTutorialStep(0, tutorialData.steps, domElements); 
}

async function handleNextTutorialStep() {
    const currentTutorial = state.getCurrentTutorial(); // Use the new getter
    if (!currentTutorial) return;
    const nextStepIndex = currentTutorial.currentStepIndex + 1;
    if (nextStepIndex < currentTutorial.steps.length) {
        state.setCurrentTutorial(currentTutorial.key, nextStepIndex);
        await ui.showTutorialStep(nextStepIndex, currentTutorial.steps, domElements);
    } else {
        ui.closeTutorial(domElements);
        state.clearCurrentTutorial();
    }
}

async function handlePrevTutorialStep() {
    const currentTutorial = state.getCurrentTutorial(); // Use the new getter
    if (!currentTutorial) return;
    const prevStepIndex = currentTutorial.currentStepIndex - 1;
    if (prevStepIndex >= 0) {
        state.setCurrentTutorial(currentTutorial.key, prevStepIndex);
        await ui.showTutorialStep(prevStepIndex, currentTutorial.steps, domElements);
    } else {
        // Optionally, do nothing or indicate it's the first step
        console.log("APP_LOG: Already on the first tutorial step.");
    }
}

// Make handleStartTutorial globally accessible for index.html if needed from the new module
// This might require changes in how it's exposed, e.g., main.js could expose it.
// For now, keeping it modular. If index.html directly calls it, this needs addressing.
// window.globalHandleStartTutorial = handleStartTutorial; // Consider if this is still the right place

export {
    handleStartTutorial,
    handleNextTutorialStep,
    handlePrevTutorialStep
};
