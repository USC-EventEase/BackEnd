const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event_name: { type: String, required: true },
  event_creation_time: { type: Date, required: true },
  event_end_time: { type: Date, required: true },
  event_location: { type: String, required: true }
});

AdminSchema.index({ event_name: 1 });
AdminSchema.index({ user_id: 1 });
AdminSchema.index({ event_creation_time: 1 });
AdminSchema.index({ event_end_time: 1 });
AdminSchema.index({ event_location: 1 });

module.exports = mongoose.model("Admin", AdminSchema);
