// Delivery fee configuration for Nigerian states
// Base location: Lagos, Nigeria

export type DeliveryOption = 'delivery' | 'pickup';

// State-based delivery fees in NGN
export const NIGERIAN_STATE_DELIVERY_FEES: Record<string, number> = {
  // LAGOS - Same city (Intra-Lagos)
  "Lagos": 2500,

  // ZONE 1 – South West (Very Close | 50–350 km)
  "Ogun": 3000,
  "Oyo": 4000,
  "Osun": 4500,
  "Ondo": 4500,
  "Ekiti": 5000,

  // ZONE 2 – South South & South East (Mid-range | 300–650 km)
  "Edo": 5000,
  "Delta": 5500,
  "Rivers": 6000,        // Port Harcourt
  "Bayelsa": 6500,
  "Akwa Ibom": 6500,     // Uyo
  "Cross River": 7000,   // Calabar – a bit farther
  "Abia": 6000,
  "Anambra": 5500,       // Onitsha / Awka
  "Imo": 6000,           // Owerri
  "Enugu": 6000,
  "Ebonyi": 6500,

  // ZONE 3 – North Central (Abuja & around | 500–800 km)
  "Kwara": 5000,         // Ilorin
  "Kogi": 5500,
  "Niger": 6000,
  "Benue": 6500,         // Makurdi
  "Plateau": 7000,       // Jos
  "Nasarawa": 6500,
  "Federal Capital Territory": 6500,
  "FCT": 6500,           // Abuja

  // ZONE 4 – North West (700–950 km)
  "Kaduna": 7000,
  "Kano": 8000,
  "Katsina": 8500,
  "Jigawa": 8500,
  "Kebbi": 9000,
  "Sokoto": 9500,
  "Zamfara": 9000,       // Gusau

  // ZONE 5 – North East (Furthest | 900–1200+ km)
  "Adamawa": 9500,       // Yola / Jimeta
  "Bauchi": 8500,
  "Borno": 10500,        // Maiduguri – highest risk & distance
  "Gombe": 9000,
  "Taraba": 9500,        // Jalingo
  "Yobe": 10000,         // Damaturu
};

// Fallback if state name is misspelled or not found
export const DEFAULT_DELIVERY_FEE = 7500;

// Free pickup option in Lagos
export const PICKUP_LOCATION = {
  address: "28th Hide Luxe Store (Contact us)",
  city: "Lagos",
  state: "Lagos",
  country: "Nigeria",
  phone: "+234 903 197 6895",
  note: "Call or WhatsApp 30 mins before arrival. Open Mon–Sat, 10AM–6PM",
};

// Optional: You can add this helper to normalize state names
export const normalizeStateName = (state: string): string => {
  const map: Record<string, string> = {
    "abuja": "Federal Capital Territory",
    "fct": "Federal Capital Territory",
    "portharcourt": "Rivers",
    "ph": "Rivers",
    "owerri": "Imo",
    "enugu": "Enugu",
    "asaba": "Delta",
    "benin": "Edo",
    "calabar": "Cross River",
    "uyo": "Akwa Ibom",
    "jos": "Plateau",
    "kano": "Kano",
    "kaduna": "Kaduna",
    "maiduguri": "Borno",
  };
  return map[state.toLowerCase()] || state;
};

/**
 * Calculate delivery fee based on state
 */
export const calculateDeliveryFee = (
  state: string,
  country: string = "Nigeria"
): number | null => {
  // Only Nigeria delivery supported
  if (country.toLowerCase() !== "nigeria") {
    return null; // Indicates international - user should contact seller
  }
  
  // Normalize state name
  const normalizedState = state.trim();
  
  // Check for exact match first
  if (NIGERIAN_STATE_DELIVERY_FEES[normalizedState] !== undefined) {
    return NIGERIAN_STATE_DELIVERY_FEES[normalizedState];
  }
  
  // Check case-insensitive match
  const lowerState = normalizedState.toLowerCase();
  for (const [key, fee] of Object.entries(NIGERIAN_STATE_DELIVERY_FEES)) {
    if (key.toLowerCase() === lowerState) {
      return fee;
    }
  }
  
  // Return default for unknown Nigerian states
  return DEFAULT_DELIVERY_FEE;
};

/**
 * Get all Nigerian states for dropdown
 */
export const getNigerianStates = (): string[] => {
  return Object.keys(NIGERIAN_STATE_DELIVERY_FEES).filter(
    (state) => state !== "FCT" // FCT is alias for Federal Capital Territory
  ).sort();
};

/**
 * Format delivery fee for display
 */
export const formatDeliveryFee = (fee: number | null): string => {
  if (fee === null) {
    return "Contact seller for international shipping";
  }
  return `₦${fee.toLocaleString()}`;
};
