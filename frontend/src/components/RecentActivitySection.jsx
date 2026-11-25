import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Scale,
  BrainCircuit,
  TrendingUp,
  MapPin,
  ArrowRight,
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getRecentActivities, clearRecentActivities } from '../utils/activityTracker';
import { formatRelativeTime, formatDate } from '../utils/formatters';

export default function RecentActivitySection() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Load initial activity list
    setActivities(getRecentActivities());

    // Listen to real-time sync updates
    const handleSync = (e) => {
      setActivities(e.detail || getRecentActivities());
    };

    window.addEventListener('mandi_mitra_activity_updated', handleSync);
    return () => {
      window.removeEventListener('mandi_mitra_activity_updated', handleSync);
    };
  }, []);

  const handleRevisit = (item) => {
    if (!item?.path) return;
    navigate(item.path, { state: item.state });
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearRecentActivities();
    setActivities([]);
  };

  const getActivityBadge = (type) => {
    switch (type) {
      case 'compare':
        return {
          icon: <Scale className="w-3.5 h-3.5 text-emerald-600" />,
          label: t('nav_compare') || 'Mandi Comparison',
          style: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        };
      case 'advisor':
        return {
          icon: <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />,
          label: t('nav_advisor') || 'Sell-or-Hold',
          style: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        };
      case 'trends':
        return {
          icon: <TrendingUp className="w-3.5 h-3.5 text-purple-600" />,
          label: t('nav_trends') || 'Market Trends',
          style: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
        };
      default:
        return {
          icon: <History className="w-3.5 h-3.5 text-slate-500" />,
          label: 'Analysis',
          style: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
        };
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            <span>{t('recent_activity_title') || 'Recent Activity'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('recent_activity_subtitle') || 'Revisit your recent mandi comparisons, market trends, and Sell-or-Hold evaluations.'}
          </p>
        </div>

        {activities.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-200"
            title="Clear all recent searches"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('recent_activity_clear') || 'Clear History'}</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      {activities.length === 0 ? (
        /* Empty State */
        <div className="py-12 px-6 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              No recent activity yet. Your mandi comparisons, market trends and Sell-or-Hold analyses will appear here.
            </p>
            <p className="text-[11px] text-slate-400">
              Start by comparing mandi prices or checking price trends for your harvest.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/compare')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{t('cta_start_comparison') || 'Start Crop Comparison'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/trends')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('cta_view_trends') || 'Explore Market Trends'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Activity Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((item) => {
            const badge = getActivityBadge(item.type);
            return (
              <div
                key={item.id}
                onClick={() => handleRevisit(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRevisit(item);
                  }
                }}
                role="button"
                tabIndex={0}
                className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <div>
                  {/* Top: Type Badge & Relative Time */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.style}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                    <span
                      className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1"
                      title={formatDate(item.timestamp)}
                    >
                      <Calendar className="w-3 h-3" />
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>

                  {/* Crop & Variety Title */}
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {item.cropName}
                    {item.varietyName && (
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">
                        ({item.varietyName})
                      </span>
                    )}
                  </h4>

                  {/* Location or Mandi */}
                  {item.location && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}
                </div>

                {/* Bottom: Result Summary & CTA */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md truncate max-w-[65%]">
                    {item.summary}
                  </span>

                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
                    <span>{t('revisit_analysis') || 'Revisit'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
