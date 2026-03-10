// routes/nn.js — Non-Negotiables routes with daily auto-reset
const express = require('express');
const router  = express.Router();
const { NN }  = require('../models');

// Helper — today's date as YYYY-MM-DD
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// GET /api/nn/:deviceId — fetch all NN items, auto-resetting done if it's a new day
router.get('/:deviceId', async (req, res) => {
  try {
    const today = todayStr();
    // Reset any items whose lastDoneDate is not today back to undone
    await NN.updateMany(
      { deviceId: req.params.deviceId, done: true, lastDoneDate: { $ne: today } },
      { $set: { done: false } }
    );

    const items = await NN.find({ deviceId: req.params.deviceId }).sort({ order: 1, createdAt: 1 });
    res.json({ items, today });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/nn/:deviceId — create a new NN item
router.post('/:deviceId', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' });

    const count = await NN.countDocuments({ deviceId: req.params.deviceId });
    const item  = await NN.create({
      deviceId: req.params.deviceId,
      text:     text.trim(),
      order:    count,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/nn/:id/toggle — toggle done state with streak logic
router.patch('/:id/toggle', async (req, res) => {
  try {
    const today = todayStr();
    const item  = await NN.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    item.done = !item.done;
    item.lastDoneDate = item.done ? today : null;
    await item.save();

    // Check if ALL items for this device are now done → fire streak on the device side
    const total  = await NN.countDocuments({ deviceId: item.deviceId });
    const doneCount = await NN.countDocuments({ deviceId: item.deviceId, done: true });
    const allDone = total > 0 && doneCount === total;

    res.json({ item, allDone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/nn/:id — delete a single NN item
router.delete('/:id', async (req, res) => {
  try {
    await NN.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
