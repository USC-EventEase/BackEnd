const express = require("express");
const Admin = require("../models/Admin");
const { authenticate, authorizeAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

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
    res.status(201).json({ message: "Event created", event: newEvent });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// READ All Events
router.get("/events", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const events = await Admin.find().populate("user_id", "name email");
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

    res.status(200).json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

module.exports = router;
