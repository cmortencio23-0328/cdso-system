const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

router.post('/update', async (req, res) => {
    const { type, id, status } = req.body;

    let collectionName = '';

    if (type === 'report') collectionName = 'reports';
    if (type === 'requisition') collectionName = 'requisitions';
    if (type === 'reservation') collectionName = 'reservations';

    if (collectionName === '') {
        return res.json({ success: false });
    }

    try {
        await db.collection(collectionName).doc(id).update({ status });

        res.json({ success: true });

    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
});

module.exports = router;