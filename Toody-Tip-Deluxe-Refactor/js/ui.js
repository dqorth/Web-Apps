import { domElements } from './domElements.js'; // Correctly import from the new file
import { formatDate, formatDisplayDate, getMondayOfWeek, sortEmployeesByName, calculateHoursWorked, formatTimeTo12Hour, getWeekInfoForDate } from './utils.js';
import { JOB_POSITIONS_AVAILABLE, BASE_CYCLE_START_DATE } from './state.js';

export function populateJobPositions(selectElement, positions) {
    if (!selectElement) return;
    selectElement.innerHTML = ''; // Clear existing options
    positions.forEach(position => {
        const option = document.createElement('option');
        option.value = position;
        option.textContent = position;
        selectElement.appendChild(option);
    });
}

export function populateCycleStartDateSelect(cycleStartDateSelectElement, baseCycleDate, activeSelectedDate) {
    if (!cycleStartDateSelectElement) return;
    console.log("UI_LOG: Populating Cycle Start Dates...");
    cycleStartDateSelectElement.innerHTML = '';
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let i = -12; i <= 12; i++) {
        const cycleStart = new Date(baseCycleDate);
        cycleStart.setUTCDate(baseCycleDate.getUTCDate() + (i * 28));
        const option = document.createElement('option');
        const dateValue = formatDate(cycleStart);
        option.value = dateValue;
        option.textContent = formatDisplayDate(dateValue);
        cycleStartDateSelectElement.appendChild(option);
    }

    let defaultCycleStartValue = formatDate(baseCycleDate);
    if (activeSelectedDate) { // If an active date is provided, try to find its cycle start
        const { cycleStart } = getWeekInfoForDate(activeSelectedDate, baseCycleDate); // Assumes getWeekInfoForDate is available or will be added to utils
        if (cycleStart) defaultCycleStartValue = cycleStart;
    } else { // Fallback to today's cycle if no active date
        const todayUTCStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        for (let i = 0; i < cycleStartDateSelectElement.options.length; i++) {
            const opt = cycleStartDateSelectElement.options[i];
            const optDate = new Date(opt.value + "T00:00:00Z");
            const cycleEndDate = new Date(optDate);
            cycleEndDate.setUTCDate(optDate.getUTCDate() + 27);
            if (todayUTCStart >= optDate && todayUTCStart <= cycleEndDate) {
                defaultCycleStartValue = opt.value;
                break;
            }
        }
    }

    if (cycleStartDateSelectElement.querySelector(`option[value="${defaultCycleStartValue}"]`)) {
        cycleStartDateSelectElement.value = defaultCycleStartValue;
    } else if (cycleStartDateSelectElement.options.length > 0) {
        // Fallback to a sensible default if the calculated one isn't in the list (e.g. middle option)
        cycleStartDateSelectElement.selectedIndex = Math.floor(cycleStartDateSelectElement.options.length / 2);
    }
    console.log("UI_LOG: Cycle Start Dates populated. Default:", cycleStartDateSelectElement.value);
}

export function renderDayNavigation(container, dateForNav, onDaySelectCallback) {
    if (!container) { if (container) container.innerHTML = ''; return; }
    container.innerHTML = '';
    if (!dateForNav) { return; } // Don't render if no date context

    const navDiv = document.createElement('div');
    navDiv.className = 'day-nav-container';

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayValues = [1, 2, 3, 4, 5, 6, 0]; // 0 for Sunday, 1 for Monday, etc.
    const activeDayNum = new Date(dateForNav + 'T00:00:00Z').getUTCDay();

    dayValues.forEach((dayVal, index) => {
        const btn = document.createElement('button');
        btn.classList.add('button', 'small-action-btn', 'day-nav-btn');
        btn.textContent = days[index];
        btn.dataset.dayValue = String(dayVal);

        if (dayVal === activeDayNum) {
            btn.classList.add('active-day');
        }

        btn.addEventListener('click', (e) => {
            const selectedDay = parseInt(e.target.dataset.dayValue);
            if (onDaySelectCallback) {
                onDaySelectCallback(selectedDay);
            }
        });
        navDiv.appendChild(btn);
    });
    container.appendChild(navDiv);
}

export function updateCurrentlyViewedWeekDisplay(element, currentReportWeekStartDate) {
    if (!element) return;
    if (currentReportWeekStartDate instanceof Date && !isNaN(currentReportWeekStartDate)) {
        const endDate = new Date(currentReportWeekStartDate);
        endDate.setUTCDate(currentReportWeekStartDate.getUTCDate() + 6);
        element.textContent = `Viewing: ${formatDisplayDate(formatDate(currentReportWeekStartDate))} - ${formatDisplayDate(formatDate(endDate))}`;
    } else {
        element.textContent = "Week: N/A";
    }
}

