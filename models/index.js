// models/index.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── USER ──
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {type: String, required: true, minlength: 6},
    createdAt: {type: Date, default: Date.now},
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password helper
userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

// Never expose password in JSON responses
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

// ── SESSION (pomodoro + theme) ──
const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    pomCount: {type: Number, default: 0},
    theme: {type: String, default: 'eink'},
    updatedAt: {type: Date, default: Date.now},
});

// ── TODOS ──
const todoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    text: {type: String, required: true, trim: true},
    done: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now},
});

// ── NON-NEGOTIABLES ──
const nnSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    text: {type: String, required: true, trim: true},
    done: {type: Boolean, default: false},
    lastDoneDate: {type: String, default: null},
    streak: {type: Number, default: 0},
    order: {type: Number, default: 0},
    createdAt: {type: Date, default: Date.now},
});

module.exports = {
    User: mongoose.model('User', userSchema),
    Session: mongoose.model('Session', sessionSchema),
    Todo: mongoose.model('Todo', todoSchema),
    NN: mongoose.model('NN', nnSchema),
};
