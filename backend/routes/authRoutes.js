const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const { sendOtpEmail } = require('../utils/emailService');
const logger = require('../utils/logger');

const router = express.Router();

// --- User Registration ---
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        // Check if user already exists
        const [existingUsers] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

        const newUser = {
            username,
            email,
            password: hashedPassword,
            otp,
            otp_expires: otpExpires,
            is_verified: false,
        };

        await db.query('INSERT INTO Users SET ?', newUser);
        await sendOtpEmail(email, otp);

        res.status(201).json({ message: 'User registered. Please check your email for OTP.' });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});


// --- OTP Verification ---
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = users[0];
        if (user.otp !== otp || new Date() > new Date(user.otp_expires)) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        await db.query('UPDATE Users SET is_verified = true, otp = NULL, otp_expires = NULL WHERE email = ?', [email]);

        res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
        logger.error('OTP verification error:', error);
        res.status(500).json({ message: 'Server error during OTP verification.' });
    }
});


// --- User Login ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = users[0];
        if (!user.is_verified) {
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const payload = {
            user: {
                id: user.user_id,
                username: user.username,
                email: user.email,
            },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: payload.user,
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;