export function renderEmployeeRoster(rosterContainer, employeeRosterData, activeDate, dailyShiftsData, jobPositions) {
    console.log('[ui.js] renderEmployeeRoster - ActiveDate:', activeDate, 'DailyShiftsData for this date:', JSON.parse(JSON.stringify(dailyShiftsData))); // Diagnostic
    if (!rosterContainer) { console.error("UI_LOG: Roster list container not found!"); return; }
    rosterContainer.innerHTML = '';
    if (!activeDate) {
        rosterContainer.innerHTML = '<p>Please select a date to see the roster.</p>';
        return;
    }

    const positionDisplayOrder = ["Server", "Busser", "Food Runner", "Shake Spinner", "Host", ...jobPositions.filter(p => !["Server", "Busser", "Food Runner", "Shake Spinner", "Host"].includes(p))];

    positionDisplayOrder.forEach(posKey => {
        const employeesInThisPosition = employeeRosterData.filter(emp => emp.positions.includes(posKey));
        if (employeesInThisPosition.length > 0) {
            const positionGroupDiv = document.createElement('div');
            positionGroupDiv.className = 'roster-position-group';

            const groupHeader = document.createElement('h5');
            groupHeader.className = 'position-group-header-roster';
            groupHeader.textContent = posKey + 's';
            positionGroupDiv.appendChild(groupHeader);

            const ul = document.createElement('ul');
            ul.className = 'item-list roster-lineup-selectable';

            employeesInThisPosition.sort((a, b) => sortEmployeesByName(a, b, 'name')).forEach(emp => {
                const li = document.createElement('li');
                li.id = `roster-emp-${emp.id}-${posKey.replace(/\s+/g, '')}`;

                const mainInfoDiv = document.createElement('div'); mainInfoDiv.className = 'roster-item-main-info';
                const empInfoDiv = document.createElement('div'); empInfoDiv.className = 'employee-info';
                const nameStrong = document.createElement('strong');
                nameStrong.dataset.empid = emp.id; nameStrong.dataset.positioncontext = posKey;
                nameStrong.title = `Click to log/edit shift for ${emp.name} as ${posKey}`; nameStrong.textContent = emp.name;
                empInfoDiv.appendChild(nameStrong);
                mainInfoDiv.appendChild(empInfoDiv);

                const actionsDiv = document.createElement('div'); actionsDiv.className = 'employee-actions';
                const toggleWorkedBtn = document.createElement('button');
                toggleWorkedBtn.classList.add('button', 'worked-today-toggle-btn');
                toggleWorkedBtn.dataset.empid = emp.id;
                toggleWorkedBtn.dataset.positioncontext = posKey;

                // Event listeners are handled by the delegated listener in events.js (handleRosterEmployeeClick)
                // The onLogShiftClick and onEditShiftClick parameters passed to renderEmployeeRoster
                // are effectively no longer used by this function directly.

                actionsDiv.appendChild(toggleWorkedBtn);
                mainInfoDiv.appendChild(actionsDiv);
                li.appendChild(mainInfoDiv);

                const inlineFormDiv = document.createElement('div');
                inlineFormDiv.id = `inline-form-${emp.id}-${posKey.replace(/\s+/g, '')}`;
                inlineFormDiv.className = 'inline-shift-form-container';
                inlineFormDiv.style.display = 'none';
                li.appendChild(inlineFormDiv);
                ul.appendChild(li);

                let existingShift = null;
                const shiftsForDay = dailyShiftsData[activeDate]; // Get shifts for the specific active date
                if (shiftsForDay) { // Check if there are any shifts for this day
                    existingShift = shiftsForDay.find(s => s.employeeId === emp.id && s.positionWorked === posKey);
                }
                // Diagnostic for shift finding - ensure existingShift is serializable or handle null/undefined
                let shiftToLog = existingShift ? JSON.parse(JSON.stringify(existingShift)) : null;
                console.log('[ui.js] renderEmployeeRoster - Employee:', emp.name, 'posKey:', posKey, 'Found existingShift (pre-update call):', shiftToLog, 'ID specifically:', existingShift ? existingShift.id : 'undefined');
                updateEmployeeLineupCard(li, toggleWorkedBtn, existingShift, emp, posKey);
            });
            positionGroupDiv.appendChild(ul);
            rosterContainer.appendChild(positionGroupDiv);
        }
    });
    applyMasonryLayoutToRoster(rosterContainer); // Pass container
}

export function updateEmployeeLineupCard(liElement, buttonElement, shiftData, employee, positionContext) {
    // Diagnostic: handle null shiftData before stringify/parse
    let shiftDataForLog = shiftData ? JSON.parse(JSON.stringify(shiftData)) : null;
    console.log('[ui.js] updateEmployeeLineupCard - START - Args:', { employeeName: employee ? employee.name : 'N/A', pos: positionContext, shiftData: shiftDataForLog });
    if (!liElement || !buttonElement) {
        console.error('[ui.js] updateEmployeeLineupCard - ERROR: liElement or buttonElement is null.', { liElement, buttonElement });
        return;
    }

    const employeeInfoDiv = liElement.querySelector('.employee-info');
    if (!employeeInfoDiv) {
        console.error('[ui.js] updateEmployeeLineupCard - ERROR: employeeInfoDiv not found in liElement:', liElement);
    }
    let shiftSummaryDiv = liElement.querySelector('.shift-summary-display');
    
    // Always remove existing summary to prevent duplicates if function is called multiple times
    if (shiftSummaryDiv) {
        console.log('[ui.js] updateEmployeeLineupCard - Removing existing shiftSummaryDiv.');
        shiftSummaryDiv.remove();
    }

    buttonElement.classList.remove('is-not-working', 'is-working', 'is-editing-shift');
    delete buttonElement.dataset.shiftId; // Clear existing shiftId from button

    // Ensure shiftData and its id are valid and non-empty
    const hasValidShiftId = shiftData && typeof shiftData.id === 'string' && shiftData.id.trim() !== '';
    console.log(`[ui.js] updateEmployeeLineupCard - Valid Shift ID check: ${hasValidShiftId}, shiftData.id: ${shiftData ? shiftData.id : 'N/A'}`);

    if (hasValidShiftId) {
        console.log('[ui.js] updateEmployeeLineupCard - Condition MET: shiftData is present with a valid ID.');
        buttonElement.textContent = `Edit Shift (${formatTimeTo12Hour(shiftData.timeIn)})`;
        buttonElement.dataset.action = "edit";
        buttonElement.dataset.shiftId = shiftData.id;
        buttonElement.classList.add('is-editing-shift');
        buttonElement.setAttribute('aria-pressed', 'true');
        console.log('[ui.js] updateEmployeeLineupCard - Button updated for "Edit Shift":', buttonElement.outerHTML);

        if (employeeInfoDiv) {
            shiftSummaryDiv = document.createElement('div');
            shiftSummaryDiv.className = 'shift-summary-display';
            let summaryText = `${formatTimeTo12Hour(shiftData.timeIn)} - ${formatTimeTo12Hour(shiftData.timeOut)} (${calculateHoursWorked(shiftData.timeIn, shiftData.timeOut).toFixed(2)} hrs)`;
            if (shiftData.positionWorked === "Server") {
                summaryText += ` | Sales: $${(shiftData.totalSales || 0).toFixed(2)}`;
                summaryText += ` | Tips: $${((shiftData.ccTips || 0) + (shiftData.cashTips || 0)).toFixed(2)}`;
            }
            shiftSummaryDiv.textContent = summaryText;
            employeeInfoDiv.appendChild(shiftSummaryDiv);
            console.log('[ui.js] updateEmployeeLineupCard - Shift summary created and appended:', shiftSummaryDiv.outerHTML);
            // Explicitly set display to block as per original_app.html logic for visibility
            shiftSummaryDiv.style.display = 'block'; 
            console.log('[ui.js] updateEmployeeLineupCard - shiftSummaryDiv display style set to block.');

        } else {
            console.warn('[ui.js] updateEmployeeLineupCard - employeeInfoDiv was null, cannot append shift summary.');
        }
    } else {
        console.log('[ui.js] updateEmployeeLineupCard - Condition NOT MET: No valid shiftData or shiftData.id. Setting button to "Log Shift".');
        buttonElement.textContent = "Log Shift";
        buttonElement.dataset.action = "log";
        buttonElement.classList.add('is-not-working');
        buttonElement.setAttribute('aria-pressed', 'false');
        console.log('[ui.js] updateEmployeeLineupCard - Button updated for "Log Shift":', buttonElement.outerHTML);
        // Ensure summary is hidden if no shift data
        if (shiftSummaryDiv) { // This check might be redundant if we always remove it above
            console.log('[ui.js] updateEmployeeLineupCard - Hiding shiftSummaryDiv as there is no shift data.');
            shiftSummaryDiv.style.display = 'none';
        }
    }
    console.log('[ui.js] updateEmployeeLineupCard - END - Employee:', employee ? employee.name : 'N/A');
}

