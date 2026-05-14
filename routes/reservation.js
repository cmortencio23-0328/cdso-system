const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/add', (req, res) => {
    const { fullname, email, equipment_name, reservation_date, purpose } = req.body;

    const sql = `
        INSERT INTO reservations(fullname, email, equipment_name, reservation_date, purpose)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [fullname, email, equipment_name, reservation_date, purpose], (err) => {
        if (err) {
            console.log(err);
            return res.json({ success: false });
        }

        res.json({ success: true });
    });
});

router.get('/all', (req, res) => {
    db.query('SELECT * FROM reservations ORDER BY id DESC', (err, rows) => {
        if (err) return res.json([]);
        res.json(rows);
    });
});

router.get('/analytics', (req, res) => {
    const sql = `
        SELECT
        COUNT(*) AS totalReservations,
        SUM(status = 'Pending') AS pendingReservations,
        SUM(status = 'Approved') AS approvedReservations,
        SUM(status = 'Rejected') AS rejectedReservations
        FROM reservations
    `;

    db.query(sql, (err, result) => {
        if (err) return res.json({});
        res.json(result[0]);
    });
});

module.exports = router;