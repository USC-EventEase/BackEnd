const cron   = require('node-cron');
const crypto = require('crypto');
const Salt   = require('../models/Salt');
const dotenv = require("dotenv");
dotenv.config();

const MS_PER_SLOT = 15 * 60 * 1000;

// Generate HMAC‑based salt for a given slot
async function makeSalt(slot) {
  return crypto
    .createHmac('sha256', process.env.QR_SECRET)
    .update(String(slot))
    .digest('hex');
}

// Upsert the salt into MongoDB
async function updateSaltInDb() {
  try {
    const now   = Date.now();
    const slot  = Math.floor(now / MS_PER_SLOT);
    const value = await makeSalt(slot);

    await Salt.findOneAndUpdate(
      {},
      {slot, value, updatedAt: new Date() },
      { upsert: true, new: true}
    );
    console.log(`[SaltJob] saved at ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[SaltJob] Error updating salt:', err);
  }
}

// Initialize job: run immediately and schedule every quarter‑hour
template = module.exports = function initSaltJob() {
  updateSaltInDb();
  cron.schedule('0,15,30,45 * * * *', updateSaltInDb);
};

// Getter for the latest salt document
module.exports.getLatest = async () => {
  return Salt.findOne().sort({ slot: -1 }).lean();
};
