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
