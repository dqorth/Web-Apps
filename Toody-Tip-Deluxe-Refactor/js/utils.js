// Utility functions

export const formatDate = (dObj) => {
    if (!(dObj instanceof Date) || isNaN(dObj.getTime())) {
        console.warn("formatDate received invalid Date object:", dObj);
        return 'Invalid Date';
    }
    return dObj.toISOString().split('T')[0];
};

export const formatDisplayDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return "N/A"; // Added typeof check
    // Ensure the date string is treated as UTC by appending Z if it doesn't have time/zone info
    const dObj = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00Z');
    if (isNaN(dObj.getTime())) {
        console.warn("formatDisplayDate received invalid date string:", dateStr);
        return "Invalid Date";
    }
    return dObj.toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric', timeZone: 'UTC' });
};

export const timeToMinutes = (tStr) => {
    if (!tStr || typeof tStr !== 'string' || !tStr.includes(':')) return 0;
    const parts = tStr.split(':');
    if (parts.length !== 2) return 0;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return 0;
    return h * 60 + m;
};

export const calculateHoursWorked = (tiStr, toStr) => {
    if (!tiStr || !toStr) return 0;
    const mi = timeToMinutes(tiStr);
    const mo = timeToMinutes(toStr);
    // Handles overnight shifts if mo < mi by assuming it's the next day, but current app logic doesn't support this directly.
    // For this app, clock out must be after clock in on the same day.
    if (mo <= mi) return 0; 
    return (mo - mi) / 60;
};

export const roundToNearest15Minutes = (tStr) => {
    if (!tStr || typeof tStr !== 'string' || !tStr.includes(':')) return tStr;
    const parts = tStr.split(':');
    if (parts.length !== 2) return tStr;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return tStr;

    let tm = h * 60 + m;
    let rtm = Math.round(tm / 15) * 15;
    let rh = Math.floor(rtm / 60);
    let rmin = rtm % 60;

    // Handle cases where rounding pushes to the next day (e.g., 23:53 rounds to 24:00)
    // For tip calculations, this might mean 00:00 of the next day, but usually, it's capped at 23:45 or handled by context.
    // The original app capped hours at 24, so we'll keep it consistent.
    if (rh >= 24) rh = rh % 24; 

    return `${String(rh).padStart(2, '0')}:${String(rmin).padStart(2, '0')}`;
};

export const formatTimeTo12Hour = (timeString24) => {
    if (!timeString24 || typeof timeString24 !== 'string' || !timeString24.includes(':')) {
        return timeString24 || "N/A";
    }
    let [hours, minutesStr] = timeString24.split(':');
    let hoursNum = parseInt(hours, 10);
    if (isNaN(hoursNum) || isNaN(parseInt(minutesStr, 10))) return timeString24; // Invalid format

    const ampm = hoursNum >= 12 ? 'PM' : 'AM';
    hoursNum = hoursNum % 12;
    hoursNum = hoursNum ? hoursNum : 12; // the hour '0' should be '12'
    const paddedHours = String(hoursNum).padStart(2, '0'); // Pad with 0 if single digit, though not typical for 12hr format display
    // const finalHours = String(hoursNum); // More typical for 12hr
    return `${hoursNum}:${minutesStr} ${ampm}`; // Original used padded hours, then unpadded. Let's stick to unpadded for 12hr part.
};

export const roundToNearestHalfDollar = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return 0;
    return Math.round(amount * 2) / 2;
};

export const getMondayOfWeek = (dateObj) => {
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        console.warn("getMondayOfWeek received invalid Date object:", dateObj);
        return new Date(NaN); // Return an invalid date object
    }
    const d = new Date(dateObj.getTime());
    d.setUTCHours(0, 0, 0, 0);
    const day = d.getUTCDay(); // Sunday - 0, Monday - 1, ...
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setUTCDate(diff));
};

