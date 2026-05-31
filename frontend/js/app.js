/* Core Application State & Initialization */

let currentLat = null;
let currentLng = null;
let currentCity = "";
let currentLocationName = "";
let targetTimezone = null;
let currentDate = new Date();
let use24Hour = true;
let selectedDayNum = 1;
let showDetailedTimings = false;

function initDefaults() {
    // Populate month picker defaults
    updateMonthPicker();
    
    // Add event listeners for dynamic url updates when options change
    document.querySelectorAll('.opt-group input').forEach(el => {
        el.addEventListener('change', () => {
            updateDynamicUrls();
            if (document.getElementById('modal-overlay').style.display === 'flex') {
                renderCalendar();
            }
        });
    });
}

function getLocation() {
    if (navigator.geolocation) {
        document.getElementById('input-location').value = "Locating...";
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                await updateLocationFromCoords(lat, lng);
            },
            (err) => {
                console.error(err);
                alert("Location access denied or unavailable.");
                document.getElementById('input-location').value = "";
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function toggleTimeFormat() {
    use24Hour = !use24Hour;
    document.getElementById('btn-time-format').textContent = use24Hour ? "24 Hr" : "12 Hr";
    if (document.getElementById('modal-overlay').style.display === 'flex') {
        renderCalendar();
    }
}

function updateDynamicUrls() {
    if (currentLat === null || currentLng === null) return;
    
    const opts = [];
    if (document.getElementById('opt-brahma').checked) opts.push('brahma');
    if (document.getElementById('opt-sunrise').checked) opts.push('sun');
    if (document.getElementById('opt-sandhya').checked) opts.push('sandhya');
    if (document.getElementById('opt-noon').checked) opts.push('noon');
    if (document.getElementById('opt-civil').checked) opts.push('civil');
    if (document.getElementById('opt-nautical').checked) opts.push('nautical');
    if (document.getElementById('opt-astronomical').checked) opts.push('astronomical');
    if (document.getElementById('opt-moon-phases').checked) opts.push('moon_phases');
    if (document.getElementById('opt-moon-times').checked) opts.push('moon_times');
    
    const optionsStr = opts.join(',');
    const workerUrl = `https://api.yogasadhanacalendar.com/sync?lat=${currentLat.toFixed(6)}&lng=${currentLng.toFixed(6)}&options=${optionsStr}`;
    const webcalUrl = workerUrl.replace('https://', 'webcal://').replace('http://', 'webcal://');
    const googleCalUrl = `https://www.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl)}`;
    
    document.getElementById('btn-apple-cal').href = webcalUrl;
    document.getElementById('btn-google-cal').href = googleCalUrl;
    document.getElementById('manual-sync-url').value = workerUrl;
}

function subscribeDynamic(e) {
    if (e) e.preventDefault();
    if (currentLat === null || currentLng === null) return;
    
    updateDynamicUrls();
    
    const drawer = document.getElementById('dynamic-sync-drawer');
    if (drawer.style.display === 'none' || !drawer.style.display) {
        drawer.style.display = 'flex';
    } else {
        drawer.style.display = 'none';
    }
}

function copySyncUrl() {
    const input = document.getElementById('manual-sync-url');
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value).then(() => {
        const btn = document.getElementById('copy-sync-btn');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-tertiary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => {
            btn.innerHTML = originalHtml;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

document.addEventListener('DOMContentLoaded', initDefaults);
