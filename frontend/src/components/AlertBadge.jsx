import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, HelpCircle, Trophy } from 'lucide-react';

export default function AlertBadge({ type, label, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs sm:text-sm px-2.5 py-1',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 font-bold',
  }[size];

  switch (type) {
    case 'SELL NOW':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700 ${sizeClasses}`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {label || 'SELL NOW'}
        </span>
      );

    case 'CONSIDER HOLDING':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700 ${sizeClasses}`}>
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          {label || 'CONSIDER HOLDING'}
        </span>
      );

    case 'CAUTION':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700 ${sizeClasses}`}>
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          {label || 'CAUTION'}
        </span>
      );

    case 'INSUFFICIENT DATA':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 ${sizeClasses}`}>
          <HelpCircle className="w-4 h-4 text-slate-500" />
          {label || 'INSUFFICIENT DATA'}
        </span>
      );

    case 'BEST':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-extrabold bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 shadow-sm ${sizeClasses}`}>
          <Trophy className="w-4 h-4 fill-slate-900 text-slate-900" />
          {label || '#1 BEST NET PROFIT'}
        </span>
      );

    case 'STALE':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 text-xs px-2 py-0.5`}>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          {label || 'Stale Price (>7d)'}
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-800 text-xs px-2.5 py-1`}>
          {label}
        </span>
      );
  }
}
