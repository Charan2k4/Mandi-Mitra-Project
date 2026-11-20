import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  TrendingUp,
  BrainCircuit,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  BarChart3,
  Truck,
  Sparkles,
  Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    mandisCount: 12,
    cropsCount: 10,
    latestDate: 'Today',
    status: 'Operational'
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [mandis, crops] = await Promise.all([
          apiService.getMandis(),
          apiService.getCrops()
        ]);
        setStats(prev => ({
          ...prev,
          mandisCount: mandis.length || 12,
          cropsCount: crops.length || 10,
        }));
      } catch (err) {
        // Fallback to static counters
      }
    }
    loadStats();
  }, []);

  const popularCrops = [
    { id: 1, name: 'Paddy (Dhan)', category: 'Cereals', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200' },
    { id: 2, name: 'Cotton (Kapas)', category: 'Fibres', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200' },
    { id: 3, name: 'Red Chilli (Mirchi)', category: 'Spices', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200' },
    { id: 5, name: 'Soybean', category: 'Oilseeds', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200' },
    { id: 7, name: 'Onion (Pyaz)', category: 'Vegetables', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200' },
    { id: 6, name: 'Wheat (Gehun)', category: 'Cereals', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200' },
  ];

  const handleSelectCrop = (cropId) => {
    navigate('/compare', { state: { preselectedCropId: cropId } });
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-900 text-white p-6 sm:p-10 lg:p-12 shadow-xl overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-semibold backdrop-blur-md border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>AI & Rule-Based Agricultural Decision Support</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {t('hero_title')}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
            {t('hero_subtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-white text-emerald-900 hover:bg-emerald-50 transition-all shadow-md shadow-emerald-950/20 text-sm sm:text-base group"
            >
              <Scale className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              {t('cta_start_comparison')}
              <ArrowRight className="w-4 h-4 text-emerald-600" />
            </Link>

            <Link
              to="/trends"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-emerald-700/60 hover:bg-emerald-700/90 text-white border border-emerald-500/40 transition-colors text-sm sm:text-base"
            >
              <TrendingUp className="w-5 h-5 text-emerald-300" />
              {t('cta_view_trends')}
            </Link>
          </div>
        </div>

        {/* Decorative background circles */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-600/30 blur-2xl pointer-events-none" />
        <div className="absolute right-10 top-10 w-40 h-40 rounded-full bg-green-500/20 blur-xl pointer-events-none" />
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('stat_markets_tracked')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.mandisCount} Mandis
          </div>
          <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">
            Verified APMCs
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('stat_commodities')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.cropsCount} Crops
          </div>
          <span className="text-xs text-blue-600 font-medium mt-1 inline-block">
            Major Agricultural Strains
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('stat_data_source')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Agmarknet
          </div>
          <span className="text-xs text-purple-600 font-medium mt-1 inline-block">
            Official Data Benchmark
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Decision Engine
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Sell-or-Hold
          </div>
          <span className="text-xs text-amber-600 font-medium mt-1 inline-block">
            Transparent Rule-Based
          </span>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">
          {t('how_it_works_title')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t('step1_title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('step1_desc')}
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t('step2_title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('step2_desc')}
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t('step3_title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('step3_desc')}
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold flex items-center justify-center text-sm">
              4
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t('step4_title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('step4_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Compare By Popular Crops */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {t('quick_crops_title')}
          </h2>
          <Link
            to="/compare"
            className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            All Crops <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {popularCrops.map((crop) => (
            <button
              key={crop.id}
              onClick={() => handleSelectCrop(crop.id)}
              className="flex flex-col items-start p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all text-left group"
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mb-2 ${crop.color}`}>
                {crop.category}
              </span>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {crop.name}
              </h3>
              <span className="text-[11px] text-slate-400 mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Compare <ArrowRight className="w-3 h-3 text-emerald-600" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
