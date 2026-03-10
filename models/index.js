// models/index.js — All Mongoose schemas for DeepFocus
const mongoose = require('mongoose');

// ── USER SESSION ──
// A lightweight "user" identified by a generated device ID stored in the browser.
// No auth required — keeps the app simple while still syncing across devices
// when the user shares or enters their deviceId.
const sessionSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true, index: true },
  pomCount:  { type: Number, default: 0 },
  theme:     { type: String, default: 'eink' },
  updatedAt: { type: Date,   default: Date.now },
});

// ── TODOS ──
const todoSchema = new mongoose.Schema({
  deviceId:  { type: String, required: true, index: true },
  text:      { type: String, required: true, trim: true },
  done:      { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// ── NON-NEGOTIABLES ──
const nnSchema = new mongoose.Schema({
  deviceId:  { type: String, required: true, index: true },
  text:      { type: String, required: true, trim: true },
  done:      { type: Boolean, default: false },
  // Track which calendar date this item was last completed on (YYYY-MM-DD)
  lastDoneDate: { type: String, default: null },
  streak:    { type: Number, default: 0 },
  order:     { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  Session: mongoose.model('Session', sessionSchema),
  Todo:    mongoose.model('Todo',    todoSchema),
  NN:      mongoose.model('NN',      nnSchema),
};
