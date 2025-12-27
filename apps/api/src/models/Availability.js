const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0=Sun
    start: { type: String, required: true }, // "09:00"
    end: { type: String, required: true },   // "17:00"
    slotMinutes: { type: Number, default: 30 },
    isClosed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

availabilitySchema.index({ dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model("Availability", availabilitySchema);