export function applyMasonryLayoutToRoster(rosterListContainer) {
    if (!rosterListContainer || window.innerWidth <= 768) {
        if (rosterListContainer) {
            rosterListContainer.querySelectorAll('.roster-position-group').forEach(item => {
                item.style.gridRowEnd = '';
            });
            rosterListContainer.style.display = (window.innerWidth <= 768) ? 'block' : 'grid';
        }
        return;
    }

    const items = rosterListContainer.querySelectorAll('.roster-position-group');
    if (!items.length) return;

    rosterListContainer.style.display = 'grid';
    // Ensure grid-row-gap and grid-auto-rows are defined in CSS or default them here if necessary.
    // For robustness, could read them with window.getComputedStyle if they might change, but hardcoding is simpler if static.
    const gridRowGap = parseInt(window.getComputedStyle(rosterListContainer).getPropertyValue('grid-row-gap')) || 20;
    const gridAutoRows = 10; // This was an arbitrary value in original, might need adjustment or CSS definition

    items.forEach(item => {
        item.style.gridRowEnd = ""; // Reset first
        const contentHeight = item.scrollHeight;
        const rowSpan = Math.ceil((contentHeight + gridRowGap) / (gridAutoRows + gridRowGap));
        item.style.gridRowEnd = `span ${rowSpan}`;
    });
}

