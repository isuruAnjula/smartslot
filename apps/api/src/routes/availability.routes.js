const router = require("express").Router();
const { listAvailability, upsertAvailability } = require("../controllers/availability.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

router.get("/", listAvailability);
router.post("/", requireAuth, requireAdmin, upsertAvailability);

module.exports = router;
