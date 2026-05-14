const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/update', (req, res) => {
    const { type, id, status } = req.body;

    let table = '';

    if (type === 'report') table = 'reports';
    if (type === 'requisition') table = 'requisitions';
    if (type === 'reservation') table = 'reservations';

    if (table === '') {
        return res.json({ success: false });
    }

    const sql = `UPDATE ${table} SET status = ? WHERE id = ?`;

    db.query(sql, [status, id], (err) => {
        if (err) {
            console.log(err);
            return res.json({ success: false });
        }

        res.json({ success: true });
    });
});

module.exports = router;