/* Leaflet Map Initialization & Handlers */

let map;
let marker;

function initMap() {
    map = L.map('map-wrapper').setView([20, 0], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
    }).addTo(map);

    // Custom Locate Me Button
    const LocateControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function () {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control custom-locate-control');
            container.innerHTML = `<a href="#" title="Locate Me" role="button" aria-label="Locate Me" style="display:flex; justify-content:center; align-items:center;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
            </a>`;
            container.onclick = function(e){
                e.preventDefault();
                e.stopPropagation();
                if(typeof getLocation === 'function') getLocation();
            };
            return container;
        }
    });
    map.addControl(new LocateControl());

    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        document.getElementById('input-coords').value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        // Set input location value to visually indicate it was a map click, 
        // since we do a reverse lookup inside updateLocationFromCoords (called via searchLocationByCoords).
        document.getElementById('input-location').value = `Map Location`;
        
        // We can just call updateLocationFromCoords directly here instead of mimicking an input event
        updateLocationFromCoords(lat, lng);
    });
}

// Initialize map when DOM is loaded, if Leaflet is ready
document.addEventListener('DOMContentLoaded', initMap);
