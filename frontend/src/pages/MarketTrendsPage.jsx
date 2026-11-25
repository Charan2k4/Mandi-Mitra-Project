import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  TrendingUp,
  Calendar,
  Layers,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import ModalPriceTooltip from '../components/ModalPriceTooltip';
import { recordActivity } from '../utils/activityTracker';

export default function MarketTrendsPage() {
  const { t } = useLanguage();
  const location = useLocation();

  const [crops, setCrops] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [mandis, setMandis] = useState([]);

  const [selectedCropId, setSelectedCropId] = useState('');
  const [selectedVarietyId, setSelectedVarietyId] = useState('');
  const [selectedMandiId, setSelectedMandiId] = useState('');
  const [days, setDays] = useState(30);

  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const [cropsData, mandisData] = await Promise.all([
          apiService.getCrops(),
          apiService.getMandis()
        ]);
        setCrops(cropsData);
        setMandis(mandisData);

        if (cropsData.length > 0) {
          const initCropId = location.state?.commodityId || cropsData[0].id;
          setSelectedCropId(initCropId);
          const vars = await apiService.getVarieties(initCropId);
          setVarieties(vars);
          setSelectedVarietyId(location.state?.varietyId || '');
          if (location.state?.mandiId) {
            setSelectedMandiId(location.state.mandiId);
          }
          if (location.state?.days) {
            setDays(location.state.days);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize market trends options.');
      }
    }
    init();
  }, []);

  const handleCropChange = async (e) => {
    const cId = parseInt(e.target.value);
    setSelectedCropId(cId);
    try {
      const vars = await apiService.getVarieties(cId);
      setVarieties(vars);
      setSelectedVarietyId(''); // Reset to All Varieties
    } catch {
      setVarieties([]);
      setSelectedVarietyId('');
    }
  };

  useEffect(() => {
    if (!selectedCropId) return;

    async function fetchHistory() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiService.getPriceHistory(
          selectedCropId,
          selectedVarietyId || null,
          selectedMandiId || null,
          days
        );
        setHistoryData(res);

        // Record activity if history returned
        if (res?.history?.length > 0) {
          const cropObj = crops.find((c) => c.id === parseInt(selectedCropId));
          const varietyObj = varieties.find((v) => v.id === parseInt(selectedVarietyId));
          const mandiObj = mandis.find((m) => m.id === parseInt(selectedMandiId));
          const pts = res.history;
          const latestPt = pts[pts.length - 1];

          recordActivity({
            type: 'trends',
            title: 'Market Trends',
            cropName: cropObj?.name || 'Crop',
            varietyName: varietyObj?.name || '',
            location: mandiObj ? `${mandiObj.name}` : 'All Regional APMCs',
            summary: latestPt ? `Latest: ${formatCurrency(latestPt.modal_price)}/qtl (${days}d)` : `${days}-Day History`,
            path: '/trends',
            state: {
              commodityId: parseInt(selectedCropId),
              varietyId: selectedVarietyId ? parseInt(selectedVarietyId) : '',
              mandiId: selectedMandiId ? parseInt(selectedMandiId) : '',
              days: parseInt(days)
            }
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch price history records.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, [selectedCropId, selectedVarietyId, selectedMandiId, days]);

  // Summary stats from points
  const points = historyData?.history || [];
  const modalPrices = points.map(p => p.modal_price);
  const maxPrice = modalPrices.length > 0 ? Math.max(...modalPrices) : 0;
  const minPrice = modalPrices.length > 0 ? Math.min(...modalPrices) : 0;
  const avgPrice = modalPrices.length > 0 ? (modalPrices.reduce((a, b) => a + b, 0) / modalPrices.length) : 0;
  const latestPoint = points.length > 0 ? points[points.length - 1] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-emerald-600" />
          {t('trends_title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('trends_subtitle')}
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <option value="">All Varieties</option>
              {varieties.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              APMC Mandi
            </label>
            <select
              value={selectedMandiId}
              onChange={(e) => setSelectedMandiId(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Regional Average (All Mandis)</option>
              {mandis.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('select_time_range')}
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {[7, 14, 30, 45].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`py-2 rounded-xl font-medium border text-center transition-colors ${
                    days === d
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 block">Latest Modal Price</span>
            <ModalPriceTooltip />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
            {latestPoint ? formatCurrency(latestPoint.modal_price) : 'N/A'}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {latestPoint ? formatDate(latestPoint.price_date) : ''}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 block">{days}-Day High</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(maxPrice)}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
            Peak benchmark
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 block">{days}-Day Low</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(minPrice)}
          </span>
          <span className="text-[11px] text-rose-500 font-semibold block mt-0.5">
            Floor benchmark
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 block">{days}-Day Average</span>
          <span className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            {formatCurrency(avgPrice)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Mean baseline
          </span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Daily Price Movement (₹ / Quintal)
            </h3>
            <p className="text-xs text-slate-400">
              Showing modal, min, and max price spreads.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-emerald-600" /> Modal
              <ModalPriceTooltip iconClassName="w-3 h-3" />
            </span>
            <span className="inline-block w-3 h-3 rounded-full bg-blue-400" /> Max
            <span className="inline-block w-3 h-3 rounded-full bg-amber-400" /> Min
          </div>
        </div>

        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <LoadingSpinner message="Loading historical market trends..." />
          </div>
        ) : points.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-sm text-slate-500">
            No historical price records found for this crop / market filter.
          </div>
        ) : (
          <div className="h-80 sm:h-96 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="price_date"
                  tickFormatter={(val) => val.slice(5)} // MM-DD
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `₹${val}`}
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                />
                <Tooltip
                  formatter={(value, name) => [`₹${value}/qtl`, name === 'modal_price' ? 'Modal Price' : name === 'max_price' ? 'Max Price' : 'Min Price']}
                  labelFormatter={(lbl) => formatDate(lbl)}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="modal_price"
                  name="Modal Price"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="max_price"
                  name="Max Price"
                  stroke="#60a5fa"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="min_price"
                  name="Min Price"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Source: {historyData?.data_source || 'Agmarknet Benchmark Data'}</span>
          <span>Last Updated: {historyData?.latest_date ? formatDate(historyData.latest_date) : 'Today'}</span>
        </div>
      </div>
    </div>
  );
}
