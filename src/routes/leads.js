const express = require("express");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const router = express.Router();
const store = require("../store");
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ error: "CSV file is required (field name: file)" });

  const leads = [];
  const filepath = req.file.path;
  fs.createReadStream(filepath)
    .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
    .on("data", (row) => {
      leads.push({
        name: (row.name || "").trim(),
        role: (row.role || "").trim(),
        company: (row.company || "").trim(),
        industry: (row.industry || "").trim(),
        location: (row.location || "").trim(),
        linkedin_bio: (row.linkedin_bio || "").trim(),
      });
    })
    .on("end", () => {
      store.leads = leads;

      fs.unlink(filepath, () => {});
      res.json({ ok: true, count: leads.length });
    })
    .on("error", (err) => {
      fs.unlink(filepath, () => {});
      res
        .status(500)
        .json({ error: "Failed to parse CSV", details: err.message });
    });
});

router.get("/", (req, res) => res.json({ leads: store.leads }));

module.exports = router;
