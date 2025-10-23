export interface DeliveryDetails {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  additionalInfo?: string;
}

export interface OrderStatus {
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  deliveryDate?: Date;
  trackingNumber?: string;
  updatedAt: Date;
}
