/* Core Application State & Initialization */

let currentLat = null;
let currentLng = null;
let currentCity = "";
let currentLocationName = "";
let targetTimezone = null;
let currentDate = new Date();
let deferredPrompt; // PWA Install Prompt
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
    
    // Check if running as a Chrome Extension
    const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    if (isExtension) {
        // Find the dynamic sync card (it's the one before the visual calendar card, wait, it has an id? No, it's the second card in action-grid)
        const cards = document.querySelectorAll('#action-grid .card');
        if (cards.length >= 2) {
            cards[1].innerHTML = `
                <div class="card-header-row">
                    <h2>Live Background Sync</h2>
                    <span class="tag tag-dynamic" style="background: var(--bg-tertiary); color: var(--text-main); border: 1px solid var(--border-color);">Chrome Extension</span>
                </div>
                <p>Silently update your Google Calendar in the background whenever you travel. 100% private. No data sent to our servers.</p>
                <button class="btn-action" onclick="enableExtensionSync()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-3.32 3.32"/></svg>
                    Enable Auto-Sync
                </button>
            `;
        }
        const extPromo = document.querySelector('.card-extension');
        if (extPromo) extPromo.style.display = 'none';
    }
}

function enableExtensionSync() {
    alert("In a full implementation, this would trigger chrome.identity.getAuthToken to authenticate with Google Calendar.");
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
    const workerUrl = `https://api.sunmooncal.com/sync.ics?lat=${currentLat.toFixed(6)}&lng=${currentLng.toFixed(6)}&options=${optionsStr}`;
    const webcalUrl = workerUrl.replace('https://', 'webcal://').replace('http://', 'webcal://');
    
    // Apple Calendar prefers webcal:// protocol to trigger the native app
    document.getElementById('btn-apple-cal').href = webcalUrl;
    
    // Google Calendar prefers a standard HTTPS URL for the cid parameter
    const googleCalUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(workerUrl)}`;
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

// PWA Install Prompt Handling
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('btn-install-pwa');
    const installCard = document.getElementById('card-pwa');
    const installBtnCard = document.getElementById('btn-install-pwa-card');
    
    const showInstallPrompt = async (clickEvent) => {
        if (clickEvent) clickEvent.preventDefault();
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        } else {
            alert("To install the app, click the install icon in your browser's address bar.");
        }
    };

    if (installBtn) {
        installBtn.style.display = 'inline-block';
        installBtn.addEventListener('click', showInstallPrompt);
    }
    if (installBtnCard) {
        if (installCard) installCard.style.display = 'block';
        installBtnCard.addEventListener('click', showInstallPrompt);
    }
});

// Also attach a fallback directly in case beforeinstallprompt hasn't fired yet
document.addEventListener('DOMContentLoaded', () => {
    const fallbackBtn = document.getElementById('btn-install-pwa-card');
    if (fallbackBtn) {
        fallbackBtn.addEventListener('click', (e) => {
            if (!deferredPrompt) {
                e.preventDefault();
                alert("If the install prompt doesn't appear, you can install the app by clicking the install icon in your browser's address bar (near the bookmark star).");
            }
        });
    }
});

// Detect iOS for manual PWA install tooltip
const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
};
const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

if (isIos() && !isInStandaloneMode()) {
    const installBtn = document.getElementById('btn-install-pwa');
    const installCard = document.getElementById('card-pwa');
    const installBtnCard = document.getElementById('btn-install-pwa-card');
    const installMsg = document.getElementById('pwa-install-msg');
    
    const iosInstallAlert = () => {
        alert("To install the app on iOS: tap the 'Share' icon at the bottom of Safari, then scroll down and tap 'Add to Home Screen'.");
    };

    if (installBtn) {
        installBtn.style.display = 'inline-block';
        installBtn.textContent = "Install (iOS)";
        installBtn.addEventListener('click', iosInstallAlert);
    }
    
    if (installBtnCard) {
        installBtnCard.addEventListener('click', (e) => {
            e.preventDefault();
            iosInstallAlert();
        });
    }
}