export function renderFullEmployeeListForManagement(container, employeeRosterData, onEditCallback, onRemoveCallback) {
    if (!container) { console.error("UI_LOG: Full employee roster container not found!"); return; }
    container.innerHTML = '';
    if (employeeRosterData.length === 0) {
        container.innerHTML = '<p>No employees in the roster yet. Add a new hero using the form!</p>';
        return;
    }
    const ul = document.createElement('ul');
    ul.className = 'item-list';
    employeeRosterData.sort((a, b) => sortEmployeesByName(a, b, 'name')).forEach(emp => {
        const li = document.createElement('li');
        li.id = `management-emp-${emp.id}`;

        const employeeInfoDiv = document.createElement('div');
        employeeInfoDiv.className = 'employee-info';
        employeeInfoDiv.innerHTML = `<strong>${emp.name}</strong><span class="roster-positions">${emp.positions.join(', ')}</span>`;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'employee-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'button small-action-btn edit-btn';
        editBtn.dataset.id = emp.id;
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => onEditCallback(emp));
        actionsDiv.appendChild(editBtn);

        const removeXBtn = document.createElement('button');
        removeXBtn.className = 'remove-x-btn';
        removeXBtn.dataset.id = emp.id;
        removeXBtn.textContent = 'X';
        removeXBtn.setAttribute('aria-label', `Remove ${emp.name}`);
        removeXBtn.addEventListener('click', () => onRemoveCallback(emp.id)); // Pass emp.id

        li.append(employeeInfoDiv, actionsDiv, removeXBtn);
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

export function renderEmpPositionsWithPayRates(positionsContainer, jobPositionsList, editingEmpData) {
    if (!positionsContainer) return;
    positionsContainer.innerHTML = '';

    if (jobPositionsList.length === 0) {
        positionsContainer.innerHTML = "<p>No job positions configured.</p>";
        return;
    }

    jobPositionsList.forEach(pos => {
        const posIdentifier = pos.replace(/\s+/g, '');
        const groupDiv = document.createElement('div');
        groupDiv.className = 'position-entry-group';

        const isSelected = editingEmpData ? editingEmpData.positions.includes(pos) : false;
        const currentPayRateValue = (editingEmpData && editingEmpData.payRates && editingEmpData.payRates[pos] !== undefined) ? String(editingEmpData.payRates[pos]) : '';

        const roleToggleButton = document.createElement('button');
        roleToggleButton.type = 'button';
        roleToggleButton.classList.add('button', 'role-toggle-btn');
        if (isSelected) roleToggleButton.classList.add('selected-role');
        else roleToggleButton.classList.add('is-not-working'); // Re-evaluate class name if needed
        roleToggleButton.dataset.position = pos;
        roleToggleButton.textContent = pos;
        roleToggleButton.setAttribute('aria-pressed', String(isSelected));

        const payRateWrapperDiv = document.createElement('div');
        payRateWrapperDiv.className = 'pay-rate-input-wrapper';
        payRateWrapperDiv.id = `payRateWrapper_${posIdentifier}`;
        payRateWrapperDiv.style.display = isSelected ? 'block' : 'none';

        const payRateLabel = document.createElement('label');
        payRateLabel.htmlFor = `payRate_${posIdentifier}`;
        payRateLabel.textContent = `${pos} Pay Rate ($/hr):`;

        const payRateInput = document.createElement('input');
        payRateInput.type = 'number';
        payRateInput.id = `payRate_${posIdentifier}`;
        payRateInput.dataset.position = pos; // For easier data retrieval
        payRateInput.placeholder = "0.00";
        payRateInput.step = "0.01";
        payRateInput.value = currentPayRateValue;

        payRateWrapperDiv.appendChild(payRateLabel);
        payRateWrapperDiv.appendChild(payRateInput);
        groupDiv.appendChild(roleToggleButton);
        groupDiv.appendChild(payRateWrapperDiv);
        positionsContainer.appendChild(groupDiv);

        // Event listener for toggling pay rate input will be in events.js
        // roleToggleButton.addEventListener('click', () => { ... });
    });
}

export function renderInlineShiftForm(containerElement, employee, positionWorkedContext, activeDate, existingShiftData, onSaveShift, onDeleteShift, onCancel) {
    if (!containerElement || !employee || !positionWorkedContext || !activeDate) {
        console.error("renderInlineShiftForm: Missing required parameters.", { containerElement, employee, positionWorkedContext, activeDate });
        if(containerElement) containerElement.innerHTML = '<p style="color:red;">Error loading form.</p>';
        return;
    }
    containerElement.innerHTML = '';
    containerElement.style.display = 'block';

    const formDiv = document.createElement('div');
    formDiv.dataset.shiftFormFor = employee.id;
    formDiv.dataset.shiftPosition = positionWorkedContext;

    const posDisplay = document.createElement('p');
    posDisplay.innerHTML = `Logging shift as: <strong>${positionWorkedContext}</strong> for ${employee.name}`;
    formDiv.appendChild(posDisplay);

    const timeInputsGroup = document.createElement('div');
    timeInputsGroup.className = 'time-inputs-group';

    const timeInContainer = document.createElement('div');
    const timeInLabel = document.createElement('label'); timeInLabel.textContent = 'Clock In:'; timeInLabel.htmlFor = `timeIn_${employee.id}_${positionWorkedContext}`;
    const timeInInline = document.createElement('input'); timeInInline.type = 'time'; timeInInline.step = '60'; timeInInline.className = 'inline-shift-timein'; timeInInline.id = `timeIn_${employee.id}_${positionWorkedContext}`;
    timeInContainer.append(timeInLabel, timeInInline);
    timeInputsGroup.appendChild(timeInContainer);

    const timeOutContainer = document.createElement('div');
    const timeOutLabel = document.createElement('label'); timeOutLabel.textContent = 'Clock Out:'; timeOutLabel.htmlFor = `timeOut_${employee.id}_${positionWorkedContext}`;
    const timeOutInline = document.createElement('input'); timeOutInline.type = 'time'; timeOutInline.step = '60'; timeOutInline.className = 'inline-shift-timeout'; timeOutInline.id = `timeOut_${employee.id}_${positionWorkedContext}`;
    timeOutContainer.append(timeOutLabel, timeOutInline);
    timeInputsGroup.appendChild(timeOutContainer);
    formDiv.appendChild(timeInputsGroup);

    const serverTipsDiv = document.createElement('div');
    serverTipsDiv.className = 'inline-server-tips';
    serverTipsDiv.style.display = (positionWorkedContext === "Server") ? 'block' : 'none';

    const tipInputsGroup = document.createElement('div'); tipInputsGroup.className = 'tip-inputs-group';

    const salesContainer = document.createElement('div');
    const salesLabel = document.createElement('label'); salesLabel.textContent = 'Total Sales ($):'; salesLabel.htmlFor = `sales_${employee.id}_${positionWorkedContext}`;
    const salesInput = document.createElement('input'); salesInput.type = 'number'; salesInput.placeholder = '0.00'; salesInput.step = '0.01'; salesInput.className = 'inline-shift-sales'; salesInput.id = `sales_${employee.id}_${positionWorkedContext}`;
    salesContainer.append(salesLabel, salesInput);
    tipInputsGroup.appendChild(salesContainer);

    const ccTipContainer = document.createElement('div');
    const ccLabel = document.createElement('label'); ccLabel.textContent = 'CC Tips ($):'; ccLabel.htmlFor = `cctips_${employee.id}_${positionWorkedContext}`;
    const ccInput = document.createElement('input'); ccInput.type = 'number'; ccInput.placeholder = '0.00'; ccInput.step = '0.01'; ccInput.className = 'inline-shift-cctips'; ccInput.id = `cctips_${employee.id}_${positionWorkedContext}`;
    ccTipContainer.append(ccLabel, ccInput);
    tipInputsGroup.appendChild(ccTipContainer);

    const cashTipContainer = document.createElement('div');
    const cashLabel = document.createElement('label'); cashLabel.textContent = 'Cash Tips ($):'; cashLabel.htmlFor = `cashtips_${employee.id}_${positionWorkedContext}`;
    const cashInput = document.createElement('input'); cashInput.type = 'number'; cashInput.placeholder = '0.00'; cashInput.step = '0.01'; cashInput.className = 'inline-shift-cashtips'; cashInput.id = `cashtips_${employee.id}_${positionWorkedContext}`;
    cashTipContainer.append(cashLabel, cashInput);
    tipInputsGroup.appendChild(cashTipContainer);

    serverTipsDiv.appendChild(tipInputsGroup);
    formDiv.appendChild(serverTipsDiv);

    // Populate form if editing existing shift
    if (existingShiftData) {
        timeInInline.value = existingShiftData.timeIn || '';
        timeOutInline.value = existingShiftData.timeOut || '';
        if (positionWorkedContext === "Server") {
            salesInput.value = existingShiftData.totalSales || '';
            ccInput.value = existingShiftData.ccTips || '';
            cashInput.value = existingShiftData.cashTips || '';
        }
    }

    const formActionsDiv = document.createElement('div');
    formActionsDiv.className = 'inline-form-actions';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = existingShiftData ? 'Update Shift' : 'Log Shift';
    saveBtn.classList.add('button', 'small-action-btn', 'log-specific-shift-btn');
    saveBtn.dataset.employeeId = employee.id;
    saveBtn.dataset.positionContext = positionWorkedContext;
    if (existingShiftData) {
        saveBtn.dataset.editingShiftId = existingShiftData.id;
    }
    saveBtn.addEventListener('click', (event) => { // Capture the event object
        const shiftDetails = {
            date: activeDate,
            employeeId: employee.id,
            employeeName: employee.name, 
            positionWorked: positionWorkedContext,
            shiftPayRate: (employee.payRates && employee.payRates[positionWorkedContext] !== undefined) ? parseFloat(employee.payRates[positionWorkedContext]) : 0,
            timeIn: timeInInline.value,
            timeOut: timeOutInline.value,
            id: existingShiftData ? existingShiftData.id : undefined
        };
        if (positionWorkedContext === "Server") {
            shiftDetails.totalSales = parseFloat(salesInput.value) || 0;
            shiftDetails.ccTips = parseFloat(ccInput.value) || 0;
            shiftDetails.cashTips = parseFloat(cashInput.value) || 0;
        }
        // Pass only the event to onSaveShift, as handleLogOrUpdateInlineShift expects it
        onSaveShift(event); 
    });
    formActionsDiv.appendChild(saveBtn);

    if (existingShiftData && onDeleteShift) {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete Shift';
        deleteBtn.classList.add('button', 'small-action-btn', 'delete-shift-btn');
        deleteBtn.style.backgroundColor = '#AA0000';
        deleteBtn.addEventListener('click', () => onDeleteShift(existingShiftData.id, activeDate, employee.id, positionWorkedContext, containerElement.closest('li')));
        formActionsDiv.appendChild(deleteBtn);
    }

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.classList.add('button', 'small-action-btn', 'cancel-edit-inline-btn');
    cancelBtn.style.backgroundColor = '#BDBDBD';
    cancelBtn.addEventListener('click', () => {
        console.log("[ui.js] Cancel button clicked. Calling onCancel with:", employee.id, positionWorkedContext, existingShiftData); // Diagnostic
        onCancel(employee.id, positionWorkedContext, existingShiftData);
    }); // Pass employee.id, positionContext, and existingShiftData
    formActionsDiv.appendChild(cancelBtn);

    formDiv.appendChild(formActionsDiv);
    containerElement.appendChild(formDiv);

    // Focus the first input
    timeInInline.focus();
}

export function renderDailyPayoutResults(payoutResultsContainer, processedShifts, activeDate, onRemoveShiftCallback) {
    if (!payoutResultsContainer) { console.error("UI_LOG: Payout results div not found!"); return; }
    if (!processedShifts || processedShifts.length === 0) {
        payoutResultsContainer.innerHTML = `<p>No shifts processed for ${formatDisplayDate(activeDate)}.</p>`;
        return;
    }

    let html = '';
    const groupedByPosition = processedShifts.reduce((acc, shift) => {
        const pos = shift.positionWorked;
        if (!acc[pos]) acc[pos] = [];
        acc[pos].push(shift);
        return acc;
    }, {});

    // Assuming JOB_POSITIONS_AVAILABLE is imported or passed
    const positionOrder = ["Server", "Busser", "Food Runner", "Shake Spinner", "Host", ...JOB_POSITIONS_AVAILABLE.filter(p => !["Server", "Busser", "Food Runner", "Shake Spinner", "Host"].includes(p))];

    positionOrder.forEach(posKey => {
        if (groupedByPosition[posKey] && groupedByPosition[posKey].length > 0) {
            html += `<h5 class="report-position-group-header">${posKey}s:</h5>`;
            html += `<div class="data-table-container" style="overflow-x:auto;"><table class="data-results-table"><thead><tr><th>Employee</th><th>Shift Time</th><th>Hrs</th><th>Wage</th><th>Sales</th><th>CC Tips</th><th>Cash Tips</th><th>Tip Out</th><th>Tip In</th><th>Take-Home Tips</th><th>Action</th></tr></thead><tbody>`;
            groupedByPosition[posKey].sort((a, b) => sortEmployeesByName(a, b, 'employeeName')).forEach((pShift, index) => {
                html += `<tr>
                             <td data-label="Employee">${pShift.employeeName}</td>
                             <td data-label="Shift Time">${formatTimeTo12Hour(pShift.timeIn)} - ${formatTimeTo12Hour(pShift.timeOut)}</td>
                             <td data-label="Hrs">${pShift.hoursWorked.toFixed(2)}</td>
                             <td data-label="Wage">$${pShift.shiftWage.toFixed(2)}</td>
                             <td data-label="Sales">${pShift.positionWorked === "Server" ? `$${(pShift.totalSales || 0).toFixed(2)}` : 'N/A'}</td>
                             <td data-label="CC Tips">${pShift.positionWorked === "Server" ? `$${(pShift.ccTips || 0).toFixed(2)}` : 'N/A'}</td>
                             <td data-label="Cash Tips">${pShift.positionWorked === "Server" ? `$${(pShift.cashTips || 0).toFixed(2)}` : 'N/A'}</td>
                             <td data-label="Tip Out">${pShift.positionWorked === "Server" ? `$${(pShift.tipOutGiven || 0).toFixed(2)}` : 'N/A'}</td>
                             <td data-label="Tip In">${pShift.positionWorked !== "Server" ? `$${(pShift.tipInReceived || 0).toFixed(2)}` : 'N/A'}</td>
                             <td data-label="Take-Home Tips"><strong>$${(pShift.finalTakeHomeTips || 0).toFixed(2)}</strong></td>
                             <td data-label="Action">
                                 <button class="button small-action-btn remove-shift-from-scoop-btn"
                                         data-shift-id="${pShift.id}"
                                         data-date="${pShift.date}" 
                                         data-empid="${pShift.employeeId}"
                                         data-positioncontext="${pShift.positionWorked}"
                                         title="Remove this shift permanently"
                                         style="background-color: #c62828; font-size: 0.8em; padding: 4px 8px; margin-top:0;">
                                     Del
                                 </button>
                             </td>
                         </tr>`;

                if (pShift.positionWorked !== "Server" && pShift.detailedTipIns && pShift.detailedTipIns.length > 0) {
                    html += `<tr class="detailed-tip-in-row-daily ${index % 2 === 1 ? 'even-detail' : 'odd-detail'}"><td colspan="11">`;
                    html += '<ul class="support-tip-detail" style="margin:2px 0 2px 30px;padding-left:5px;list-style-type:circle;">';
                    pShift.detailedTipIns.forEach(detail => {
                        let fST = 'N/A'; if (detail.fromServerShiftTime && detail.fromServerShiftTime.includes('-')) { const [sIn, sOut] = detail.fromServerShiftTime.split('-'); fST = `${formatTimeTo12Hour(sIn)}-${formatTimeTo12Hour(sOut)}`; }
                        let supST = 'N/A'; if (detail.supportShiftTime && detail.supportShiftTime.includes('-')) { const [supIn, supOut] = detail.supportShiftTime.split('-'); supST = `${formatTimeTo12Hour(supIn)}-${formatTimeTo12Hour(supOut)}`; }
                        html += `<li>From ${detail.fromServerName} (Server ${fST}, ${detail.overlapMinutes.toFixed(0)}m overlap with your ${supST}): <strong>$${detail.amount.toFixed(2)}</strong></li>`;
                    });
                    html += '</ul></td></tr>';
                }
            });
            html += `</tbody></table></div>`;
        }
    });
    payoutResultsContainer.innerHTML = html;

    payoutResultsContainer.querySelectorAll('.remove-shift-from-scoop-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const button = event.currentTarget;
            const shiftId = button.dataset.shiftId;
            const shiftDate = button.dataset.date;
            const empId = button.dataset.empid;
            const posCtx = button.dataset.positioncontext;
            if (onRemoveShiftCallback) {
                onRemoveShiftCallback(shiftId, shiftDate, empId, posCtx);
            }
        });
    });
}

