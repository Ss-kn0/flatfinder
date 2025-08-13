# Flat Finder (Free, Static)
A lightweight, free-to-host website that shows available flats on an interactive map with filters for price and number of bedrooms.

## Features
- Interactive map (Leaflet + OpenStreetMap)
- Client-side filters: min price, max price, bedrooms
- Always shows results that are currently in the **map viewport** (pan/zoom to adjust area)
- Zero backend needed for viewing (can be hosted on GitHub Pages / Netlify)
- Listings are stored as a simple `data/listings.json` file

## Quick Start
1. **Open `index.html`** locally to try it.
2. To deploy for free:
   - Create a public GitHub repo, push these files.
   - In repo settings → Pages → Build from branch → choose `main` and `/ (root)`.
   - Your site will be live at `https://&lt;your-username&gt;.github.io/&lt;repo&gt;/`.

## Updating Listings (Legal & ToS-friendly)
Many popular property portals **forbid scraping** in their Terms of Service and via `robots.txt`. To keep things legal and reliable, use **one of these options**:

### Option A: Google Sheets (no code backend)
- Put your listings in a Google Sheet with columns:
  `id, title, price, bedrooms, lat, lng, city, address, url, source`
- File → Share → Publish to the web → CSV link.
- On `script.js`, replace the `loadData()` function with a fetch to your CSV, then convert rows to JSON.
- Pros: free, easy to maintain. Cons: manual or external process to get data into the sheet.

### Option B: Official APIs / Authorised Feeds
- Some platforms provide APIs under agreement (e.g., partner programs). Use those instead of scraping.
- Store the fetched results as `data/listings.json` using a scheduled job (GitHub Actions, cron on a VPS, or your local machine).

### Option C: Your Own Crawler (only for allowed sites)
If (and only if) a site’s Terms and robots allow it, you can write a small crawler to populate `data/listings.json`.
**Checklist before crawling:**
- Read the site’s Terms of Service carefully.
- Check `robots.txt` and honour disallow rules.
- Use a polite rate limit (e.g., 1 request per 5–10 seconds).
- Identify yourself with a descriptive User-Agent including contact info.
- Cache results and avoid re-downloading.
- Only store minimal fields you need.

A tiny Python example is included in `tools/sheet_sync_example.py` to convert a Google Sheets CSV into `data/listings.json`.

## Data Format
`data/listings.json` must be an array of objects like:
```json
{
  "id": "unique-id",
  "title": "2BR near Sagrada Família",
  "price": 1200,
  "bedrooms": 2,
  "lat": 41.4036,
  "lng": 2.1744,
  "city": "Barcelona",
  "address": "Carrer de Mallorca, 401",
  "url": "https://example.com/listing-123",
  "source": "your-source"
}
```

## Map Defaults
The map is centered on Barcelona. Change the initial `setView([lat, lng], zoom)` in `script.js` to your desired city.

## Free Enhancements to Consider
- Marker clustering (Leaflet MarkerCluster)
- Draw a polygon (Leaflet.draw) and show only results inside it
- Client-side favorites (localStorage)
- Shareable search URLs (encode filters + bounds in the URL hash)

---
© 2025-08-13 — Built for personal use.
