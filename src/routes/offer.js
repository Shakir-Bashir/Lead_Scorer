const express = require("express");
const router = express.Router();
const store = require("../store");

router.post("/", (req, res) => {
  const { name, value_props, ideal_use_cases } = req.body;
  if (!name || !Array.isArray(value_props) || !Array.isArray(ideal_use_cases)) {
    return res.status(400).json({
      error: "name, value_props (array), ideal_use_cases (array) required",
    });
  }

  store.offer = { name, value_props, ideal_use_cases };
  return res.json({ ok: true, offer: store.offer });
});

router.get("/", (req, res) => res.json({ offer: store.offer }));

module.exports = router;
