'use client';

import React, { useState, useEffect } from 'react';
import { InventoryItem, GroceryStore, ShoppingListItem, PaymentSettings, OrderRecord } from '@/app/types';
import Navbar from '@/components/Navbar';
import InventoryView from '@/components/InventoryView';
import ScannerView from '@/components/ScannerView';
import RecipesView from '@/components/RecipesView';
import ShoppingListView from '@/components/ShoppingListView';
import StoresMapView from '@/components/StoresMapView';
import PaymentSettingsView from '@/components/PaymentSettingsView';
import OnboardingModal from '@/components/OnboardingModal';

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', name: 'Organic Whole Milk', quantity: 1, unit: 'gallon', category: 'Dairy', expiryDate: '2026-08-03', minThreshold: 1, price: 4.99, storeName: 'Whole Foods' },
  { id: 'inv-2', name: 'Hass Avocados', quantity: 4, unit: 'pcs', category: 'Produce', expiryDate: '2026-08-05', minThreshold: 2, price: 3.49, storeName: 'Trader Joe\'s' },
  { id: 'inv-3', name: 'Grass-fed Ribeye Steak', quantity: 2, unit: 'lbs', category: 'Meat', expiryDate: '2026-08-02', minThreshold: 1, price: 18.99, storeName: 'Whole Foods' },
  { id: 'inv-4', name: 'Jasmine Rice', quantity: 5, unit: 'kg', category: 'Pantry', expiryDate: '2027-02-01', minThreshold: 2, price: 14.50, storeName: 'Safeway' },
  { id: 'inv-5', name: 'Extra Virgin Olive Oil', quantity: 1, unit: 'bottle', category: 'Pantry', expiryDate: '2027-08-01', minThreshold: 1, price: 12.99, storeName: 'Safeway' },
  { id: 'inv-6', name: 'Free Range Eggs', quantity: 10, unit: 'pcs', category: 'Dairy', expiryDate: '2026-08-12', minThreshold: 4, price: 5.20, storeName: 'Whole Foods' },
  { id: 'inv-7', name: 'Sourdough Bread', quantity: 1, unit: 'loaf', category: 'Bakery', expiryDate: '2026-08-04', minThreshold: 1, price: 4.50, storeName: 'Trader Joe\'s' },
  { id: 'inv-8', name: 'Fresh Baby Spinach', quantity: 2, unit: 'bags', category: 'Produce', expiryDate: '2026-08-03', minThreshold: 1, price: 3.99, storeName: 'Whole Foods' },
];

