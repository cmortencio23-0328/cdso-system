const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

/* CREATE ACCOUNT */
router.post('/signup', async (req, res) => {
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

    try {
        const usersRef = db.collection('users');

        // Check if email already exists
        const existing = await usersRef.where('email', '==', email).get();

        if (!existing.empty) {
            return res.send(`
                <script>
                    alert("Signup failed. Email may already exist.");
                    window.location.href = "/signup.html";
                </script>
            `);
        }

        // Create new user document
        await usersRef.add({
            fullname,
            email,
            password,
            role,
            createdAt: new Date()
        });

        return res.send(`
            <script>
                alert("Account created successfully! Your role is: ${role}");
                window.location.href = "/login.html";
            </script>
        `);

    } catch (err) {
        console.log(err);

        return res.send(`
            <script>
                alert("Signup failed. Please try again.");
                window.location.href = "/signup.html";
            </script>
        `);
    }
});

/* LOGIN */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const usersRef = db.collection('users');

        const snapshot = await usersRef
            .where('email', '==', email)
            .where('password', '==', password)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.send(`
                <script>
                    alert("Invalid email or password.");
                    window.location.href = "/login.html";
                </script>
            `);
        }

        const doc = snapshot.docs[0];
        const user = doc.data();

        req.session.user = {
            id: doc.id,
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

    } catch (err) {
        console.log(err);

        return res.send(`
            <script>
                alert("Database error. Please try again.");
                window.location.href = "/login.html";
            </script>
        `);
    }
});

/* CHECK SESSION */
router.get('/me', (req, res) => {
    if (req.session.user) {
        return res.json({
            loggedIn: true,
            user: req.session.user
        });
    }

    return res.json({ loggedIn: false });
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