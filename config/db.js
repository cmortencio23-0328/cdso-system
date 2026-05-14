const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'cdso_db'
});

db.connect((err) => {
    if (err) {
        console.log('MySQL Connection Failed:', err);
    } else {
        console.log('MySQL Connected');
    }
});

module.exports = db;