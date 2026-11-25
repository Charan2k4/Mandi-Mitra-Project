import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  AlertOctagon
} from 'lucide-react';
import AlertBadge from './AlertBadge';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

export default function AdvisoryCard({ advice }) {
  const { t } = useLanguage();

  if (!advice) return null;

  const getOutcomeTheme = () => {
    switch (advice.recommendation) {
      case 'SELL NOW':
        return {
          border: 'border-emerald-400 dark:border-emerald-600',
          bg: 'from-emerald-500/10 to-transparent',
          accent: 'text-emerald-700 dark:text-emerald-400',
        };
      case 'CONSIDER HOLDING':
        return {
          border: 'border-blue-400 dark:border-blue-600',
          bg: 'from-blue-500/10 to-transparent',
          accent: 'text-blue-700 dark:text-blue-400',
        };
      case 'CAUTION':
        return {
          border: 'border-amber-400 dark:border-amber-600',
          bg: 'from-amber-500/10 to-transparent',
          accent: 'text-amber-700 dark:text-amber-400',
        };
      default:
        return {
          border: 'border-slate-300 dark:border-slate-700',
          bg: 'from-slate-500/10 to-transparent',
          accent: 'text-slate-700 dark:text-slate-300',
        };
    }
  };

  const theme = getOutcomeTheme();

  return (
    <div className={`rounded-2xl border-2 ${theme.border} bg-white dark:bg-slate-900 shadow-lg overflow-hidden`}>
      {/* Top Advisory Banner */}
      <div className={`p-6 bg-gradient-to-b ${theme.bg} border-b border-slate-100 dark:border-slate-800`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <AlertBadge type={advice.recommendation} size="lg" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {advice.commodity_name} {advice.variety_name ? `(${advice.variety_name})` : ''}
            </span>
          </div>
        </div>

        <p className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 leading-snug">
          {advice.summary}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
        <div className="p-4">
          <span className="text-xs text-slate-500 block">{t('metrics_current_price')}</span>
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {advice.current_price ? `${formatCurrency(advice.current_price)}/qtl` : 'N/A'}
          </span>
          {advice.price_age_days !== null && (
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {advice.price_age_days} days ago
            </span>
          )}
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-500 block">{t('metrics_7d_avg')}</span>
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {advice.avg_price_7d ? `${formatCurrency(advice.avg_price_7d)}/qtl` : 'N/A'}
          </span>
          {advice.price_change_7d_pct !== null && (
            <span className={`text-[11px] font-semibold flex items-center gap-0.5 mt-0.5 ${
              advice.price_change_7d_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {advice.price_change_7d_pct >= 0 ? '+' : ''}{advice.price_change_7d_pct}% (7d)
            </span>
          )}
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-500 block">{t('metrics_30d_avg')}</span>
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {advice.avg_price_30d ? `${formatCurrency(advice.avg_price_30d)}/qtl` : 'N/A'}
          </span>
          {advice.price_volatility_pct !== null && (
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Volatility: {advice.price_volatility_pct}%
            </span>
          )}
        </div>

        <div className="p-4">
          <span className="text-xs text-slate-500 block">{t('holding_cost_label')}</span>
          <span className="text-base font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(advice.estimated_holding_cost)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Based on chosen storage rate
          </span>
        </div>
      </div>

      {/* Reasons and Risks */}
      <div className="p-6 space-y-6">
        {/* Reasons */}
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            {t('reasons_title')}
          </h4>
          <ul className="space-y-1.5 pl-5 list-disc text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {advice.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        {advice.risks_and_uncertainties && advice.risks_and_uncertainties.length > 0 && (
          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4">
            <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-xs sm:text-sm mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              {t('risks_title')}
            </h4>
            <ul className="space-y-1 pl-4 list-disc text-xs text-amber-800 dark:text-amber-300/90">
              {advice.risks_and_uncertainties.map((risk, i) => (
                <li key={i}>{risk}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 leading-relaxed">
          {advice.disclaimer}
        </div>
      </div>
    </div>
  );
}
