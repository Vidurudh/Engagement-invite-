const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { query, runMigrations } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and utility middleware
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..')));

// Helper to escape simple HTML characters to prevent XSS
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const result = await query('SELECT 1 as connected');
    if (result && result.rows && result.rows[0].connected === 1) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = 'disconnected';
  }

  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// GET /api/blessings - Retrieve all blessings
app.get('/api/blessings', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, note, created_at FROM blessings ORDER BY created_at DESC'
    );
    res.json({
      success: true,
      count: result.rows.length,
      blessings: result.rows,
    });
  } catch (error) {
    console.error('Error fetching blessings:', error.message);
    res.status(500).json({
      success: false,
      error: 'Unable to retrieve blessings at this moment. Please try again shortly.',
      blessings: [],
    });
  }
});

// POST /api/blessings - Submit a new blessing
app.post('/api/blessings', async (req, res) => {
  try {
    const { name, note } = req.body;

    // Validation
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanNote = typeof note === 'string' ? note.trim() : '';

    if (!cleanName || cleanName.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your name.',
      });
    }

    if (cleanName.length > 120) {
      return res.status(400).json({
        success: false,
        error: 'Name cannot exceed 120 characters.',
      });
    }

    if (!cleanNote || cleanNote.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your blessing or wish.',
      });
    }

    if (cleanNote.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Blessing message cannot exceed 2000 characters.',
      });
    }

    const sanitizedName = sanitizeText(cleanName);
    const sanitizedNote = sanitizeText(cleanNote);

    const result = await query(
      'INSERT INTO blessings (name, note) VALUES ($1, $2) RETURNING id, name, note, created_at',
      [sanitizedName, sanitizedNote]
    );

    const createdBlessing = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Thank you for your warm blessing!',
      blessing: createdBlessing,
    });
  } catch (error) {
    console.error('Error saving blessing:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Unable to save your blessing at this moment. Please try again shortly.',
    });
  }
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'A temporary error occurred on the server.',
  });
});

// Start server function
async function startServer(port = PORT) {
  try {
    // Attempt auto-migration if database is available
    await runMigrations().catch((err) => {
      console.warn('Note: Auto-migration skipped or waiting for database connection:', err.message);
    });
  } catch (e) {
    // DB might connect later
  }

  return app.listen(port, () => {
    console.log(`RV Engagement Invitation Server running at http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
