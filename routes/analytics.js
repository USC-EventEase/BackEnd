const express = require('express');
const Admin = require("../models/Admin");
const MyTicket = require("../models/MyTicket");
const { authenticate, authorizeAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

router.get('/getanalytics/:userId', authenticate, authorizeAdmin, async (req, res) => {
    const userId = req.params.userId;

    try {
        const events = await  Admin.find({ user_id: userId });
        if (!events || events.length === 0) {
            return res.status(404).json({ message: 'No events found for this user.' });
        }
        const pieChartData = events.map(event => {
            let totalTickets = 0;
            let availableTickets = 0;
            event.tickets.forEach(ticketType => {
                totalTickets += ticketType['total_tickets'];
                availableTickets += ticketType['available_tickets'];
            });
            return {
                eventName: event.event_name,
                totalTicketsSold: totalTickets - availableTickets
            };
        });

        const revenueData = {};
        for (const event of events) {
            const tickets = await MyTicket.find({ event_id: event._id });
            tickets.forEach(ticket => {
                ticket.tickets.forEach(ticketDetail => {
                    const date = ticket.dateTimeBooking.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
                    if (!revenueData[date]) {
                        revenueData[date] = 0;
                    }
                    revenueData[date] += ticketDetail.price;
                });
            });
        }

        const lineChartData = Object.keys(revenueData).sort().map(date => {
            return {
                date,
                revenue: revenueData[date]
            };
        });

        res.json({
            pieChart: pieChartData,
            lineChart: lineChartData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;