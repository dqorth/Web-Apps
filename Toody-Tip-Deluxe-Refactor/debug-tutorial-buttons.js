// Tutorial Button Diagnostics
console.log("=== Tutorial Button Diagnostics ===");

// Check if tutorial buttons exist
const tutorialBtns = document.querySelectorAll('.tutorial-btn');
console.log(`Found ${tutorialBtns.length} tutorial buttons:`, tutorialBtns);

// Check if handleStartTutorial is available
console.log("window.handleStartTutorial:", typeof window.handleStartTutorial);

// Check if tutorial data exists
if (window.state && window.state.getTutorialData) {
    console.log("Tutorial data check:");
    ['roster', 'lineup', 'scoop', 'weekly', 'data'].forEach(key => {
        const data = window.state.getTutorialData(key);
        console.log(`  ${key}:`, data ? `${data.steps?.length || 0} steps` : 'NOT FOUND');
    });
}

// Test button click simulation
if (tutorialBtns.length > 0) {
    console.log("Testing first tutorial button...");
    const firstBtn = tutorialBtns[0];
    const tutorialKey = firstBtn.dataset.tutorialFor;
    console.log(`Button data-tutorial-for: "${tutorialKey}"`);
    
    // Try calling handleStartTutorial directly
    if (window.handleStartTutorial) {
        try {
            console.log("Calling window.handleStartTutorial...");
            window.handleStartTutorial(tutorialKey);
            console.log("SUCCESS: Tutorial function called");
        } catch (error) {
            console.error("ERROR calling tutorial function:", error);
        }
    }
}

console.log("=== End Diagnostics ===");
