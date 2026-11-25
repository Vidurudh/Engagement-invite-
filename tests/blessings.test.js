const { test, describe, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { newDb } = require('pg-mem');
const { app } = require('../src/server');
const { setPool, runMigrations } = require('../src/db');

describe('Blessings API & Database Integration Tests', () => {
  let memDb;
  let memPool;

  before(async () => {
    // Setup in-memory PostgreSQL database using pg-mem
    memDb = newDb();
    const pg = memDb.adapters.createPg();
    memPool = new pg.Pool();
    setPool(memPool);

    // Run PostgreSQL migrations against in-memory PostgreSQL
    await runMigrations(memPool);
  });

  beforeEach(async () => {
    // Clean table before each test
    await memPool.query('DELETE FROM blessings');
  });

  after(async () => {
    if (memPool) {
      await memPool.end();
    }
  });

  test('GET /api/health should return ok status and database connectivity', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.database, 'connected');
    assert.ok(res.body.timestamp);
  });

  test('GET /api/blessings should return empty list when no blessings are recorded', async () => {
    const res = await request(app).get('/api/blessings');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 0);
    assert.deepEqual(res.body.blessings, []);
  });

  test('POST /api/blessings should save a blessing and return status 201', async () => {
    const payload = {
      name: 'Ramesh & Geetha',
      note: 'Hearty congratulations to Ranjani and Vidurudh! Wishing you a lifetime of joy and togetherness.',
    };

    const res = await request(app)
      .post('/api/blessings')
      .send(payload)
      .set('Content-Type', 'application/json');

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.blessing.id);
    assert.equal(res.body.blessing.name, 'Ramesh &amp; Geetha');
    assert.equal(res.body.blessing.note, payload.note);
    assert.ok(res.body.blessing.created_at);
  });

  test('POST /api/blessings followed by GET /api/blessings should retrieve the persisted blessing', async () => {
    await request(app)
      .post('/api/blessings')
      .send({
        name: 'Karthik S',
        note: 'Best wishes for the engagement ceremony!',
      });

    await request(app)
      .post('/api/blessings')
      .send({
        name: 'Ananya & Family',
        note: 'May God shower you both with boundless happiness.',
      });

    const res = await request(app).get('/api/blessings');
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 2);
    assert.equal(res.body.blessings.length, 2);
    // Verified names are present
    const names = res.body.blessings.map((b) => b.name);
    assert.ok(names.includes('Karthik S'));
    assert.ok(names.includes('Ananya &amp; Family'));
  });

  test('POST /api/blessings should reject empty name with 400', async () => {
    const res = await request(app)
      .post('/api/blessings')
      .send({
        name: '   ',
        note: 'May you both be blessed!',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Please enter your name/i);
  });

  test('POST /api/blessings should reject empty note with 400', async () => {
    const res = await request(app)
      .post('/api/blessings')
      .send({
        name: 'Suresh',
        note: '   ',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Please enter your blessing/i);
  });

  test('POST /api/blessings should reject name exceeding 120 characters', async () => {
    const longName = 'A'.repeat(121);
    const res = await request(app)
      .post('/api/blessings')
      .send({
        name: longName,
        note: 'Warm blessings!',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /cannot exceed 120 characters/i);
  });

  test('POST /api/blessings should reject message exceeding 2000 characters', async () => {
    const longNote = 'A'.repeat(2001);
    const res = await request(app)
      .post('/api/blessings')
      .send({
        name: 'Vidhya',
        note: longNote,
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /cannot exceed 2000 characters/i);
  });

  test('GET / should serve the engagement invitation HTML page', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.match(res.text, /Ranjani &amp; Vidurudh Srinivasan/i);
    assert.match(res.text, /Blessings &amp; Wishes/i);
    assert.match(res.text, /config\.js/i);
  });

  test('GET /config.js should serve the configuration file', async () => {
    const res = await request(app).get('/config.js');
    assert.equal(res.status, 200);
    assert.match(res.text, /window\.BLESSINGS_CONFIG/i);
    assert.match(res.text, /GOOGLE_SHEETS_SCRIPT_URL/i);
  });

  test('Google Drive / Sheets endpoint should return valid blessings JSON schema', async () => {
    const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbz3kRw7TGqip54pyRUGl_W4JoWe9Rc5Joo_FzpluuisgYTZ1pdpjExnaJdmm1YOizS6ZQ/exec';
    const response = await fetch(googleScriptUrl);
    assert.equal(response.ok, true);
    const data = await response.json();
    assert.equal(data.success, true);
    assert.equal(typeof data.count, 'number');
    assert.ok(Array.isArray(data.blessings));
    if (data.blessings.length > 0) {
      const first = data.blessings[0];
      assert.ok(first.name);
      assert.ok(first.note);
      assert.ok(first.created_at);
    }
  });
});
