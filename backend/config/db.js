const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'smart_hostel_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(connectionConfig);

function connect(callback) {
  pool.getConnection((error, connection) => {
    if (error) {
      if (callback) {
        callback(error);
      }
      return;
    }

    connection.release();
    console.log(`MySQL connected to ${connectionConfig.database} on ${connectionConfig.host}:${connectionConfig.port}`);
    if (callback) {
      callback(null);
    }
  });
}

function query(sql, params, callback) {
  if (typeof params === 'function') {
    pool.query(sql, params);
    return;
  }

  pool.query(sql, params, callback);
}

module.exports = {
  connect,
  query,
  meta: {
    mode: 'mysql',
    connection: {
      host: connectionConfig.host,
      port: connectionConfig.port,
      database: connectionConfig.database,
    },
  },
};
