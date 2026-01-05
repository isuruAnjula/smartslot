const { z } = require("zod");
const Availability = require("../models/Availability");
const Booking = require("../models/Booking");

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  tzOffsetMinutes: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 0)),
});

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function addMinutes(dateObj, minutes) {
  return new Date(dateObj.getTime() + minutes * 60 * 1000);
}

function dayOfWeekFromDate(dateStr) {
  // dateStr: YYYY-MM-DD
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay(); // 0-6
}

async function getSlots(req, res) {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid query", errors: parsed.error.flatten() });
  }

  const { date, tzOffsetMinutes } = parsed.data;

  // availability for that weekday
  const dow = dayOfWeekFromDate(date);
  const avail = await Availability.findOne({ dayOfWeek: dow });
  if (!avail || avail.isClosed) {
    return res.json({ slots: [] });
  }

  // build time range (local)
  const startMin = toMinutes(avail.start);
  const endMin = toMinutes(avail.end);
  const slot = avail.slotMinutes || 30;

  // compute start/end Date objects in user's local day, then convert to UTC by applying tz offset
  // user local midnight = date + T00:00:00, then subtract tzOffsetMinutes to get UTC time
  const localMidnight = new Date(date + "T00:00:00");
  const utcMidnight = addMinutes(localMidnight, -tzOffsetMinutes);

  const rangeStartUtc = addMinutes(utcMidnight, startMin);
  const rangeEndUtc = addMinutes(utcMidnight, endMin);

  // bookings overlapping that day range
  const bookings = await Booking.find({
    startTime: { $lt: rangeEndUtc },
    endTime: { $gt: rangeStartUtc },
    status: { $ne: "cancelled" },
  }).select("startTime endTime");

  const taken = bookings.map((b) => ({
    start: new Date(b.startTime).getTime(),
    end: new Date(b.endTime).getTime(),
  }));

  // generate slots
  const slots = [];
  let cursor = new Date(rangeStartUtc);

  while (cursor.getTime() + slot * 60 * 1000 <= rangeEndUtc.getTime()) {
    const slotStart = cursor;
    const slotEnd = addMinutes(slotStart, slot);

    // exclude past slots
    if (slotStart.getTime() > Date.now()) {
      const overlaps = taken.some((t) => slotStart.getTime() < t.end && slotEnd.getTime() > t.start);
      if (!overlaps) {
        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
        });
      }
    }

    cursor = addMinutes(cursor, slot);
  }

  return res.json({ slots });
}

module.exports = { getSlots };
