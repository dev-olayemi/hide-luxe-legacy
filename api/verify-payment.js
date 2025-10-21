module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");
  const { transaction_id } = req.body;
  const FLW_SECRET = process.env.FLW_SECRET_KEY;
  if (!FLW_SECRET || !transaction_id)
    return res.status(400).json({ error: "Missing params" });

  try {
    const resp = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${FLW_SECRET}`,
        },
      }
    );
    const data = await resp.json();
    // data.data contains transaction details — check status, amount, tx_ref etc
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "server error" });
  }
};