export function generateWeeklyReportContentUI(reportOutputContainer, weeklyEmployeeSummaryData, dailyShiftsByDate, weekStartObj, jobPositions, onEditShiftCallback) {
    console.log("[LOG ui.js] generateWeeklyReportContentUI entered. weekStartObj:", weekStartObj, 
                "Type:", typeof weekStartObj, 
                "IsDate:", weekStartObj instanceof Date, 
                "getUTCDate type:", typeof weekStartObj?.getUTCDate, 
                "Constructor name:", weekStartObj?.constructor?.name, 
                "Object.prototype.toString:", Object.prototype.toString.call(weekStartObj));

    if (!(weekStartObj instanceof Date) || isNaN(weekStartObj.getTime()) || typeof weekStartObj.getUTCDate !== 'function') {
        console.error("Invalid weekStartObj:", weekStartObj);
        reportOutputContainer.innerHTML = '<p style="color:red;">Error: Invalid week start date.</p>';
        return;
    }

    reportOutputContainer.innerHTML = '';

    const employeeSummaryArray = Object.values(weeklyEmployeeSummaryData);
    employeeSummaryArray.sort((a, b) => sortEmployeesByName(a, b, 'employeeName'));

    let weeklyHTML = '';

    if (employeeSummaryArray.length > 0) {
        weeklyHTML += `<h4>Weekly Employee Totals:</h4>`;
        weeklyHTML += `<div class="data-table-container" style="overflow-x:auto; margin-bottom: 25px;"><table class="data-results-table">
            <thead><tr><th>Employee</th><th>Total Wages</th><th>Tips for Taxes</th><th>Tips on Check</th><th>Total Payout on Check</th></tr></thead><tbody>`;
        employeeSummaryArray.forEach(empSummary => {
            const totalWeeklyWages = (typeof empSummary.totalWeeklyWages === 'number') ? empSummary.totalWeeklyWages.toFixed(2) : '0.00';
            const totalWeeklyTipsForTaxes = (typeof empSummary.totalWeeklyTipsForTaxes === 'number') ? empSummary.totalWeeklyTipsForTaxes.toFixed(2) : '0.00';
            const totalWeeklyTipsOnCheck = (typeof empSummary.totalWeeklyTipsOnCheck === 'number') ? empSummary.totalWeeklyTipsOnCheck.toFixed(2) : '0.00';
            const totalWeeklyPayoutOnCheck = (typeof empSummary.totalWeeklyPayoutOnCheck === 'number') ? empSummary.totalWeeklyPayoutOnCheck.toFixed(2) : '0.00';

            weeklyHTML += `<tr>
                <td data-label="Employee">${empSummary.employeeName}</td>
                <td data-label="Total Wages">$${totalWeeklyWages}</td>
                <td data-label="Tips for Taxes">$${totalWeeklyTipsForTaxes}</td>
                <td data-label="Tips on Check">$${totalWeeklyTipsOnCheck}</td>
                <td data-label="Total Payout"><strong>$${totalWeeklyPayoutOnCheck}</strong></td>
            </tr>`;
        });
        weeklyHTML += `</tbody></table></div>`;
    } else {
        weeklyHTML += `<p><em>No employee activity recorded for this week to summarize.</em></p>`;
    }
    weeklyHTML += `<hr style="margin: 25px 0; border-top: 2px dashed var(--border-color);">`;

    const daysOfWeekNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let hasDailyData = false;

    for (let i = 0; i < 7; i++) {
        const currDayProc = new Date(weekStartObj);
        // Add log right before the failing line
        console.log("[LOG ui.js] Loop iteration", i, "weekStartObj before getUTCDate:", weekStartObj, "Type:", typeof weekStartObj, "IsDate:", weekStartObj instanceof Date);
        currDayProc.setUTCDate(weekStartObj.getUTCDate() + i);
        const dStr = formatDate(currDayProc);
        const dayName = daysOfWeekNames[currDayProc.getUTCDay()];
        weeklyHTML += `<h4 class="report-day-header">${dayName}, ${formatDisplayDate(dStr)}</h4>`;

        const procShiftsToday = dailyShiftsByDate[dStr] || []; // Expects pre-processed shifts for the day
        procShiftsToday.sort((a, b) => sortEmployeesByName(a, b, 'employeeName'));

        if (procShiftsToday.length === 0) {
            weeklyHTML += "<p><em>No shifts logged.</em></p>";
            continue;
        }
        hasDailyData = true;

        weeklyHTML += `<div class="data-table-container" style="overflow-x:auto;"><table class="data-results-table">
            <thead><tr>
                <th>Emp</th><th>Position</th><th>Shift Time</th><th>Hrs</th><th>Wage</th><th>Sales</th><th>CC Tips</th><th>Cash Tips</th><th>Tip Out</th><th>Tip In</th><th>Tips for Taxes</th><th>Action</th>
            </tr></thead><tbody>`;
        procShiftsToday.forEach(ps => {
            weeklyHTML += `<tr>
                <td data-label="Emp" title="${ps.employeeName}">${ps.employeeName.length > 18 ? ps.employeeName.substring(0, 16) + "..." : ps.employeeName}</td>
                <td data-label="Position">${ps.positionWorked}</td>
                <td data-label="Shift Time">${formatTimeTo12Hour(ps.timeIn)}-${formatTimeTo12Hour(ps.timeOut)}</td>
                <td data-label="Hrs">${ps.hoursWorked.toFixed(2)}</td>
                <td data-label="Wage">$${ps.shiftWage.toFixed(2)}</td>
                <td data-label="Sales">${ps.positionWorked === "Server" ? `$${(ps.totalSales || 0).toFixed(2)}` : 'N/A'}</td>
                <td data-label="CC Tips">${ps.positionWorked === "Server" ? `$${(ps.ccTips || 0).toFixed(2)}` : 'N/A'}</td>
                <td data-label="Cash Tips">${ps.positionWorked === "Server" ? `$${(ps.cashTips || 0).toFixed(2)}` : 'N/A'}</td>
                <td data-label="Tip Out">${ps.positionWorked === "Server" ? `$${(ps.tipOutGiven || 0).toFixed(2)}` : 'N/A'}</td>
                <td data-label="Tip In">${ps.positionWorked !== "Server" ? `$${(ps.tipInReceived || 0).toFixed(2)}` : 'N/A'}</td>
                <td data-label="Tips for Taxes">$${(ps.tipsForTaxes || 0).toFixed(2)}</td>
                <td data-label="Action">
                    <button class="button small-action-btn edit-shift-from-weekly-btn"
                            data-shift-id="${ps.id}" data-date="${ps.date}" data-empid="${ps.employeeId}" data-positioncontext="${ps.positionWorked}" 
                            style="font-size: 0.8em; padding: 4px 6px; margin-top:0; background-color: var(--accent-black);" title="Edit this shift">
                        Edit
                    </button>
                </td>
            </tr>`;
        });
        weeklyHTML += `</tbody></table></div>`;
    }
    reportOutputContainer.innerHTML = weeklyHTML;

    // Add event listeners for edit buttons
    reportOutputContainer.querySelectorAll('.edit-shift-from-weekly-btn').forEach(btn => { // Corrected: added parentheses around btn
        btn.addEventListener('click', (event) => {
            const button = event.currentTarget;
            const shiftId = button.dataset.shiftId;
            const shiftDate = button.dataset.date;
            const employeeId = button.dataset.empid;
            const positionContext = button.dataset.positioncontext;
            if (onEditShiftCallback) {
                onEditShiftCallback(shiftId, shiftDate, employeeId, positionContext);
            }
        });
    });
    return hasDailyData; // Return whether any daily data was actually rendered for the export button logic
}

