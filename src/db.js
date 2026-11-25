const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let currentPool = null;

function getPool() {
  if (!currentPool) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rv_blessings';
    currentPool = new Pool({
      connectionString,
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return currentPool;
}

function setPool(pool) {
  currentPool = pool;
}

async function query(text, params) {
  const p = getPool();
  return p.query(text, params);
}

async function runMigrations(customPool = null) {
  const p = customPool || getPool();
  const migrationPath = path.join(__dirname, '..', 'migrations', '001_create_blessings_table.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  await p.query(sql);
}

module.exports = {
  getPool,
  setPool,
  query,
  runMigrations,
};
