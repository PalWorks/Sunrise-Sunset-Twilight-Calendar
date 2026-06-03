let debounceTimer;
let currentAbortController = null;

function handleLocationEnter(e) {
    if (e.key === 'Enter') searchLocationByText();
}

function handleCoordsEnter(e) {
    if (e.key === 'Enter') searchLocationByCoords();
}

async function handleLocationInput(e) {
    const val = e.target.value.trim();
    const dropdown = document.getElementById('location-dropdown');
    if (val.length < 3) {
        dropdown.style.display = 'none';
        return;
    }
    
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        if (currentAbortController) {
            currentAbortController.abort();
        }
        currentAbortController = new AbortController();

        try {
            const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&osm_tag=place:city&osm_tag=place:town&limit=5`, {
                signal: currentAbortController.signal
            });
            const data = await res.json();
            
            if (data.features && data.features.length > 0) {
                dropdown.innerHTML = '';
                data.features.forEach(f => {
                    const p = f.properties;
                    const name = p.name;
                    const state = p.state || '';
                    const country = p.country || '';
                    let sub = state ? `${state}, ${country}` : country;
                    
                    const div = document.createElement('div');
                    div.className = 'dropdown-item';
                    div.innerHTML = `<span class="dropdown-title">${name}</span><span class="dropdown-sub">${sub}</span>`;
                    div.onclick = () => {
                        const lat = f.geometry.coordinates[1];
                        const lng = f.geometry.coordinates[0];
                        const fullLoc = state ? `${name}, ${state}, ${country}` : `${name}, ${country}`;
                        currentCity = name;
                        document.getElementById('input-location').value = fullLoc;
                        dropdown.style.display = 'none';
                        finalizeLocationUpdate(lat, lng, fullLoc);
                    };
                    dropdown.appendChild(div);
                });
                dropdown.style.display = 'block';
            } else {
                dropdown.style.display = 'none';
            }
        } catch(err) {
            if (err.name === 'AbortError') {
                console.log('[API Fetch] Aborted due to new input');
            } else {
                console.error("[API Error] Autocomplete failed:", err);
            }
        }
    }, 300);
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('location-dropdown');
    if (dropdown && !e.target.closest('.meta-item')) {
        dropdown.style.display = 'none';
    }
});

async function searchLocationByText() {
    const input = document.getElementById('input-location');
    const val = input.value;
    if (!val.trim()) return;

    input.style.opacity = '0.5';

    if (currentAbortController) {
        currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&email=contact@sunmooncal.com`, {
            signal: currentAbortController.signal
        });
        const data = await res.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            
            const addr = data[0].display_name.split(',');
            const city = addr[0].trim();
            const state = addr.length > 2 ? addr[addr.length-2].trim() : '';
            const country = addr[addr.length-1].trim();
            const fullLoc = state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;
            currentCity = city;

            await finalizeLocationUpdate(lat, lng, fullLoc);
        } else {
            alert('City not found. Please try another name.');
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            alert('Network error fetching location. Please try again.');
            console.error('[API Error] Geocoding fetch failed:', err);
        }
    } finally {
        input.style.opacity = '1';
    }
}

