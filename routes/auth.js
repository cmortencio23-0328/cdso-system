const express = require('express');
const router = express.Router();
const db = require('../config/db');

/* CREATE ACCOUNT */
router.post('/signup', (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
        return res.send(`
            <script>
                alert("All fields are required.");
                window.location.href = "/signup.html";
            </script>
        `);
    }

    if (!email.endsWith('@cca.edu.ph')) {
        return res.send(`
            <script>
                alert("Only @cca.edu.ph email is allowed.");
                window.location.href = "/signup.html";
            </script>
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
                <script>
                    alert("Signup failed. Email may already exist.");
                    window.location.href = "/signup.html";
                </script>
            `);
        }

        return res.send(`
            <script>
                alert("Account created successfully! Your role is: ${role}");
                window.location.href = "/login.html";
            </script>
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
                <script>
                    alert("Database error. Please try again.");
                    window.location.href = "/login.html";
                </script>
            `);
        }

        if (result.length === 0) {
            return res.send(`
                <script>
                    alert("Invalid email or password.");
                    window.location.href = "/login.html";
                </script>
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

        return res.redirect('/login.html');
    });
});

/* LOGOUT */
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');

        return res.send(`
            <script>
                alert("Logged out successfully.");
                window.location.href = "/login.html";
            </script>
        `);
    });
});

module.exports = router;