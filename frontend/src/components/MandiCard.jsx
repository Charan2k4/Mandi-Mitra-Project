import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, TrendingUp, IndianRupee, ArrowRight, AlertCircle, Calendar } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';
import AlertBadge from './AlertBadge';
import { useLanguage } from '../context/LanguageContext';
import ModalPriceTooltip from './ModalPriceTooltip';

export default function MandiCard({ result, commodityId, varietyId, quantityQuintals }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleGetAdvice = () => {
    navigate('/advisor', {
      state: {
        commodityId,
        varietyId,
        mandiId: result.mandi_id,
        mandiName: result.mandi_name,
        quantity: quantityQuintals
      }
    });
  };

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 p-5 ${
        result.is_recommended
          ? 'bg-gradient-to-b from-emerald-50/70 to-white dark:from-emerald-950/30 dark:to-slate-900 border-emerald-400 dark:border-emerald-600 shadow-md ring-2 ring-emerald-400/30'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-sm'
      }`}
    >
      {/* Top Banner for Best Choice */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center border border-slate-300 dark:border-slate-700">
            #{result.rank}
          </span>
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
            {result.mandi_name}
          </h3>
        </div>

        {result.is_recommended && (
          <AlertBadge type="BEST" label={t('results_best_badge')} size="sm" />
        )}
      </div>

      {/* Location and Distance */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          {result.district}, {result.state}
        </span>
        <span className="flex items-center gap-1">
          <Navigation className="w-3.5 h-3.5 text-blue-500" />
          {result.distance_km !== null ? `${formatNumber(result.distance_km, 1)} km (approx)` : 'Distance N/A'}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatDate(result.price_date)}
        </span>
        {result.is_stale && (
          <AlertBadge type="STALE" label={t('stale_price_warning')} />
        )}
        {result.data_classification === 'live' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Mandi Rate
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Benchmark Estimate
          </span>
        )}
      </div>

      {/* Financial Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 mb-4">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">Modal Price</span>
            <ModalPriceTooltip />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-sm">
            {formatCurrency(result.price_per_quintal)}/qtl
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-500 block">Gross Revenue</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
            {formatCurrency(result.gross_revenue)}
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-500 block">Transport Cost</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400 text-sm">
            -{formatCurrency(result.transportation_cost)}
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-500 block">Other Expenses</span>
          <span className="font-semibold text-slate-600 dark:text-slate-400 text-sm">
            -{formatCurrency(result.other_expenses)}
          </span>
        </div>
      </div>

      {/* Bottom Summary & CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs text-slate-500 block">{t('col_net')}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(result.net_revenue)}
            </span>
            <span className="text-xs font-medium text-slate-500">
              ({formatCurrency(result.net_rate_per_quintal)}/qtl net)
            </span>
          </div>
        </div>

        <button
          onClick={handleGetAdvice}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
        >
          <TrendingUp className="w-4 h-4" />
          {t('btn_get_advice')}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