async function searchLocationByCoords() {
    const input = document.getElementById('input-coords');
    const val = input.value.trim();
    if (!val) return;
    
    const parsed = parseCoordinateString(val);
    if (!parsed) {
        return alert("Invalid coordinates. Supported formats:\n- 9.9252, 78.1198\n- 9.9252° N, 78.1198° E\n- 9.9252 N, 78.1198 E");
    }
    
    const { lat, lng } = parsed;
    
    input.style.opacity = '0.5';
    
    if (currentAbortController) {
        currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    await updateLocationFromCoords(lat, lng, currentAbortController.signal);
    input.style.opacity = '1';
}

function parseCoordinateString(inputString) {
    const clean = inputString.trim();
    const parts = clean.split(/[,;\/]+/).map(p => p.trim());
    
    if (parts.length < 2) {
        const spaceParts = clean.split(/\s+/);
        if (spaceParts.length >= 2) {
            let latStr = spaceParts[0];
            let startIndex = 1;
            if (['N', 'S'].includes(spaceParts[1]?.toUpperCase())) {
                latStr += spaceParts[1];
                startIndex = 2;
            }
            let lngStr = spaceParts.slice(startIndex).join("");
            return parseLatLngParts(latStr, lngStr);
        }
        return null;
    }
    
    return parseLatLngParts(parts[0], parts[1]);
}

function parseLatLngParts(latStr, lngStr) {
    function parsePart(str) {
        const cleanStr = str.replace(/[°\s]/g, '').toUpperCase();
        let val = parseFloat(cleanStr);
        if (isNaN(val)) return null;
        
        if (cleanStr.includes('S') || cleanStr.includes('W')) {
            val = -Math.abs(val);
        } else if (cleanStr.includes('N') || cleanStr.includes('E')) {
            val = Math.abs(val);
        }
        return val;
    }
    
    const lat = parsePart(latStr);
    const lng = parsePart(lngStr);
    
    if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    
    return { lat, lng };
}

async function updateLocationFromCoords(lat, lng, signal = null) {
    try {
        const fetchOpts = signal ? { signal } : {};
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&email=contact@sunmooncal.com`, fetchOpts);
        const data = await res.json();
        
        let locName = "Selected Location";
        if(data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.county || "Unknown City";
            const state = data.address.state || "";
            const country = data.address.country || "";
            locName = state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;
            currentCity = city;
        } else {
            currentCity = "Map Location";
        }

        await finalizeLocationUpdate(lat, lng, locName);
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('[API Error] Reverse geocoding failed:', err);
            alert('Could not resolve city name for coordinates. Proceeding with raw coordinates.');
            await finalizeLocationUpdate(lat, lng, "Map Location");
        }
    }
}

async function finalizeLocationUpdate(lat, lng, locName) {
    currentLat = lat;
    currentLng = lng;
    currentLocationName = locName;
    
    if (typeof L !== 'undefined') {
        const pulseIcon = L.divIcon({
            className: 'custom-pulse-icon',
            html: '<div class="pulse-ring"></div><div class="pulse-dot"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        if (typeof map !== 'undefined' && map !== null) {
            map.setView([lat, lng], 10);
            if(marker) map.removeLayer(marker);
            marker = L.marker([lat, lng], {icon: pulseIcon}).addTo(map);
        }
    }

    const actionGrid = document.getElementById('action-grid');
    if (actionGrid) actionGrid.classList.add('active');
    
    const actionStack = document.getElementById('action-stack-container');
    if (actionStack) actionStack.classList.remove('disabled');
    
    const inputLocation = document.getElementById('input-location');
    if (inputLocation) inputLocation.value = locName;
    
    const inputCoords = document.getElementById('input-coords');
    if (inputCoords) inputCoords.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    
    const tzEl = document.getElementById('meta-tz');
    const tzOffsetEl = document.getElementById('meta-tz-offset');
    tzEl.textContent = "Loading...";
    tzOffsetEl.textContent = "";
    try {
        const tzRes = await fetch(`https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lng}`);
        const tzData = await tzRes.json();
        tzEl.textContent = tzData.timeZone || "Unknown";
        
        // Save target timezone for correct visual calendar rendering
        if (tzData.timeZone) {
            targetTimezone = tzData.timeZone;
        } else {
            targetTimezone = null;
        }
        
        if (tzData.currentUtcOffset) {
            const offsetSec = tzData.currentUtcOffset.seconds;
            const sign = offsetSec >= 0 ? '+' : '-';
            const absSec = Math.abs(offsetSec);
            const hrs = Math.floor(absSec / 3600).toString().padStart(2, '0');
            const mins = Math.floor((absSec % 3600) / 60).toString().padStart(2, '0');
            tzOffsetEl.textContent = `(GMT ${sign}${hrs}${mins})`;
        }
    } catch(e) {
        console.error('[API Error] Timezone fetch failed:', e);
        tzEl.textContent = "GMT Offset";
        tzOffsetEl.textContent = "";
        targetTimezone = null;
    }

    updateDynamicUrls();

    const overlay = document.getElementById('modal-overlay');
    if (overlay && overlay.style.display === 'flex') {
        if (typeof renderCalendar === 'function') {
            renderCalendar();
        }
    }
}