export function initializeCollapsibleSections(onSectionToggleCallback) {
    console.log("UI_LOG: Initializing collapsible sections...");
    document.querySelectorAll('.collapsible-header').forEach(header => {
        const contentId = header.getAttribute('aria-controls');
        const content = document.getElementById(contentId);
        const indicator = header.querySelector('.collapse-indicator');
        if (!content) { console.warn(`Collapsible content NOT FOUND for ID: '${contentId}'`); return; }

        // Add collapse button at the bottom if not present
        if (!content.querySelector('.collapse-bottom-btn')) {
            const collapseBtnBottom = document.createElement('button');
            collapseBtnBottom.className = 'button collapse-bottom-btn';
            collapseBtnBottom.textContent = 'Collapse Section ↑';
            collapseBtnBottom.addEventListener('click', () => header.click()); // Simulate header click
            content.appendChild(collapseBtnBottom);
        }

        // Determine initial state from localStorage or default
        let startCollapsed = localStorage.getItem(`collapsible_${contentId}_collapsed`) !== 'false';
        if (contentId === 'lineupContent') { // lineupContent defaults to open
            startCollapsed = localStorage.getItem(`collapsible_${contentId}_collapsed`) === 'true';
        }

        content.style.display = startCollapsed ? 'none' : 'block';
        if (indicator) indicator.textContent = startCollapsed ? '+' : '-';
        header.setAttribute('aria-expanded', String(!startCollapsed));

        header.addEventListener('click', (e) => {
            if (e.target.classList.contains('tutorial-btn')) return; // Ignore clicks on tutorial buttons within headers

            const isCurrentlyHidden = content.style.display === 'none';
            content.style.display = isCurrentlyHidden ? 'block' : 'none';
            if (indicator) indicator.textContent = isCurrentlyHidden ? '-' : '+';
            header.setAttribute('aria-expanded', String(isCurrentlyHidden));
            localStorage.setItem(`collapsible_${contentId}_collapsed`, String(!isCurrentlyHidden));

            if (isCurrentlyHidden && onSectionToggleCallback) {
                onSectionToggleCallback(contentId); // Notify that a section was opened
            }
        });

        header.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                header.click();
            }
        });
        if (!header.hasAttribute('tabindex')) header.setAttribute('tabindex', '0');
    });
}

