// routes/todos.js
const express = require('express');
const router  = express.Router();
const { Todo } = require('../models');

// GET /api/todos/:deviceId — fetch all todos for a device
router.get('/:deviceId', async (req, res) => {
  try {
    const todos = await Todo.find({ deviceId: req.params.deviceId })
      .sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/todos/:deviceId — create a new todo
router.post('/:deviceId', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' });

    const todo = await Todo.create({
      deviceId: req.params.deviceId,
      text:     text.trim(),
    });
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/todos/:id — toggle done or update text
router.patch('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!todo) return res.status(404).json({ error: 'Not found' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/todos/:id — delete a single todo
router.delete('/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/todos/:deviceId/done — clear all completed todos
router.delete('/:deviceId/done', async (req, res) => {
  try {
    await Todo.deleteMany({ deviceId: req.params.deviceId, done: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
