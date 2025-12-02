// Simple Flutterwave config chooser (CommonJS)
// Chooses live keys when NODE_ENV === 'production', otherwise uses dev keys
const env = process.env.NODE_ENV || process.env.VERCEL_ENV || 'development';

const isProd = env === 'production' || env === 'prod' || process.env.VERCEL_ENV === 'production';

const config = {
  env,
  isProd,
  publicKey: isProd ? process.env.FLW_PUBLIC_KEY_LIVE : process.env.FLW_PUBLIC_KEY_DEV || process.env.VITE_FLW_PUBLIC_KEY,
  secretKey: isProd ? process.env.FLW_SECRET_KEY_LIVE : process.env.FLW_SECRET_KEY_DEV || process.env.FLW_SECRET_KEY,
  encryptionKey: isProd ? process.env.FLW_ENCRYPTION_KEY_LIVE : process.env.FLW_ENCRYPTION_KEY_DEV,
};

module.exports = config;
