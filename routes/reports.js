const express = require('express');
const router = express.Router();
const db = require('../config/db');
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

router.post('/add', upload.single('report_file'), (req, res) => {
    const { fullname, email, problem_type, description } = req.body;
    const report_file = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO reports(fullname, email, problem_type, description, report_file)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [fullname, email, problem_type, description, report_file], (err) => {
        if (err) {
            console.log(err);
            return res.json({ success: false });
        }

        res.json({ success: true });
    });
});

router.get('/all', (req, res) => {
    db.query('SELECT * FROM reports ORDER BY id DESC', (err, rows) => {
        if (err) return res.json([]);
        res.json(rows);
    });
});

router.get('/analytics', (req, res) => {
    const sql = `
        SELECT
        COUNT(*) AS totalReports,
        SUM(status = 'Pending') AS pendingReports,
        SUM(status = 'Approved') AS approvedReports,
        SUM(status = 'Rejected') AS rejectedReports
        FROM reports
    `;

    db.query(sql, (err, result) => {
        if (err) return res.json({});
        res.json(result[0]);
    });
});

module.exports = router;