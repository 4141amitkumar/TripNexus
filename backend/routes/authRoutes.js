const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const pool = require(path.join(__dirname, '..', 'db.js')); // Using robust path joining
const { sendOtpEmail } = require('../utils/emailService');

const router = express.Router();

// Store OTPs temporarily. In a real app, use Redis or a database table.
const otpStore = {};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Check if user already exists
        const [existingUser] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = {
            otp,
            username,
            hashedPassword,
            expires: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
        };

        // 4. Send OTP email
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: 'OTP sent to your email. Please verify to complete registration.' });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const storedData = otpStore[email];

        if (!storedData || storedData.expires < Date.now()) {
            return res.status(400).json({ message: 'OTP is invalid or has expired.' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        // OTP is correct, create the user
        const { username, hashedPassword } = storedData;

        const [result] = await pool.query(
            'INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        
        const userId = result.insertId;

        // Clean up OTP store
        delete otpStore[email];
        
        // Create a JWT token for immediate login
        const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ 
            message: 'User registered successfully!',
            token,
            user: { id: userId, username, email }
        });

    } catch (error) {
        console.error("OTP Verification Error:", error);
        res.status(500).json({ message: 'Server error during OTP verification.' });
    }
});


// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ userId: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: { id: user.user_id, username: user.username, email: user.email }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});


module.exports = router;

