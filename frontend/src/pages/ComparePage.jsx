import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Scale,
  MapPin,
  Truck,
  IndianRupee,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Layers,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { apiService } from '../services/api';
import MandiCard from '../components/MandiCard';
import LoadingSpinner from '../components/LoadingSpinner';
import MandiMapLeaflet from '../components/MandiMapLeaflet';
import { getCoordinatesFor } from '../utils/geoCoordinates';
import ModalPriceTooltip from '../components/ModalPriceTooltip';
import { recordActivity } from '../utils/activityTracker';
import { formatCurrency } from '../utils/formatters';

export default function ComparePage() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const location = useLocation();

  // Locations state
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [farmerLocation, setFarmerLocation] = useState(location.state?.preselectedFarmerLocation || '');
  const [farmerCoords, setFarmerCoords] = useState({ lat: null, lng: null });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Crops state
  const [crops, setCrops] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [selectedCropId, setSelectedCropId] = useState(location.state?.preselectedCropId || '');
  const [selectedVarietyId, setSelectedVarietyId] = useState(location.state?.preselectedVarietyId || '');

  // Commercial parameters
  const [quantity, setQuantity] = useState(location.state?.preselectedQuantity ?? 25.0);
  const [transportRate, setTransportRate] = useState(location.state?.preselectedTransportRate ?? 15.0);
  const [otherExpenses, setOtherExpenses] = useState(location.state?.preselectedOtherExpenses ?? 300.0);
  const [searchRadius, setSearchRadius] = useState(location.state?.preselectedSearchRadius || settings.searchRadiusKm || 100);
  const [pricePreference, setPricePreference] = useState(location.state?.preselectedPricePreference || settings.pricePreference || 'modal');

  // Execution state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [sortBy, setSortBy] = useState('net_revenue'); // 'net_revenue', 'price', 'distance'

  // Load initial dropdowns
  useEffect(() => {
    async function initData() {
      try {
        const [statesData, cropsData] = await Promise.all([
          apiService.getStates(),
          apiService.getCrops()
        ]);
        setStates(statesData);
        setCrops(cropsData);

        if (statesData.length > 0) {
          const targetStateName = location.state?.preselectedState;
          const chosenState = (targetStateName && statesData.find(s => s.name === targetStateName))
            || statesData.find(s => s.name === 'Telangana')
            || statesData[0];
          setSelectedState(chosenState.name);
          const initialCoords = location.state?.preselectedCoords || getCoordinatesFor(chosenState.name);
          setFarmerCoords(initialCoords);
          await loadDistricts(chosenState.id, chosenState.name, location.state?.preselectedDistrict);
        }

        const activeCropId = location.state?.preselectedCropId || selectedCropId || (cropsData.length > 0 ? cropsData[0].id : '');
        if (activeCropId) {
          setSelectedCropId(activeCropId);
          await loadVarieties(activeCropId, location.state?.preselectedVarietyId);
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize form data');
      }
    }
    initData();
  }, []);

  // Auto-run if navigated from Recent Activity
  useEffect(() => {
    if (location.state?.autoRun && selectedCropId && selectedState) {
      const timer = setTimeout(() => {
        handleSubmit();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [selectedCropId, selectedState]);

  const loadDistricts = async (stateId, stateName = selectedState, targetDistrict = null) => {
    try {
      const dists = await apiService.getDistricts(stateId);
      setDistricts(dists);
      if (dists.length > 0) {
        const found = targetDistrict ? dists.find(d => d.name === targetDistrict) : null;
        const chosen = found || dists[0];
        setSelectedDistrict(chosen.name);
        const coords = (chosen.latitude && chosen.longitude)
          ? { lat: chosen.latitude, lng: chosen.longitude }
          : getCoordinatesFor(stateName, chosen.name);
        setFarmerCoords(coords);
      } else {
        setSelectedDistrict('');
        setFarmerCoords(getCoordinatesFor(stateName));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadVarieties = async (cropId, targetVarietyId = null) => {
    try {
      const vars = await apiService.getVarieties(cropId);
      setVarieties(vars);
      if (targetVarietyId && vars.some(v => v.id === parseInt(targetVarietyId))) {
        setSelectedVarietyId(targetVarietyId);
      } else if (vars.length > 0) {
        setSelectedVarietyId(vars[0].id);
      } else {
        setSelectedVarietyId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStateChange = (e) => {
    const sName = e.target.value;
    setSelectedState(sName);
    // Immediately set coordinates to state centroid so coordinates from other states are wiped
    setFarmerCoords(getCoordinatesFor(sName));
    const sObj = states.find(s => s.name === sName);
    if (sObj) {
      loadDistricts(sObj.id, sName);
    }
  };

  const handleDistrictChange = (e) => {
    const dName = e.target.value;
    setSelectedDistrict(dName);
    const dObj = districts.find(d => d.name === dName);
    const coords = (dObj && dObj.latitude && dObj.longitude)
      ? { lat: dObj.latitude, lng: dObj.longitude }
      : getCoordinatesFor(selectedState, dName);
    setFarmerCoords(coords);
  };

  const handleCropChange = (e) => {
    const cId = parseInt(e.target.value);
    setSelectedCropId(cId);
    loadVarieties(cId);
  };

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
          // Reverse geocode to get actual city/town name, state, and nearest district
          const geoData = await apiService.reverseGeocode(lat, lng);

          if (geoData && geoData.location_name) {
            setFarmerLocation(geoData.location_name);
          }

          if (geoData && geoData.state_name) {
            setSelectedState(geoData.state_name);

            // Load districts for this detected state
            if (geoData.state_id) {
              const stateDists = await apiService.getDistricts(geoData.state_id);
              setDistricts(stateDists);

              if (geoData.district_name) {
                // Check if the detected district exists in this state's district list
                const distMatch = stateDists.find(d =>
                  d.name.toLowerCase() === geoData.district_name.toLowerCase()
                );
                if (distMatch) {
                  setSelectedDistrict(distMatch.name);
                } else if (stateDists.length > 0) {
                  setSelectedDistrict(stateDists[0].name);
                }
              } else if (stateDists.length > 0) {
                setSelectedDistrict(stateDists[0].name);
              }
            }
          }
        } catch (err) {
          console.warn('Reverse geocode failed, using coordinates directly:', err);
          setFarmerLocation(`Location (${lat}, ${lng})`);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        alert('Could not access GPS. Please check browser location permissions or choose manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedCropId) return;

    setIsLoading(true);
    setError(null);

    const payload = {
      state: selectedState,
      district: selectedDistrict,
      farmer_location: farmerLocation,
      farmer_lat: farmerCoords.lat,
      farmer_lng: farmerCoords.lng,
      commodity_id: parseInt(selectedCropId),
      variety_id: selectedVarietyId ? parseInt(selectedVarietyId) : null,
      quantity_quintals: parseFloat(quantity),
      transport_rate_per_km: parseFloat(transportRate),
      other_expenses: parseFloat(otherExpenses || 0),
      search_radius_km: parseInt(searchRadius),
      price_preference: pricePreference
    };

    try {
      const response = await apiService.compareMandis(payload);
      setComparisonResults(response);

      // Record in recent activities
      const cropObj = crops.find((c) => c.id === parseInt(selectedCropId));
      const varietyObj = varieties.find((v) => v.id === parseInt(selectedVarietyId));
      const topResult = response.results?.[0];
      const summaryText = topResult
        ? `Best: ${topResult.mandi_name} (${formatCurrency(topResult.net_revenue)})`
        : 'No mandis found in radius';

      recordActivity({
        type: 'compare',
        title: 'Mandi Comparison',
        cropName: cropObj?.name || 'Crop',
        varietyName: varietyObj?.name || '',
        location: selectedDistrict ? `${selectedDistrict}, ${selectedState}` : (farmerLocation || 'Local Region'),
        summary: summaryText,
        path: '/compare',
        state: {
          preselectedCropId: parseInt(selectedCropId),
          preselectedVarietyId: selectedVarietyId ? parseInt(selectedVarietyId) : '',
          preselectedState: selectedState,
          preselectedDistrict: selectedDistrict,
          preselectedQuantity: parseFloat(quantity),
          preselectedTransportRate: parseFloat(transportRate),
          preselectedOtherExpenses: parseFloat(otherExpenses || 0),
          preselectedSearchRadius: parseInt(searchRadius),
          preselectedPricePreference: pricePreference,
          preselectedFarmerLocation: farmerLocation,
          preselectedCoords: farmerCoords,
          autoRun: true
        }
      });
    } catch (err) {
      setError(err.message || 'Comparison failed. Please verify inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sort results
  const getSortedResults = () => {
    if (!comparisonResults?.results) return [];
    const list = [...comparisonResults.results];
    if (sortBy === 'price') {
      return list.sort((a, b) => b.price_per_quintal - a.price_per_quintal);
    } else if (sortBy === 'distance') {
      return list.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
    }
    // Default net_revenue
    return list.sort((a, b) => b.net_revenue - a.net_revenue);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Scale className="w-7 h-7 text-emerald-600" />
          {t('nav_compare')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('results_subtitle')}
        </p>
      </div>

      {/* Main Grid: Input Form + Map / Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Farmer Input Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>{t('form_title')}</span>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isDetectingLocation}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                {isDetectingLocation ? 'Detecting Location...' : t('btn_detect_gps')}
              </button>
            </h2>

            {/* State and District */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('form_state')}
                </label>
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  {states.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('form_district')}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Village / Coordinates display */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('form_village')}
              </label>
              <input
                type="text"
                value={farmerLocation}
                onChange={(e) => setFarmerLocation(e.target.value)}
                placeholder="e.g. Atmakur Village / Farm Landmark"
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
              {farmerCoords.lat && farmerCoords.lng && (
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Reference Center: {farmerCoords.lat.toFixed(4)}, {farmerCoords.lng.toFixed(4)}
                </span>
              )}
            </div>

            {/* Crop and Variety */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('form_crop')}
                </label>
                <select
                  value={selectedCropId}
                  onChange={handleCropChange}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  {crops.length === 0 && <option value="">Loading crops...</option>}
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('form_variety')}
                </label>
                <select
                  value={selectedVarietyId}
                  onChange={(e) => setSelectedVarietyId(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  {varieties.length === 0 && <option value="">Select crop first</option>}
                  {varieties.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity in Quintals */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('form_quantity')}
                </label>
                <span className="text-[11px] text-slate-400">{t('form_quantity_help')}</span>
              </div>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                required
              />
              <div className="flex gap-2 mt-1.5">
                {[10, 25, 50, 100].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className={`text-xs px-2.5 py-0.5 rounded-lg border transition-colors ${
                      parseFloat(quantity) === q
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {q} qtl
                  </button>
                ))}
              </div>
            </div>

            {/* Transport Rate & Other Expenses */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('form_transport_rate')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={transportRate}
                  onChange={(e) => setTransportRate(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('form_other_exp')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={otherExpenses}
                  onChange={(e) => setOtherExpenses(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              {t('form_transport_help')}
            </p>

            {/* Search Radius Pills */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('form_radius')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 100, 200].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSearchRadius(r)}
                    className={`text-xs py-1.5 font-medium rounded-xl border transition-all text-center ${
                      searchRadius === r
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>

            {/* Price Preference */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('form_price_pref')}
                </label>
                <ModalPriceTooltip iconClassName="w-3 h-3" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'modal', label: 'Modal' },
                  { id: 'min', label: 'Min' },
                  { id: 'max', label: 'Max' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPricePreference(p.id)}
                    className={`py-1.5 font-medium rounded-xl border transition-all text-center flex items-center justify-center gap-1 ${
                      pricePreference === p.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{p.label}</span>
                    {p.id === 'modal' && <ModalPriceTooltip iconClassName="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-md shadow-emerald-600/20 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner message="" />
                  <span>{t('btn_calculating')}</span>
                </>
              ) : (
                <>
                  <Scale className="w-5 h-5" />
                  <span>{t('btn_compare_now')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isLoading && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800">
              <LoadingSpinner message="Querying live APMC records and calculating net revenues..." />
            </div>
          )}

          {!isLoading && !comparisonResults && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                <Scale className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Ready to Compare Mandis
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Fill in your crop quantity and vehicle transportation rate on the left, then click <strong>"Calculate & Compare Mandis"</strong> to see net profitability rankings across all regional APMCs.
              </p>
            </div>
          )}

          {!isLoading && comparisonResults && (
            <div className="space-y-6">
              {/* Summary Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Found {comparisonResults.total_mandis_found} Mandis within {searchRadius} km
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ranked by estimated net revenue in hand.
                  </p>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-slate-700 dark:text-slate-200 text-xs"
                  >
                    <option value="net_revenue">Net Revenue (Highest)</option>
                    <option value="price">Market Price</option>
                    <option value="distance">Nearest Distance</option>
                  </select>
                </div>
              </div>

              {/* Mandi Cards List */}
              <div className="space-y-4">
                {getSortedResults().map((res) => (
                  <MandiCard
                    key={res.mandi_id}
                    result={res}
                    commodityId={parseInt(selectedCropId)}
                    varietyId={selectedVarietyId ? parseInt(selectedVarietyId) : null}
                    quantityQuintals={parseFloat(quantity)}
                  />
                ))}

                {comparisonResults.total_mandis_found === 0 && (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                    {t('no_mandis_found')}
                  </div>
                )}
              </div>

              {/* Leaflet Map Preview */}
              {comparisonResults.total_mandis_found > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Geographic Mandi Distribution
                  </h4>
                  <MandiMapLeaflet
                    farmerLat={farmerCoords.lat}
                    farmerLng={farmerCoords.lng}
                    searchRadiusKm={searchRadius}
                    mandis={comparisonResults.results}
                    highlightedMandiId={comparisonResults.best_mandi?.mandi_id}
                  />
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                {comparisonResults.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
