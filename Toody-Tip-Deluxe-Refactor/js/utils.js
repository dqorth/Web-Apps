// Utility functions
export const TARGET_TIMEZONE_IANA = 'America/Denver';

export const formatDate = (dObj) => {
    if (!(dObj instanceof Date) || isNaN(dObj.getTime())) {
        console.warn("formatDate received invalid Date object:", dObj);
        return 'Invalid Date';
    }
    // Format to YYYY-MM-DD in the target timezone
    const year = dObj.toLocaleDateString('en-US', { year: 'numeric', timeZone: TARGET_TIMEZONE_IANA });
    const month = dObj.toLocaleDateString('en-US', { month: '2-digit', timeZone: TARGET_TIMEZONE_IANA });
    const day = dObj.toLocaleDateString('en-US', { day: '2-digit', timeZone: TARGET_TIMEZONE_IANA });
    return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return "N/A";
    // Assuming dateStr is YYYY-MM-DD and represents a date in the target timezone.
    // To correctly parse and display it for that timezone, we construct a Date object.
    // new Date(YYYY, MM-1, DD) is safer for local timezone interpretation.
    const parts = dateStr.split('-');
    if (parts.length !== 3) return "Invalid Date";
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    
    const dObj = new Date(year, month, day);

    if (isNaN(dObj.getTime())) {
        console.warn("formatDisplayDate received invalid date string:", dateStr);
        return "Invalid Date";
    }
    return dObj.toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric', timeZone: TARGET_TIMEZONE_IANA });
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
    // Create a new Date object that represents the date in the target timezone
    // This is tricky because JS Date objects are fundamentally UTC-based with a local (system) timezone offset.
    // For consistency, we should work with date components as perceived in the target timezone.
    
    // Get date parts in target timezone
    const yearStr = dateObj.toLocaleDateString('en-US', { year: 'numeric', timeZone: TARGET_TIMEZONE_IANA });
    const monthStr = dateObj.toLocaleDateString('en-US', { month: '2-digit', timeZone: TARGET_TIMEZONE_IANA });
    const dayStr = dateObj.toLocaleDateString('en-US', { day: '2-digit', timeZone: TARGET_TIMEZONE_IANA });

    // Create a new Date object from these parts. This will be interpreted in the system's local timezone.
    // If the system timezone is MDT, this is fine. If not, this date needs to be treated carefully.
    // For calculations like getDay(), it should reflect the day as it is in MDT.
    const mdtDate = new Date(`${yearStr}-${monthStr}-${dayStr}T00:00:00`); // Use local time interpretation

    const d = new Date(mdtDate.getTime()); // Clone for manipulation
    d.setHours(0, 0, 0, 0); // Normalize to start of day in local time (intended to be MDT)
    
    const dayOfWeekInMDT = d.getDay(); // Sunday - 0, Monday - 1, ... (in local time)
    const diff = d.getDate() - dayOfWeekInMDT + (dayOfWeekInMDT === 0 ? -6 : 1); // Adjust when day is Sunday
    
    // Create the result date by setting the day component on a date that is already effectively in MDT midnight
    const mondayObj = new Date(d.getFullYear(), d.getMonth(), diff);
    return mondayObj;
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

    // Parse dateString (YYYY-MM-DD) as a date in the target timezone (MDT)
    const parts = dateString.split('-');
    if (parts.length !== 3) return { weekInCycle: "Invalid Date", weekStartDate: null, cycleStart: null };
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    const selectedDate = new Date(year, month, day); // Interpreted as local time (MDT)
    selectedDate.setHours(0,0,0,0);

    if (isNaN(selectedDate.getTime())) return { weekInCycle: "Invalid Date", weekStartDate: null, cycleStart: null };

    if (!(baseCycleDate instanceof Date) || isNaN(baseCycleDate.getTime())) {
        console.warn("getWeekInfoForDate received invalid baseCycleDate:", baseCycleDate);
        return { weekInCycle: "Error", weekStartDate: null, cycleStart: null };
    }

    // Assuming baseCycleDate is a UTC instant, convert it to an MDT-midnight-equivalent Date object for consistent comparison
    // This is complex. A simpler approach is to ensure baseCycleDate itself is already an MDT midnight.
    // For now, let's assume baseCycleDate is an absolute UTC point, and we find its corresponding MDT Monday.
    const baseMonday = getMondayOfWeek(baseCycleDate); // This will give Monday in MDT
    const selectedMonday = getMondayOfWeek(selectedDate); // This will give Monday in MDT

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

    // Ensure both dates are treated as MDT midnight for calculations
    const baseMonday = getMondayOfWeek(baseCycleStartDate); // MDT Monday
    const targetMonday = getMondayOfWeek(targetDate);     // MDT Monday

    const diffTimeMillis = targetMonday.getTime() - baseMonday.getTime();

    // If targetMonday is before baseMonday
    if (diffTimeMillis < 0) {
        // Calculate how many full 28-day cycles to go back
        const cyclesToGoBack = Math.ceil(Math.abs(diffTimeMillis) / (1000 * 60 * 60 * 24 * 28));
        
        const cycleStartDate = new Date(baseMonday);
        // Adjusting date by days; setDate handles month/year rollovers
        cycleStartDate.setDate(baseMonday.getDate() - (cyclesToGoBack * 28));
        
        // Days from this earlier cycle's start to the targetMonday
        const daysIntoThisCycle = Math.round((targetMonday.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekInCycle = Math.floor(daysIntoThisCycle / 7) + 1;
        
        return { cycleStart: formatDate(cycleStartDate), weekNum: weekInCycle };
    }

    // If targetMonday is at or after baseMonday
    const diffDays = Math.round(diffTimeMillis / (1000 * 60 * 60 * 24));
    const diffCycles = Math.floor(diffDays / 28);
    
    const cycleStartDate = new Date(baseMonday);
    // Adjusting date by days
    cycleStartDate.setDate(baseMonday.getDate() + (diffCycles * 28));
    
    const daysIntoCurrentCycle = diffDays - (diffCycles * 28);
    const weekInCycle = Math.floor(daysIntoCurrentCycle / 7) + 1;

    return { cycleStart: formatDate(cycleStartDate), weekNum: weekInCycle };
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export const getDayOfWeekMDT = (dateObj) => {
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        console.warn("getDayOfWeekMDT received invalid Date object:", dateObj);
        // Return a value that might indicate an error, e.g., -1, or handle as per application needs
        return -1; // Or throw an error
    }
    // Get the day of the week as a string (e.g., "Sun", "Mon") in MDT
    const dayStringMDT = dateObj.toLocaleDateString('en-US', { weekday: 'short', timeZone: TARGET_TIMEZONE_IANA });
    const dayMap = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
    return dayMap[dayStringMDT];
};

export const parseDateToMDT = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
        console.warn("parseDateToMDT received invalid dateString:", dateString);
        return new Date(NaN); // Return an invalid date object
    }
    // Assuming dateString is YYYY-MM-DD
    const parts = dateString.split('-');
    if (parts.length !== 3) {
        console.warn("parseDateToMDT: Invalid date string format:", dateString);
        return new Date(NaN);
    }
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.warn("parseDateToMDT: Invalid date components after parsing:", dateString);
        return new Date(NaN);
    }
    // Create a Date object. JavaScript's Date constructor, when given year, month, day,
    // interprets them in the local timezone of the system where the code is running.
    // Since our application logic is standardized on MDT, we assume this system
    // (or the interpretation context) should align with MDT for these date parts.
    // This effectively creates a Date object representing midnight on that date *in MDT*.
    return new Date(year, month, day, 0, 0, 0);
};

export const addDaysToDate = (dateObj, daysToAdd) => {
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        console.warn("addDaysToDate received invalid Date object:", dateObj);
        return new Date(NaN); // Return an invalid date object
    }
    if (typeof daysToAdd !== 'number' || isNaN(daysToAdd)) {
        console.warn("addDaysToDate received invalid daysToAdd:", daysToAdd);
        return new Date(dateObj); // Return a copy of the original date
    }
    const newDate = new Date(dateObj.getTime()); // Clone the date object
    newDate.setDate(dateObj.getDate() + daysToAdd);
    return newDate;
};
