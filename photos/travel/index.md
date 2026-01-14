---
layout: default
title: Travel Photos
---

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<section class="photo-category">
  <p class="section-title">Travel</p>
  
  <div id="travel-map"></div>
  
  <div class="location-grid">
    <a href="/photos/travel/cancun-mexico/" class="location-card" data-lat="21.1619" data-lng="-86.8515">
      <h3>Cancun</h3>
      <p>Mexico</p>
    </a>
    <a href="/photos/travel/boston-usa/" class="location-card" data-lat="42.3601" data-lng="-71.0589">
      <h3>Boston</h3>
      <p>USA</p>
    </a>
    <a href="/photos/travel/st-louis-usa/" class="location-card" data-lat="38.6270" data-lng="-90.1994">
      <h3>St. Louis</h3>
      <p>USA</p>
    </a>
    <a href="/photos/travel/lagos-nigeria/" class="location-card" data-lat="6.5244" data-lng="3.3792">
      <h3>Lagos</h3>
      <p>Nigeria</p>
    </a>
    <a href="/photos/travel/ogidi-anambra/" class="location-card" data-lat="6.1667" data-lng="6.8333">
      <h3>Ogidi</h3>
      <p>Anambra, Nigeria</p>
    </a>
    <a href="/photos/travel/blue-mountain-ontario/" class="location-card" data-lat="44.5013" data-lng="-80.3161">
      <h3>Blue Mountain</h3>
      <p>Ontario, Canada</p>
    </a>
  </div>
</section>

<style>
#travel-map {
  height: 450px;
  width: 100%;
  border-radius: 12px;
  margin-bottom: 3rem;
  z-index: 1;
}

.leaflet-popup-content-wrapper {
  background: #111;
  color: #fff;
  border-radius: 8px;
}

.leaflet-popup-content {
  margin: 12px 16px;
}

.leaflet-popup-content h4 {
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.leaflet-popup-content p {
  color: #888;
  font-size: 0.85rem;
  margin: 0;
}

.leaflet-popup-content a {
  display: inline-block;
  margin-top: 8px;
  color: #fff;
  font-size: 0.8rem;
  text-decoration: none;
  padding: 6px 12px;
  background: #333;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.leaflet-popup-content a:hover {
  background: #444;
}

.leaflet-popup-tip {
  background: #111;
}

.leaflet-container {
  background: #0a0a0a;
  font-family: 'Space Grotesk', sans-serif;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  var map = L.map('travel-map', {
    center: [20, 0],
    zoom: 2,
    scrollWheelZoom: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  }).addTo(map);

  var locations = [
    {
      name: "Cancun",
      country: "Mexico",
      lat: 21.1619,
      lng: -86.8515,
      url: "/photos/travel/cancun-mexico/"
    },
    {
      name: "Boston",
      country: "USA",
      lat: 42.3601,
      lng: -71.0589,
      url: "/photos/travel/boston-usa/"
    },
    {
      name: "St. Louis",
      country: "USA",
      lat: 38.6270,
      lng: -90.1994,
      url: "/photos/travel/st-louis-usa/"
    },
    {
      name: "Lagos",
      country: "Nigeria",
      lat: 6.5244,
      lng: 3.3792,
      url: "/photos/travel/lagos-nigeria/"
    },
    {
      name: "Ogidi",
      country: "Anambra, Nigeria",
      lat: 6.1667,
      lng: 6.8333,
      url: "/photos/travel/ogidi-anambra/"
    },
    {
      name: "Blue Mountain",
      country: "Ontario, Canada",
      lat: 44.5013,
      lng: -80.3161,
      url: "/photos/travel/blue-mountain-ontario/"
    }
  ];

  var customIcon = L.divIcon({
    className: 'custom-marker',
    html: '<div class="marker-pin"></div>',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
  });

  locations.forEach(function(loc) {
    var marker = L.marker([loc.lat, loc.lng], {icon: customIcon}).addTo(map);
    marker.bindPopup(
      '<h4>' + loc.name + '</h4>' +
      '<p>' + loc.country + '</p>' +
      '<a href="' + loc.url + '">View Photos →</a>'
    );
  });

  // Hover effect on location cards
  document.querySelectorAll('.location-card').forEach(function(card) {
    card.addEventListener('mouseenter', function() {
      var lat = parseFloat(this.dataset.lat);
      var lng = parseFloat(this.dataset.lng);
      map.flyTo([lat, lng], 6, {duration: 1});
    });
  });
});
</script>

<style>
.custom-marker {
  background: transparent;
}

.marker-pin {
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 20px rgba(255,255,255,0.5);
  animation: markerPulse 2s ease-in-out infinite;
}

.marker-pin::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 10px solid #fff;
}

@keyframes markerPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}
</style>
