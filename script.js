
// script.js
let map = L.map('map').setView([40.4168, -3.7038], 12); // Default Madrid
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let markersLayer = L.layerGroup().addTo(map);
let searchCircle;

function fetchNestoria(lat, lng, radiusKm) {
    const url = `https://api.nestoria.es/api?action=search_listings&encoding=json&listing_type=buy&country=es&centre_point=${lat},${lng}&radius=${radiusKm}&number_of_results=50&page=1`;
    
    fetch(url)
        .then(res => res.json())
        .then(data => {
            markersLayer.clearLayers();
            if (searchCircle) searchCircle.remove();

            searchCircle = L.circle([lat, lng], {
                radius: radiusKm * 1000,
                color: 'blue',
                fillColor: '#3f51b5',
                fillOpacity: 0.2
            }).addTo(map);

            if (data.response && data.response.listings) {
                data.response.listings.forEach(listing => {
                    if (listing.latitude && listing.longitude) {
                        const popupContent = `
                            <b>${listing.title}</b><br>
                            ${listing.price_formatted || ''}<br>
                            ${listing.bedroom_number || '?'} bedrooms<br>
                            <img src="${listing.img_url}" alt="Property" style="width:150px;">
                        `;
                        L.marker([listing.latitude, listing.longitude])
                            .bindPopup(popupContent)
                            .addTo(markersLayer);
                    }
                });
            }
        })
        .catch(err => console.error('Nestoria fetch error:', err));
}

// 📍 User clicks on the map to set location
map.on('click', function(e) {
    const lat = e.latlng.lat.toFixed(5);
    const lng = e.latlng.lng.toFixed(5);
    const radiusKm = document.getElementById('radiusInput').value;
    fetchNestoria(lat, lng, radiusKm);
});

// 📍 Use current location
document.getElementById('locateBtn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            map.setView([lat, lng], 12);
            const radiusKm = document.getElementById('radiusInput').value;
            fetchNestoria(lat, lng, radiusKm);
        });
    }
});

// 📍 Radius slider changes
document.getElementById('radiusInput').addEventListener('input', function() {
    document.getElementById('radiusValue').innerText = this.value + ' km';
});
