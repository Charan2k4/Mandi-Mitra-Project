# Farmer & User Guide — Mandi Mitra

This user guide explains how to use all six pages of Mandi Mitra using simple language and practical examples based on Indian agricultural realities.

---

## 1. Dashboard (`/`)

### Purpose
The Dashboard is the welcoming home screen. It provides a quick overview of tracked markets, supported crops, verified data status, and quick-compare shortcuts for popular commodities.

### What Each Element Does
- **Hero Banner**: Explains the core purpose of Mandi Mitra. Click **"Start Crop Comparison"** to jump directly to the comparison engine.
- **Summary KPI Cards**:
  - *APMC Markets Tracked*: Displays the count of verified regional mandis in the database (e.g., 23 APMCs).
  - *Crops Supported*: Displays the number of available commodities (e.g., 10 major crops).
  - *Data Benchmark*: Shows data source verification (`Agmarknet Verified`).
  - *Decision Engine*: Confirms the rule-based advisory status.
- **How It Works (4-Step Cards)**: Explains the workflow from entering crop details to receiving sell-or-hold advice.
- **Quick Compare by Popular Commodities**: Clickable crop tiles (Paddy, Cotton, Red Chilli, Soybean, Onion, Wheat) that navigate to the comparison form with that crop pre-selected.

---

## 2. Compare Mandis (`/compare`)

### Purpose
This is the core financial comparison tool. It calculates your **real net revenue** after vehicle freight and local handling charges are deducted, ranking mandis from most profitable to least profitable.

### Farmer Input Fields
1. **State & District**: Select your state (e.g., *Telangana*) and district (e.g., *Warangal*).
2. **Auto-detect My Location (GPS)**: Click this button to let your mobile browser detect your GPS coordinates automatically.
3. **Village / Location (Optional)**: Enter your village or farm landmark (e.g., *Atmakur Village*).
4. **Crop & Variety**: Choose your crop (e.g., *Paddy (Dhan)*) and specific variety (e.g., *Sona Masuri*).
5. **Harvest Quantity (Quintals)**: Enter the volume available for sale ($1\text{ quintal} = 100\text{ kg}$). Quick buttons allow selecting 10, 25, 50, or 100 quintals.
6. **Transport Cost (₹ per km)**: Enter your vehicle's rate per kilometre. Guide:
   - Mini-truck / Auto Trolley: ₹15–20/km
   - Tractor Trolley: ₹10–15/km
   - 10-Ton Truck: ₹25–35/km
7. **Other Selling Expenses (₹)**: Enter local loading, unloading, weighing, and market cess fees (e.g., ₹300).
8. **Search Radius**: Select 25 km, 50 km, 100 km, or 200 km.
9. **Price Metric**: Choose Modal (most frequent rate), Minimum, or Maximum price.

### Step-by-Step Practical Example
- **Crop**: Paddy (Dhan), Variety: Sona Masuri
- **Quantity**: 25 quintals ($2,500\text{ kg}$)
- **Farmer Location**: Warangal Rural
- **Transport Rate**: ₹15 per km (Mini-truck)
- **Other Expenses**: ₹300
- **Action**: Click **"Calculate & Compare Mandis"**

### What Result to Expect
The system evaluates all mandis within your chosen radius:
- **Rank #1 (Best Net Profit)**: *Narsampet Mandi*
  - Distance: ~32.6 km (approx straight-line)
  - Market Price: ₹2,470 per quintal
  - Gross Revenue: $25 \times 2,470 = ₹61,750$
  - Transport Deduction: $32.59\text{ km} \times ₹15 = -₹488.85$
  - Other Expenses: $-₹300$
  - **Estimated Net Revenue**: $₹61,750 - ₹488.85 - ₹300 = \mathbf{₹60,961.15}$
  - Net Rate in Hand: **₹2,438.45 per quintal**
- Each mandi card features a **"Get Advisory"** button that transfers your crop details directly to the Sell-or-Hold engine.

---

## 3. Sell-or-Hold Advisor (`/advisor`)

### Purpose
Helps you answer the critical question: *"Should I sell my harvest today, or will waiting 3 to 7 days yield higher profit after covering storage costs?"*

### Farmer Input Fields
1. **Target Crop & Variety**: Select the produce being evaluated.
2. **Target APMC Mandi**: Select a specific mandi or evaluate regional averages.
3. **Quantity (Quintals)**: Volume to calculate total storage costs.
4. **Holding Horizon**: Choose 1 Day, 3 Days (Recommended), or 7 Days.
5. **Storage Cost (₹/qtl/day)**: Daily warehousing, bagging, and fumigation rate (e.g., ₹5/quintal/day).
6. **Action**: Click **"Evaluate Sell-or-Hold"**.

### Outcome Classifications
- **`SELL NOW`** (Green): Current market rates are near recent peaks, or holding costs exceed potential price gains. Lock in profits now.
- **`CONSIDER HOLDING`** (Blue): Produce is currently discounted relative to the 30-day average, 7-day momentum is stabilizing upward, and expected recovery comfortably exceeds storage costs.
- **`CAUTION`** (Yellow): Extreme price swings (volatility $>15\%$) or mixed market signals. High risk of unpredictable price drops.
- **`INSUFFICIENT DATA`** (Gray): Fewer than 3 historical records exist or price quotes are older than 7 days.

---

## 4. Market Trends (`/trends`)

### Purpose
Provides interactive visual price history charts to identify seasonal price cycles.

### How to Use
1. Select your Crop (e.g., *Cotton (Kapas)*) and Variety (e.g., *Medium Staple*).
2. Choose a specific APMC Mandi or view the regional average.
3. Select a time horizon: **7d**, **14d**, **30d**, or **45d**.
4. The chart renders:
   - **Solid Green Line**: Daily Modal Price (most common trading rate).
   - **Dashed Blue Line**: Daily Maximum Price.
   - **Dashed Amber Line**: Daily Minimum Price.
5. Hover over any day on the chart to inspect the exact trading price and arrival volume in tonnes.

---

## 5. Mandi Map (`/map`)

### Purpose
An interactive geographical explorer displaying verified APMC locations across India.

### How to Use
- Click **"Auto-detect My Location"** to place a blue marker at your farm.
- Adjust the radius buttons (50 km, 100 km, 150 km, 200 km) to draw an interactive boundary ring around your location.
- Click on any green mandi pin to view its name, district, contact number, and trading days.
- The highest-profit mandi is highlighted with a distinct gold pin.

---

## 6. Settings (`/settings`)

### Purpose
Allows customizing calculation assumptions and interface language. Settings are stored directly in your browser's local storage and immediately apply to all pages.

### Configurable Preferences
- **Interface Language**: Switch between **English**, **తెలుగు (Telugu)**, and **हिन्दी (Hindi)**.
- **Default Search Radius**: Set default radius (25, 50, 100, or 200 km).
- **Default Price Metric**: Modal, Minimum, or Maximum.
- **Holding Period**: 1, 3, or 7 days.
- **Storage Cost Assumption**: Default ₹ per quintal per day.
- **Min Profit Improvement (%)**: Minimum percentage price rise needed to justify holding.
- **Max Acceptable Price Age (Days)**: Staleness limit (default 7 days).
- **Reset to Defaults**: Restores default values with one click.
