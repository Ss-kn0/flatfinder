let map = L.map('map').setView([41.387, 2.17], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let listings = [];
let markers = [];
let centerMarker = null;
let centerCircle = null;
let centerLat = 41.387;
let centerLng = 2.17;

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

async function loadData() {
  const res = await fetch('data/listings.json');
  listings = await res.json();
  render();
}

function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

function render() {
  const minPrice = parseInt(document.getElementById('minPrice').value || '0', 10);
  const maxPrice = parseInt(document.getElementById('maxPrice').value || '9999999', 10);
  const bedrooms = parseInt(document.getElementById('bedrooms').value || '0', 10);
  const radius = parseFloat(document.getElementById('radiusKm').value || '20');

  if (centerCircle) {
    centerCircle.setRadius(radius * 1000);
  }

  const filtered = listings.filter(l => {
    const inPrice = l.price >= minPrice && l.price <= maxPrice;
    const inBeds = (l.bedrooms || 0) >= bedrooms;
    const dist = haversine(centerLat, centerLng, l.lat, l.lng);
    return inPrice && inBeds && dist <= radius;
  });

  clearMarkers();
  const listEl = document.getElementById('list');
  listEl.innerHTML = '';

  filtered.forEach(l => {
    const marker = L.marker([l.lat, l.lng]).addTo(map);
    marker.bindPopup(`<b>${l.title}</b><br>${l.price} € · ${l.bedrooms} bd`);
    markers.push(marker);

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h4>${l.title}</h4><p>${l.price} € — ${l.bedrooms} bd</p>`;
    listEl.appendChild(card);
  });
}

document.getElementById('radiusKm').addEventListener('input', e => {
  document.getElementById('radiusLabel').textContent = e.target.value;
  render();
});
document.getElementById('minPrice').addEventListener('input', render);
document.getElementById('maxPrice').addEventListener('input', render);
document.getElementById('bedrooms').addEventListener('change', render);

document.getElementById('setCenter').addEventListener('click', () => {
  map.once('click', e => {
    centerLat = e.latlng.lat;
    centerLng = e.latlng.lng;
    if (centerMarker) map.removeLayer(centerMarker);
    centerMarker = L.marker([centerLat, centerLng], { draggable: true }).addTo(map);
    centerMarker.on('dragend', ev => {
      centerLat = ev.target.getLatLng().lat;
      centerLng = ev.target.getLatLng().lng;
      if (centerCircle) centerCircle.setLatLng([centerLat, centerLng]);
      render();
    });
    if (centerCircle) map.removeLayer(centerCircle);
    centerCircle = L.circle([centerLat, centerLng], { radius: parseFloat(document.getElementById('radiusKm').value)*1000 }).addTo(map);
    render();
  });
  alert('Click on the map to set the search center.');
});

document.getElementById('useLocation').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      centerLat = pos.coords.latitude;
      centerLng = pos.coords.longitude;
      map.setView([centerLat, centerLng], 13);
      if (centerMarker) map.removeLayer(centerMarker);
      centerMarker = L.marker([centerLat, centerLng], { draggable: true }).addTo(map);
      centerMarker.on('dragend', ev => {
        centerLat = ev.target.getLatLng().lat;
        centerLng = ev.target.getLatLng().lng;
        if (centerCircle) centerCircle.setLatLng([centerLat, centerLng]);
        render();
      });
      if (centerCircle) map.removeLayer(centerCircle);
      centerCircle = L.circle([centerLat, centerLng], { radius: parseFloat(document.getElementById('radiusKm').value)*1000 }).addTo(map);
      render();
    });
  }
});

loadData();
