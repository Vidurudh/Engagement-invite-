const { runMigrations, getPool } = require('./db');

async function migrate() {
  console.log('Running database migrations...');
  try {
    await runMigrations();
    console.log('✓ Migrations executed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    const pool = getPool();
    if (pool && typeof pool.end === 'function') {
      await pool.end();
    }
  }
}

if (require.main === module) {
  migrate();
}

module.exports = { migrate };
