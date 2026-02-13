// ================= GLOBAL VARIABLES =================
let map;
let currentMode = "seeker";

// Load saved help requests from localStorage
let helpRequests = JSON.parse(localStorage.getItem("helpRequests")) || [];


// ================= INITIALIZE MAP =================
function initMap() {
  map = L.map("map").setView([10.8505, 76.2711], 7); // Default Kerala view

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
}


// ================= START APP AFTER ROLE SELECTION =================
function startApp(role) {
  document.getElementById("roleScreen").style.display = "none";
  document.getElementById("app").style.display = "block";

  currentMode = role;

  const roleTitle = document.getElementById("roleTitle");
  const helpForm = document.getElementById("helpForm");

  if (role === "seeker") {
    roleTitle.innerText = "Report an Animal in Need";
    helpForm.style.display = "block";
  } else {
    roleTitle.innerText = "Nearby Help Requests";
    helpForm.style.display = "none";
  }

  // Fix map rendering after hidden load
  setTimeout(() => {
    map.invalidateSize();
    refreshMarkers(); // Show saved markers
  }, 200);
}


// ================= SUBMIT HELP REQUEST =================
function submitHelp() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const helpData = {
      id: Date.now(),
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      description: document.getElementById("description").value,
      responded: false,
    };

    helpRequests.push(helpData);

    // Save to localStorage
    localStorage.setItem("helpRequests", JSON.stringify(helpRequests));

    addMarker(helpData);
  });
}


// ================= ADD MARKER =================
function addMarker(req) {
  const marker = L.marker([req.lat, req.lng]).addTo(map);

  let popupContent = `<p>${req.description}</p>`;

  // Show button ONLY for volunteers & if not already responded
  if (currentMode === "volunteer" && !req.responded) {
    popupContent += `<button onclick="respond(${req.id})">I can help</button>`;
  }

  // Show confirmation if responded
  if (req.responded) {
    popupContent += `<p style="color: green;">✔ Volunteer on the way</p>`;
  }

  marker.bindPopup(popupContent);

  // Auto zoom to new marker only for seeker
  if (currentMode === "seeker") {
    marker.openPopup();
    map.flyTo([req.lat, req.lng], 16, {
      animate: true,
      duration: 1.5,
    });
  }
}


// ================= VOLUNTEER RESPONSE =================
function respond(id) {
  const req = helpRequests.find((r) => r.id === id);
  if (!req) return;

  req.responded = true;

  // Save updated state
  localStorage.setItem("helpRequests", JSON.stringify(helpRequests));

  alert("You have volunteered to help!");

  refreshMarkers();
}


// ================= REFRESH ALL MARKERS =================
function refreshMarkers() {
  // Remove old markers
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  // Re-add all markers
  helpRequests.forEach(addMarker);
}


// ================= LOAD MAP ON PAGE LOAD =================
window.onload = initMap;
