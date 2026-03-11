require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const todosRouter = require('./routes/todos');
const nnRouter = require('./routes/nn');
const sessionRouter = require('./routes/session');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({origin: process.env.FRONTEND_ORIGIN || '*'}));
app.use(express.json());

app.use('/api/todos', todosRouter);
app.use('/api/nn', nnRouter);
app.use('/api/session', sessionRouter);

// Serve sw.js from root with correct headers (required for service workers)
app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile('sw.js', {root: __dirname});
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

app.use((req, res) => res.status(404).json({error: 'Route not found'}));

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅  MongoDB Atlas connected');
        app.listen(PORT, () =>
            console.log(`🚀  Server running on http://localhost:${PORT}`),
        );
    })
    .catch((err) => {
        console.error('❌  MongoDB connection failed:', err.message);
        process.exit(1);
    });
