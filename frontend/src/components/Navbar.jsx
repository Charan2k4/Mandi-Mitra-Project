import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sprout,
  Scale,
  TrendingUp,
  BrainCircuit,
  MapPin,
  Settings as SettingsIcon,
  Languages,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { settings, updateSettings } = useSettings();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t('nav_dashboard'), icon: Sprout },
    { to: '/compare', label: t('nav_compare'), icon: Scale },
    { to: '/advisor', label: t('nav_advisor'), icon: BrainCircuit },
    { to: '/trends', label: t('nav_trends'), icon: TrendingUp },
    { to: '/map', label: t('nav_map'), icon: MapPin },
    { to: '/settings', label: t('nav_settings'), icon: SettingsIcon },
  ];

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-emerald-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-800 to-green-700 dark:from-emerald-400 dark:to-green-300 bg-clip-text text-transparent">
                {t('app_name')}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {t('tagline')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions (Compact Language Dropdown & Theme) */}
          <div className="flex items-center gap-2 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-slate-200 dark:border-slate-800 shrink-0">
            {/* User-Friendly Compact Language Dropdown */}
            <div className="relative inline-flex items-center">
              <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 absolute left-2 pointer-events-none" />
              <select
                id="header-language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Select Language"
                className="w-[96px] pl-6 pr-5 py-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-sm transition-colors appearance-none"
              >
                <option value="en" className="dark:bg-slate-800 text-slate-900 dark:text-white">English</option>
                <option value="te" className="dark:bg-slate-800 text-slate-900 dark:text-white">తెలుగు</option>
                <option value="hi" className="dark:bg-slate-800 text-slate-900 dark:text-white">हिन्दी</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 pointer-events-none absolute right-1.5" />
            </div>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('settings_language')}</span>
            <div className="relative inline-flex items-center">
              <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 absolute left-2 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-[96px] pl-6 pr-5 py-1 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-sm transition-colors appearance-none"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు</option>
                <option value="hi">हिन्दी</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 pointer-events-none absolute right-1.5" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}