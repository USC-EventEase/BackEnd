const cron = require('node-cron');
const Admin = require('../models/Admin');

function calculateLinearPrice(ticket) {
    const available = parseInt(ticket.available_tickets);
    const total = parseInt(ticket.total_tickets);
    const base = parseFloat(ticket.original_price);
    const ratioSold = (total - available) / total;
    const newPrice = base + (ratioSold * base);
    return Math.round(newPrice);
}

module.exports = () => {
    cron.schedule('0 * * * *', async () => {
        console.log("Running price update");

        try {
          const events = await Admin.find();
      
          for (const event of events) {
            let hasChanges = false;
      
            for (const [type, ticket] of event.tickets.entries()) {
              const newPrice = calculateLinearPrice(ticket);
              const currentPrice = parseFloat(ticket.current_price);
      
              if (newPrice !== currentPrice) {
                ticket.current_price = newPrice;
                event.tickets.set(type, ticket);
                hasChanges = true;
              }
            }
      
            if (hasChanges) {
              await event.save();
            }
          }
      
          console.log("Dynamic pricing check complete\n");
        } catch (err) {
          console.error("Error during price update:", err.message);
        }
      });      
};
