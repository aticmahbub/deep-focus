// routes/auth.js — register & login
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {User, Session} = require('../models');

function signToken(userId) {
    return jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password)
            return res.status(400).json({error: 'Email and password required'});
        if (password.length < 6)
            return res
                .status(400)
                .json({error: 'Password must be at least 6 characters'});

        const existing = await User.findOne({email});
        if (existing)
            return res.status(409).json({error: 'Email already in use'});

        const user = await User.create({email, password});
        // Create empty session for new user
        await Session.create({userId: user._id});

        const token = signToken(user._id);
        res.status(201).json({token, user});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password)
            return res.status(400).json({error: 'Email and password required'});

        const user = await User.findOne({email});
        if (!user)
            return res.status(401).json({error: 'Invalid email or password'});

        const match = await user.comparePassword(password);
        if (!match)
            return res.status(401).json({error: 'Invalid email or password'});

        const token = signToken(user._id);
        res.json({token, user});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// GET /api/auth/me — verify token & return user
router.get('/me', require('../middleware/auth'), (req, res) => {
    res.json({user: req.user});
});

module.exports = router;
