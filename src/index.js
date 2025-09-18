require("dotenv").config();
const express = require("express");
const cors = require("cors");

const offerRoutes = require("./routes/offer");
const leadsRoutes = require("./routes/leads");
const scoreRoutes = require("./routes/score");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/offer", offerRoutes);
app.use("/leads", leadsRoutes);
app.use("/score", scoreRoutes);

// Health
app.get("/", (req, res) => res.send({ ok: true, msg: "Lead Scorer API" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
