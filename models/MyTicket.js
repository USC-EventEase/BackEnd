const mongoose = require('mongoose');

const TicketDetailSchema = new mongoose.Schema({
  original_count: { type: Number, required: true },
  available_count: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const MyTicketSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateTimeBooking: { type: Date, default: Date.now },
  total_amount: { type: Number, required: true },
  tickets: {
    type: Map,
    of: TicketDetailSchema,
    required: true
  }
});

module.exports = mongoose.model("MyTicket", MyTicketSchema);