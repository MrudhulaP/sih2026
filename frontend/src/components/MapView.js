import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

function MapFocusController({ detection }) {
  const map = useMap();

  useEffect(() => {
    if (
      detection &&
      detection.latitude !== undefined &&
      detection.latitude !== null &&
      detection.longitude !== undefined &&
      detection.longitude !== null
    ) {
      map.flyTo(
        [Number(detection.latitude), Number(detection.longitude)],
        12,
        { duration: 1.2 }
      );
    }
  }, [detection, map]);

  return null;
}

function MapView({ detections = [], selectedDetection = null, onDetectionSelect }) {
  const locations = detections.filter(
    (item) =>
      item.latitude !== undefined &&
      item.latitude !== null &&
      item.longitude !== undefined &&
      item.longitude !== null
  );

  const activeSelection =
    selectedDetection &&
    selectedDetection.latitude !== undefined &&
    selectedDetection.latitude !== null &&
    selectedDetection.longitude !== undefined &&
    selectedDetection.longitude !== null
      ? selectedDetection
      : locations[0] || null;

  const center =
    activeSelection
      ? [Number(activeSelection.latitude), Number(activeSelection.longitude)]
      : [20.5937, 78.9629];

  return (
    <div className="map-wrapper">
      <MapContainer
        center={center}
        zoom={activeSelection ? 12 : 5}
        scrollWheelZoom={true}
        className="map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFocusController detection={activeSelection} />

        {locations.map((item, index) => {
          const selected =
            activeSelection &&
            (activeSelection.object_id ?? activeSelection.id ?? activeSelection.name) ===
              (item.object_id ?? item.id ?? item.name ?? index);

          const icon = L.divIcon({
            className: selected ? "custom-marker selected" : "custom-marker",
            html: '<span></span>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });

          return (
            <Marker
              key={item.object_id ?? index}
              position={[Number(item.latitude), Number(item.longitude)]}
              icon={icon}
              eventHandlers={{
                click: () => onDetectionSelect && onDetectionSelect(item)
              }}
            >
              <Popup>
                <strong>
                  {item.class_name || item.class || item.label || item.name || "Detected Object"}
                </strong>

                <br />

                Confidence: {item.confidence ? `${(Number(item.confidence) * 100).toFixed(1)}%` : "N/A"}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {locations.length === 0 && (
        <div className="map-overlay">📍 No geographic metadata available</div>
      )}
    </div>
  );
}

export default MapView;