const INITIAL_STORES: GroceryStore[] = [
  {
    id: 'store-1',
    name: 'Whole Foods Market',
    lat: 37.4219999,
    lng: -122.0840000,
    address: '787 Market St, San Francisco, CA',
    rating: 4.8,
    deliveryTimeMins: 25,
    minOrder: 15.0,
    deliveryFee: 3.99,
    catalog: [
      { name: 'Organic Whole Milk', price: 4.99, unit: 'gallon', category: 'Dairy' },
      { name: 'Grass-fed Ribeye Steak', price: 18.99, unit: 'lbs', category: 'Meat' },
      { name: 'Fresh Baby Spinach', price: 3.99, unit: 'bag', category: 'Produce' }
    ]
  },
  {
    id: 'store-2',
    name: 'Trader Joe\'s Fresh',
    lat: 37.4300000,
    lng: -122.0900000,
    address: '200 State St, San Francisco, CA',
    rating: 4.9,
    deliveryTimeMins: 35,
    minOrder: 10.0,
    deliveryFee: 2.99,
    catalog: [
      { name: 'Hass Avocados', price: 3.49, unit: 'pack', category: 'Produce' },
      { name: 'Sourdough Bread', price: 4.50, unit: 'loaf', category: 'Bakery' },
      { name: 'Greek Yogurt', price: 4.20, unit: 'tub', category: 'Dairy' }
    ]
  },
  {
    id: 'store-3',
    name: 'Safeway Supermarket',
    lat: 37.4150000,
    lng: -122.0750000,
    address: '550 El Camino Real, Menlo Park, CA',
    rating: 4.6,
    deliveryTimeMins: 45,
    minOrder: 25.0,
    deliveryFee: 4.99,
    catalog: [
      { name: 'Jasmine Rice', price: 14.50, unit: 'kg', category: 'Pantry' },
      { name: 'Extra Virgin Olive Oil', price: 12.99, unit: 'bottle', category: 'Pantry' },
      { name: 'Free Range Eggs', price: 5.20, unit: 'dozen', category: 'Dairy' }
    ]
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([
    { id: 'shop-1', name: 'Greek Yogurt', quantity: 2, unit: 'tub', estimatedPrice: 4.20, storeId: 'store-2', checked: false },
    { id: 'shop-2', name: 'Organic Whole Milk', quantity: 1, unit: 'gallon', estimatedPrice: 4.99, storeId: 'store-1', checked: false }
  ]);

  const [stores, setStores] = useState<GroceryStore[]>(INITIAL_STORES);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripeEnabled: true,
    stripePublishableKey: 'pk_test_51Mz...PantryPal',
    stripeSecretKey: 'sk_test_...SecretKey',
    paypalEnabled: true,
    paypalClientId: 'AY_Sandbox_Client_Id_9821',
    bankTransferEnabled: true,
    bankAccountName: 'PantryPal Household Rations Inc.',
    bankAccountNumber: 'US89-PANTRY-004921',
    bankRoutingNumber: '021000021',
    testMode: true
  });
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
    if (typeof window !== 'undefined') {
      const savedInv = localStorage.getItem('pantrypal_inventory');
      if (savedInv) {
        try { setInventory(JSON.parse(savedInv)); } catch (e) {}
      }
      const savedShop = localStorage.getItem('pantrypal_shopping');
      if (savedShop) {
        try { setShoppingList(JSON.parse(savedShop)); } catch (e) {}
      }
      if (!localStorage.getItem('pantrypal_onboarded')) {
        setShowOnboarding(true);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('pantrypal_inventory', JSON.stringify(inventory));
    }
  }, [inventory, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('pantrypal_shopping', JSON.stringify(shoppingList));
    }
  }, [shoppingList, mounted]);

  const addToShoppingList = (item: InventoryItem) => {
    const existing = shoppingList.find(s => s.name.toLowerCase() === item.name.toLowerCase());
    if (existing) {
      setShoppingList(shoppingList.map(s => s.id === existing.id ? { ...s, quantity: s.quantity + 1 } : s));
    } else {
      const newShopItem: ShoppingListItem = {
        id: 'shop-' + Date.now(),
        name: item.name,
        quantity: item.minThreshold || 1,
        unit: item.unit,
        estimatedPrice: item.price || 3.99,
        storeId: stores[0]?.id || 'store-1',
        checked: false
      };
      setShoppingList([...shoppingList, newShopItem]);
    }
    setActiveTab('shopping');
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - new Date().setHours(0,0,0,0);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const expiringCount = inventory.filter(i => getDaysUntilExpiry(i.expiryDate) <= 3 && getDaysUntilExpiry(i.expiryDate) >= 0).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        inventoryCount={inventory.length}
        expiringCount={expiringCount}
        shoppingCount={shoppingList.length}
        openOnboarding={() => setShowOnboarding(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'inventory' && (
          <InventoryView
            items={inventory}
            setItems={setInventory}
            addToShoppingList={addToShoppingList}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'scanner' && (
          <ScannerView
            setItems={setInventory}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'recipes' && (
          <RecipesView
            inventory={inventory}
            setInventory={setInventory}
          />
        )}
        {activeTab === 'shopping' && (
          <ShoppingListView
            shoppingList={shoppingList}
            setShoppingList={setShoppingList}
            stores={stores}
            paymentSettings={paymentSettings}
            onOrderPlaced={(order) => setOrders([order, ...orders])}
          />
        )}
        {activeTab === 'stores' && (
          <StoresMapView
            stores={stores}
            setStores={setStores}
          />
        )}
        {activeTab === 'settings' && (
          <PaymentSettingsView
            settings={paymentSettings}
            setSettings={setPaymentSettings}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <p>PantryPal • Smart House Rations, Fridge Stocking, AI OCR & Automated Supermarket Delivery Network</p>
      </footer>

      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}
