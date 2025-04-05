const express = require("express");
const Admin = require("../models/Admin");
const User = require("../models/User");
const { authenticate, authorizeAdmin } = require("../middleware/authMiddleware");
const router = express.Router();


router.post("/event", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { event_name, event_creation_time, event_end_time, event_location } = req.body;

    const user_id = req.user.userId;
    const newEvent = new Admin({ user_id, event_name, event_creation_time, event_end_time, event_location });
    await newEvent.save();

    res.status(201).json({ message: "Event created", event: newEvent });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

router.get("/events", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const events = await Admin.find().populate("user_id", "name email");
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

router.get("/event/:id", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const event = await Admin.findById(req.params.id).populate("user_id", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

router.put("/event/:id", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const updatedEvent = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: "Event not found" });

    res.status(200).json({ message: "Event updated", event: updatedEvent });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

router.delete("/event/:id",authenticate, authorizeAdmin, async (req, res) => {
  try {
    const deletedEvent = await Admin.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ message: "Event not found" });

    res.status(200).json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

module.exports = router;
