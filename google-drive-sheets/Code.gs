/**
 * Google Apps Script for Ranjani & Vidurudh Srinivasan Engagement Invitation
 * 
 * This script turns any Google Sheet in your Google Drive into a live, free,
 * cloud database for guest blessings and wishes.
 *
 * It provides two endpoints:
 * 1. doGet: Returns all stored blessings as JSON so they appear on the invitation screen.
 * 2. doPost: Saves new blessings submitted by guests directly into your Google Sheet.
 */

const SHEET_NAME = 'Blessings';

/**
 * Returns or initializes the Blessings sheet with proper headers.
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Add header row
    const headers = ['Timestamp', 'Guest Name', 'Blessing / Message'];
    sheet.appendRow(headers);
    
    // Style headers
    const headerRange = sheet.getRange(1, 1, 1, 3);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#fbf5e8');
    headerRange.setFontColor('#5c1620');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 180);
    sheet.setColumnWidth(2, 220);
    sheet.setColumnWidth(3, 500);
  }
  
  return sheet;
}

/**
 * Handle GET requests: Fetch all blessings for the website.
 */
function doGet(e) {
  try {
    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow();
    
    const blessings = [];
    
    if (lastRow > 1) {
      // Rows 2 to lastRow
      const values = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
      
      for (let i = 0; i < values.length; i++) {
        const rawDate = values[i][0];
        const name = values[i][1];
        const note = values[i][2];
        
        if (name && note) {
          blessings.push({
            id: i + 1,
            name: String(name).trim(),
            note: String(note).trim(),
            created_at: rawDate instanceof Date ? rawDate.toISOString() : String(rawDate)
          });
        }
      }
    }
    
    // Return newest blessings first
    blessings.reverse();
    
    const output = JSON.stringify({
      success: true,
      count: blessings.length,
      blessings: blessings
    });
    
    return ContentService.createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    const errorOutput = JSON.stringify({
      success: false,
      error: error.message || 'Failed to retrieve blessings',
      blessings: []
    });
    
    return ContentService.createTextOutput(errorOutput)
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests: Save a new blessing from the website.
 */
function doPost(e) {
  try {
    const sheet = getOrCreateSheet();
    let name = '';
    let note = '';
    
    // Check if body was sent as JSON or form data
    if (e.postData && e.postData.contents) {
      try {
        const data = JSON.parse(e.postData.contents);
        name = data.name;
        note = data.note;
      } catch (parseErr) {
        // Fallback to URL-encoded parameters
        name = e.parameter.name;
        note = e.parameter.note;
      }
    } else if (e.parameter) {
      name = e.parameter.name;
      note = e.parameter.note;
    }
    
    name = (name || '').trim();
    note = (note || '').trim();
    
    if (!name) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Please provide your name.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (!note) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Please provide your blessing message.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const timestamp = new Date();
    sheet.appendRow([timestamp, name, note]);
    
    const output = JSON.stringify({
      success: true,
      message: 'Blessing saved to Google Drive successfully.',
      blessing: {
        id: sheet.getLastRow() - 1,
        name: name,
        note: note,
        created_at: timestamp.toISOString()
      }
    });
    
    return ContentService.createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    const errorOutput = JSON.stringify({
      success: false,
      error: error.message || 'Failed to save blessing'
    });
    
    return ContentService.createTextOutput(errorOutput)
      .setMimeType(ContentService.MimeType.JSON);
  }
}
