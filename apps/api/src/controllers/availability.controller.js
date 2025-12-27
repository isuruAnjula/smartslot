const { z } = require("zod");
const Availability = require("../models/Availability");

const upsertSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
  slotMinutes: z.number().int().min(10).max(180).optional(),
  isClosed: z.boolean().optional(),
});

async function listAvailability(req, res) {
  const rows = await Availability.find().sort({ dayOfWeek: 1 });
  res.json({ availability: rows });
}

async function upsertAvailability(req, res) {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

  const doc = await Availability.findOneAndUpdate(
    { dayOfWeek: parsed.data.dayOfWeek },
    { $set: parsed.data },
    { upsert: true, new: true }
  );
  res.json({ availability: doc });
}

module.exports = { listAvailability, upsertAvailability };
