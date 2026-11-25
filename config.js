/**
 * Ranjani & Vidurudh Srinivasan — Engagement Invitation Configuration
 *
 * This configuration connects the Blessings Wall to:
 * Option 1: Google Drive / Google Sheets (Active)
 */
window.BLESSINGS_CONFIG = {
  // Google Apps Script Web App URL connected to your Google Drive Sheet
  GOOGLE_SHEETS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbz3kRw7TGqip54pyRUGl_W4JoWe9Rc5Joo_FzpluuisgYTZ1pdpjExnaJdmm1YOizS6ZQ/exec",

  // Local or hosted backend API endpoint (fallback)
  API_BASE_URL: "/api",

  // Auto-refresh blessings interval in milliseconds (30 seconds)
  POLL_INTERVAL_MS: 30000
};
