// routes/session.js — Pomodoro count + theme preference
const express   = require('express');
const router    = express.Router();
const { Session } = require('../models');

// GET /api/session/:deviceId — get or create session
router.get('/:deviceId', async (req, res) => {
  try {
    let session = await Session.findOne({ deviceId: req.params.deviceId });
    if (!session) {
      session = await Session.create({ deviceId: req.params.deviceId });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/session/:deviceId — update pomCount and/or theme
router.patch('/:deviceId', async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { deviceId: req.params.deviceId },
      { $set: { ...req.body, updatedAt: new Date() } },
      { new: true, upsert: true }
    );
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
