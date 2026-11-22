import React, { useState } from 'react';
import { Settings as SettingsIcon, Languages, Check, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { settings, updateSettings, resetSettings } = useSettings();

  const [formData, setFormData] = useState({
    searchRadiusKm: settings.searchRadiusKm,
    pricePreference: settings.pricePreference,
    holdingPeriodDays: settings.holdingPeriodDays,
    storageCostPerQtlDay: settings.storageCostPerQtlDay,
    minProfitThresholdPct: settings.minProfitThresholdPct,
    maxAcceptablePriceAgeDays: settings.maxAcceptablePriceAgeDays,
  });

  const [showSavedNotification, setShowSavedNotification] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({
      searchRadiusKm: parseInt(formData.searchRadiusKm),
      pricePreference: formData.pricePreference,
      holdingPeriodDays: parseInt(formData.holdingPeriodDays),
      storageCostPerQtlDay: parseFloat(formData.storageCostPerQtlDay),
      minProfitThresholdPct: parseFloat(formData.minProfitThresholdPct),
      maxAcceptablePriceAgeDays: parseInt(formData.maxAcceptablePriceAgeDays),
    });
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 3000);
  };

  const handleReset = () => {
    resetSettings();
    setFormData({
      searchRadiusKm: 100,
      pricePreference: 'modal',
      holdingPeriodDays: 3,
      storageCostPerQtlDay: 5.0,
      minProfitThresholdPct: 3.0,
      maxAcceptablePriceAgeDays: 7,
    });
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-emerald-600" />
          {t('settings_title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('settings_subtitle')}
        </p>
      </div>

      {showSavedNotification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>{t('settings_saved')}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Language Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            {t('settings_language')}
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all text-center ${
                language === 'en'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('te')}
              className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all text-center ${
                language === 'te'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              తెలుగు (Telugu)
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all text-center ${
                language === 'hi'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>
        </div>

        {/* Calculation Parameters */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Mandi Calculation Assumptions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('settings_radius')} (km)
              </label>
              <select
                value={formData.searchRadiusKm}
                onChange={(e) => setFormData({ ...formData, searchRadiusKm: e.target.value })}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km (Default)</option>
                <option value={200}>200 km</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('settings_price_pref')}
              </label>
              <select
                value={formData.pricePreference}
                onChange={(e) => setFormData({ ...formData, pricePreference: e.target.value })}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="modal">Modal Price (Most Frequent)</option>
                <option value="min">Minimum Price</option>
                <option value="max">Maximum Price</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('settings_holding_days')}
              </label>
              <select
                value={formData.holdingPeriodDays}
                onChange={(e) => setFormData({ ...formData, holdingPeriodDays: e.target.value })}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value={1}>1 Day</option>
                <option value={3}>3 Days (Recommended)</option>
                <option value={7}>7 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('settings_storage_cost')}
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.storageCostPerQtlDay}
                onChange={(e) => setFormData({ ...formData, storageCostPerQtlDay: e.target.value })}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('settings_profit_threshold')}
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.minProfitThresholdPct}
                onChange={(e) => setFormData({ ...formData, minProfitThresholdPct: e.target.value })}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('settings_max_price_age')}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.maxAcceptablePriceAgeDays}
                onChange={(e) => setFormData({ ...formData, maxAcceptablePriceAgeDays: e.target.value })}
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('btn_reset_defaults')}
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-md shadow-emerald-600/20 text-sm"
          >
            <Check className="w-4 h-4" />
            {t('btn_save_settings')}
          </button>
        </div>
      </form>
    </div>
  );
}
