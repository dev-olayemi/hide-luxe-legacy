// Delivery fee configuration for Nigerian states
// Base location: Lagos, Nigeria

export type DeliveryOption = 'delivery' | 'pickup';

// State-based delivery fees in NGN
// Fees are based on distance/logistics zones from Lagos
export const NIGERIAN_STATE_DELIVERY_FEES: Record<string, number> = {
  // Lagos - Local delivery
  "Lagos": 2500,
  
  // Zone 1 - South West (Closest to Lagos)
  "Ogun": 3500,
  "Oyo": 4000,
  "Osun": 4500,
  "Ondo": 4500,
  "Ekiti": 5000,
  
  // Zone 2 - South South / South East
  "Edo": 5500,
  "Delta": 5500,
  "Rivers": 6000,
  "Bayelsa": 6500,
  "Akwa Ibom": 7000,
  "Cross River": 7000,
  "Anambra": 6000,
  "Imo": 6500,
  "Abia": 6500,
  "Enugu": 6000,
  "Ebonyi": 6500,
  
  // Zone 3 - North Central
  "Kwara": 5000,
  "Kogi": 5500,
  "Niger": 6000,
  "Benue": 6500,
  "Plateau": 7000,
  "Nasarawa": 7000,
  "Federal Capital Territory": 6500,
  "FCT": 6500,
  
  // Zone 4 - North West
  "Kaduna": 7500,
  "Kano": 8000,
  "Katsina": 8500,
  "Jigawa": 8500,
  "Zamfara": 9000,
  "Sokoto": 9500,
  "Kebbi": 9000,
  
  // Zone 5 - North East (Furthest from Lagos)
  "Bauchi": 8500,
  "Gombe": 9000,
  "Taraba": 9000,
  "Adamawa": 9500,
  "Yobe": 10000,
  "Borno": 10500,
};

// Default fee for unlisted states or international
export const DEFAULT_DELIVERY_FEE = 8000;

// International delivery is not supported (they should contact seller)
export const INTERNATIONAL_DELIVERY_SUPPORTED = false;

// Pickup location details
export const PICKUP_LOCATION = {
  address: "28th Hide Luxe Store",
  city: "Lagos",
  state: "Lagos",
  country: "Nigeria",
  note: "Contact us for exact pickup location and timing",
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
