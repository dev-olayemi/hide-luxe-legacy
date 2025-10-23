// usage: set FIREBASE_SERVICE_ACCOUNT to stringified JSON or point to file and run `node scripts/set-admin-claim.js youremail@example.com`
const admin = require("firebase-admin");
const fs = require("fs");

const SA_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH; // or use string env
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
  });
} else if (SA_PATH) {
  admin.initializeApp({
    credential: admin.credential.cert(require(SA_PATH)),
  });
} else {
  console.error(
    "Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH"
  );
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/set-admin-claim.js user@example.com");
  process.exit(1);
}

(async () => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log("Set admin claim for", email, "uid=", user.uid);
    process.exit(0);
  } catch (err) {
    console.error("Failed to set claim:", err);
    process.exit(1);
  }
})();
