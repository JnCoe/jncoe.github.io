# Electoral Map Integration Guide

## Overview

This guide explains how to migrate the Power BI electoral map to a static Leaflet.js solution using a two-repository architecture.

## Current Situation

- **Website Repo**: `JnCoe/jncoe.github.io` contains `electoral_map.html` with embedded Power BI map (license expired)
- **Data Location**: `final_output.csv` (60MB, ~398,845 rows) in `/mnt/d/Users/jonas/Downloads/`
- **Current Data**: `candidates.csv` with 1,028 candidates, candidate photos in `images/candidates_pic/`
- **Problem**: Power BI embed token expired, need static solution for GitHub Pages

## Two-Repository Architecture

### Repository 1: Data Repository (NEW)
**Name**: `rio-electoral-data-2024` (or similar)

**Purpose**: Store and process electoral data

**Structure**:
```
rio-electoral-data-2024/
├── README.md                          # Project overview and usage
├── DATA_DICTIONARY.md                 # Column definitions
├── PROCESSING.md                      # How data was processed
├── data/
│   ├── final_output.csv              # Original 60MB raw data
│   ├── candidates.csv                # Candidate summary data
│   ├── locations.csv                 # Voting locations with lat/lon (NEW)
│   └── processed/
│       ├── voting_locations.json     # ~200KB - All location coordinates
│       ├── votes_190002135253.json   # ~50-100KB per candidate
│       ├── votes_190001986140.json
│       └── ... (1,028 files total)
├── images/
│   └── candidates_pic/               # Candidate photos
└── scripts/
    ├── 01_geocode.py                 # Convert addresses to lat/lon
    ├── 02_create_locations.py        # Build locations.csv
    ├── 03_preprocess.py              # Split data by candidate
    └── requirements.txt              # Python dependencies
```

### Repository 2: Website Repository (EXISTING)
**Name**: `JnCoe/jncoe.github.io`

**Changes**: 
- `electoral_map.html` modified to fetch data from data repo via GitHub raw URLs
- Remove local `candidates.csv` and `images/candidates_pic/` (moved to data repo)
- Add Leaflet.js map implementation

## Data Processing Workflow

### Step 1: Geocoding Addresses
**Script**: `scripts/01_geocode.py`

**Input**: `final_output.csv` (columns: `DS_LOCAL_VOTACAO_ENDERECO`, `NM_LOCAL_VOTACAO`)

**Process**:
1. Extract unique voting location addresses (~1,432 unique locations)
2. Use **Nominatim API** (OpenStreetMap, free) to geocode each address
3. Rate limit: 1 request/second (Nominatim policy)
4. Estimated time: ~24 minutes for all locations

**Output**: `geocoded_locations.csv`
```csv
location_id,address,location_name,latitude,longitude,district
1,"AV NOSSA SENHORA DE COPACABANA, 709A, Rio de Janeiro - RJ","1/2 - BANCO BRADESCO, NSC 709A",-22.9668,-43.1822,Copacabana
```

**API Used**: Nominatim (free, open source)
- Endpoint: `https://nominatim.openstreetmap.org/search`
- No API key required
- Must include User-Agent header
- Respects rate limits

### Step 2: Create Locations CSV
**Script**: `scripts/02_create_locations.py`

**Purpose**: Create optimized location reference file

**Output**: `data/locations.csv`
```csv
location_id,address,location_name,latitude,longitude
1,"AV NOSSA SENHORA DE COPACABANA, 709A","1/2 - BANCO BRADESCO",-22.9668,-43.1822
```

**Size**: ~200KB (1,432 rows × ~140 bytes each)

### Step 3: Preprocess Vote Data
**Script**: `scripts/03_preprocess.py`

**Input**: 
- `final_output.csv` (398,845 rows)
- `locations.csv` (from Step 2)

**Process**:
1. Read locations CSV to create location_id mapping
2. For each of 1,028 candidates:
   - Filter rows for that candidate
   - Join with location_id
   - Calculate vote proportion: `(votes / total_votes_at_location) * 100`
   - Output to JSON file

**Output**: 1,028 JSON files in `data/processed/`

**Format**: `votes_{sq_candidato}.json`
```json
[
  {
    "location_id": 1,
    "votes": 250,
    "proportion": 12.5,
    "total_votes_location": 2000
  },
  ...
]
```

**Size per file**: ~50-100KB
**Total size**: ~50-100MB (vs 60MB original, but lazy-loaded)

### Step 4: Create Voting Locations JSON
**Script**: Part of `03_preprocess.py`

**Output**: `data/processed/voting_locations.json`
```json
{
  "1": {
    "address": "AV NOSSA SENHORA DE COPACABANA, 709A",
    "name": "1/2 - BANCO BRADESCO, NSC 709A",
    "lat": -22.9668,
    "lon": -43.1822
  },
  ...
}
```

**Size**: ~200KB
**Purpose**: Loaded once on page load, contains all marker positions

## Website Integration

### HTML Changes: `electoral_map.html`

