-- Mandi Mitra PostgreSQL Schema
-- Compatible with Supabase PostgreSQL (Standard or Connection Pooler)

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if re-running
DROP TABLE IF EXISTS comparison_logs CASCADE;
DROP TABLE IF EXISTS farmer_preferences CASCADE;
DROP TABLE IF EXISTS market_prices CASCADE;
DROP TABLE IF EXISTS varieties CASCADE;
DROP TABLE IF EXISTS commodities CASCADE;
DROP TABLE IF EXISTS mandis CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS states CASCADE;

-- 1. States
CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Districts
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_state_district UNIQUE (state_id, name)
);

-- 3. Mandis (Agricultural Produce Market Committees - APMCs)
CREATE TABLE mandis (
    id SERIAL PRIMARY KEY,
    district_id INTEGER NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    address TEXT,
    contact_phone VARCHAR(50),
    operating_days VARCHAR(100) DEFAULT 'Mon-Sat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_district_mandi UNIQUE (district_id, name)
);

-- 4. Commodities
CREATE TABLE commodities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- Cereals, Pulses, Oilseeds, Spices, Vegetables, Fibres
    unit VARCHAR(20) DEFAULT 'Quintal',
    shelf_life_days INTEGER DEFAULT 60, -- for perishability assessment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Varieties
CREATE TABLE varieties (
    id SERIAL PRIMARY KEY,
    commodity_id INTEGER NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    grade VARCHAR(50) DEFAULT 'Standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_commodity_variety UNIQUE (commodity_id, name)
);

-- 6. Market Prices (Daily Mandi Price Records)
CREATE TABLE market_prices (
    id SERIAL PRIMARY KEY,
    mandi_id INTEGER NOT NULL REFERENCES mandis(id) ON DELETE CASCADE,
    commodity_id INTEGER NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
    variety_id INTEGER REFERENCES varieties(id) ON DELETE SET NULL,
    price_date DATE NOT NULL,
    min_price DECIMAL(10, 2) NOT NULL,
    max_price DECIMAL(10, 2) NOT NULL,
    modal_price DECIMAL(10, 2) NOT NULL,
    price_unit VARCHAR(30) DEFAULT 'Rs/Quintal',
    arrivals_in_tonnes DECIMAL(10, 2) DEFAULT 0.0,
    data_source VARCHAR(50) DEFAULT 'Agmarknet',
    data_classification VARCHAR(30) DEFAULT 'historical', -- 'live', 'historical', 'sample'
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_mandi_commodity_variety_date UNIQUE (mandi_id, commodity_id, variety_id, price_date)
);

-- 7. Farmer Preferences (Persisted user settings)
CREATE TABLE farmer_preferences (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) UNIQUE,
    default_radius_km INTEGER DEFAULT 100,
    price_preference VARCHAR(20) DEFAULT 'modal', -- 'modal', 'min', 'max'
    language VARCHAR(10) DEFAULT 'en', -- 'en', 'te'
    holding_period_days INTEGER DEFAULT 3,
    min_profit_threshold_pct DECIMAL(5, 2) DEFAULT 3.0,
    max_acceptable_price_age_days INTEGER DEFAULT 7,
    holding_cost_per_quintal_day DECIMAL(10, 2) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Comparison Logs (Anonymous analytics for advisory history)
CREATE TABLE comparison_logs (
    id SERIAL PRIMARY KEY,
    farmer_state VARCHAR(100),
    farmer_district VARCHAR(100),
    farmer_lat DECIMAL(10, 6),
    farmer_lng DECIMAL(10, 6),
    commodity_name VARCHAR(100),
    variety_name VARCHAR(100),
    quantity_quintals DECIMAL(10, 2),
    transport_rate_per_km DECIMAL(10, 2),
    other_expenses DECIMAL(10, 2),
    recommended_mandi_id INTEGER REFERENCES mandis(id),
    estimated_best_net_revenue DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_districts_state_id ON districts(state_id);
CREATE INDEX idx_mandis_district_id ON mandis(district_id);
CREATE INDEX idx_mandis_lat_lng ON mandis(latitude, longitude);
CREATE INDEX idx_varieties_commodity_id ON varieties(commodity_id);
CREATE INDEX idx_market_prices_lookup ON market_prices(commodity_id, variety_id, price_date DESC);
CREATE INDEX idx_market_prices_mandi ON market_prices(mandi_id, commodity_id);
CREATE INDEX idx_market_prices_date ON market_prices(price_date DESC);
