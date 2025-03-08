const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'dharnesh10',
    database: 'qr'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

// Generate a dynamic state token for QR
let currentState = crypto.randomBytes(20).toString('hex');
setInterval(() => {
    currentState = crypto.randomBytes(20).toString('hex');
}, 1000);

app.get('/qr-state', (req, res) => {
    res.json({ state: currentState });
});

// Fetch all users
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, data) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(data);
    });
});

// Mark attendance
app.post('/mark-attendance', (req, res) => {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ error: 'Email is required' });

    db.query('UPDATE users SET present = 1 WHERE email = ?', [email], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to mark attendance' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'Attendance marked successfully' });
    });
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});