export const getSortableNameParts = (name) => {
    if (!name || typeof name !== 'string') return { lastName: '', firstName: '' };
    const parts = name.trim().split(/\s+/).filter(p => p); // Filter out empty strings from multiple spaces
    if (parts.length === 0) return { lastName: '', firstName: '' };
    if (parts.length > 1) {
        const lastName = parts.pop(); // Assume last part is the last name
        return { lastName: lastName, firstName: parts.join(' ') };
    }
    return { lastName: parts[0], firstName: '' }; // Only one part, treat as last name
};

export const sortEmployeesByName = (empA, empB_or_NameB, nameProperty = 'employeeName') => {
    const nameA_Str = (typeof empA === 'string') ? empA : empA[nameProperty];
    const nameB_Str = (typeof empB_or_NameB === 'string') ? empB_or_NameB : empB_or_NameB[nameProperty];

    const nameA_Parts = getSortableNameParts(nameA_Str);
    const nameB_Parts = getSortableNameParts(nameB_Str);

    const lastNameComparison = nameA_Parts.lastName.toLowerCase().localeCompare(nameB_Parts.lastName.toLowerCase());
    if (lastNameComparison !== 0) {
        return lastNameComparison;
    }
    // If last names are the same, compare by first name
    return nameA_Parts.firstName.toLowerCase().localeCompare(nameB_Parts.firstName.toLowerCase());
};

// This function was also in calculations.js, ensure it's consistent or solely here.
export const calculateOverlapDurationMinutes = (serverShift, supportShift) => {
    if (!serverShift || !supportShift || !serverShift.timeIn || !serverShift.timeOut || !supportShift.timeIn || !supportShift.timeOut) {
        return 0;
    }
    const sStart = timeToMinutes(serverShift.timeIn);
    const sEnd = timeToMinutes(serverShift.timeOut);
    const supStart = timeToMinutes(supportShift.timeIn);
    const supEnd = timeToMinutes(supportShift.timeOut);

    // Ensure end times are after start times for valid calculation
    if (sEnd <= sStart || supEnd <= supStart) return 0;

    const overlapStart = Math.max(sStart, supStart);
    const overlapEnd = Math.min(sEnd, supEnd);

    return Math.max(0, overlapEnd - overlapStart);
};

export const getWeekInfoForDate = (dateString, baseCycleDate) => {
    if (!dateString) return { weekInCycle: "N/A", weekStartDate: null, cycleStart: null };
    // Ensure dateString is treated as UTC by appending 'T00:00:00Z' if it's just a date
    const selectedDate = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z');
    if (isNaN(selectedDate.getTime())) return { weekInCycle: "Invalid Date", weekStartDate: null, cycleStart: null };

    if (!(baseCycleDate instanceof Date) || isNaN(baseCycleDate.getTime())) {
        console.warn("getWeekInfoForDate received invalid baseCycleDate:", baseCycleDate);
        return { weekInCycle: "Error", weekStartDate: null, cycleStart: null };
    }

    const baseMonday = getMondayOfWeek(baseCycleDate);
    const selectedMonday = getMondayOfWeek(selectedDate);

    const diffTimeMillis = selectedMonday.getTime() - baseMonday.getTime();
    // Ensure we are not calculating for dates before the base cycle start for weekInCycle
    if (diffTimeMillis < 0) {
        // It's before the base cycle, so weekInCycle is not applicable in the same way
        // Or, decide how to handle this case based on app requirements.
        // For now, let's return N/A for weekInCycle if it's before the base.
        // The cycleStart might still be calculable if we allow negative cycle numbers.
        // However, the original app implies cycles start from BASE_CYCLE_START_DATE onwards.
        
        // To find the "cycle start" for a date *before* the base, we'd go backwards.
        let tempCycleStart = new Date(baseMonday);
        while (tempCycleStart.getTime() > selectedMonday.getTime()) {
            tempCycleStart.setUTCDate(tempCycleStart.getUTCDate() - 28); // Go back 4 weeks
        }
        // At this point, tempCycleStart is the start of a 4-week cycle that contains or is before selectedMonday.
        // If selectedMonday is *in* this cycle, then weekInCycle can be calculated relative to tempCycleStart.
        const diffForWeekCalc = selectedMonday.getTime() - tempCycleStart.getTime();
        const weekInThisCycle = Math.floor(diffForWeekCalc / (1000 * 60 * 60 * 24 * 7)) + 1;

        return {
            weekInCycle: (weekInThisCycle >=1 && weekInThisCycle <=4) ? weekInThisCycle : "N/A",
            weekStartDate: formatDate(selectedMonday), // Monday of the selected date's week
            cycleStart: formatDate(tempCycleStart) // Start of the 4-week cycle it falls into
        };
    }

    const diffWeeksTotal = Math.floor(diffTimeMillis / (1000 * 60 * 60 * 24 * 7));

    const cycleNumber = Math.floor(diffWeeksTotal / 4); // 0-indexed cycle number from base
    const weekInCycle = (diffWeeksTotal % 4) + 1; // 1-indexed week in its cycle

    const cycleStartMonday = new Date(baseMonday);
    cycleStartMonday.setUTCDate(baseMonday.getUTCDate() + cycleNumber * 4 * 7);

    return {
        weekInCycle: weekInCycle,
        weekStartDate: formatDate(selectedMonday),
        cycleStart: formatDate(cycleStartMonday)
    };
};