export function displayImportStatus(messagesContainer, fileNameDisplay, fileName, messages) {
    if (fileNameDisplay) {
        fileNameDisplay.textContent = fileName ? `Selected: ${fileName}` : "No file chosen";
    }
    if (messagesContainer) {
        let html = '';
        if (messages.success) {
            html += `<p style="color:green;">${messages.success}</p>`;
        }
        if (messages.skipped) {
            html += `<p style="color:orange;">${messages.skipped}</p>`;
        }
        if (messages.errors && messages.errors.length > 0) {
            html += '<strong>Details:</strong><ul>';
            messages.errors.forEach(m => html += `<li>${m}</li>`);
            html += '</ul>';
        }
        messagesContainer.innerHTML = html || "<p>Processing complete.</p>";
    }
}

export function resetEmployeeForm(formWrapper, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, jobPositionsList) {
    if (nameInput) nameInput.value = '';
    if (editingIdInput) editingIdInput.value = '';
    
    renderEmpPositionsWithPayRates(positionsContainer, jobPositionsList, null); // Pass null for editingEmpData

    if (addBtn) addBtn.style.display = 'inline-block';
    if (updateBtn) updateBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'inline-block'; // Or manage visibility as needed
    if (formWrapper) formWrapper.style.display = 'none'; // Default to hidden after reset
}

export function populateEmployeeFormForEdit(formWrapper, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, employeeData, jobPositionsList) {
    if (!employeeData) return;
    if (editingIdInput) editingIdInput.value = employeeData.id;
    if (nameInput) nameInput.value = employeeData.name;

    renderEmpPositionsWithPayRates(positionsContainer, jobPositionsList, employeeData);

    if (addBtn) addBtn.style.display = 'none';
    if (updateBtn) updateBtn.style.display = 'inline-block';
    if (cancelBtn) cancelBtn.style.display = 'inline-block';
    if (formWrapper) formWrapper.style.display = 'block';
    if (nameInput) nameInput.focus();
}

export function togglePayRateInputVisibility(positionIdentifier, isVisible) {
    const payRateWrapper = document.getElementById(`payRateWrapper_${positionIdentifier}`);
    if (payRateWrapper) {
        payRateWrapper.style.display = isVisible ? 'block' : 'none';
        if (isVisible) {
            const payRateInput = payRateWrapper.querySelector('input[type="number"]');
            if (payRateInput) {
                // payRateInput.focus(); // Optional: focus when shown
            }
        }
    } else {
        console.warn(`Pay rate wrapper not found for position: ${positionIdentifier}`);
    }
}

export function toggleEmployeeFormVisibility(formWrapper, toggleButton, isEditing, employeeToEdit, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, jobPositionsList) {
    const isCurrentlyHidden = formWrapper.style.display === 'none';
    if (isCurrentlyHidden) {
        if (isEditing && employeeToEdit) {
            populateEmployeeFormForEdit(formWrapper, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, employeeToEdit, jobPositionsList);
            if (toggleButton) toggleButton.textContent = 'Hide Edit Form';
        } else {
            resetEmployeeForm(null, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, jobPositionsList); // Don't hide wrapper here
            formWrapper.style.display = 'block';
            if (toggleButton) toggleButton.textContent = 'Hide Add Employee Form';
            if (nameInput) nameInput.focus();
        }
    } else {
        formWrapper.style.display = 'none';
        if (toggleButton) toggleButton.textContent = 'Add New Jukebox Hero'; 
        // If it was an edit form that is now hidden, reset it fully
        if (editingIdInput && editingIdInput.value) {
             resetEmployeeForm(null, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, jobPositionsList);
        }
    }
}

