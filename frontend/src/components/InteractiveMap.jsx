import React, { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";

const DEFAULT_CENTER = [31.6295, -7.9811]; // Marrakech
const DEFAULT_ZOOM = 13;
const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    );
    const data = await res.json();
    // Build a short, readable address from address parts
    if (data.address) {
      const a = data.address;
      const parts = [
        a.road || a.pedestrian || a.neighbourhood || a.suburb || "",
        a.suburb || a.neighbourhood || a.city_district || "",
        a.city || a.town || a.village || "",
      ].filter(Boolean);
      // Remove duplicates
      const unique = [...new Set(parts)];
      if (unique.length > 0) {
        return unique.slice(0, 3).join(", ");
      }
    }
    // Fallback: take first 2 parts of display_name
    if (data.display_name) {
      return data.display_name.split(",").slice(0, 2).map(s => s.trim()).join(", ");
    }
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

async function searchPlaces(query) {
  if (!query || query.length < 3) return [];
  try {
    const res = await fetch(
      `${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ma&viewbox=-8.2,31.8,-7.8,31.5&bounded=0`,
    );
    return await res.json();
  } catch {
    return [];
  }
}

export default function InteractiveMap({
  onDepartSelect,
  onDestinationSelect,
  departValue,
  destinationValue,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const departMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  const [activePin, setActivePin] = useState("depart"); // "depart" | "destination"
  const [departQuery, setDepartQuery] = useState(departValue || "");
  const [destQuery, setDestQuery] = useState(destinationValue || "");
  const [departSuggestions, setDepartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Sync external values
  useEffect(() => {
    if (departValue !== undefined) setDepartQuery(departValue);
  }, [departValue]);

  useEffect(() => {
    if (destinationValue !== undefined) setDestQuery(destinationValue);
  }, [destinationValue]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false,
      tap: true,
      touchZoom: true,
      dragging: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Attribution
    L.control.attribution({ position: "bottomleft", prefix: false })
      .addAttribution('&copy; <a href="https://osm.org/copyright">OSM</a>')
      .addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    // Click handler
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      handleMapClick(lat, lng);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update click behavior when activePin changes
  const activePinRef = useRef(activePin);
  activePinRef.current = activePin;

  function handleMapClick(lat, lng) {
    const pin = activePinRef.current;
    placeMarker(lat, lng, pin);
    reverseGeocode(lat, lng).then((name) => {
      if (pin === "depart") {
        setDepartQuery(name);
        onDepartSelect?.(name, { lat, lng });
      } else {
        setDestQuery(name);
        onDestinationSelect?.(name, { lat, lng });
      }
    });
  }

  function placeMarker(lat, lng, type) {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    const iconHtml = type === "depart"
      ? `<div class="map-marker map-marker--depart"><div class="map-marker__dot"></div><div class="map-marker__pulse"></div></div>`
      : `<div class="map-marker map-marker--dest"><div class="map-marker__dot"></div><div class="map-marker__pulse"></div></div>`;

    const icon = L.divIcon({
      html: iconHtml,
      className: "map-marker-container",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    if (type === "depart") {
      if (departMarkerRef.current) {
        departMarkerRef.current.setLatLng([lat, lng]);
      } else {
        departMarkerRef.current = L.marker([lat, lng], {
          icon,
          draggable: true,
        }).addTo(map);

        departMarkerRef.current.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          reverseGeocode(pos.lat, pos.lng).then((name) => {
            setDepartQuery(name);
            onDepartSelect?.(name, { lat: pos.lat, lng: pos.lng });
          });
          updateRouteLine();
        });
      }
    } else {
      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng([lat, lng]);
      } else {
        destMarkerRef.current = L.marker([lat, lng], {
          icon,
          draggable: true,
        }).addTo(map);

        destMarkerRef.current.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          reverseGeocode(pos.lat, pos.lng).then((name) => {
            setDestQuery(name);
            onDestinationSelect?.(name, { lat: pos.lat, lng: pos.lng });
          });
          updateRouteLine();
        });
      }
    }

    updateRouteLine();
  }

  function updateRouteLine() {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (departMarkerRef.current && destMarkerRef.current) {
      const p1 = departMarkerRef.current.getLatLng();
      const p2 = destMarkerRef.current.getLatLng();

      routeLineRef.current = L.polyline([p1, p2], {
        color: "#6366f1",
        weight: 3,
        opacity: 0.7,
        dashArray: "8, 8",
        className: "route-line-animated",
      }).addTo(map);

      map.fitBounds(L.latLngBounds(p1, p2).pad(0.3));
    }
  }

  // GPS Location
  function handleLocateMe() {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
        }
        placeMarker(latitude, longitude, "depart");
        reverseGeocode(latitude, longitude).then((name) => {
          setDepartQuery(name);
          onDepartSelect?.(name, { lat: latitude, lng: longitude });
          setIsLocating(false);
        });
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  // Autocomplete search
  const debouncedSearchDepart = useCallback(
    debounce(async (q) => {
      const results = await searchPlaces(q);
      setDepartSuggestions(results);
    }, 400),
    [],
  );

  const debouncedSearchDest = useCallback(
    debounce(async (q) => {
      const results = await searchPlaces(q);
      setDestSuggestions(results);
    }, 400),
    [],
  );

  function handleDepartInputChange(e) {
    const val = e.target.value;
    setDepartQuery(val);
    onDepartSelect?.(val, null);
    debouncedSearchDepart(val);
  }

  function handleDestInputChange(e) {
    const val = e.target.value;
    setDestQuery(val);
    onDestinationSelect?.(val, null);
    debouncedSearchDest(val);
  }

  function selectDepartSuggestion(place) {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const name = place.display_name.split(",").slice(0, 3).map(s => s.trim()).join(", ");

    setDepartQuery(name);
    setDepartSuggestions([]);
    onDepartSelect?.(name, { lat, lng });
    placeMarker(lat, lng, "depart");

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
    }
  }

  function selectDestSuggestion(place) {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const name = place.display_name.split(",").slice(0, 3).map(s => s.trim()).join(", ");

    setDestQuery(name);
    setDestSuggestions([]);
    onDestinationSelect?.(name, { lat, lng });
    placeMarker(lat, lng, "destination");

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
    }
  }

  return (
    <div className="interactive-map">
      {/* Map Container */}
      <div className="interactive-map__canvas" ref={mapContainerRef}>
        {!mapReady && (
          <div className="interactive-map__loading">
            <div className="interactive-map__spinner" />
            <span>Chargement de la carte...</span>
          </div>
        )}
      </div>

      {/* Map Controls Overlay */}
      <div className="interactive-map__controls">
        <button
          type="button"
          className="map-control-btn map-control-btn--locate"
          onClick={handleLocateMe}
          disabled={isLocating}
          title="Ma position GPS"
        >
          {isLocating ? (
            <div className="map-control-btn__spinner" />
          ) : (
            <Icon name="location" size={18} />
          )}
        </button>

        <div className="map-pin-toggle">
          <button
            type="button"
            className={`map-pin-toggle__btn ${activePin === "depart" ? "map-pin-toggle__btn--active map-pin-toggle__btn--depart" : ""}`}
            onClick={() => setActivePin("depart")}
          >
            <span className="map-pin-toggle__dot map-pin-toggle__dot--depart" />
            Depart
          </button>
          <button
            type="button"
            className={`map-pin-toggle__btn ${activePin === "destination" ? "map-pin-toggle__btn--active map-pin-toggle__btn--dest" : ""}`}
            onClick={() => setActivePin("destination")}
          >
            <span className="map-pin-toggle__dot map-pin-toggle__dot--dest" />
            Destination
          </button>
        </div>
      </div>

      {/* Search Fields */}
      <div className="interactive-map__fields">
        <div className="map-search-field">
          <div className="map-search-field__row">
            <span className="map-search-field__indicator map-search-field__indicator--depart" />
            <input
              type="text"
              placeholder="Point de depart..."
              value={departQuery}
              onChange={handleDepartInputChange}
              onFocus={() => setActivePin("depart")}
              className="map-search-field__input"
            />
            {departQuery && (
              <button
                type="button"
                className="map-search-field__clear"
                onClick={() => {
                  setDepartQuery("");
                  setDepartSuggestions([]);
                  onDepartSelect?.("", null);
                }}
              >
                &times;
              </button>
            )}
          </div>
          {departSuggestions.length > 0 && (
            <ul className="map-suggestions">
              {departSuggestions.map((place) => (
                <li key={place.place_id}>
                  <button
                    type="button"
                    onClick={() => selectDepartSuggestion(place)}
                  >
                    <Icon name="location" size={14} />
                    <span>{place.display_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="map-search-field__connector">
          <span />
          <span />
          <span />
        </div>

        <div className="map-search-field">
          <div className="map-search-field__row">
            <span className="map-search-field__indicator map-search-field__indicator--dest" />
            <input
              type="text"
              placeholder="Destination..."
              value={destQuery}
              onChange={handleDestInputChange}
              onFocus={() => setActivePin("destination")}
              className="map-search-field__input"
            />
            {destQuery && (
              <button
                type="button"
                className="map-search-field__clear"
                onClick={() => {
                  setDestQuery("");
                  setDestSuggestions([]);
                  onDestinationSelect?.("", null);
                }}
              >
                &times;
              </button>
            )}
          </div>
          {destSuggestions.length > 0 && (
            <ul className="map-suggestions">
              {destSuggestions.map((place) => (
                <li key={place.place_id}>
                  <button
                    type="button"
                    onClick={() => selectDestSuggestion(place)}
                  >
                    <Icon name="location" size={14} />
                    <span>{place.display_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Helper tip */}
      <p className="interactive-map__tip">
        <Icon name="route" size={14} />
        <span>Touche la carte ou cherche une adresse pour placer tes points</span>
      </p>
    </div>
  );
}