export function findCycleAndWeekForDatePrecise(targetDate, baseCycleStartDate) {
    if (!(targetDate instanceof Date) || isNaN(targetDate.getTime())) {
        console.warn("findCycleAndWeekForDatePrecise received invalid targetDate:", targetDate);
        return { cycleStart: null, weekNum: "N/A" };
    }
    if (!(baseCycleStartDate instanceof Date) || isNaN(baseCycleStartDate.getTime())) {
        console.warn("findCycleAndWeekForDatePrecise received invalid baseCycleStartDate:", baseCycleStartDate);
        return { cycleStart: null, weekNum: "N/A" };
    }

    const baseMonday = getMondayOfWeek(baseCycleStartDate);
    const targetMonday = getMondayOfWeek(targetDate);

    const diffTimeMillis = targetMonday.getTime() - baseMonday.getTime();

    // If targetMonday is before baseMonday
    if (diffTimeMillis < 0) {
        // Calculate how many full 28-day cycles to go back
        const cyclesToGoBack = Math.ceil(Math.abs(diffTimeMillis) / (1000 * 60 * 60 * 24 * 28));
        const cycleStartOffsetDays = cyclesToGoBack * -28;
        
        const cycleStartDate = new Date(baseMonday);
        cycleStartDate.setUTCDate(baseMonday.getUTCDate() + cycleStartOffsetDays);
        
        // Days from this earlier cycle's start to the targetMonday
        const daysIntoThisCycle = Math.round((targetMonday.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekInCycle = Math.floor(daysIntoThisCycle / 7) + 1;
        
        return { cycleStart: formatDate(cycleStartDate), weekNum: weekInCycle };
    }

    // If targetMonday is at or after baseMonday
    const diffDays = Math.round(diffTimeMillis / (1000 * 60 * 60 * 24));
    const diffCycles = Math.floor(diffDays / 28);
    const cycleStartOffsetDays = diffCycles * 28;
    const cycleStartDate = new Date(baseMonday);
    cycleStartDate.setUTCDate(baseMonday.getUTCDate() + cycleStartOffsetDays);
    const daysIntoCurrentCycle = diffDays - cycleStartOffsetDays;
    const weekInCycle = Math.floor(daysIntoCurrentCycle / 7) + 1;

    return { cycleStart: formatDate(cycleStartDate), weekNum: weekInCycle };
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