#### 1. Add Leaflet.js CSS/JS
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

#### 2. Update Data Source URLs
```javascript
// OLD: Local file
Papa.parse("candidates.csv", { ... });

// NEW: GitHub raw URL
const DATA_REPO = "https://raw.githubusercontent.com/JnCoe/rio-electoral-data-2024/main";
Papa.parse(`${DATA_REPO}/data/candidates.csv`, { ... });
```

#### 3. Update Image Paths
```javascript
// OLD:
const imageUrl = `images/candidates_pic/FRJ${candidate.sq_candidato}_div.jpg`;

// NEW:
const imageUrl = `${DATA_REPO}/images/candidates_pic/FRJ${candidate.sq_candidato}_div.jpg`;
```

#### 4. Initialize Leaflet Map
```javascript
// Replace embedContainer1 Power BI code with:
const map = L.map('embedContainer1').setView([-22.9068, -43.1729], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let markersLayer = L.layerGroup().addTo(map);
let votingLocations = {};
```

#### 5. Load Voting Locations (Once on Page Load)
```javascript
window.onload = async function() {
  try {
    const response = await fetch(`${DATA_REPO}/data/processed/voting_locations.json`);
    votingLocations = await response.json();
    console.log(`Loaded ${Object.keys(votingLocations).length} voting locations`);
  } catch (error) {
    console.error('Failed to load voting locations:', error);
    alert('Unable to load map data. Please try again later.');
  }
};
```

#### 6. Load Candidate Data on Button Click
```javascript
document.getElementById('applyButton').addEventListener('click', async () => {
  if (!selectedCandidate) {
    alert('Please select a candidate first');
    return;
  }

  // Find candidate ID
  const candidate = candidatesData.find(c => c.Candidate === selectedCandidate);
  const candidateId = candidate.sq_candidato;

  // Show loading state
  const button = document.getElementById('applyButton');
  const originalText = button.textContent;
  button.textContent = 'Loading map data...';
  button.disabled = true;

  try {
    // Fetch candidate vote data
    const response = await fetch(`${DATA_REPO}/data/processed/votes_${candidateId}.json`);
    if (!response.ok) throw new Error('Failed to load candidate data');
    
    const votes = await response.json();

    // Clear existing markers
    markersLayer.clearLayers();

    // Get min/max for scaling
    const minVotes = parseFloat(candidate.min_abs_votes);
    const maxVotes = parseFloat(candidate.max_abs_votes);
    const minProp = parseFloat(candidate.min_prop_votes);
    const maxProp = parseFloat(candidate.max_prop_votes);

    // Add markers
    votes.forEach(vote => {
      const loc = votingLocations[vote.location_id];
      if (!loc) return; // Skip if location not found

      const marker = L.circleMarker([loc.lat, loc.lon], {
        radius: scaleRadius(vote.votes, minVotes, maxVotes),
        fillColor: scaleColor(vote.proportion, minProp, maxProp),
        color: '#666',
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.6
      }).bindPopup(`
        <strong>${loc.name}</strong><br>
        ${loc.address}<br>
        <br>
        <strong>Votes:</strong> ${vote.votes.toLocaleString()}<br>
        <strong>Share:</strong> ${vote.proportion.toFixed(2)}%<br>
        <strong>Total at location:</strong> ${vote.total_votes_location.toLocaleString()}
      `);
      
      markersLayer.addLayer(marker);
    });

    // Zoom to fit all markers
    if (markersLayer.getLayers().length > 0) {
      map.fitBounds(markersLayer.getBounds(), { padding: [50, 50] });
    }

    // Scroll to map
    document.getElementById('map').scrollIntoView({ behavior: 'smooth' });

  } catch (error) {
    console.error('Error loading candidate data:', error);
    alert('Failed to load candidate data. Please try again.');
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
});

// Scaling functions
function scaleRadius(votes, min, max) {
  const minRadius = 5;
  const maxRadius = 30;
  if (max === min) return minRadius;
  return minRadius + ((votes - min) / (max - min)) * (maxRadius - minRadius);
}

function scaleColor(proportion, minProp, maxProp) {
  // Color gradient: light blue (low) → dark red (high)
  const minColor = [160, 209, 255]; // #A0D1FF
  const maxColor = [107, 35, 40];   // #6B2328
  
  if (maxProp === minProp) return `rgb(${minColor.join(',')})`;
  
  const normalized = (proportion - minProp) / (maxProp - minProp);
  const r = Math.round(minColor[0] + normalized * (maxColor[0] - minColor[0]));
  const g = Math.round(minColor[1] + normalized * (maxColor[1] - minColor[1]));
  const b = Math.round(minColor[2] + normalized * (maxColor[2] - minColor[2]));
  
  return `rgb(${r},${g},${b})`;
}
```

## Data Flow

