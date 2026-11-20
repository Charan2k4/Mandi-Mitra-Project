import React from 'react';
import { Sprout, ShieldCheck, Database, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-slate-900 dark:text-white text-base">
                {t('app_name')}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('tagline')}. Built for Indian farmers to calculate realistic net revenue factoring vehicle freight and market charges.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Database className="w-4 h-4 text-emerald-600" />
              Data Source & Provenance
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Price data sourced from official Agmarknet / Data.gov.in resources and verified APMC market records. Prices are updated daily with clear timestamps.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Non-Speculative Advisory
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Recommendations are informational decision support tools based on historical moving averages and storage expenses. They do not guarantee future spot market rates.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Mandi Mitra. Designed for Farmer Empowerment.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Distances shown are approximate straight-line estimates.
          </p>
        </div>
      </div>
    </footer>
  );
}
