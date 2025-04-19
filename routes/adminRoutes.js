const express = require("express");
const Admin = require("../models/Admin");
const MyTicket = require("../models/MyTicket");
const Salt = require("../models/Salt");
const { authenticate, authorizeAdmin } = require("../middleware/authMiddleware");
const axios = require("axios");
const saltUpdates = require('../jobs/saltUpdate')

const router = express.Router();



router.put("/validate/:bookingId/:userId/:eventId/:type/:salt", authenticate, authorizeAdmin, async (req, res) => {
  const { bookingId, userId, eventId, type, salt } = req.params;
  if(!bookingId || !userId || !eventId || !type || !salt){
    return res.status(404).json({ error: 'Params not found.' });
  }
  try {
    const saltLatest = await saltUpdates.getLatest();
    if(saltLatest.value!=salt){
      return res.status(404).json({ error: 'Salt incorrect' });
    }

    const booking = await MyTicket.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    if (booking.user_id.toString() !== userId) {
      return res
        .status(403)
        .json({ error: 'This booking does not belong to the specified user.' });
    }
    if (booking.event_id.toString() !== eventId) {
      return res
        .status(400)
        .json({ error: 'This booking is not for the specified event.' });
    }

    const event = await Admin.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    if (event.user_id.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: 'You are not authorized to validate tickets for this event.' });
    }
    const ticketType = booking.tickets.get(type);
		if (!ticketType) {
			return res.status(404).json({ message: `Ticket type not found` });
		}

    const available = ticketType.available_count;
      if (available < 1) {
        return res
          .status(400)
          .json({ error: `Not enough ${type} tickets left (requested ${requested}, available ${available}).` });
      }

      // All checks passed
      
      ticketType.available_count = ticketType.available_count - 1;
      booking.tickets.set(type, ticketType);
      await booking.save();

      // 9. Finally, send back success
      return res.status(200).json({ valid: true, remaining: ticketType.available_count});
      
    
  } catch (err) {
    console.error('Validation error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


// CREATE Event
router.post("/event", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const {
      event_name,
      event_description,
      event_date,
      event_time,
      event_genre,
      event_image,
      event_location,
      tickets
    } = req.body;

    const user_id = req.user.userId;

    for (const type in tickets) {
      const ticket = tickets[type];
      const requiredFields = ["total_tickets", "original_price", "current_price", "available_tickets"];
      const missing = requiredFields.filter(field => !ticket[field]);
      if (missing.length > 0) {
        return res.status(400).json({
          message: `Missing fields in ticket type "${type}": ${missing.join(", ")}`
        });
      }
    }

    const newEvent = new Admin({
      user_id,
      event_name,
      event_description,
      event_date,
      event_time,
      event_genre,
      event_image,
      event_location,
      tickets
    });

    await newEvent.save();

    const recommendationPayload = {
      eventId: newEvent._id,
      eventData: {
        event_name,
        event_description
      }
    };

    try {
      await axios.post("http://recommendation:3002/api/add_recommendations", recommendationPayload); 
    } catch (recommendationError) {
      console.error("Recommendation service error:", recommendationError.message);
    }


    res.status(201).json({ message: "Event created", event: newEvent });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// READ All Events
router.get("/events", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const userId = req.user.userId;
    const events = await Admin.find({ user_id: userId }).populate(
      "user_id",
      "name email"
    );
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// READ Single Event
router.get("/event/:id", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const event = await Admin.findById(req.params.id).populate("user_id", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// UPDATE Event
router.put("/event/:id", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const {
      event_name,
      event_description,
      event_date,
      event_time,
      event_genre,
      event_image,
      event_location,
      tickets
    } = req.body;

    if (tickets) {
      for (const type in tickets) {
        const ticket = tickets[type];
        const requiredFields = ["total_tickets", "original_price", "current_price", "available_tickets"];
        const missing = requiredFields.filter(field => !ticket[field]);
        if (missing.length > 0) {
          return res.status(400).json({
            message: `Missing fields in ticket type "${type}": ${missing.join(", ")}`
          });
        }
      }
    }

    const updatedEvent = await Admin.findByIdAndUpdate(
      req.params.id,
      {
        event_name,
        event_description,
        event_date,
        event_time,
        event_genre,
        event_image,
        event_location,
        tickets
      },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) return res.status(404).json({ message: "Event not found" });

    res.status(200).json({ message: "Event updated", event: updatedEvent });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// DELETE Event
router.delete("/event/:id", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const deletedEvent = await Admin.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ message: "Event not found" });
    
    const recommendationPayload = {
      eventId: req.params.id
    };

    try {
      await axios.post("http://recommendation:3002/api/delete_recommendations", recommendationPayload); 
    } catch (recommendationError) {
      console.error("Recommendation service error:", recommendationError.message);
    }
    res.status(200).json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

module.exports = router;
