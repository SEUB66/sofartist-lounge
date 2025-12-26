const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:dlzLRbuILbmJGnFdZwefWPXrHpfwHGVo@gondola.proxy.rlwy.net:52600/railway',
  ssl: false,
});

async function test() {
  try {
    console.log('Testing connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('SUCCESS:', result.rows[0]);
    await pool.end();
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

test();
