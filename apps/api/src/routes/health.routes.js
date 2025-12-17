const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({ ok: true, service: "smartslot-api" });
});

module.exports = router;
