const mongoose = require('mongoose');

const SaltSchema = new mongoose.Schema({
  slot:      { type: Number, required: true, unique: true },
  value:     { type: String, required: true },
  updatedAt: { type: Date,   default: Date.now }
});

// SaltSchema.index({ slot: 1 }, { unique: true });

module.exports = mongoose.model('Salt', SaltSchema);