const express = require('express');
const router = express.Router();
const db = require('../config/db');

/* CREATE ACCOUNT */
router.post('/signup', (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
        return res.send(`
            <h2>All fields are required</h2>
            <a href="/signup.html">Back to Signup</a>
        `);
    }

    if (!email.endsWith('@cca.edu.ph')) {
        return res.send(`
            <h2>Only @cca.edu.ph email is allowed</h2>
            <a href="/signup.html">Back to Signup</a>
        `);
    }

    let role = 'student';

    if (email.startsWith('admin.')) {
        role = 'admin';
    } else if (email.startsWith('cdso.')) {
        role = 'cdso';
    }

    const sql = `
        INSERT INTO users(fullname, email, password, role)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [fullname, email, password, role], (err) => {
        if (err) {
            console.log(err);
            return res.send(`
                <h2>Signup Failed</h2>
                <p>Email already exists or database error.</p>
                <a href="/signup.html">Try Again</a>
            `);
        }

        res.send(`
            <h2>Account Created Successfully</h2>
            <p>Your role is: ${role}</p>
            <a href="/login.html">Go to Login</a>
        `);
    });
});

/* LOGIN */
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = `
        SELECT * FROM users
        WHERE email = ? AND password = ?
        LIMIT 1
    `;

    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.log(err);
            return res.send(`
                <h2>Database Error</h2>
                <a href="/login.html">Back to Login</a>
            `);
        }

        if (result.length === 0) {
            return res.send(`
                <h2>Invalid Email or Password</h2>
                <a href="/login.html">Try Again</a>
            `);
        }

        const user = result[0];

        req.session.user = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            role: user.role
        };

        if (user.role === 'admin') {
            return res.redirect('/admin-dashboard.html');
        }

        if (user.role === 'cdso') {
            return res.redirect('/dashboard.html');
        }

        if (user.role === 'student') {
            return res.redirect('/student-dashboard.html');
        }

        res.redirect('/login.html');
    });
});

/* LOGOUT */
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/login.html');
    });
});

module.exports = router;