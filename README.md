# Ranjani & Vidurudh Srinivasan — Engagement Invitation

A digital engagement invitation website featuring an interactive **Blessings Wall** with live online persistence. Guest wishes and blessings are stored online and displayed on screen in real time.

---

## Online Storage Options

You can store guest blessings using either of the two methods below:

### Option 1: Google Drive & Google Sheets (Recommended for Free Hosting)
**Zero server cost & viewable right inside your Google Drive on mobile or computer.**

1. Open your Google Drive and create a new Google Sheet named **`RV Engagement Blessings`**.
2. Click **Extensions > Apps Script**, delete any placeholder code, and paste the code from [`google-drive-sheets/Code.gs`](google-drive-sheets/Code.gs).
3. Click **Deploy > New deployment**, select **Web app**:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Copy the deployment URL provided by Google.
5. Open [`config.js`](config.js) and paste the URL into `GOOGLE_SHEETS_SCRIPT_URL`:
   ```javascript
   window.BLESSINGS_CONFIG = {
     GOOGLE_SHEETS_SCRIPT_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
     API_BASE_URL: "/api"
   };
   ```
*See the detailed step-by-step guide in [`google-drive-sheets/README.md`](google-drive-sheets/README.md).*

---

### Option 2: PostgreSQL Relational Database (Self-Hosted Backend)
If you prefer running a dedicated client-server backend:

#### 1. Quick Start with Docker Compose
```bash
# Starts PostgreSQL 16 and the invitation web server
docker compose up -d
```
Visit `http://localhost:3000` to view the website.

#### 2. Local Node.js Setup
```bash
# Install dependencies
npm install

# Copy environment variables and set your PostgreSQL connection
cp .env.example .env

# Run database migrations
npm run migrate

# Start server
npm start
```

---

## Running the Automated Tests

To run the verification test suite:
```bash
npm test
```
The test suite validates:
- Health check and database connectivity
- Empty state rendering
- Blessing submission, validation, and sanitization
- Persistence retrieval and ordering
- Length limits (name up to 120 characters, message up to 2000 characters)
- Static asset serving (`index.html` and `config.js`)

---

## Project Structure
```
├── index.html                   # Engagement invitation single-page website
├── config.js                    # Live storage configuration (Google Drive / API)
├── google-drive-sheets/
│   ├── Code.gs                  # Google Apps Script for Google Drive / Sheets
│   └── README.md                # 2-minute non-technical setup guide
├── src/
│   ├── server.js                # Express web server & REST API
│   ├── db.js                    # PostgreSQL connection pool & query handler
│   └── migrate.js               # Database migration runner
├── migrations/
│   └── 001_create_blessings_table.sql # PostgreSQL schema migration
├── tests/
│   └── blessings.test.js        # Automated test suite
├── docker-compose.yml           # PostgreSQL 16 + Node container setup
├── Dockerfile                   # Production container definition
├── package.json                 # Project configuration and test scripts
└── .env.example                 # Environment configuration template
```