```
User Action: Select candidate → Click "See candidate on the map"
    ↓
1. Fetch votes_{candidate_id}.json from GitHub (~50-100KB)
    ↓
2. For each vote record, lookup location from votingLocations object (already loaded)
    ↓
3. Create L.circleMarker with:
   - Position: [location.lat, location.lon]
   - Size: scaled by vote count
   - Color: scaled by vote proportion
    ↓
4. Add to markersLayer and display on map
```

## Key Features

### Performance Optimization
- **Lazy loading**: Only fetch selected candidate's data (~50-100KB) instead of entire 60MB
- **One-time location load**: Voting locations JSON (~200KB) loaded once on page load
- **Cached files**: GitHub CDN caches raw files, subsequent loads are instant
- **Mobile friendly**: Small file sizes work well on mobile networks

### Error Handling
- Loading states during data fetch
- Error messages if data fails to load
- Fallback behavior for missing locations
- Disabled button during loading to prevent double-clicks

### Visual Features
- Bubble size represents absolute votes (scaled from min to max)
- Color gradient represents vote proportion (blue = low, red = high)
- Tooltips show location details, vote counts, and percentages
- Auto-zoom to fit all markers for selected candidate
- Smooth scroll to map section

## GitHub Raw URL Format

```
https://raw.githubusercontent.com/{username}/{repo}/{branch}/{path}

Examples:
https://raw.githubusercontent.com/JnCoe/rio-electoral-data-2024/main/data/candidates.csv
https://raw.githubusercontent.com/JnCoe/rio-electoral-data-2024/main/data/processed/voting_locations.json
https://raw.githubusercontent.com/JnCoe/rio-electoral-data-2024/main/data/processed/votes_190002135253.json
https://raw.githubusercontent.com/JnCoe/rio-electoral-data-2024/main/images/candidates_pic/FRJ190002135253_div.jpg
```

## CORS and Caching

### CORS Support
- GitHub raw URLs have CORS enabled by default
- No special configuration needed
- Accessible from any website

### Caching
- GitHub serves raw files with cache headers
- Browser automatically caches files
- Updates reflected when repo is updated
- Consider versioning for cache busting if needed: `?v=1`

## Implementation Steps

### Phase 1: Create Data Repository
1. Create new GitHub repo `rio-electoral-data-2024`
2. Upload `final_output.csv` to `data/`
3. Upload `candidates.csv` to `data/`
4. Upload `images/candidates_pic/` folder to `images/`
5. Create `README.md` with project description

### Phase 2: Run Processing Scripts
1. Install Python dependencies: `pip install pandas geopy requests`
2. Run `01_geocode.py` to get lat/lon (~24 minutes)
3. Run `02_create_locations.py` to create `locations.csv`
4. Run `03_preprocess.py` to generate JSON files
5. Upload processed files to `data/processed/`

### Phase 3: Update Website
1. Add Leaflet.js CSS/JS to `electoral_map.html`
2. Update all data source paths to GitHub raw URLs
3. Replace Power BI embed code with Leaflet map
4. Add lazy loading logic for candidate data
5. Test on GitHub Pages

### Phase 4: Testing
1. Test candidate selection and filtering
2. Verify map loads correctly
3. Check mobile responsiveness
4. Validate error handling
5. Test with slow network connection

## File Sizes Summary

| File | Size | When Loaded | Purpose |
|------|------|-------------|---------|
| `candidates.csv` | ~100KB | Page load | Candidate list and filters |
| `voting_locations.json` | ~200KB | Page load | All marker coordinates |
| `votes_{id}.json` | ~50-100KB | On demand | Selected candidate votes |
| Leaflet.js + CSS | ~150KB | Page load | Map library |

**Total initial load**: ~450KB (vs 60MB original)
**Per candidate load**: ~50-100KB

## Python Dependencies

```txt
# requirements.txt
pandas>=2.0.0
requests>=2.31.0
geopy>=2.4.0
```

## Nominatim API Usage

```python
import time
import requests
from geopy.geocoders import Nominatim

# Initialize geocoder with user agent
geolocator = Nominatim(user_agent="rio-electoral-map-2024")

# Geocode with rate limiting
def geocode_address(address):
    try:
        location = geolocator.geocode(address + ", Rio de Janeiro, Brazil")
        time.sleep(1)  # Respect 1 request/second limit
        if location:
            return location.latitude, location.longitude
        return None, None
    except Exception as e:
        print(f"Error geocoding {address}: {e}")
        return None, None
```

## Benefits of This Architecture

1. **Separation of Concerns**: Data processing separate from presentation
2. **Version Control**: Data changes tracked in dedicated repo
3. **Clean Website Repo**: Remove large data files from main repo
4. **Scalability**: Easy to add more elections or regions
5. **Performance**: Lazy loading only what's needed
6. **Cost**: Completely free (GitHub Pages + Nominatim)
7. **Maintenance**: Update data without touching website code
8. **Documentation**: Data repo can have extensive docs about data processing

## Next Steps

1. Create `rio-electoral-data-2024` repository
2. Develop Python preprocessing scripts
3. Run geocoding and data processing
4. Update `electoral_map.html` with Leaflet integration
5. Test and deploy
