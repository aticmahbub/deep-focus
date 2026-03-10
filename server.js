// server.js — DeepFocus Express + MongoDB Atlas backend
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const todosRouter   = require('./routes/todos');
const nnRouter      = require('./routes/nn');
const sessionRouter = require('./routes/session');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── MIDDLEWARE ──
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*' }));
app.use(express.json());

// ── ROUTES ──
app.use('/api/todos',   todosRouter);
app.use('/api/nn',      nnRouter);
app.use('/api/session', sessionRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

// 404 catch-all
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── CONNECT TO MONGODB ATLAS ──
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅  MongoDB Atlas connected');
    app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
