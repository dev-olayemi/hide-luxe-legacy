module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  // fake create a Firestore-like order id for testing UI
  const fakeOrderId = "order_dev_" + Date.now().toString(36);
  // return same shape frontend expects
  res.status(200).json({ ok: true, orderId: fakeOrderId });
};