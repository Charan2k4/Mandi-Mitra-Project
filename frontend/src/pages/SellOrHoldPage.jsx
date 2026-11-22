import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BrainCircuit,
  Clock,
  Warehouse,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Percent,
  Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { apiService } from '../services/api';
import AdvisoryCard from '../components/AdvisoryCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SellOrHoldPage() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const location = useLocation();

  // State from navigation or defaults
  const [crops, setCrops] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [mandis, setMandis] = useState([]);

  const [selectedCropId, setSelectedCropId] = useState(location.state?.commodityId || '');
  const [selectedVarietyId, setSelectedVarietyId] = useState(location.state?.varietyId || '');
  const [selectedMandiId, setSelectedMandiId] = useState(location.state?.mandiId || '');
  const [quantity, setQuantity] = useState(location.state?.quantity || 10.0);
  const [holdingDays, setHoldingDays] = useState(settings.holdingPeriodDays || 3);
  const [storageCost, setStorageCost] = useState(settings.storageCostPerQtlDay || 5.0);

  const [advice, setAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cropsData, mandisData] = await Promise.all([
          apiService.getCrops(),
          apiService.getMandis()
        ]);
        setCrops(cropsData);
        setMandis(mandisData);

        const activeCropId = selectedCropId || (cropsData.length > 0 ? cropsData[0].id : '');
        setSelectedCropId(activeCropId);

        if (activeCropId) {
          const vars = await apiService.getVarieties(activeCropId);
          setVarieties(vars);
          if (!selectedVarietyId && vars.length > 0) {
            setSelectedVarietyId(vars[0].id);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load options.');
      }
    }
    loadData();
  }, []);

  const handleCropChange = async (e) => {
    const cId = parseInt(e.target.value);
    setSelectedCropId(cId);
    try {
      const vars = await apiService.getVarieties(cId);
      setVarieties(vars);
      setSelectedVarietyId(vars.length > 0 ? vars[0].id : '');
    } catch {
      setVarieties([]);
    }
  };

  const handleFetchAdvice = async (e) => {
    if (e) e.preventDefault();
    if (!selectedCropId) return;

    setIsLoading(true);
    setError(null);

    const payload = {
      commodity_id: parseInt(selectedCropId),
      variety_id: selectedVarietyId ? parseInt(selectedVarietyId) : null,
      mandi_id: selectedMandiId ? parseInt(selectedMandiId) : null,
      quantity_quintals: parseFloat(quantity),
      holding_period_days: parseInt(holdingDays),
      storage_cost_per_quintal_day: parseFloat(storageCost),
      min_profit_threshold_pct: parseFloat(settings.minProfitThresholdPct || 3.0),
      max_acceptable_price_age_days: parseInt(settings.maxAcceptablePriceAgeDays || 7),
      price_preference: settings.pricePreference || 'modal'
    };

    try {
      const response = await apiService.getSellOrHoldAdvice(payload);
      setAdvice(response);
    } catch (err) {
      setError(err.message || 'Failed to generate advisory.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto trigger if navigated with state
  useEffect(() => {
    if (selectedCropId && crops.length > 0) {
      handleFetchAdvice();
    }
  }, [crops]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="w-7 h-7 text-emerald-600" />
          {t('advisor_title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('advisor_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <form onSubmit={handleFetchAdvice} className="space-y-5">
            <h2 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-emerald-600" />
              Advisory Parameters
            </h2>

            {/* Crop Selector */}
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

            {/* Variety Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('form_variety')}
              </label>
              <select
                value={selectedVarietyId}
                onChange={(e) => setSelectedVarietyId(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Varieties / Average</option>
                {varieties.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Mandi Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target APMC Mandi (Optional)
              </label>
              <select
                value={selectedMandiId}
                onChange={(e) => setSelectedMandiId(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Regional Mandis (Cluster Benchmark)</option>
                {mandis.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.district_name || 'APMC'})</option>
                ))}
              </select>
            </div>

            {/* Harvest Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('form_quantity')}
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Holding Horizon Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('holding_period')} (Days)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 3, 7].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setHoldingDays(d)}
                    className={`text-xs py-2 font-semibold rounded-xl border transition-all text-center ${
                      holdingDays === d
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {d} Day{d > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage cost assumption */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Storage Cost (₹/qtl/day)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={storageCost}
                onChange={(e) => setStorageCost(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Warehouse rent + fumigation + bagging
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-md shadow-emerald-600/20 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <BrainCircuit className="w-5 h-5" />
              <span>Evaluate Sell-or-Hold</span>
            </button>
          </form>
        </div>

        {/* Advisory Output */}
        <div className="lg:col-span-8">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800">
              <LoadingSpinner message="Evaluating historical price momentum, moving averages, and storage costs..." />
            </div>
          ) : advice ? (
            <AdvisoryCard advice={advice} />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                No Advisory Generated Yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Select your crop, holding horizon, and storage costs on the left to generate an explainable recommendation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
