// Basic client-side app: loads JSON and filters on the fly.
const map = L.map('map').setView([41.387, 2.170], 12); // Barcelona center by default
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let listings = [];
let markers = [];

async function loadData() {
  try {
    const res = await fetch('data/listings.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load listings.json');
    listings = await res.json();
    render();
  } catch (e) {
    console.error(e);
    document.getElementById('list').innerHTML = '<p>Could not load listings. Ensure data/listings.json exists.</p>';
  }
}

function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

function formatPrice(eur) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(eur);
}

function render() {
  const minPrice = parseInt(document.getElementById('minPrice').value || '0', 10);
  const maxPrice = parseInt(document.getElementById('maxPrice').value || '9999999', 10);
  const bedrooms = parseInt(document.getElementById('bedrooms').value || '0', 10);
  const bounds = map.getBounds();

  const filtered = listings.filter(l => {
    const inPrice = l.price >= minPrice && l.price <= maxPrice;
    const inBeds = (l.bedrooms || 0) >= bedrooms;
    const inBounds = bounds.contains([l.lat, l.lng]);
    return inPrice && inBeds && inBounds;
  });

  clearMarkers();
  const listEl = document.getElementById('list');
  listEl.innerHTML = '';

  filtered.forEach(l => {
    const marker = L.marker([l.lat, l.lng]).addTo(map);
    marker.bindPopup(`<strong>${l.title}</strong><br>${formatPrice(l.price)} · ${l.bedrooms||0} bd<br><a href="${l.url}" target="_blank" rel="noreferrer">Open listing</a>`);
    markers.push(marker);

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${l.title}</h3>
      <div class="meta">
        <span>${formatPrice(l.price)}</span>
        <span>·</span>
        <span>${l.bedrooms || 0} bd</span>
        <span>·</span>
        <span>${l.city || ''}</span>
      </div>
      <p>${l.address || ''}</p>
      <p><a href="${l.url}" target="_blank" rel="noreferrer">Open listing</a></p>
    `;
    listEl.appendChild(card);
  });

  if (filtered.length === 0) {
    listEl.innerHTML = '<p>No results in view. Try zooming/moving the map or relaxing filters.</p>';
  }
}

document.getElementById('applyFilters').addEventListener('click', render);
document.getElementById('resetFilters').addEventListener('click', () => {
  document.getElementById('minPrice').value = '';
  document.getElementById('maxPrice').value = '';
  document.getElementById('bedrooms').value = '';
  render();
});
map.on('moveend', render);

loadData();
