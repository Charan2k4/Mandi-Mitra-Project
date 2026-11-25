import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

/**
 * ModalPriceTooltip
 * Provides an accessible, responsive tooltip explaining "Modal Price" to farmers and users.
 * Supports hover on desktop and tap/click on mobile devices, with click-outside dismissal.
 */
export default function ModalPriceTooltip({ className = '', iconClassName = 'w-3.5 h-3.5' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const explanationText = "The most commonly reported market price for this crop in the selected mandi. It helps farmers estimate their potential selling revenue.";

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const toggleTooltip = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex items-center align-middle ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={toggleTooltip}
        aria-label="Modal Price Explanation"
        title={explanationText}
        className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none transition-colors p-0.5 rounded cursor-pointer"
      >
        <Info className={iconClassName} />
      </button>

      {isOpen && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 sm:w-72 p-3 text-xs font-normal leading-relaxed text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 pointer-events-auto"
        >
          <span className="font-semibold block mb-1 text-emerald-600 dark:text-emerald-400">
            Modal Price
          </span>
          {explanationText}
          {/* Tooltip triangle arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white dark:border-t-slate-800" />
        </span>
      )}
    </span>
  );
}
