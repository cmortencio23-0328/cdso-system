const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

router.post('/add', async (req, res) => {
    const { fullname, email, equipment_name, reservation_date, purpose } = req.body;

    try {
        await db.collection('reservations').add({
            fullname,
            email,
            equipment_name,
            reservation_date,
            purpose,
            status: 'Pending',
            createdAt: new Date()
        });

        res.json({ success: true });

    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
});

router.get('/all', async (req, res) => {
    try {
        const snapshot = await db.collection('reservations')
            .orderBy('createdAt', 'desc')
            .get();

        const rows = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(rows);

    } catch (err) {
        console.log(err);
        res.json([]);
    }
});

router.get('/analytics', async (req, res) => {
    try {
        const snapshot = await db.collection('reservations').get();

        let totalReservations = 0;
        let pendingReservations = 0;
        let approvedReservations = 0;
        let rejectedReservations = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            totalReservations++;

            if (data.status === 'Pending') pendingReservations++;
            if (data.status === 'Approved') approvedReservations++;
            if (data.status === 'Rejected') rejectedReservations++;
        });

        res.json({
            totalReservations,
            pendingReservations,
            approvedReservations,
            rejectedReservations
        });

    } catch (err) {
        console.log(err);
        res.json({});
    }
});

module.exports = router;