import menOxford from "@/assets/products/men-oxford-black.jpg";
import womenHeels from "@/assets/products/women-heels-brown.jpg";
import menLoafers from "@/assets/products/men-loafers-brown.jpg";
import womenBoots from "@/assets/products/women-boots-black.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  sizes: string[];
  colors: string[];
  isNew?: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Classic Oxford Black",
    price: 125000,
    image: menOxford,
    images: [menOxford],
    category: "Men's Footwear",
    description: "Timeless black Oxford shoes crafted from premium Italian leather. Features traditional lace-up design with leather soles and refined stitching details. Perfect for formal occasions and business settings.",
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: ["Black"],
    isNew: true,
  },
  {
    id: "2",
    name: "Elegant Leather Heels",
    price: 95000,
    image: womenHeels,
    images: [womenHeels],
    category: "Women's Footwear",
    description: "Sophisticated brown leather heels that combine elegance with comfort. Hand-stitched from the finest leather, featuring a sleek pointed toe and a 3-inch heel for the perfect balance of style and wearability.",
    sizes: ["36", "37", "38", "39", "40", "41"],
    colors: ["Brown"],
    isNew: true,
  },
  {
    id: "3",
    name: "Premium Brown Loafers",
    price: 110000,
    image: menLoafers,
    images: [menLoafers],
    category: "Men's Footwear",
    description: "Luxurious brown leather loafers that epitomize casual elegance. Slip-on design with meticulous stitching and a cushioned insole for all-day comfort. Versatile enough for both business casual and weekend wear.",
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: ["Brown", "Tan"],
  },
  {
    id: "4",
    name: "Sophisticated Ankle Boots",
    price: 135000,
    image: womenBoots,
    images: [womenBoots],
    category: "Women's Footwear",
    description: "Refined black ankle boots that make a bold statement. Crafted from supple premium leather with a comfortable block heel and inside zipper for easy wear. Perfect for transitional seasons and adding edge to any outfit.",
    sizes: ["36", "37", "38", "39", "40", "41"],
    colors: ["Black"],
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter((p) => p.category === category);
};

export const getNewArrivals = (): Product[] => {
  return products.filter((p) => p.isNew);
};
