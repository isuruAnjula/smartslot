const { z } = require("zod");
const Booking = require("../models/Booking");

const createSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().optional(),
});

async function createBooking(req, res) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
  }

  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const start = new Date(parsed.data.startTime);
  const end = new Date(parsed.data.endTime);

  if (!(start < end)) {
    return res.status(400).json({ message: "startTime must be before endTime" });
  }

  // prevent double-booking (overlap)
  const conflict = await Booking.findOne({
    status: { $ne: "cancelled" },
    startTime: { $lt: end },
    endTime: { $gt: start },
  });

  if (conflict) {
    return res.status(409).json({ message: "Slot already booked" });
  }

  const booking = await Booking.create({
    user: req.user.id,
    startTime: start,
    endTime: end,
    notes: parsed.data.notes,
    status: "confirmed",
  });

  return res.status(201).json({ booking });
}

module.exports = { createBooking };
