/**
 * Utility functions for converting color names to hex values
 */

// Common color name to hex mappings (offline fallback)
const colorNameMap: Record<string, string> = {
  // Basic colors
  'white': '#FFFFFF',
  'black': '#000000',
  'red': '#FF0000',
  'green': '#008000',
  'blue': '#0000FF',
  'yellow': '#FFFF00',
  'cyan': '#00FFFF',
  'magenta': '#FF00FF',
  'silver': '#C0C0C0',
  'gray': '#808080',
  'grey': '#808080',
  'maroon': '#800000',
  'olive': '#808000',
  'lime': '#00FF00',
  'aqua': '#00FFFF',
  'teal': '#008080',
  'navy': '#000080',
  'fuchsia': '#FF00FF',
  'purple': '#800080',
  'orange': '#FFA500',
  'pink': '#FFC0CB',
  'brown': '#A52A2A',

  // Shades and tints
  'light gray': '#D3D3D3',
  'light grey': '#D3D3D3',
  'dark gray': '#A9A9A9',
  'dark grey': '#A9A9A9',
  'light blue': '#ADD8E6',
  'dark blue': '#00008B',
  'deep blue': '#00008B',
  'light green': '#90EE90',
  'dark green': '#006400',
  'light red': '#FFB6C1',
  'dark red': '#8B0000',
  'light yellow': '#FFFFE0',
  'dark yellow': '#808000',
  'light purple': '#DDA0DD',
  'dark purple': '#301934',
  'light pink': '#FFB6C1',
  'hot pink': '#FF69B4',
  'deep pink': '#FF1493',
  'light brown': '#D2B48C',
  'dark brown': '#654321',
  'light orange': '#FFD9B3',
  'dark orange': '#FF8C00',
  'coral': '#FF7F50',
  'salmon': '#FA8072',

  // Common leather/fashion colors
  'beige': '#F5F5DC',
  'tan': '#D2B48C',
  'cream': '#FFFDD0',
  'ivory': '#FFFFF0',
  'khaki': '#F0E68C',
  'gold': '#FFD700',
  'rose': '#FF007F',
  'rust': '#B7410E',
  'burgundy': '#800020',
  'wine': '#722F37',
  'charcoal': '#36454F',
  'peach': '#FFDAB9',
  'apricot': '#FBCF8A',
  'mustard': '#FFDB58',
  'sage': '#9DC183',
  'mint': '#98FF98',
  'turquoise': '#40E0D0',
  'indigo': '#4B0082',
  'violet': '#EE82EE',
  'lavender': '#E6E6FA',
  'plum': '#DDA0DD',
  'chestnut': '#954535',
  'copper': '#B87333',
  'bronze': '#CD7F32',
  'ebony': '#555D50',
  'slate': '#708090',
  'ash': '#B2BEB5',
  'linen': '#FAF0E6',
  'pearl': '#EAE0C8',
  'sand': '#C2B280',
  'sepia': '#704214',

  // Special cases
  'butter': '#FFFACD',
  'buttercream': '#FFFACD',
};

/**
 * Convert a color name or hex value to a valid hex color
 * Supports hex values, color names, and compound names like "deep blue"
 */
export async function getColorHex(colorInput: string): Promise<string> {
  if (!colorInput || typeof colorInput !== 'string') {
    return '#CCCCCC'; // Default gray for invalid input
  }

  const trimmed = colorInput.trim();

  // Check if already a hex color
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Check offline map first (case-insensitive)
  const lowerColor = trimmed.toLowerCase();
  if (colorNameMap[lowerColor]) {
    return colorNameMap[lowerColor];
  }

  // Try partial match for compound colors (e.g., "light blue" -> "light" + "blue")
  const words = lowerColor.split(/\s+/);
  if (words.length > 1) {
    // Try exact compound match first
    if (colorNameMap[lowerColor]) {
      return colorNameMap[lowerColor];
    }
    // Try progressively longer compounds
    for (let i = words.length; i > 1; i--) {
      const compound = words.slice(0, i).join(' ');
      if (colorNameMap[compound]) {
        return colorNameMap[compound];
      }
    }
    // Try last word as main color
    const mainColor = words[words.length - 1];
    if (colorNameMap[mainColor]) {
      return colorNameMap[mainColor];
    }
  }

  // Try the ntc.js API (Name That Color) as fallback
  try {
    const response = await fetch(`https://chir.mmuchz.com/ntc.js?hex=${encodeURIComponent(trimmed)}&n=1`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.n_hex) {
        return data.n_hex;
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch color from ntc.js for "${colorInput}":`, error);
  }

  // Final fallback: generate a hash-based color from the input string
  return generateColorFromString(trimmed);
}

/**
 * Generate a consistent color from a string using hash
 */
function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  const hue = Math.abs(hash % 360);
  const saturation = 70 + (Math.abs(hash >> 8) % 20);
  const lightness = 50 + (Math.abs(hash >> 16) % 20);

  return hslToHex(hue, saturation, lightness);
}

/**
 * Convert HSL to Hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}
