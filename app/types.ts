export type Category = 'Produce' | 'Dairy' | 'Meat' | 'Pantry' | 'Beverages' | 'Spices' | 'Bakery' | 'Frozen';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: Category;
  expiryDate: string; // YYYY-MM-DD
  minThreshold: number;
  price?: number;
  storeName?: string;
}

export interface Recipe {
  id: string;
  title: string;
  cuisine: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Chef Level';
  matchPercentage: number;
  availableIngredients: string[];
  missingIngredients: string[];
  instructions: string[];
  calories: number;
  description: string;
}

export interface GroceryStore {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  rating: number;
  deliveryTimeMins: number;
  minOrder: number;
  deliveryFee: number;
  catalog: { name: string; price: number; unit: string; category: Category }[];
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  storeId: string;
  checked: boolean;
}

export interface PaymentSettings {
  stripeEnabled: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  paypalEnabled: boolean;
  paypalClientId: string;
  bankTransferEnabled: boolean;
  bankAccountName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  testMode: boolean;
}

export interface OrderRecord {
  id: string;
  storeName: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  paymentMethod: 'Stripe' | 'PayPal' | 'Bank Transfer';
  deliveryAddress: string;
  status: 'Processing' | 'Dispatched' | 'Out for Delivery' | 'Delivered';
  estimatedDeliveryMinutes?: number;
  createdAt: string;
}
