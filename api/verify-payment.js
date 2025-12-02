// CommonJS server handler for express (or serverless style)
// Uses flwConfig.cjs to pick dev vs live Flutterwave keys
const fetch = globalThis.fetch || require("node-fetch");
const admin = require("firebase-admin");
const flwConfig = require("./payments/flwConfig.cjs");

function initFirebase() {
  if (!admin.apps.length) {
    const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!sa) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT env var required");
    }
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(sa)),
    });
  }
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const body = req.body || {};
    const {
      tx_ref,
      transaction_id,
      cartItems = [],
      deliveryDetails = null,
      userId = null,
    } = body;

    if (!tx_ref && !transaction_id) {
      res.status(400).json({ error: "tx_ref or transaction_id required" });
      return;
    }

    const FLW_SECRET = flwConfig.secretKey;
    if (!FLW_SECRET) {
      console.error("Flutterwave secret missing. flwConfig:", flwConfig);
      res.status(500).json({ error: "FLW secret not configured for current environment" });
      return;
    }

    // Build verification URL. Prefer verifying by transaction id if provided.
    let verifyUrl;
    if (transaction_id) {
      verifyUrl = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;
    } else {
      // verify by tx_ref
      verifyUrl = `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(
        tx_ref
      )}`;
    }

    const verifyRes = await fetch(verifyUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${FLW_SECRET}` },
    });

    if (!verifyRes.ok) {
      const txt = await verifyRes.text().catch(() => "");
      console.error("Flutterwave verify failed", verifyRes.status, txt);
      res
        .status(502)
        .json({ error: "Failed to verify transaction", detail: txt });
      return;
    }

    const verifyJson = await verifyRes.json();
    const vdata = verifyJson.data || verifyJson;

    const okStatus =
      (vdata &&
        (vdata.status === "successful" || vdata.status === "completed")) ||
      verifyJson.status === "success";

    if (!okStatus) {
      res
        .status(400)
        .json({
          error: "Transaction not successful",
          detail: vdata?.status || verifyJson.status,
        });
      return;
    }

    // Persist order to Firestore
    initFirebase();
    const firestore = admin.firestore();

    const items = Array.isArray(cartItems)
      ? cartItems.map((it) => ({
          id: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          image: it.image || null,
          category: it.category || null,
        }))
      : [];

    const orderPayload = {
      userId: userId || null,
      userEmail: deliveryDetails?.email || vdata?.customer?.email || null,
      items,
      totalAmount: vdata?.amount || null,
      deliveryDetails: {
        ...(deliveryDetails || {}),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      status: "processing",
      paymentStatus: "paid",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      txRef: vdata?.tx_ref || tx_ref || null,
      paymentDetails: {
        transactionId: vdata?.id || transaction_id || null,
        flwRef: vdata?.flw_ref || null,
        amount: vdata?.amount || null,
        status: vdata?.status || null,
        raw: vdata,
      },
    };

    const orderRef = await firestore.collection("orders").add(orderPayload);

    res.status(200).json({ ok: true, orderId: orderRef.id });
  } catch (err) {
    console.error("verify-payment handler error", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
