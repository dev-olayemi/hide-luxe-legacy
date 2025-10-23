const express = require("express");
const cors = require("cors");
const verifyHandler = require("./verify-payment-dev"); // use stub for dev

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/verify-payment", (req, res) => verifyHandler(req, res));

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.API_PORT || 8081;
app.listen(PORT, () =>
  console.log(`Local API running at http://localhost:${PORT}/api`)
);
