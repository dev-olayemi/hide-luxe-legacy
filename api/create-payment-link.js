// Vercel serverless (or any Node server). Requires FLW_SECRET_KEY in environment.
// Returns full JSON from Flutterwave. Adjust response parsing as needed.

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");
  const body = req.body;
  const FLW_SECRET = process.env.FLW_SECRET_KEY;
  if (!FLW_SECRET)
    return res.status(500).json({ error: "Missing FLW_SECRET_KEY" });

  try {
    const resp = await fetch("https://api.flutterwave.com/v3/payment-links", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FLW_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: body.amount,
        currency: body.currency || "NGN",
        tx_ref: body.tx_ref,
        redirect_url:
          body.redirect_url ||
          `${
            process.env.APP_ORIGIN || "http://localhost:8080"
          }/payment-success`,
        customer: body.customer,
        title: "28th Hide Luxe Order",
        description: `Cart ${body.cartId || ""}`,
      }),
    });

    const data = await resp.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "server error" });
  }
};
