require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'cdso_secret',
    resave: false,
    saveUninitialized: false
}));

function checkRole(role) {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.redirect('/');
        }

        if (req.session.user.role !== role) {
            if (req.session.user.role === 'admin') {
                return res.redirect('/admin-dashboard.html');
            }

            if (req.session.user.role === 'cdso') {
                return res.redirect('/dashboard.html');
            }

            if (req.session.user.role === 'student') {
                return res.redirect('/student-dashboard.html');
            }

            return res.redirect('/');
        }

        next();
    };
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/style.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/script.js'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/signup.html'));
});

/* ADMIN */
app.get('/admin-dashboard.html', checkRole('admin'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin-dashboard.html'));
});

app.get('/admin-approvals.html', checkRole('admin'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin-approvals.html'));
});

app.get('/admin-reports.html', checkRole('admin'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin-reports.html'));
});

app.get('/system-config.html', checkRole('admin'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public/system-config.html'));
});

/* CDSO */
app.get('/dashboard.html', checkRole('cdso'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

app.get('/requisitions.html', checkRole('cdso'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public/requisitions.html'));
});

app.get('/reservations.html', checkRole('cdso'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public/reservations.html'));
});

app.get('/reports.html', checkRole('cdso'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public/reports.html'));
});

/* STUDENT */
app.get('/student-dashboard.html', checkRole('student'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public/student-dashboard.html'));
});

app.get('/student-reports.html', checkRole('student'), (req, res) => {
    res.sendFile(path.join(__dirname, 'public/student-reports.html'));
});

/* BACKEND ROUTES */
app.use('/auth', require('./routes/auth'));
app.use('/requisition', require('./routes/requisition'));
app.use('/reservation', require('./routes/reservation'));
app.use('/reports', require('./routes/reports'));
app.use('/approval', require('./routes/approvals'));

app.use((req, res) => {
    res.status(404).send(`
        <h2>Page not found</h2>
        <a href="/">Back to CDSO System</a>
    `);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`CDSO System running on port ${PORT}`);
});