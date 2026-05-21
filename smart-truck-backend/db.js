const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'smartuser',
  password: 'smartpass123',
  database: 'smart_truck_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test koneksi
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
  } else {
    console.log('✅ MySQL Pool Connected');
    connection.release();
  }
});

module.exports = pool;