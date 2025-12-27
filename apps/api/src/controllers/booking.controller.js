const { z } = require("zod");
const Booking = require("../models/Booking");

const createSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

async function createBooking(req, res) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

  const booking = await Booking.create({
    user: req.user.id,
    startTime: new Date(parsed.data.startTime),
    endTime: new Date(parsed.data.endTime),
    notes: parsed.data.notes || "",
  });

  res.status(201).json({ booking });
}

async function myBookings(req, res) {
  const bookings = await Booking.find({ user: req.user.id }).sort({ startTime: -1 });
  res.json({ bookings });
}

async function adminListBookings(req, res) {
  const bookings = await Booking.find().populate("user", "name email").sort({ startTime: -1 });
  res.json({ bookings });
}

module.exports = { createBooking, myBookings, adminListBookings };
