const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/add', (req, res) => {
    const { fullname, email, item_name, quantity, description } = req.body;

    const sql = `
        INSERT INTO requisitions(fullname, email, item_name, quantity, description)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [fullname, email, item_name, quantity, description], (err) => {
        if (err) {
            console.log(err);
            return res.json({ success: false });
        }

        res.json({ success: true });
    });
});

router.get('/all', (req, res) => {
    db.query('SELECT * FROM requisitions ORDER BY id DESC', (err, rows) => {
        if (err) return res.json([]);
        res.json(rows);
    });
});

router.get('/analytics', (req, res) => {
    const sql = `
        SELECT
        COUNT(*) AS totalRequests,
        SUM(status = 'Pending') AS pendingRequests,
        SUM(status = 'Approved') AS approvedRequests,
        SUM(status = 'Rejected') AS rejectedRequests
        FROM requisitions
    `;

    db.query(sql, (err, result) => {
        if (err) return res.json({});
        res.json(result[0]);
    });
});

module.exports = router;