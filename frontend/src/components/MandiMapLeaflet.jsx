import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { formatCurrency, formatNumber } from '../utils/formatters';

// Helper component to smoothly re-center Leaflet map when coordinates change
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

// Fix for default Leaflet icon paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const farmerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const mandiIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const bestMandiIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -38],
  shadowSize: [45, 45]
});

export default function MandiMapLeaflet({
  farmerLat,
  farmerLng,
  searchRadiusKm = 100,
  mandis = [],
  highlightedMandiId = null
}) {
  const defaultCenter = [farmerLat || 17.9784, farmerLng || 79.5941];

  return (
    <div className="w-full h-[450px] sm:h-[550px] rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700">
      <MapContainer
        center={defaultCenter}
        zoom={farmerLat && farmerLng ? 8 : 7}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={defaultCenter} />

        {/* Farmer Marker */}
        {farmerLat && farmerLng && (
          <>
            <Marker position={[farmerLat, farmerLng]} icon={farmerIcon}>
              <Popup>
                <div className="font-sans text-xs">
                  <strong className="text-blue-700 font-bold block text-sm">Your Location (Farmer)</strong>
                  <span>Coordinates: {farmerLat.toFixed(4)}, {farmerLng.toFixed(4)}</span>
                </div>
              </Popup>
            </Marker>

            {/* Radius Circle */}
            <Circle
              center={[farmerLat, farmerLng]}
              radius={searchRadiusKm * 1000}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '4, 4'
              }}
            />
          </>
        )}

        {/* Mandi Markers */}
        {mandis.map((m) => {
          if (!m.latitude || !m.longitude) return null;
          const isBest = m.is_recommended || m.id === highlightedMandiId || m.mandi_id === highlightedMandiId;

          return (
            <Marker
              key={m.id || m.mandi_id}
              position={[m.latitude, m.longitude]}
              icon={isBest ? bestMandiIcon : mandiIcon}
            >
              <Popup>
                <div className="font-sans text-xs p-1">
                  <div className="font-bold text-slate-900 text-sm mb-1">
                    {m.name || m.mandi_name}
                  </div>
                  {isBest && (
                    <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded mb-1">
                      #1 Best Net Profit
                    </span>
                  )}
                  <div className="text-slate-600 mb-0.5">
                    <strong>District:</strong> {m.district || m.district_name || 'N/A'}
                  </div>
                  {m.distance_km !== undefined && (
                    <div className="text-slate-600 mb-0.5">
                      <strong>Distance:</strong> {formatNumber(m.distance_km, 1)} km (approx)
                    </div>
                  )}
                  {m.price_per_quintal && (
                    <div className="text-emerald-700 font-semibold mb-0.5">
                      <strong>Price:</strong> {formatCurrency(m.price_per_quintal)}/qtl
                    </div>
                  )}
                  {m.net_revenue && (
                    <div className="text-emerald-800 font-bold">
                      <strong>Est. Net Revenue:</strong> {formatCurrency(m.net_revenue)}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
