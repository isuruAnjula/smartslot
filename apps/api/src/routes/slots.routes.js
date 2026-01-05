const router = require("express").Router();
const { getSlots } = require("../controllers/slots.controller");

router.get("/", getSlots); // public

module.exports = router;
