/**
 * Activity Tracker Utility for Mandi Mitra
 * Persists recent farmer analyses (Mandi Comparisons, Sell-or-Hold, Market Trends)
 * in browser localStorage so farmers can easily revisit their decision history.
 */

const STORAGE_KEY = 'mandi_mitra_recent_activity';
const MAX_ACTIVITIES = 10;

/**
 * Retrieve the list of recent activities from localStorage.
 */
export function getRecentActivities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read recent activities from localStorage:', err);
    return [];
  }
}

/**
 * Record a new activity entry into localStorage.
 *
 * @param {Object} activity
 * @param {'compare'|'advisor'|'trends'} activity.type
 * @param {string} activity.title
 * @param {string} activity.cropName
 * @param {string} [activity.varietyName]
 * @param {string} [activity.location]
 * @param {string} activity.summary
 * @param {string} activity.path
 * @param {Object} [activity.state]
 */
export function recordActivity(activity) {
  try {
    const activities = getRecentActivities();
    const newEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...activity
    };

    // Remove duplicates of the same type, crop, and location to keep history clean & relevant
    const filtered = activities.filter((item) => {
      const isSameType = item.type === newEntry.type;
      const isSameCrop = item.cropName === newEntry.cropName;
      const isSameLoc = item.location === newEntry.location;
      return !(isSameType && isSameCrop && isSameLoc);
    });

    const updated = [newEntry, ...filtered].slice(0, MAX_ACTIVITIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event for real-time reactive sync across components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mandi_mitra_activity_updated', { detail: updated }));
    }

    return updated;
  } catch (err) {
    console.error('Failed to save activity to localStorage:', err);
    return [];
  }
}

/**
 * Clear all stored activity history.
 */
export function clearRecentActivities() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mandi_mitra_activity_updated', { detail: [] }));
    }
  } catch (err) {
    console.error('Failed to clear activities:', err);
  }
}
