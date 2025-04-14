const express = require("express");
const Admin = require("../models/Admin");
const User = require("../models/User");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();


// GET /api/user/events - Get all events without user_id
router.get('/events', authenticate, async (req, res) => {
	try {
	  // Exclude the 'user_id' field from the result
	  const events = await Admin.find({}, { user_id: 0 });
  
	  res.status(200).json(events);
	} catch (err) {
	  res.status(500).json({ message: "Server Error: " + err.message });
	}
});

// GET /api/user/events/search?name=<x> - Search by event name
router.get('/events/search', authenticate, async (req, res) => {
	try {
	  const { name } = req.query;
  
	  if (!name) {
		return res.status(400).json({ message: "Missing query parameter" });
	  }
  
	  const events = await Admin.find(
			{ event_name: { $regex: name, $options: 'i' } },
			{ user_id: 0 }
	  );
  
	  res.status(200).json(events);
	} catch (err) {
	  res.status(500).json({ message: "Server Error: " + err.message });
	}
});

// GET /api/user/events/genre?name=<x> - Get all events that match event genre <x>
router.get('/events/genre', authenticate, async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Missing query parameter" });
    }

    const events = await Admin.find(
      { event_genre: { $regex: `^${name}$`, $options: 'i' } },
      { user_id: 0 }
    );

    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// PATCH /api/user/event/<id>/tickets/<tickets> - Update the number of available tickets
router.patch("/event/:id/tickets/:type", authenticate, async (req, res) => {
  const { id, type } = req.params;
  const { available_tickets } = req.body;

  if (available_tickets === undefined) {
    return res.status(400).json({ message: "Missing field in request body" });
  }

  try {

    const event = await Admin.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const ticket = event.tickets.get(type);
    if (!ticket) {
      return res.status(404).json({ message: `Ticket type not found in event` });
    }

		if (available_tickets < 0 || available_tickets > ticket.total_tickets) {
      return res.status(400).json({ message: `Error updating available tickets` });
    }

    ticket.available_tickets = available_tickets;
    event.tickets.set(type, ticket);
    await event.save();

    res.status(200).json({ message: `'${type}' available tickets updated`, event });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

module.exports = router;
