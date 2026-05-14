const mysql = require('mysql2');

let db;

if (process.env.MYSQL_URL) {
    db = mysql.createConnection(process.env.MYSQL_URL);
} else {
    db = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cdso_db'
    });
}

db.connect((err) => {
    if (err) {
        console.log('MySQL Connection Failed:', err);
    } else {
        console.log('MySQL Connected');
    }
});

module.exports = db;