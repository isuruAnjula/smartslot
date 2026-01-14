const router = require("express").Router();
const { requireAuth } = require("../middlewares/auth.middleware");
const { createBooking } = require("../controllers/booking.controller");

router.post("/", requireAuth, createBooking);

module.exports = router;
