const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.MYSQLHOST || 'localhost',
    port: process.env.MYSQLPORT || 3306,
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'railway'
});

db.connect((err) => {
    if (err) {
        console.log('MySQL Connection Failed:', err);
    } else {
        console.log('MySQL Connected');
    }
});

module.exports = db;