/**
 * Seed script — adds 5 sample art products to Firestore
 * Uses Firebase Admin SDK (service account) — bypasses all Firestore security rules
 * Usage: node scripts/seed-art-products.mjs
 */

import { createRequire } from "module";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Use firebase-admin (already installed as a dependency)
const admin = require("firebase-admin");
const serviceAccount = require("../hide-luxe-firebase-adminsdk-fbsvc-097d57f6c7.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ── Sample art products ───────────────────────────────────────────────────────
// Using publicly available royalty-free art images from Unsplash
const artProducts = [
  {
    name: "Golden Horizon",
    description:
      "A sweeping abstract landscape capturing the moment the sun melts into the earth. Bold strokes of gold and amber on a deep charcoal canvas.",
    inspiration: "Inspired by the Lagos skyline at dusk",
    price: 450000,
    discount: 0,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80"],
    type: "art",
    category: "Abstract",
    materials: "Acrylic on canvas",
    care: "Keep away from direct sunlight. Wipe gently with a dry cloth.",
    isLimited: true,
    isFeatured: true,
    isAvailable: true,
    stock: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Echoes of Silence",
    description:
      "A hauntingly beautiful portrait series exploring identity and stillness. Deep blues and muted greys create a meditative atmosphere.",
    inspiration: "Inspired by the quiet between heartbeats",
    price: 320000,
    discount: 10,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80"],
    type: "art",
    category: "Portrait",
    materials: "Oil on linen",
    care: "Avoid humidity. Professional framing recommended.",
    isLimited: false,
    isFeatured: true,
    isAvailable: true,
    stock: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Urban Pulse",
    description:
      "A vibrant mixed-media piece capturing the energy of city life — layered textures, neon accents, and raw urban geometry.",
    inspiration: "The rhythm of Surulere at midnight",
    price: 280000,
    discount: 0,
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80"],
    type: "art",
    category: "Mixed Media",
    materials: "Mixed media on board",
    care: "Handle with care. Do not expose to moisture.",
    isLimited: false,
    isFeatured: false,
    isAvailable: true,
    stock: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Roots & Wings",
    description:
      "A powerful diptych celebrating heritage and freedom. Earthy terracotta tones ground the piece while sweeping upward strokes suggest flight.",
    inspiration: "For every child who was told to stay small",
    price: 600000,
    discount: 0,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80"],
    type: "art",
    category: "Abstract",
    materials: "Acrylic and gold leaf on canvas",
    care: "Store upright. Avoid stacking. Professional installation advised.",
    isLimited: true,
    isFeatured: true,
    isAvailable: true,
    stock: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Still Waters",
    description:
      "A serene waterscape rendered in translucent layers of blue and white. The surface tension of calm water captured in exquisite detail.",
    inspiration: "A morning on the Benue River",
    price: 195000,
    discount: 15,
    image: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&q=80"],
    type: "art",
    category: "Landscape",
    materials: "Watercolour on archival paper",
    care: "Frame under UV-protective glass. Keep away from direct light.",
    isLimited: false,
    isFeatured: false,
    isAvailable: true,
    stock: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ── Also ensure the artSection setting exists ─────────────────────────────────
async function ensureArtSectionSetting() {
  await db.doc("siteSettings/artSection").set({ enabled: true }, { merge: true });
  console.log("✓ siteSettings/artSection set to enabled: true");
}

async function seed() {
  console.log("\n🎨 Seeding art products...\n");

  await ensureArtSectionSetting();

  for (const product of artProducts) {
    const ref = await db.collection("products").add(product);
    console.log(`✓ Added: "${product.name}" → ${ref.id}`);
  }

  console.log(`\n✅ Done — ${artProducts.length} art products seeded.\n`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
