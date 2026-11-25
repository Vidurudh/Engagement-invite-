# Google Drive & Sheets Setup Guide for Blessings

This guide shows you how to connect your Google Drive to the **Ranjani & Vidurudh Srinivasan Engagement Invitation** so all guest blessings are stored directly in your personal Google Sheet and appear on screen in real time.

---

## Step 1: Create a Google Sheet in Google Drive
1. Open [Google Drive](https://drive.google.com/) and sign in with your Google Account.
2. Click **+ New** in the top-left and select **Google Sheets**.
3. Name the spreadsheet at the top: `RV Engagement Blessings`.

---

## Step 2: Add the Apps Script Code
1. In your new Google Sheet, click **Extensions** in the top menu and select **Apps Script**.
2. An editor tab will open with an empty `myFunction()`. Delete everything inside the editor.
3. Open the file [`Code.gs`](file:///home/kannan/Downloads/RV/google-drive-sheets/Code.gs) from this folder, copy all the code, and paste it into the Apps Script editor.
4. Click the **Save** icon (disk symbol) or press `Ctrl + S` / `Cmd + S`.

---

## Step 3: Deploy as a Web App
1. In the top-right corner of the Apps Script editor, click the blue **Deploy** button and choose **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `RV Blessings Live API`
   - **Execute as**: `Me (your email address)`
   - **Who has access**: `Anyone` *(Note: This allows wedding guests to submit wishes without needing a Google login)*.
4. Click **Deploy**.
5. Google will ask you to authorize access:
   - Click **Authorize access**.
   - Select your Google account.
   - If you see a *"Google hasn't verified this app"* screen, click **Advanced** at the bottom-left and then click **Go to Untitled project (unsafe)**.
   - Click **Allow**.
6. Google will display your **Web app URL** (starts with `https://script.google.com/macros/s/...`).
7. Click **Copy** to copy this URL.

---

## Step 4: Paste Your URL into the Invitation
1. Open [`config.js`](file:///home/kannan/Downloads/RV/config.js) in your project.
2. Paste your copied Web App URL into the `GOOGLE_SHEETS_SCRIPT_URL` field:
   ```javascript
   window.BLESSINGS_CONFIG = {
     GOOGLE_SHEETS_SCRIPT_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
     API_BASE_URL: "/api"
   };
   ```
3. Save the file.

---

## How It Works
- **When a guest submits a wish:** The blessing is instantly added as a new row in your Google Sheet with the date and time, guest name, and message.
- **When anyone views the page:** The website automatically retrieves all blessings from your Google Sheet and displays them on the Blessings Wall.
- **You own the data:** You can open your Google Drive on your mobile phone or computer anytime to view, read, or print all the blessings received!