export function switchViewToEmployeeForm(lineupSection, formSection, isEditing, empToEdit, formWrapper, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, jobPositionsList, fullRosterContainer, employeeRosterData, onEditFullRoster, onRemoveFullRoster, toggleButton) {
    if (lineupSection) lineupSection.style.display = 'none';
    if (formSection) formSection.style.display = 'block';

    if (isEditing && empToEdit) {
        populateEmployeeFormForEdit(formWrapper, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, empToEdit, jobPositionsList);
        if (toggleButton) toggleButton.textContent = 'Hide Edit Form';
    } else {
        // When switching to form view not for a specific edit (e.g. from main button), ensure form is reset but potentially visible or hidden based on toggle button state
        // The toggle button itself might control the addEmployeeFormWrapper visibility
        resetEmployeeForm(null, nameInput, positionsContainer, addBtn, updateBtn, cancelBtn, editingIdInput, jobPositionsList);
        if (formWrapper.style.display === 'block') {
             if (toggleButton) toggleButton.textContent = 'Hide Add Employee Form';
             if (nameInput) nameInput.focus();
        } else {
            if (toggleButton) toggleButton.textContent = 'Add New Jukebox Hero';
        }
    }
    renderFullEmployeeListForManagement(fullRosterContainer, employeeRosterData, onEditFullRoster, onRemoveFullRoster);
}

export function switchViewToLineup(lineupSection, formSection, lineupContentId, rosterContainer, employeeRosterData, activeDate, dailyShiftsData, jobPositions) {
    if (formSection) formSection.style.display = 'none';
    if (lineupSection) lineupSection.style.display = 'block';

    const lineupContent = document.getElementById(lineupContentId);
    if (lineupContent && lineupContent.style.display === 'none') {
        const lineupHeader = lineupContent.previousElementSibling;
        if (lineupHeader && lineupHeader.classList.contains('collapsible-header')) {
            lineupHeader.click(); // This will also trigger applyMasonry via the collapsible logic if it's set up
        } else {
            lineupContent.style.display = 'block';
            applyMasonryLayoutToRoster(rosterContainer);
        }
    } else if (lineupContent && lineupContent.style.display === 'block') {
        // If already visible, still might need to re-render roster if data changed
        renderEmployeeRoster(rosterContainer, employeeRosterData, activeDate, dailyShiftsData, jobPositions);
        applyMasonryLayoutToRoster(rosterContainer);
    }
}

export function updateDateDisplays(lineupDateElem, scoopDateElem, dateString) {
    const displayDate = formatDisplayDate(dateString);
    if (lineupDateElem) lineupDateElem.textContent = displayDate;
    if (scoopDateElem) scoopDateElem.textContent = displayDate;
}

// Tutorial UI Functions (to be filled in later, ensure they take domElements and data as params)

export function showConfirmationModal(message, onConfirm, onCancel) {
    if (domElements.confirmRemoveModal && domElements.confirmRemoveMessage && domElements.confirmRemoveBtn && domElements.cancelRemoveBtn) {
        domElements.confirmRemoveMessage.textContent = message;
        domElements.confirmRemoveModal.style.display = 'block';

        domElements.confirmRemoveBtn.onclick = () => {
            hideConfirmationModal();
            if (onConfirm) onConfirm();
        };
        domElements.cancelRemoveBtn.onclick = () => {
            hideConfirmationModal();
            if (onCancel) onCancel();
        };
    } else {
        console.error("Confirmation modal elements not found.");
        // Fallback if custom modal elements are missing
        if (confirm(message)) {
            if (onConfirm) onConfirm();
        } else {
            if (onCancel) onCancel();
        }
    }
}

export function hideConfirmationModal() {
    if (domElements.confirmRemoveModal) {
        domElements.confirmRemoveModal.style.display = 'none';
    }
    // Clean up event listeners to prevent multiple executions
    if (domElements.confirmRemoveBtn) domElements.confirmRemoveBtn.onclick = null;
    if (domElements.cancelRemoveBtn) domElements.cancelRemoveBtn.onclick = null;
}

export function showInfoModal(message, onOk) {
    if (domElements.infoModal && domElements.infoMessage && domElements.infoOkBtn) {
        domElements.infoMessage.textContent = message;
        domElements.infoModal.style.display = 'block';

        domElements.infoOkBtn.onclick = () => {
            hideInfoModal();
            if (onOk) onOk();
        };
    } else {
        console.error("Info modal elements not found. Falling back to alert.");
        alert(message); // Fallback to standard alert
        if (onOk) onOk(); // Call onOk immediately after alert dismissal
    }
}

export function hideInfoModal() {
    if (domElements.infoModal) {
        domElements.infoModal.style.display = 'none';
    }
    if (domElements.infoOkBtn) domElements.infoOkBtn.onclick = null;
}

// TUTORIAL SYSTEM UI FUNCTIONS
export function startTutorial(tutorialData, initialStepIndex, domElements) {
    // Implementation for starting the tutorial
    console.log("Tutorial started. Initial step:", initialStepIndex);
    showTutorialStep(initialStepIndex, tutorialData, domElements);
}

export function showTutorialStep(stepIndex, tutorialData, domElements) {
    // Implementation for showing a specific tutorial step
    console.log("Showing tutorial step:", stepIndex);
    const step = tutorialData.steps[stepIndex];
    if (!step) return;

    // Highlight the target element
    positionHighlightBox(step.targetElement, domElements);

    // Set the text box content and position
    const textBoxContent = step.text;
    const targetElement = domElements[step.targetElement];
    if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const highlightRect = {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
        };
        positionTextBox(highlightRect, textBoxContent, domElements);
    }

    // Update the tutorial state
    domElements.tutorialStepIndicator.textContent = `Step ${stepIndex + 1} of ${tutorialData.steps.length}`;
}

export function positionHighlightBox(targetElement, domElements) { /* ... */ }
export function positionTextBox(highlightRect, tutorialText, domElements) { /* ... */ }
export function closeTutorial(domElements) { /* ... */ }
