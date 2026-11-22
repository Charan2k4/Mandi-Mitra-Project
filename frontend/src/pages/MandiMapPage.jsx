import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Info, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import MandiMapLeaflet from '../components/MandiMapLeaflet';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MandiMapPage() {
  const { t } = useLanguage();
  const [mandis, setMandis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [farmerCoords, setFarmerCoords] = useState({ lat: 17.9784, lng: 79.5941 }); // Warangal center default
  const [searchRadius, setSearchRadius] = useState(100);
  const [detectedLocationName, setDetectedLocationName] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    async function fetchAllMandis() {
      try {
        const data = await apiService.getMandis();
        setMandis(data);
      } catch (err) {
        setError(err.message || 'Failed to load APMC locations');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllMandis();
  }, []);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));
        setFarmerCoords({ lat, lng });

        try {
          const geoData = await apiService.reverseGeocode(lat, lng);
          if (geoData) {
            const locParts = [geoData.location_name, geoData.district_name, geoData.state_name].filter(Boolean);
            setDetectedLocationName(locParts.join(', '));
          }
        } catch (err) {
          console.warn('Reverse geocoding failed:', err);
          setDetectedLocationName(`Location (${lat}, ${lng})`);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => {
        setIsDetectingLocation(false);
        alert('Could not access GPS. Using default reference coordinates.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-7 h-7 text-emerald-600" />
            {t('map_title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('map_subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {detectedLocationName && (
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-fadeIn">
              📍 {detectedLocationName}
            </span>
          )}
          <button
            onClick={handleDetectGPS}
            disabled={isDetectingLocation}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Navigation className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            {isDetectingLocation ? 'Detecting...' : t('btn_detect_gps')}
          </button>
        </div>
      </div>

      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            Search Radius:
          </span>
          <div className="flex gap-2">
            {[50, 100, 150, 200].map((r) => (
              <button
                key={r}
                onClick={() => setSearchRadius(r)}
                className={`px-3 py-1 rounded-lg border transition-colors ${
                  searchRadius === r
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600" /> {t('legend_farmer')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600" /> {t('legend_mandi')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" /> {t('legend_best')}
          </span>
        </div>
      </div>

      {/* Map Display */}
      {isLoading ? (
        <div className="h-[500px] flex items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <LoadingSpinner message="Loading interactive Mandi map..." />
        </div>
      ) : (
        <div className="space-y-2">
          <MandiMapLeaflet
            farmerLat={farmerCoords.lat}
            farmerLng={farmerCoords.lng}
            searchRadiusKm={searchRadius}
            mandis={mandis}
          />
          <p className="text-[11px] text-slate-400 italic">
            * All coordinates are authentic, verified APMC yard locations across Telangana, Andhra Pradesh, Maharashtra, Karnataka, Punjab, and Madhya Pradesh. Distances are approximate straight-line geodesic distances.
          </p>
        </div>
      )}
    </div>
  );
}
