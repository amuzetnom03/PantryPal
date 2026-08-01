'use client';

import React, { useState } from 'react';
import { ShoppingListItem, GroceryStore, PaymentSettings, OrderRecord } from '@/app/types';
import { ShoppingCart, Trash2, Plus, Truck, CreditCard, CheckCircle2, Building, ShieldCheck, Loader2 } from 'lucide-react';

interface ShoppingListViewProps {
  shoppingList: ShoppingListItem[];
  setShoppingList: React.Dispatch<React.SetStateAction<ShoppingListItem[]>>;
  stores: GroceryStore[];
  paymentSettings: PaymentSettings;
  onOrderPlaced: (order: OrderRecord) => void;
}

export default function ShoppingListView({ shoppingList, setShoppingList, stores, paymentSettings, onOrderPlaced }: ShoppingListViewProps) {
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.id || 'store-1');
  const [deliveryAddress, setDeliveryAddress] = useState('742 Evergreen Terrace, Springfield');
  const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'PayPal' | 'Bank Transfer'>('Stripe');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<OrderRecord | null>(null);

  // New item form
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(3.99);

  const currentStore = stores.find(s => s.id === selectedStoreId) || stores[0];

  const toggleCheck = (id: string) => {
    setShoppingList(shoppingList.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const deleteItem = (id: string) => {
    setShoppingList(shoppingList.filter(i => i.id !== id));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const item: ShoppingListItem = {
      id: 'shop-' + Date.now(),
      name: newItemName,
      quantity: newItemQty,
      unit: 'pcs',
      estimatedPrice: newItemPrice,
      storeId: selectedStoreId,
      checked: false
    };
    setShoppingList([item, ...shoppingList]);
    setNewItemName('');
    setNewItemQty(1);
  };

  const subtotal = shoppingList.reduce((acc, item) => acc + item.estimatedPrice * item.quantity, 0);
  const deliveryFee = currentStore?.deliveryFee || 3.99;
  const totalAmount = subtotal + (subtotal > 0 ? deliveryFee : 0);

  const handleCheckout = async () => {
    if (shoppingList.length === 0) return;
    setLoadingCheckout(true);

    try {
      const res = await fetch('/api/gemini/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: currentStore?.name || 'Local Grocery Store',
          items: shoppingList.map(i => ({ name: i.name, quantity: i.quantity, price: i.estimatedPrice })),
          paymentMethod,
          deliveryAddress,
          totalAmount
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setOrderSuccess(data.order);
      onOrderPlaced(data.order);
      setShoppingList([]); // Clear shopping list upon successful order dispatch
      setIsCheckingOut(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shopping List & Supermarket Auto-Delivery</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Automated replenishment reminders connected directly with local grocery store delivery networks.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-900/50 px-4 py-2 rounded-xl border border-emerald-500/30 text-sm">
          <Truck className="w-4 h-4 text-emerald-300" />
          <span>Selected Store: <strong>{currentStore?.name}</strong></span>
        </div>
      </div>

      {orderSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center space-x-3 text-emerald-800">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-lg">Order Successfully Dispatched!</h3>
              <p className="text-xs text-emerald-700">Order ID: {orderSuccess.id} • Estimated Delivery in ~{orderSuccess.estimatedDeliveryMinutes} mins</p>
            </div>
          </div>
          <div className="text-xs text-slate-600 bg-white p-4 rounded-xl border border-emerald-100 space-y-1">
            <div><strong>Store:</strong> {orderSuccess.storeName}</div>
            <div><strong>Delivery Address:</strong> {orderSuccess.deliveryAddress}</div>
            <div><strong>Payment Gateway:</strong> {orderSuccess.paymentMethod} {paymentSettings.testMode && '(Test Mode Active)'}</div>
            <div><strong>Total Paid:</strong> ${orderSuccess.totalAmount.toFixed(2)}</div>
          </div>
          <button
            onClick={() => setOrderSuccess(null)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all"
          >
            Create New Shopping List
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Add item & Store Select */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-bold text-slate-900 text-base">Select Delivery Supermarket</h2>
            <div className="space-y-2">
              {stores.map(store => (
                <div
                  key={store.id}
                  onClick={() => setSelectedStoreId(store.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedStoreId === store.id ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{store.name}</h4>
                    <span className="text-xs text-slate-500">~{store.deliveryTimeMins} mins • ${store.deliveryFee} delivery</span>
                  </div>
                  {selectedStoreId === store.id && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-bold text-slate-900 text-base">Add Item to Shopping List</h2>
            <form onSubmit={addItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Greek Yogurt"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add to List</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: Shopping Items List & Checkout Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between min-h-[450px]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  <span>Current Shopping List ({shoppingList.length})</span>
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  Subtotal: ${subtotal.toFixed(2)}
                </span>
              </div>

              {shoppingList.length === 0 && (
                <div className="py-20 text-center space-y-3">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-slate-500 text-sm">Your shopping list is currently empty. Reorder low stock items from your fridge or add items manually.</p>
                </div>
              )}

              <div className="space-y-3">
                {shoppingList.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleCheck(item.id)}
                        className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                      />
                      <div>
                        <h4 className={`font-bold text-sm ${item.checked ? 'line-through text-slate-400' : 'text-slate-900'}`}>{item.name}</h4>
                        <span className="text-xs text-slate-500">Qty: {item.quantity} {item.unit}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-bold text-slate-900 text-sm">${(item.estimatedPrice * item.quantity).toFixed(2)}</span>
                      <button onClick={() => deleteItem(item.id)} className="text-slate-400 hover:text-rose-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {shoppingList.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Supermarket Delivery Fee ({currentStore?.name}):</span>
                    <span className="font-semibold text-slate-900">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span className="text-emerald-600">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <Truck className="w-5 h-5" />
                  <span>Proceed to Auto-Delivery & Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckingOut && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <h2 className="text-xl font-bold text-slate-900">Secure Checkout & Auto-Delivery</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address</label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Select Payment Gateway (Configured in Settings)</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Stripe')}
                  className={`p-3 rounded-xl border text-center font-semibold text-xs transition-all ${
                    paymentMethod === 'Stripe' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                  <span>Stripe</span>
                  {!paymentSettings.stripeEnabled && <span className="block text-[9px] text-amber-600 mt-0.5">(Disabled)</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('PayPal')}
                  className={`p-3 rounded-xl border text-center font-semibold text-xs transition-all ${
                    paymentMethod === 'PayPal' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-teal-600" />
                  <span>PayPal</span>
                  {!paymentSettings.paypalEnabled && <span className="block text-[9px] text-amber-600 mt-0.5">(Disabled)</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Bank Transfer')}
                  className={`p-3 rounded-xl border text-center font-semibold text-xs transition-all ${
                    paymentMethod === 'Bank Transfer' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <span>Bank Transfer</span>
                  {!paymentSettings.bankTransferEnabled && <span className="block text-[9px] text-amber-600 mt-0.5">(Disabled)</span>}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between"><span>Store:</span><span className="font-bold text-slate-900">{currentStore?.name}</span></div>
              <div className="flex justify-between"><span>ETA Delivery:</span><span className="font-bold text-slate-900">~{currentStore?.deliveryTimeMins} minutes</span></div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Charge:</span>
                <span className="text-emerald-600">${totalAmount.toFixed(2)} {paymentSettings.testMode && '[TEST MODE]'}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCheckingOut(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loadingCheckout}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md flex items-center space-x-2"
              >
                {loadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                <span>Authorize & Send Order to Store</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
