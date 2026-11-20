import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ComparePage from './pages/ComparePage';
import SellOrHoldPage from './pages/SellOrHoldPage';
import MarketTrendsPage from './pages/MarketTrendsPage';
import MandiMapPage from './pages/MandiMapPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <LanguageProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="advisor" element={<SellOrHoldPage />} />
              <Route path="trends" element={<MarketTrendsPage />} />
              <Route path="map" element={<MandiMapPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </LanguageProvider>
  );
}
