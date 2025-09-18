const express = require("express");
const router = express.Router();
const store = require("../store");
const scorer = require("../services/scorer");
const { Parser } = require("json2csv");

router.post("/", async (req, res) => {
  if (!store.offer)
    return res
      .status(400)
      .json({ error: "No offer found. POST /offer first." });
  if (!store.leads || store.leads.length === 0)
    return res
      .status(400)
      .json({ error: "No leads. POST /leads/upload first." });

  try {
    const results = await scorer.scoreAll(store.leads, store.offer);
    store.results = results;
    res.json({ ok: true, count: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scoring failed", details: err.message });
  }
});

router.get("/results", (req, res) => {
  res.json(store.results || []);
});

router.get("/results/export", (req, res) => {
  const fields = [
    "name",
    "role",
    "company",
    "industry",
    "intent",
    "score",
    "reasoning",
    "ai_explanation",
  ];
  const parser = new Parser({ fields });
  const csv = parser.parse(store.results || []);
  res.header("Content-Type", "text/csv");
  res.attachment("results.csv");
  res.send(csv);
});

module.exports = router;
