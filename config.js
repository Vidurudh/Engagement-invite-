/**
 * Ranjani & Vidurudh Srinivasan — Engagement Invitation Configuration
 *
 * This configuration allows you to connect the Blessings Wall to:
 * 1. Google Drive / Google Sheets (zero server maintenance, free, viewable in Google Drive)
 * 2. PostgreSQL / Node Server API (full relational database backend)
 */
window.BLESSINGS_CONFIG = {
  // Option 1: Google Apps Script Web App URL (from your Google Drive sheet)
  // Example: "https://script.google.com/macros/s/AKfycbx.../exec"
  // Refer to google-drive-sheets/README.md for the step-by-step setup guide.
  GOOGLE_SHEETS_SCRIPT_URL: "",

  // Option 2: Backend API endpoint (used when running the Node.js + PostgreSQL server)
  API_BASE_URL: "/api",

  // Auto-refresh blessings interval in milliseconds (30 seconds)
  POLL_INTERVAL_MS: 30000
};
