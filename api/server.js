const express = require("express");
const cors = require("cors");
const flwConfig = require("./payments/flwConfig.cjs");

// Select the proper verify-payment handler depending on environment
let verifyHandler;
try {
  if (flwConfig.isProd) {
    verifyHandler = require("./verify-payment");
    console.log("Using production verify-payment handler");
  } else {
    verifyHandler = require("./verify-payment-dev");
    console.log("Using dev verify-payment handler");
  }
} catch (err) {
  console.warn("verify-payment handler load failed, falling back to dev stub:", err.message);
  verifyHandler = require("./verify-payment-dev");
}

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/verify-payment", (req, res) => verifyHandler(req, res));

// Safe dev helper: report which Flutterwave public key the server is using
app.get("/api/flw-config", (req, res) => {
  try {
    const publicKey = flwConfig.publicKey || null;
    const maskedPublic = publicKey
      ? publicKey.length > 10
        ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`
        : publicKey
      : null;
    return res.json({ ok: true, env: flwConfig.env, isProd: flwConfig.isProd, publicKey: maskedPublic });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "failed to read flw config" });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.API_PORT || 8081;
app.listen(PORT, () =>
  console.log(`Local API running at http://localhost:${PORT}/api`)
);
