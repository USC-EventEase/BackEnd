const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  total_tickets: { type: String, required: true },
  original_price: { type: String, required: true },
  current_price: { type: String, required: true },
  available_tickets: { type: String, required: true }
}, { _id: false });

const AdminSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event_name: { type: String, required: true },
  event_description: { type: String, required: true },
  event_date: { type: String, required: true }, // Format: MM/DD/YYYY
  event_time: { type: String, required: true }, // Format: HH:mm
  event_genre: { type: String, required: true },
  event_image: { type: String, required: true },
  tickets: {
    type: Map,
    of: TicketSchema,
    required: true
  },
  event_location: { type: String, required: true }
});

module.exports = mongoose.model("Admin", AdminSchema);
