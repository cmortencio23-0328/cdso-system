const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowed = /jpg|jpeg|png|pdf|doc|docx/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());

        if (ext) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

router.post('/add', upload.single('report_file'), async (req, res) => {
    const { fullname, email, problem_type, description } = req.body;
    const report_file = req.file ? req.file.filename : null;

    try {
        await db.collection('reports').add({
            fullname,
            email,
            problem_type,
            description,
            report_file,
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
        const snapshot = await db.collection('reports')
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
        const snapshot = await db.collection('reports').get();

        let totalReports = 0;
        let pendingReports = 0;
        let approvedReports = 0;
        let rejectedReports = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            totalReports++;

            if (data.status === 'Pending') pendingReports++;
            if (data.status === 'Approved') approvedReports++;
            if (data.status === 'Rejected') rejectedReports++;
        });

        res.json({
            totalReports,
            pendingReports,
            approvedReports,
            rejectedReports
        });

    } catch (err) {
        console.log(err);
        res.json({});
    }
});

module.exports = router;