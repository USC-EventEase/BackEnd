const express = require("express");
const Admin = require("../models/Admin");
const User = require("../models/User");
const { authenticate } = require("../middleware/authMiddleware");
const MyTicket = require('../models/MyTicket');
const router = express.Router();
const saltUpdates = require('../jobs/saltUpdate')

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

// GET /api/user/salt - Get salt 
router.get('/salt', authenticate, async (req, res) => {
	try {
		const saltLatest = await saltUpdates.getLatest();
  
	  	res.status(200).json({"Salt":saltLatest});
	} catch (err) {
	  res.status(500).json({ message: "Server Error: " + err.message });
	}
});

// GET /api/user/events - Get events with event_id
router.get('/events/:id', authenticate, async (req, res) => {
	try {
	  const eventId = req.params.id;
	  // Use findById to find the event by its id and exclude the user_id field
	  const event = await Admin.findById(eventId, { user_id: 0 });
	  
	  if (!event) {
		return res.status(404).json({ message: 'Event not found' });
	  }
	  
	  res.status(200).json(event);
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

// POST /api/user/events/register - Registers the specified number of tickets for a user and event, and stores the order in MyTicket
router.post('/event/register', authenticate, async (req, res) => {
	const { event_id, tickets } = req.body;
	const user_id = req.user.userId

	try {
		const event = await Admin.findById(event_id);
		if (!event) {
			return res.status(404).json({ message: 'Event not found' });
		}

		let total_amount = 0;
		const ticketDetails = {};

		for (const [type, info] of Object.entries(tickets)) {
			const eventTicket = event.tickets.get(type);

			if (!eventTicket) {
				return res.status(400).json({ message: `Ticket type not found in event` });
			}

			const count = info.count;
			const price = info.price;
			const available = parseInt(eventTicket.available_tickets);

			if (count > available || count < 0) {
				return res.status(400).json({ message: `Incorrect number of tickets requested` });
			}

			eventTicket.available_tickets = `${available - count}`;
			event.tickets.set(type, eventTicket);

			ticketDetails[type] = {
				original_count: count,
				available_count: count,
				price: count * price
			};

			total_amount += count * price;
		}

		const myTicket = new MyTicket({
			event_id,
			user_id,
			total_amount,
			tickets: ticketDetails
		});

		await myTicket.save();
		await event.save();

		res.status(201).json({ message: "Tickets registered successfully!", ticket: myTicket });
	} catch (err) {
		res.status(500).json({ message: "Server Error: " + err.message });
	}
});

// Call to update available count after QR code is verified
// PATCH /api/user/ticket/<id>/type/<ticketType> - Updates available count of each ticket type in MyTickets
router.patch("/ticket/:id/type/:type", authenticate, async (req, res) => {
	const { id, type } = req.params;
	const { count } = req.body;

	if (isNaN(count) || count < 0) {
		return res.status(400).json({ message: "Invalid or missing count in request body" });
	}

	try {
		const ticket = await MyTicket.findById(id);
		if (!ticket) return res.status(404).json({ message: "Ticket not found" });

		const ticketType = ticket.tickets.get(type);
		if (!ticketType) {
			return res.status(404).json({ message: `Ticket type not found` });
		}

		if ( count > ticketType.available_count) {
			return res.status(400).json({ message: `Error not enough tickets available` });
		}

		ticketType.available_count = ticketType.available_count - count;
		ticket.tickets.set(type, ticketType);
		await ticket.save();

		res.status(200).json({ message: `'${type}' available count updated`, ticket });
	} catch (err) {
		res.status(500).json({ message: "Server Error: " + err.message });
	}
});

// GET /api/user/tickets - Get all tickets the user
router.get('/tickets', authenticate, async (req, res) => {
  const userId = req.user.userId

  try {
    const tickets = await MyTicket.find({ user_id: userId })
      .populate('event_id', 'event_name event_description event_date event_time event_location');

    if (tickets.length === 0) {
      return res.status(404).json({ message: "No tickets found for this user." });
    }

    res.status(200).json({
      message: `Tickets for user`,
      tickets
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

module.exports = router;
