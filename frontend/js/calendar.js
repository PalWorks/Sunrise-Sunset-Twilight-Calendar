/* Visual Calendar Modal Engine */

function showVisualCalendar() {
    if (currentLat === null) return;
    openCalendarModal();
    selectedDayNum = 1; // Default select first day of month
    renderCalendar();
}

function closeVisualCalendar() {
    closeCalendarModal();
}

function updateMonthPicker() {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    document.getElementById('month-picker').value = `${year}-${month}`;
}

function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    updateMonthPicker();
    selectedDayNum = 1; // Reset to first day of new month
    renderCalendar();
}

function handleDateKey(e) {
    if (e.key === 'Enter') jumpToTextDate();
}

function jumpToTextDate() {
    const val = document.getElementById('month-picker').value.trim();
    if (!val) return updateMonthPicker();
    
    const parts = val.split('-');
    if (parts.length >= 2) {
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]);
        if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
            currentDate.setFullYear(y);
            currentDate.setMonth(m - 1);
            selectedDayNum = 1;
            renderCalendar();
            return;
        }
    }
    updateMonthPicker();
}

function formatTime(dateObj) {
    if (!dateObj) return "--:--";
    
    let options = {
        hour: '2-digit', 
        minute: '2-digit',
        hour12: !use24Hour
    };
    
    if (typeof targetTimezone !== 'undefined' && targetTimezone) {
        try {
            options.timeZone = targetTimezone;
        } catch (e) {
            console.warn("Invalid timezone string, falling back to local:", targetTimezone);
        }
    }
    
    return dateObj.toLocaleTimeString([], options);
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    document.getElementById('calendar-month-title').textContent = `${monthNames[month]} ${year}`;

    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const div = document.createElement('div');
        div.className = 'cal-header-day';
        div.textContent = day;
        grid.appendChild(div);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const div = document.createElement('div');
        div.className = 'cal-day empty';
        grid.appendChild(div);
    }

    let mobileSelectedData = null;

    for (let i = 1; i <= daysInMonth; i++) {
        // We use UTC internally to avoid local daylight savings shifting the exact 12:00 target
        // Then we get the times. Suncalc will return Dates representing absolute UTC moments.
        // We then format them with options.timeZone to display correctly for the location.
        const targetDate = new Date(year, month, i, 12, 0, 0);
        const times = SunCalc.getTimes(targetDate, currentLat, currentLng);
        
        const events = [];
        const dots = [];

        if (document.getElementById('opt-brahma').checked && times.sunrise) {
            const start = new Date(times.sunrise.getTime() - 96 * 60000);
            const end = new Date(times.sunrise.getTime() - 48 * 60000);
            const label = `Brahma M.`;
            const timeVal = `${formatTime(start)} - ${formatTime(end)}`;
            events.push({ name: label, time: timeVal, class: 'e-brahma' });
            dots.push('dot-brahma');
        }
        if (document.getElementById('opt-sunrise').checked && times.sunrise) {
            events.push({ name: 'Sunrise', time: formatTime(times.sunrise), class: 'e-sun' });
            dots.push('dot-sun');
        }
        if (document.getElementById('opt-sandhya').checked && times.sunrise) {
            const start = new Date(times.sunrise.getTime() - 24 * 60000);
            const end = new Date(times.sunrise.getTime() + 24 * 60000);
            events.push({ name: 'M. Sandhya', time: `${formatTime(start)} - ${formatTime(end)}`, class: 'e-sandhya' });
            dots.push('dot-sandhya');
        }
        if (document.getElementById('opt-noon').checked && times.solarNoon) {
            events.push({ name: 'Solar Noon', time: formatTime(times.solarNoon), class: 'e-noon' });
            dots.push('dot-noon');
        }
        if (document.getElementById('opt-sandhya').checked && times.sunset) {
            const start = new Date(times.sunset.getTime() - 24 * 60000);
            const end = new Date(times.sunset.getTime() + 24 * 60000);
            events.push({ name: 'E. Sandhya', time: `${formatTime(start)} - ${formatTime(end)}`, class: 'e-sandhya' });
            dots.push('dot-sandhya');
        }
        if (document.getElementById('opt-sunrise').checked && times.sunset) {
            events.push({ name: 'Sunset', time: formatTime(times.sunset), class: 'e-sun' });
            dots.push('dot-sun');
        }
        if (document.getElementById('opt-civil').checked) {
            if (times.dawn) {
                events.push({ name: 'Civil Dawn', time: formatTime(times.dawn), class: 'e-twilight' });
                dots.push('dot-twilight');
            }
            if (times.dusk) {
                events.push({ name: 'Civil Dusk', time: formatTime(times.dusk), class: 'e-twilight' });
                dots.push('dot-twilight');
            }
        }
        if (document.getElementById('opt-nautical').checked) {
            if (times.nauticalDawn) {
                events.push({ name: 'Naut. Dawn', time: formatTime(times.nauticalDawn), class: 'e-twilight' });
                dots.push('dot-twilight');
            }
            if (times.nauticalDusk) {
                events.push({ name: 'Naut. Dusk', time: formatTime(times.nauticalDusk), class: 'e-twilight' });
                dots.push('dot-twilight');
            }
        }
        if (document.getElementById('opt-astronomical').checked) {
            if (times.nightEnd) {
                events.push({ name: 'Astro Dawn', time: formatTime(times.nightEnd), class: 'e-twilight' });
                dots.push('dot-twilight');
            }
            if (times.night) {
                events.push({ name: 'Astro Dusk', time: formatTime(times.night), class: 'e-twilight' });
                dots.push('dot-twilight');
            }
        }

        if (i === selectedDayNum) {
            mobileSelectedData = { day: i, date: targetDate, events: events };
        }

        const div = document.createElement('div');
        div.className = `cal-day ${i === selectedDayNum ? 'selected' : ''}`;
        div.onclick = () => {
            selectedDayNum = i;
            document.querySelectorAll('.cal-day').forEach(el => el.classList.remove('selected'));
            div.classList.add('selected');
            updateMobileDetailDrawer(i, targetDate, events);
        };

        let dotsHtml = '';
        if (dots.length > 0) {
            dotsHtml = `<div class="day-dots">` + dots.map(d => `<span class="dot ${d}"></span>`).join('') + `</div>`;
        }

        let eventsHtml = events.map(e => `
            <div class="day-event ${e.class}">
                <span>${e.name}</span>
                <span>${e.time}</span>
            </div>
        `).join('');

        div.innerHTML = `
            <div class="day-number">${i}</div>
            ${dotsHtml}
            ${eventsHtml}
        `;
        grid.appendChild(div);
    }

    const totalCells = firstDay + daysInMonth;
    const remaining = 42 - totalCells;
    for(let i=0; i<remaining; i++) {
        const div = document.createElement('div');
        div.className = 'cal-day empty';
        grid.appendChild(div);
    }

    if (mobileSelectedData) {
        updateMobileDetailDrawer(mobileSelectedData.day, mobileSelectedData.date, mobileSelectedData.events);
    }
}

function updateMobileDetailDrawer(dayNum, dateObj, events) {
    const container = document.getElementById('mobile-detail-card');
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = `
            <div class="mobile-detail-title">Day ${dayNum} Details (${dateObj.toLocaleDateString()})</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">No timings enabled. Please check options in main menu.</div>
        `;
        return;
    }

    const dateStr = dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    let itemsHtml = events.map(e => `
        <div class="mobile-detail-item">
            <span>${e.name}</span>
            <span>${e.time}</span>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="mobile-detail-title" style="display: flex; justify-content: space-between;">
            <span>Day ${dayNum} timings</span>
            <span style="font-weight: 500; color: var(--text-muted);">${dateStr}</span>
        </div>
        <div class="mobile-detail-grid">
            ${itemsHtml}
        </div>
    `;
}
