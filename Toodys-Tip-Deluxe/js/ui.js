// User Interface Manipulation and General DOM Interactions

window.ui = (() => {
    let dom = {}; // For UI elements not specific to a module like employees or shifts

    // --- DOM Element References (queried as needed or passed) ---
    // It's often better to query these within functions or pass them to avoid
    // relying on globals that might not be initialized when this script runs.
    // However, for simplicity in refactoring from a single script, they might have been global.
    // We'll define them here for now, assuming they are fetched by ID.

    // Display Areas
    const lineupDateDisplay = () => document.getElementById('lineupDateDisplay');
    const scoopDateDisplay = () => document.getElementById('scoopDateDisplay');
    const currentlyViewedWeekDisplay = () => document.getElementById('currentlyViewedWeekDisplay');

    // Containers
    const rosterListContainer = () => document.getElementById('rosterListContainer');
    const fullEmployeeRosterContainer = () => document.getElementById('fullEmployeeRosterContainer'); // For "Manage Jukebox Hero"
    const dailyScoopContentDiv = () => document.getElementById('dailyScoopContent'); // Changed from payoutResultsDiv
    const reportOutputDiv = () => document.getElementById('reportOutput'); // Corrected ID for Weekly Rewind content

    // Navigation & View Sections
    const employeeManagementSection = () => document.getElementById('employeeManagementSection');
    const employeeLineupSection = () => document.getElementById('employeeLineupSection');
    const dailyScoopSection = () => document.getElementById('dailyScoopSection');
    const weeklyRewindSection = () => document.getElementById('weeklyRewindSection');
    const appSettingsSection = () => document.getElementById('appSettingsSection');
    const tutorialSection = () => document.getElementById('tutorialSection'); // Assuming a general tutorial container

    // Cycle Date Selectors
    const cycleStartDateSelect = () => document.getElementById('cycleStartDateSelect');
    const weekInCycleSelect = () => document.getElementById('weekInCycleSelect');


    // --- Private Helper Functions (defined within the IIFE) ---
    
    // +++ Function to toggle Add Employee Form visibility +++
    // This function needs to be defined before initializeUI if initializeUI uses it directly
    // or if event listeners set up by initializeUI call it.
    function toggleAddEmployeeFormVisibility() {
        const formWrapper = document.getElementById('addEmployeeFormWrapper');
        const toggleBtn = document.getElementById('toggleAddNewEmployeeFormBtn');
        if (!formWrapper || !toggleBtn) {
            console.error("APP_LOG: [ui.js] Add employee form wrapper or toggle button not found.");
            return;
        }

        const isVisible = formWrapper.style.display === 'block';
        if (isVisible) {
            formWrapper.style.display = 'none';
            toggleBtn.textContent = 'Add New Jukebox Hero';
        } else {
            formWrapper.style.display = 'block';
            toggleBtn.textContent = 'Cancel Adding Hero';
            // Ensure form is in 'add' state when shown via this button
            if (typeof resetFormForAdd === 'function') {
                resetFormForAdd();
            }
            // It's generally good practice to ensure the form is built if it's meant to be visible.
            // If buildAddEmployeeForm is idempotent or checks if already built, this is safe.
            // if (typeof buildAddEmployeeForm === 'function' && !formWrapper.hasChildNodes()) {
            // buildAddEmployeeForm('addEmployeeFormWrapper');
            // }
        }
    }

    function showCustomModal({ title = "Alert", message, type = "info", onConfirm = null, confirmText = "OK", showCancel = false, cancelText = "Cancel", onCancel = null }) {
        const modal = document.getElementById('customModal');
        const modalTitle = document.getElementById('customModalTitle');
        const modalMessage = document.getElementById('customModalMessage');
        const modalConfirmBtn = document.getElementById('customModalConfirm');
        const modalCancelBtn = document.getElementById('customModalCancel');

        if (!modal || !modalTitle || !modalMessage || !modalConfirmBtn || !modalCancelBtn) {
            console.error("Modal elements not found!");
            // Fallback to alert if modal is not set up in HTML
            alert(`${title}\\n\\n${message}`);
            if (type === "confirm" && onConfirm) onConfirm();
            return;
        }

        modalTitle.textContent = title;
        modalMessage.innerHTML = message; // Use innerHTML to allow for formatted messages

        modalConfirmBtn.textContent = confirmText;
        modalConfirmBtn.onclick = () => {
            closeCustomModal();
            if (onConfirm) onConfirm();
        };

        if (showCancel) {
            modalCancelBtn.textContent = cancelText;
            modalCancelBtn.style.display = 'inline-block';
            modalCancelBtn.onclick = () => {
                closeCustomModal();
                if (onCancel) onCancel();
            };
        } else {
            modalCancelBtn.style.display = 'none';
        }

        // Basic styling for different types (can be expanded with CSS classes)
        modal.classList.remove('modal-info', 'modal-warning', 'modal-error', 'modal-confirm');
        if (type === 'warning') modal.classList.add('modal-warning');
        else if (type === 'error') modal.classList.add('modal-error');
        else if (type === 'confirm') modal.classList.add('modal-confirm');
        else modal.classList.add('modal-info');


        modal.style.display = 'flex'; // Or 'block', depending on your modal CSS
    }

    function closeCustomModal() {
        const modal = document.getElementById('customModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    function initializeCollapsibleSections() {
        const headers = document.querySelectorAll('.collapsible-header');
        headers.forEach(header => {
            const content = header.nextElementSibling;
            const indicator = header.querySelector('.collapse-indicator');
            const sectionCard = header.closest('.section-card'); // Get the parent section-card

            // Set initial state based on inline style of the section-card
            let startOpen = false;
            if (sectionCard && sectionCard.style.display !== 'none') { // If section is visible
                // For visible sections, check if content should be open or closed
                // Default to open for employeeLineupSection, closed for others unless specified by HTML style
                if (sectionCard.id === 'employeeLineupSection') {
                    startOpen = true; // Lineup is open by default as per HTML
                } else if (content && content.style.display === 'block') {
                    startOpen = true; // If HTML explicitly sets content to block
                }
            }

            if (content && content.classList.contains('collapsible-content')) {
                if (startOpen) {
                    content.style.display = 'block';
                    if (indicator) indicator.textContent = '−'; // Minus sign
                    header.setAttribute('aria-expanded', 'true');
                } else {
                    content.style.display = 'none';
                    if (indicator) indicator.textContent = '+';
                    header.setAttribute('aria-expanded', 'false');
                }
            }

            header.addEventListener('click', () => {
                if (content && content.classList.contains('collapsible-content')) {
                    const isVisible = content.style.display === 'block';
                    content.style.display = isVisible ? 'none' : 'block';
                    if (indicator) indicator.textContent = isVisible ? '+' : '−';
                    header.setAttribute('aria-expanded', isVisible ? 'false' : 'true');
                    
                    // If it's the roster section, re-apply masonry after expanding/collapsing
                    if (sectionId === 'employeeFormSection' && !isVisible) { // If expanding employeeFormSection
                        if (window.employees && typeof window.employees.renderFullEmployeeListForManagement === 'function') {
                             window.employees.renderFullEmployeeListForManagement(); // Re-render list
                        }
                    } else if (sectionId === 'employeeLineupSection' && !isVisible) { // If expanding lineup
                         if (window.employees && typeof window.employees.renderEmployeeRoster === 'function') {
                            window.employees.renderEmployeeRoster();
                        }
                    }
                }
            });

            // Collapse bottom button functionality
            const collapseBottomBtn = sectionCard ? sectionCard.querySelector('.collapse-bottom-btn') : null;
            if (collapseBottomBtn && content && content.classList.contains('collapsible-content')) {
                collapseBottomBtn.addEventListener('click', () => {
                    content.style.display = 'none';
                    if (indicator) indicator.textContent = '+';
                    header.setAttribute('aria-expanded', 'false');
                    header.focus(); // Optional: move focus back to the header
                });
            }
        });
        console.log("APP_LOG: Collapsible sections initialized.");
    }

    function populateCycleStartDateSelect() {
        const cycleStartDateSelectEl = document.getElementById('cycleStartDateSelect');
        const weekInCycleSelectEl = document.getElementById('weekInCycleSelect');
        if (!cycleStartDateSelectEl || !weekInCycleSelectEl) {
            console.error("APP_LOG: Date select elements not found for population.");
            return;
        }

        const appState = window.state.getAppState();
        const baseDateStr = (appState.settings && appState.settings.baseCycleStartDate) 
                            ? appState.settings.baseCycleStartDate 
                            : (window.state.constants ? window.state.constants.BASE_CYCLE_START_DATE : '2025-06-02');

        const BASE_CYCLE_START_DATE = new Date(baseDateStr + 'T00:00:00Z');
        if (isNaN(BASE_CYCLE_START_DATE.getTime())) {
            console.error("APP_LOG: Invalid BASE_CYCLE_START_DATE_STR:", constants.BASE_CYCLE_START_DATE);
            return;
        }

        console.log("APP_LOG: Populating Cycle Start Dates...");
        cycleStartDateSelectEl.innerHTML = ''; // Clear existing options

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        for (let i = -12; i <= 12; i++) { // Approx 6 months before and after base
            const cycleStartCandidate = new Date(BASE_CYCLE_START_DATE);
            cycleStartCandidate.setUTCDate(BASE_CYCLE_START_DATE.getUTCDate() + (i * 28)); // 28 days = 4 weeks

            const option = document.createElement('option');
            const dateValue = window.utils.formatDate(cycleStartCandidate);
            option.value = dateValue;
            option.textContent = window.utils.formatDisplayDate(dateValue);
            cycleStartDateSelectEl.appendChild(option);
        }

        let defaultCycleStartValue = window.utils.formatDate(BASE_CYCLE_START_DATE);
        const todayUTCStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

        for (let i = 0; i < cycleStartDateSelectEl.options.length; i++) {
            const opt = cycleStartDateSelectEl.options[i];
            const optDate = new Date(opt.value + "T00:00:00Z");
            const cycleEndDate = new Date(optDate);
            cycleEndDate.setUTCDate(optDate.getUTCDate() + 27); // End of 4th week

            if (todayUTCStart >= optDate && todayUTCStart <= cycleEndDate) {
                defaultCycleStartValue = opt.value;
                break;
            }
        }
        
        if (cycleStartDateSelectEl.querySelector(`option[value="${defaultCycleStartValue}"]`)) {
            cycleStartDateSelectEl.value = defaultCycleStartValue;
        } else if (cycleStartDateSelectEl.options.length > 0) {
            // Fallback if today is outside all generated ranges (e.g. base date is far in past/future)
            // Select the option closest to the BASE_CYCLE_START_DATE
            const baseOption = cycleStartDateSelectEl.querySelector(`option[value="${window.utils.formatDate(BASE_CYCLE_START_DATE)}"]`);
            if (baseOption) {
                cycleStartDateSelectEl.value = baseOption.value;
            } else {
                 // Or a middle option if base is not found (should not happen with current logic)
                cycleStartDateSelectEl.selectedIndex = Math.floor(cycleStartDateSelectEl.options.length / 2);
            }
        }
        console.log("APP_LOG: Cycle Start Dates populated. Default:", cycleStartDateSelectEl.value);

        // Populate weekInCycleSelect (1, 2, 3, 4)
        weekInCycleSelectEl.innerHTML = ''; // Clear existing
        for (let i = 1; i <= 4; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Week ${i}`;
            weekInCycleSelectEl.appendChild(option);
        }
        // Default week will be set by main.updateDateControlsFromState or main.calculateAndUpdateCurrentDate
    }

    function showView(viewId, options = {}) {
        console.log(`APP_LOG: Attempting to show view: ${viewId}`);
        const allSections = document.querySelectorAll('.app-container > .section-card');
        allSections.forEach(section => {
            if (section) section.style.display = 'none';
        });

        const targetSection = document.getElementById(viewId);
        if (targetSection) {
            targetSection.style.display = 'block';
            console.log(`APP_LOG: Displaying section: ${viewId}`);

            const collapsibleContent = targetSection.querySelector('.collapsible-content');
            const collapsibleHeader = targetSection.querySelector('.collapsible-header');
            const indicator = collapsibleHeader ? collapsibleHeader.querySelector('.collapse-indicator') : null;

            // Ensure content is visible if section is shown, unless it was explicitly set to be collapsed by default in HTML
            if (collapsibleContent && collapsibleContent.style.display === 'none') {
                // Exception: if the HTML for this section specifically has display:none for content, respect it.
                // This is handled by initializeCollapsibleSections based on initial HTML styles.
                // When showView is called, we generally want the content of the *active* section to be visible.
                // However, if the section was *already* visible and its content was collapsed by the user, we might want to preserve that.
                // For now, let's assume showing a view implies expanding its main content area.
                collapsibleContent.style.display = 'block';
                if (indicator) indicator.textContent = '−'; // Minus sign
                if (collapsibleHeader) collapsibleHeader.setAttribute('aria-expanded', 'true');
            }
            
            if (viewId === 'employeeFormSection') {
                if (window.employees && typeof window.employees.renderFullEmployeeListForManagement === 'function') {
                    window.employees.renderFullEmployeeListForManagement();
                } else {
                    const fullRosterContainer = document.getElementById('fullEmployeeRosterContainer');
                    if (fullRosterContainer) fullRosterContainer.innerHTML = '<p>Roster management not available.</p>';
                }
                const addFormWrapper = document.getElementById('addEmployeeFormWrapper');
                if (addFormWrapper) addFormWrapper.style.display = 'none';
                const toggleBtn = document.getElementById('toggleAddNewEmployeeFormBtn');
                if (toggleBtn) toggleBtn.textContent = 'Add New Jukebox Hero';
                resetFormForAdd();

            } else if (viewId === 'employeeLineupSection') {
                // Content rendering for lineup is handled by main.calculateAndUpdateCurrentDate -> employees.renderEmployeeLineup
                // Ensure the container is at least empty or shows a placeholder if data isn't ready
                const rosterListCont = rosterListContainer();
                if (rosterListCont && rosterListCont.innerHTML.trim() === '') {
                    // rosterListCont.innerHTML = '<p>Loading lineup...</p>'; // Or keep it empty as per HTML
                }
            } else if (viewId === 'payoutSection') { // Corrected from dailyScoopSection to match HTML ID
                // Content rendering for scoop is handled by main.calculateAndUpdateCurrentDate -> reports.calculateAndDisplayDailyPayouts
                const payoutResults = document.getElementById('payoutResults');
                if (payoutResults && payoutResults.innerHTML.trim() === '') {
                    // payoutResults.innerHTML = '<p>Loading daily scoop...</p>'; // Or keep it empty
                }
            } else if (viewId === 'weeklyReportSection') {
                // Content rendering for weekly report is handled by main.calculateAndUpdateCurrentDate -> reports.displayWeeklyReport
                const reportOutDiv = reportOutputDiv(); // Use corrected function
                if (reportOutDiv && reportOutDiv.innerHTML.trim() === '') {
                    // reportOutDiv.innerHTML = '<p>Loading weekly rewind...</p>'; // Or keep it empty
                }
            }

        } else {
            console.warn(`APP_LOG: View ID '${viewId}' not found. Defaulting to lineup.`);
            const lineupSection = document.getElementById('employeeLineupSection');
            if (lineupSection) lineupSection.style.display = 'block';
            if (window.employees && typeof window.employees.renderEmployeeRoster === 'function') {
                window.employees.renderEmployeeRoster();
            }
        }
    }

    function buildAddEmployeeForm(formWrapperId) {
        const formWrapper = document.getElementById(formWrapperId);
        if (!formWrapper) {
            console.error(`buildAddEmployeeForm: Wrapper element with ID '${formWrapperId}' not found.`);
            return;
        }

        // Clear previous content if any (e.g., if re-building)
        formWrapper.innerHTML = '';

        // Create main form div
        const formDiv = document.createElement('div');

        // Name Input
        const nameLabel = document.createElement('label');
        nameLabel.htmlFor = 'empName';
        nameLabel.textContent = 'Name:';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'empName';
        nameInput.placeholder = 'e.g., Fonzie';
        formDiv.appendChild(nameLabel);
        formDiv.appendChild(nameInput);

        // Positions Container
        const positionsLabel = document.createElement('label');
        positionsLabel.textContent = "Rockin' Roles (Select all applicable):";
        const positionsContainer = document.createElement('div');
        positionsContainer.id = 'empPositionsContainer';
        formDiv.appendChild(positionsLabel); // Append label first
        formDiv.appendChild(positionsContainer); // Append container so it's in the DOM before passing

        // Call employees.js function to populate this
        if (typeof employees !== 'undefined' && typeof employees.renderEmpPositionsWithPayRates === 'function') {
            employees.renderEmpPositionsWithPayRates(positionsContainer, {}); // Pass the element itself, and empty existingRates for new form
        } else {
            positionsContainer.textContent = 'Error: Could not load position/pay rate form elements.';
            console.error("employees.renderEmpPositionsWithPayRates is not available.");
        }
        // formDiv.appendChild(positionsLabel); // Moved up
        // formDiv.appendChild(positionsContainer); // Moved up

        // Hidden input for editing ID
        const editingIdInput = document.createElement('input');
        editingIdInput.type = 'hidden';
        editingIdInput.id = 'editingEmployeeId';
        formDiv.appendChild(editingIdInput);

        // Buttons
        const addEmployeeBtn = document.createElement('button');
        addEmployeeBtn.id = 'addEmployeeBtn';
        addEmployeeBtn.classList.add('button');
        addEmployeeBtn.textContent = 'Add to Crew';
        formDiv.appendChild(addEmployeeBtn);

        const updateEmployeeBtn = document.createElement('button');
        updateEmployeeBtn.id = 'updateEmployeeBtn';
        updateEmployeeBtn.classList.add('button');
        updateEmployeeBtn.textContent = 'Update Hero';
        updateEmployeeBtn.style.display = 'none'; // Hidden by default
        formDiv.appendChild(updateEmployeeBtn);

        const cancelEditBtn = document.createElement('button');
        cancelEditBtn.id = 'cancelEditBtn';
        cancelEditBtn.classList.add('button');
        cancelEditBtn.textContent = 'Nevermind';
        cancelEditBtn.style.backgroundColor = '#757575';
        formDiv.appendChild(cancelEditBtn);
        
        formWrapper.appendChild(formDiv); // Append the constructed form div

        // Import Section (already in HTML, but if it were to be dynamic)
        // For now, this function focuses on the core add/edit form fields.
        // The import section is static in the HTML within the addEmployeeFormWrapper.
        // If it needed to be dynamic, its creation would go here too.

        console.log("APP_LOG: Employee add/edit form built.");
    }

    function resetFormForAdd() {
        console.log("APP_LOG: [ui.js] resetFormForAdd called");
        const empNameInput = document.getElementById('empName');
        const editingEmployeeIdInput = document.getElementById('editingEmployeeId');
        const addEmployeeBtn = document.getElementById('addEmployeeBtn');
        const updateEmployeeBtn = document.getElementById('updateEmployeeBtn');
        const empPositionsContainer = document.getElementById('empPositionsContainer');

        if (empNameInput) empNameInput.value = '';
        if (editingEmployeeIdInput) editingEmployeeIdInput.value = '';

        if (empPositionsContainer && typeof window.employees !== 'undefined' && typeof window.employees.renderEmpPositionsWithPayRates === 'function') {
            window.employees.renderEmpPositionsWithPayRates(empPositionsContainer, {}); // Clears and re-renders for new employee
        }

        if (addEmployeeBtn) addEmployeeBtn.style.display = 'inline-block';
        if (updateEmployeeBtn) updateEmployeeBtn.style.display = 'none';
    }

    function populateFormForEdit(employee) {
        console.log("APP_LOG: [ui.js] populateFormForEdit called for:", employee);
        const empNameInput = document.getElementById('empName');
        const editingEmployeeIdInput = document.getElementById('editingEmployeeId');
        const addEmployeeBtn = document.getElementById('addEmployeeBtn');
        const updateEmployeeBtn = document.getElementById('updateEmployeeBtn');
        const empPositionsContainer = document.getElementById('empPositionsContainer');

        if (!employee) {
            console.error("populateFormForEdit: No employee data provided.");
            resetFormForAdd(); // Revert to add mode
            return;
        }

        if (empNameInput) empNameInput.value = employee.name;
        if (editingEmployeeIdInput) editingEmployeeIdInput.value = employee.id;

        if (empPositionsContainer && typeof window.employees !== 'undefined' && typeof window.employees.renderEmpPositionsWithPayRates === 'function') {
            window.employees.renderEmpPositionsWithPayRates(empPositionsContainer, employee.positionsAndRates || {});
        }

        if (addEmployeeBtn) addEmployeeBtn.style.display = 'none';
        if (updateEmployeeBtn) updateEmployeeBtn.style.display = 'inline-block';
    }

    function renderDayNavigation(containerElement, dateForNav, sectionPrefix) {
        if (!containerElement || !dateForNav) {
            console.error(`UI_ERROR: renderDayNavigation for ${sectionPrefix} called with invalid container or dateForNav.`, { containerElement, dateForNav });
            return;
        }
        const appState = window.state.getAppState();
        const activeDate = appState.activeSelectedDate; // Get the globally active selected date

        containerElement.innerHTML = ''; // Clear existing navigation
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Sunday as 0
        
        // Determine the Monday of the week for which to build navigation.
        // For lineup, dateForNav is currentWeekStartDate from main.js
        // For scoop, dateForNav is the activeSelectedDate (a Date object) from main.js
        let referenceDateForWeek = new Date(dateForNav); // Works if dateForNav is a Date object or YYYY-MM-DD string
        if (typeof dateForNav === 'string') {
            referenceDateForWeek = new Date(dateForNav + 'T00:00:00Z');
        }
        const dayOfWeekForNav = referenceDateForWeek.getUTCDay(); // 0 for Sunday, 1 for Monday, etc.
        const mondayOfRelevantWeek = new Date(referenceDateForWeek);
        mondayOfRelevantWeek.setUTCDate(referenceDateForWeek.getUTCDate() - dayOfWeekForNav + (dayOfWeekForNav === 0 ? -6 : 1)); // Adjust to Monday

        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(mondayOfRelevantWeek);
            dayDate.setUTCDate(mondayOfRelevantWeek.getUTCDate() + i);
            const dateString = window.utils.formatDate(dayDate); // YYYY-MM-DD

            const dayButton = document.createElement('button');
            dayButton.classList.add('day-nav-btn');
            // Use utils.formatDateToDayOfWeek if available, otherwise a simple lookup
            dayButton.textContent = window.utils ? window.utils.formatDateToDayOfWeek(dateString) : days[dayDate.getUTCDay()]; 
            dayButton.dataset.date = dateString; // Store YYYY-MM-DD for logic
            // dayButton.dataset.dayValue = dayDate.getUTCDay() === 0 ? 7 : dayDate.getUTCDay(); // For pre-ref matching, if needed, but data-date is more robust

            if (dateString === activeDate) { // Compare with the globally active selected date
                dayButton.classList.add('active');
            }

            dayButton.addEventListener('click', () => {
                if (window.main && typeof window.main.setActiveDateAndRefreshViews === 'function') {
                    window.main.setActiveDateAndRefreshViews(dateString);
                } else {
                    console.error("UI_ERROR: main.setActiveDateAndRefreshViews function is not available.");
                    // Fallback or direct state update if absolutely necessary (not recommended)
                    // window.state.setActiveSelectedDate(dateString);
                    // employees.renderEmployeeLineup(dateString);
                    // reports.calculateAndDisplayDailyPayouts(); // This function should use the new state
                    // renderLineupDayNavigation(new Date(dateString + 'T00:00:00Z'));
                    // renderScoopDayNavigation(new Date(dateString + 'T00:00:00Z'));
                }
            });
            containerElement.appendChild(dayButton);
        }
    }

    function renderLineupDayNavigation(dateForNav) { // dateForNav is currentWeekStartDate (Date object)
        const container = document.getElementById('lineupDayNavContainer');
        if (!container) {
            console.error("UI_ERROR: Lineup day navigation container not found.");
            return;
        }
        // const activeDate = (window.state && window.state.getAppState) ? (window.state.getAppState().activeSelectedDate || window.utils.formatDate(new Date())) : window.utils.formatDate(new Date());
        renderDayNavigation(container, dateForNav, 'lineup'); // Pass dateForNav directly
    }

    function renderScoopDayNavigation(dateForNav) { // dateForNav is activeSelectedDate (Date object)
        const container = document.getElementById('scoopDayNavContainer');
        if (!container) {
            console.error("UI_ERROR: Scoop day navigation container not found.");
            return;
        }
        // const activeDate = (window.state && window.state.getAppState) ? (window.state.getAppState().activeSelectedDate || window.utils.formatDate(new Date())) : window.utils.formatDate(new Date());
        renderDayNavigation(container, dateForNav, 'scoop'); // Pass dateForNav directly
    }

    function applyMasonryLayoutToRoster() {
        const container = fullEmployeeRosterContainer(); // From top of ui.js
        if (!container || getComputedStyle(container).display === 'none') return;

        const positionGroups = container.querySelectorAll('.roster-position-group');
        if (!positionGroups.length) return;

        // Simple masonry-like column balancing
        // This is a basic example. A library might be better for complex masonry.
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.alignItems = 'flex-start'; // Align items to the top of their row

        // Determine number of columns based on container width (example: 250px per column)
        const containerWidth = container.offsetWidth;
        const columnWidthThreshold = 280; // Min width for a group before it wraps or causes new column
        let numColumns = Math.max(1, Math.floor(containerWidth / columnWidthThreshold));
        
        // Distribute items into columns (conceptually)
        // For actual visual columns with flexbox, we ensure items wrap correctly.
        // The key is that .roster-position-group elements have a flex-basis or width.
        positionGroups.forEach(group => {
            group.style.flex = `1 1 ${columnWidthThreshold}px`; // Grow, shrink, basis
            group.style.maxWidth = `${containerWidth / numColumns - 20}px`; // Max width with some gap
            group.style.margin = '10px'; // Add some margin
        });
        // If you were using CSS columns:
        // container.style.columnCount = numColumns;
        // container.style.columnGap = '20px';
        // positionGroups.forEach(group => {
        //   group.style.breakInside = 'avoid'; // Prevent items from breaking across columns
        // });
        console.log(`APP_LOG: Masonry applied, ${numColumns} columns attempted.`);
    }

    // --- Employee Lineup Card Update ---
    function updateEmployeeLineupCard(liElement, buttonElement, shiftData) {
        if (!liElement) return;

        const summaryDiv = liElement.querySelector('.shift-summary-display');
        if (!summaryDiv) {
            console.warn("Shift summary div not found in liElement for updateEmployeeLineupCard", liElement);
            return;
        }

        // Access job positions, ensure fallback if state or JOB_POSITIONS_AVAILABLE is not ready
        const JOB_POSITIONS_AVAILABLE = (window.state && window.state.constants && window.state.constants.JOB_POSITIONS_AVAILABLE) 
                                        ? window.state.constants.JOB_POSITIONS_AVAILABLE 
                                        : [];

        if (shiftData && shiftData.startTime && shiftData.endTime && shiftData.jobPositionId) {
            // Ensure utils functions are available
            const calculateHoursWorked = window.utils && window.utils.calculateHoursWorked;
            const formatTimeTo12Hour = window.utils && window.utils.formatTimeTo12Hour;

            if (!calculateHoursWorked || !formatTimeTo12Hour) {
                console.error("UI Error: Utility functions (calculateHoursWorked or formatTimeTo12Hour) not available.");
                summaryDiv.innerHTML = "Error displaying shift (utils missing).";
                summaryDiv.style.display = 'block';
                if (buttonElement) {
                    buttonElement.textContent = 'Shift Action'; // Safe default
                    buttonElement.classList.remove('is-editing-shift');
                }
                return;
            }

            const hoursWorked = calculateHoursWorked(shiftData.startTime, shiftData.endTime);
            const position = JOB_POSITIONS_AVAILABLE.find(p => p.id === shiftData.jobPositionId);
            const positionName = position ? position.name : (shiftData.jobPositionId || 'Unknown Position');
            
            summaryDiv.innerHTML = `Worked: ${formatTimeTo12Hour(shiftData.startTime)} - ${formatTimeTo12Hour(shiftData.endTime)} (${hoursWorked.toFixed(2)} hrs) as ${positionName}`;
            summaryDiv.style.display = 'block';

            if (buttonElement) {
                buttonElement.textContent = 'Edit Shift';
                buttonElement.classList.add('edit-shift');
                buttonElement.classList.remove('log-shift');
                buttonElement.classList.remove('is-editing-shift'); // Ensure this is reset
            }
            liElement.classList.add('has-shift-logged');
        } else {
            // No shift data, or incomplete shift data
            summaryDiv.innerHTML = '';
            summaryDiv.style.display = 'none';
            if (buttonElement) {
                buttonElement.textContent = 'Log Shift';
                buttonElement.classList.remove('edit-shift');
                buttonElement.classList.add('log-shift');
                buttonElement.classList.remove('is-editing-shift'); // Ensure this is reset
            }
            liElement.classList.remove('has-shift-logged');
        }
    }

    // +++ NEW FUNCTION FOR DAILY SCOOP +++
    function updatePayoutView(payoutData) {
        // console.log("updatePayoutView called with raw data:", payoutData);

        const resultsDiv = dailyScoopContentDiv(); // Use the corrected reference
        if (!resultsDiv) {
            console.error("UI_ERROR: Daily Scoop content div ('dailyScoopContent') not found in updatePayoutView.");
            return;
        }
        resultsDiv.innerHTML = ''; 

        if (!payoutData || typeof payoutData !== 'object') {
            console.warn("UI_WARN: updatePayoutView received invalid payoutData (null, undefined, or not an object):", payoutData);
            resultsDiv.innerHTML = '<p>No payout data available or data is in an unexpected format.</p>';
            return;
        }

        const displayDate = payoutData.date;
        // Log the specific date being processed and the full data object for context.
        console.log("UI_INFO: updatePayoutView processing data for date:", displayDate, "Full payoutData:", payoutData);

        const payouts = payoutData.employeeDetails; // This is expected to be an array.

        if (!displayDate) {
            console.warn("UI_WARN: Date is missing in payoutData for updatePayoutView.", payoutData);
            // Continue if possible, as employee details might still be displayable.
        }

        if (!Array.isArray(payouts)) {
            console.warn(`UI_WARN: employeeDetails in payoutData is not an array. Received:`, payouts, "Full payoutData:", payoutData);
            let message = `<p>No Jukebox Heroes' payout details found for ${displayDate || 'the selected date'}. Data for employeeDetails might be missing or in an incorrect format.</p>`;
            if (payoutData.dailyTotals && typeof payoutData.dailyTotals.totalTips === 'number' && payoutData.dailyTotals.totalTips > 0) {
                message += `<p>However, there were $${payoutData.dailyTotals.totalTips.toFixed(2)} in total tips recorded for the day.</p>`;
            } else if (payoutData.dailyTotals) {
                message += `<p>Daily totals were: ${JSON.stringify(payoutData.dailyTotals)}.</p>`;
            }
            resultsDiv.innerHTML = message;
            return;
        }
        
        if (payouts.length === 0) {
            console.log(`UI_INFO: No employee payouts to display for ${displayDate || 'the selected date'}. employeeDetails array is empty.`);
            let message = `<p>No Jukebox Heroes were on the clock for ${displayDate || 'the selected date'}.</p>`;
            if (payoutData.dailyTotals && payoutData.dailyTotals.totalTips > 0) {
                message += `<p>However, there were $${payoutData.dailyTotals.totalTips.toFixed(2)} in total tips recorded.</p>`;
            }
            resultsDiv.innerHTML = message;
            return;
        }

        // Display detailed shift information for each employee
        payouts.forEach(emp => {
            const empContainer = document.createElement('div');
            empContainer.className = 'employee-scoop-entry card mb-3'; // Added card and margin for styling

            const empHeader = document.createElement('h4');
            empHeader.className = 'card-header';
            empHeader.textContent = emp.name || 'N/A';
            empContainer.appendChild(empHeader);

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const empTotals = document.createElement('p');
            const totalHoursNum = parseFloat(emp.totalHours);
            const totalTipsNum = parseFloat(emp.totalTips);
            let tipRateText = 'N/A';
            if (totalHoursNum > 0 && !isNaN(totalTipsNum)) {
                tipRateText = `$${(totalTipsNum / totalHoursNum).toFixed(2)}/hr`;
            }
            
            empTotals.innerHTML = `Total Hours: <strong>${emp.totalHours || '0.00'}</strong> | 
                                 Total Tips: <strong>$${emp.totalTips || '0.00'}</strong> | 
                                 Tip Rate: <strong>${tipRateText}</strong>`;
            cardBody.appendChild(empTotals);

            if (emp.detailedTips && emp.detailedTips.length > 0) {
                const shiftsList = document.createElement('ul');
                shiftsList.className = 'shift-details-list list-group list-group-flush';

                emp.detailedTips.forEach(shift => {
                    const shiftItem = document.createElement('li');
                    shiftItem.className = 'list-group-item';
                    // Ensure window.utils and window.utils.formatTimeTo12Hour are available
                    const formatTime = window.utils && window.utils.formatTimeTo12Hour ? window.utils.formatTimeTo12Hour : (timeStr) => timeStr; // Fallback

                    shiftItem.innerHTML = `
                        <strong>${shift.role}</strong>: 
                        ${formatTime(shift.startTime)} - ${formatTime(shift.endTime)} 
                        (${shift.hours} hrs) - Tips: <strong>$${shift.tips}</strong>
                    `;
                    shiftsList.appendChild(shiftItem);
                });
                cardBody.appendChild(shiftsList);
            } else {
                const noShiftsMsg = document.createElement('p');
                noShiftsMsg.textContent = 'No specific shift details recorded for this period.';
                cardBody.appendChild(noShiftsMsg);
            }
            empContainer.appendChild(cardBody);
            resultsDiv.appendChild(empContainer);
        });

        // Display overall daily totals if available
        if (payoutData.dailyTotals) {
            const overallTotalsDiv = document.createElement('div');
            overallTotalsDiv.className = 'daily-scoop-summary card mt-3';
            
            const overallHeader = document.createElement('h4');
            overallHeader.className = 'card-header';
            overallHeader.textContent = 'Daily Summary';
            overallTotalsDiv.appendChild(overallHeader);

            const overallBody = document.createElement('div');
            overallBody.className = 'card-body';
            overallBody.innerHTML = `
                <p>Total Hours Worked (All Employees): <strong>${payoutData.dailyTotals.totalHours || '0.00'}</strong></p>
                <p>Total Tips Earned (All Employees): <strong>$${payoutData.dailyTotals.totalTips || '0.00'}</strong></p>
            `;
            overallTotalsDiv.appendChild(overallBody);
            resultsDiv.appendChild(overallTotalsDiv);
        }

        console.log(`UI_INFO: Successfully updated detailed payout view for ${displayDate || 'selected date'} with ${payouts.length} employee(s).`);
    }


    // --- Main UI Initialization Function (Public) ---
    function initializeUI() {
        console.log("APP_LOG: [ui.js] initializeUI called.");
        try {
            initializeCollapsibleSections();
            populateCycleStartDateSelect();
            // Ensure the form is built before listeners are attached to its components
            // or to buttons that interact with it.
            buildAddEmployeeForm('addEmployeeFormWrapper'); 

            // Setup main navigation event listeners (example from pre-refactored)
            document.getElementById('mainNavEmployeeLineup')?.addEventListener('click', () => showView('employeeLineupSection'));
            document.getElementById('mainNavEmployeeForm')?.addEventListener('click', () => showView('employeeFormSection'));
            document.getElementById('mainNavDailyScoop')?.addEventListener('click', () => showView('dailyScoopSection'));
            document.getElementById('mainNavWeeklyRewind')?.addEventListener('click', () => showView('weeklyRewindSection'));
            document.getElementById('mainNavPayoutReport')?.addEventListener('click', () => {
                showView('payoutReportSection');
                if (window.reports && typeof window.reports.generateAndDisplayPayoutReport === 'function') {
                    window.reports.generateAndDisplayPayoutReport();
                }
            });
            document.getElementById('mainNavSettings')?.addEventListener('click', () => showView('settingsSection'));
            
            // Listener for the "Add New Jukebox Hero" / "Cancel" button within employeeFormSection
            const toggleFormBtn = document.getElementById('toggleAddNewEmployeeFormBtn');
            if (toggleFormBtn) {
                // Directly reference the function now that it's defined in the IIFE scope
                toggleFormBtn.addEventListener('click', toggleAddEmployeeFormVisibility);
            } else {
                console.warn("APP_LOG: [ui.js] 'toggleAddNewEmployeeFormBtn' not found during init.");
            }

            // Initial view
            showView('employeeLineupSection'); // Or load from state if preferred view is saved

            console.log("APP_LOG: [ui.js] initializeUI completed successfully.");
        } catch (error) {
            console.error("APP_LOG: [ui.js] Error during initializeUI execution:", error);
            // Propagate or handle critical failure if UI can't initialize
            throw error; // Re-throw if this prevents app from working
        }
    }

    // +++ Function to load initial data displays +++
    function loadInitialDataDisplay() {
        console.log("APP_LOG: [ui.js] loadInitialDataDisplay called.");
        try {
            // Render the initial employee roster/lineup for the current or default date
            if (window.employees && typeof window.employees.renderEmployeeRoster === 'function') {
                // Ensure state.activeSelectedDate is available or use a default
                const activeDate = (window.state && window.state.getAppState && window.state.getAppState().activeSelectedDate) 
                                   ? window.state.getAppState().activeSelectedDate 
                                   : window.utils.formatDate(new Date());
                window.employees.renderEmployeeRoster(activeDate);
            } else {
                console.warn("APP_LOG: [ui.js] window.employees.renderEmployeeRoster not available for initial display.");
            }

            // Call main.js's function to set up date controls and calculate initial date context
            // This will also trigger other necessary renders like day navigation and potentially daily scoop
            if (window.main && typeof window.main.updateDateControlsFromState === 'function') {
                window.main.updateDateControlsFromState();
            }
            if (window.main && typeof window.main.calculateAndUpdateCurrentDate === 'function') {
                window.main.calculateAndUpdateCurrentDate();
            } else {
                console.warn("APP_LOG: [ui.js] window.main.calculateAndUpdateCurrentDate not available for initial display setup.");
            }
            
            console.log("APP_LOG: [ui.js] loadInitialDataDisplay completed.");
        } catch (error) {
            console.error("APP_LOG: [ui.js] Error during loadInitialDataDisplay execution:", error);
        }
    }

    function cacheDom() {
        dom.mainContentArea = document.getElementById('mainContentArea');
        dom.navLinks = document.querySelectorAll('nav ul li a');
        dom.sections = document.querySelectorAll('.content-section');
        dom.toastContainer = document.getElementById('toastContainer');
        dom.loadingIndicator = document.getElementById('loadingIndicator');
        dom.themeToggleButton = document.getElementById('themeToggleButton');
        dom.clearDataButton = document.getElementById('clearDataButton');
        dom.saveDataButton = document.getElementById('saveDataButton'); // Manual save
        dom.helpButton = document.getElementById('helpButton');
        dom.tutorialOverlay = document.getElementById('tutorialOverlay');
        dom.closeTutorialButton = document.getElementById('closeTutorialButton');
        dom.unsavedChangesIndicator = document.getElementById('unsavedChangesIndicator');

        // Modals (already handled by utils.showCustomModal, but specific buttons might be here)
        dom.customModal = document.getElementById('customModal');
        dom.modalOverlay = document.getElementById('modalOverlay');

        // console.log("[ui.js] DOM cached:", dom);
    }

    function bindEvents() {
        if (dom.navLinks) {
            dom.navLinks.forEach(link => {
                link.addEventListener('click', handleNavClick);
            });
        }
        if (dom.themeToggleButton) {
            dom.themeToggleButton.addEventListener('click', toggleTheme);
        }
        if (dom.clearDataButton) {
            dom.clearDataButton.addEventListener('click', () => {
                window.utils.showCustomModal(
                    'Are you sure you want to clear all locally stored data? This action cannot be undone.',
                    'warning',
                    [
                        { text: 'Yes, Clear Data', class: 'button-danger', action: (modal) => { window.appState.clearAllData(); modal.hide(); showToast('All data cleared.', 'success'); } },
                        { text: 'Cancel', class: 'button-secondary', action: (modal) => modal.hide() }
                    ]
                );
            });
        }
        if (dom.saveDataButton) {
            dom.saveDataButton.addEventListener('click', () => {
                window.appState.saveState(); // Toast is shown by saveState itself
            });
        }

        if (dom.helpButton && dom.tutorialOverlay) {
            dom.helpButton.addEventListener('click', showTutorial);
        }
        if (dom.closeTutorialButton && dom.tutorialOverlay) {
            dom.closeTutorialButton.addEventListener('click', hideTutorial);
        }
        if (dom.tutorialOverlay) { // Close tutorial by clicking outside
            dom.tutorialOverlay.addEventListener('click', function(event) {
                if (event.target === dom.tutorialOverlay) {
                    hideTutorial();
                }
            });
        }
        // console.log("[ui.js] UI events bound.");
    }

    function handleNavClick(event) {
        event.preventDefault();
        const targetId = event.target.getAttribute('href').substring(1); // e.g., #shifts -> shifts
        navigateTo(targetId);
    }

    function navigateTo(sectionId) {
        // console.log(`[ui.js] Navigating to ${sectionId}`);
        if (dom.sections) {
            dom.sections.forEach(section => {
                section.style.display = section.id === sectionId ? 'block' : 'none';
            });
        }
        if (dom.navLinks) {
            dom.navLinks.forEach(link => {
                if (link.getAttribute('href').substring(1) === sectionId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        window.appState.setState({ currentView: sectionId }, { event: 'navigation', view: sectionId });
        
        // If navigating to reports, ensure its date pickers are correctly shown/hidden
        if (sectionId === 'reports' && window.reports && typeof window.reports.handleReportTypeChange === 'function') {
            // This might be redundant if reports.js listens to navigation or visibility changes
            // but explicit call ensures state consistency upon navigation.
            // window.reports.handleReportTypeChange(); // Already called by reports.init and its own event handlers
        }
        // If navigating to employees, refresh the list (in case of direct navigation via URL or history)
        if (sectionId === 'employees' && window.employees && typeof window.employees.renderEmployeeList === 'function') {
            window.employees.renderEmployeeList();
        }
        // If navigating to shifts, refresh the list
        if (sectionId === 'shifts' && window.shifts && typeof window.shifts.renderShiftList === 'function') {
            window.shifts.renderShiftList();
        }

        // Update URL hash for deep linking (optional)
        // window.location.hash = sectionId;
    }

    function showToast(message, type = 'info', duration = 3000) {
        if (!dom.toastContainer) {
            console.warn("[ui.js] Toast container not found. Message:", message);
            // Fallback to a simple alert or custom modal if toast container is missing
            window.utils.showCustomModal(message, type);
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        dom.toastContainer.appendChild(toast);

        // Trigger reflow to enable CSS transition
        toast.offsetHeight; 

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (dom.toastContainer && toast.parentNode === dom.toastContainer) {
                    dom.toastContainer.removeChild(toast);
                }
            }, 500); // Wait for fade out transition
        }, duration);
    }

    function toggleTheme() {
        const body = document.body;
        body.classList.toggle('dark-theme');
        const isDarkMode = body.classList.contains('dark-theme');
        window.appState.setState({ settings: { ...window.appState.getState().settings, darkMode: isDarkMode } });
        if (dom.themeToggleButton) {
            dom.themeToggleButton.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
        }
        // console.log("[ui.js] Theme toggled. Dark mode:", isDarkMode);
    }

    function applyInitialTheme() {
        const settings = window.appState.getState().settings;
        if (settings.darkMode) {
            document.body.classList.add('dark-theme');
            if (dom.themeToggleButton) dom.themeToggleButton.textContent = '☀️ Light Mode';
        } else {
            document.body.classList.remove('dark-theme');
            if (dom.themeToggleButton) dom.themeToggleButton.textContent = '🌙 Dark Mode';
        }
    }

    function updateUnsavedChangesIndicator(unsaved) {
        if (dom.unsavedChangesIndicator) {
            dom.unsavedChangesIndicator.style.display = unsaved ? 'inline' : 'none';
            dom.unsavedChangesIndicator.title = unsaved ? 'You have unsaved changes' : 'All changes saved';
        }
    }

    function showTutorial() {
        if (dom.tutorialOverlay) {
            dom.tutorialOverlay.style.display = 'flex';
            // Potentially mark tutorial as seen or in progress in state
            // window.appState.setState({ tutorialActive: true });
        }
    }

    function hideTutorial() {
        if (dom.tutorialOverlay) {
            dom.tutorialOverlay.style.display = 'none';
            // window.appState.setState({ tutorialActive: false, tutorialCompleted: true });
            // Potentially save this preference
        }
    }

    function init() {
        // console.log("[ui.js] Initializing UI...");
        cacheDom();
        bindEvents();
        applyInitialTheme(); // Apply theme based on loaded state
        
        const initialState = window.appState.getState();
        navigateTo(initialState.currentView || 'shifts'); // Navigate to last known view or default
        updateUnsavedChangesIndicator(initialState.unsavedChanges);

        window.appState.subscribe((state, changes) => {
            if (changes.updated && changes.updated.includes('settings')) {
                applyInitialTheme(); // Re-apply if settings change (e.g. loaded from storage later)
            }
            if (changes.hasOwnProperty('unsavedChanges')) { // Check if 'unsavedChanges' property itself was part of the update
                updateUnsavedChangesIndicator(state.unsavedChanges);
            }
            if (changes.event === 'stateSaved') {
                updateUnsavedChangesIndicator(false);
            }
        });

        // Handle unsaved changes before leaving the page
        window.addEventListener('beforeunload', (event) => {
            if (window.appState.getState().unsavedChanges) {
                event.preventDefault(); // Standard for most browsers
                event.returnValue = ''; // Required for some older browsers
                return ''; // For some browsers
            }
        });

        // Check if tutorial should be shown on first load
        // This logic might be better in main.js or a dedicated tutorial.js
        if (!initialState.tutorialCompleted && dom.tutorialOverlay) {
            // showTutorial(); // Decide if it should auto-show or only via help button
        }
        // console.log("[ui.js] UI Initialization complete.");
    }

    // Public API
    return {
        init,
        navigateTo,
        showToast,
        toggleTheme, // if manual toggle outside of button is needed
        showTutorial,
        hideTutorial
    };
})();

// Initialize UI module when the DOM is ready
// document.addEventListener('DOMContentLoaded', window.ui.init);
// This will be called from main.js
