const router = require("express").Router();
const { createBooking, myBookings, adminListBookings, cancelBooking } = require("../controllers/booking.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

router.post("/", requireAuth, createBooking);
router.get("/mine", requireAuth, myBookings);
router.get("/admin", requireAuth, requireAdmin, adminListBookings);
router.patch("/:id/cancel", requireAuth, cancelBooking);

module.exports = router;
