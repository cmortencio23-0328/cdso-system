const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

router.post('/add', async (req, res) => {
    const { fullname, email, item_name, quantity, description } = req.body;

    try {
        await db.collection('requisitions').add({
            fullname,
            email,
            item_name,
            quantity,
            description,
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
        const snapshot = await db.collection('requisitions')
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
        const snapshot = await db.collection('requisitions').get();

        let totalRequests = 0;
        let pendingRequests = 0;
        let approvedRequests = 0;
        let rejectedRequests = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            totalRequests++;

            if (data.status === 'Pending') pendingRequests++;
            if (data.status === 'Approved') approvedRequests++;
            if (data.status === 'Rejected') rejectedRequests++;
        });

        res.json({
            totalRequests,
            pendingRequests,
            approvedRequests,
            rejectedRequests
        });

    } catch (err) {
        console.log(err);
        res.json({});
    }
});

module.exports = router;