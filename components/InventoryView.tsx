'use client';

import React, { useState } from 'react';
import { InventoryItem, Category } from '@/app/types';
import { Plus, Search, AlertTriangle, Trash2, Edit3, ShoppingCart, RefreshCw, CheckCircle2 } from 'lucide-react';

interface InventoryViewProps {
  items: InventoryItem[];
  setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  addToShoppingList: (item: InventoryItem) => void;
  setActiveTab: (tab: string) => void;
}

const CATEGORIES: Category[] = ['Produce', 'Dairy', 'Meat', 'Pantry', 'Beverages', 'Spices', 'Bakery', 'Frozen'];

export default function InventoryView({ items, setItems, addToShoppingList, setActiveTab }: InventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form state for new/edit item
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'pcs',
    category: 'Produce' as Category,
    expiryDate: new Date().toISOString().split('T')[0],
    minThreshold: 1,
    price: 3.99,
    storeName: 'Whole Foods Market'
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDaysUntilExpiry = (expiryDate: string) => {
    const diff = new Date(expiryDate).getTime() - new Date().setHours(0,0,0,0);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...i, ...formData } : i));
      setEditingItem(null);
    } else {
      const newItem: InventoryItem = {
        id: 'item-' + Date.now(),
        ...formData
      };
      setItems([newItem, ...items]);
    }

    setFormData({
      name: '',
      quantity: 1,
      unit: 'pcs',
      category: 'Produce',
      expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      minThreshold: 1,
      price: 3.99,
      storeName: 'Whole Foods Market'
    });
    setIsAdding(false);
  };

  const startEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      expiryDate: item.expiryDate,
      minThreshold: item.minThreshold,
      price: item.price || 3.99,
      storeName: item.storeName || 'Local Market'
    });
    setIsAdding(true);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Smart Fridge & House Rations</h1>
            <p className="text-emerald-100 text-sm mt-1">
              Real-time inventory tracking, expiration alerts, and automated supermarket reordering.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  name: '',
                  quantity: 1,
                  unit: 'pcs',
                  category: 'Produce',
                  expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                  minThreshold: 1,
                  price: 3.99,
                  storeName: 'Whole Foods Market'
                });
                setIsAdding(true);
              }}
              className="bg-white text-emerald-800 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:bg-emerald-50 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ration Item</span>
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className="bg-emerald-600/60 border border-emerald-400/30 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-all flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Scan Receipt / Barcode</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-600/40">
          <div className="bg-emerald-900/40 backdrop-blur-xs rounded-xl p-3 border border-emerald-500/20">
            <div className="text-2xl font-bold">{items.length}</div>
            <div className="text-xs text-emerald-200">Total Tracked Items</div>
          </div>
          <div className="bg-emerald-900/40 backdrop-blur-xs rounded-xl p-3 border border-emerald-500/20">
            <div className="text-2xl font-bold text-amber-300">
              {items.filter(i => getDaysUntilExpiry(i.expiryDate) <= 3 && getDaysUntilExpiry(i.expiryDate) >= 0).length}
            </div>
            <div className="text-xs text-emerald-200">Expiring in 3 Days</div>
          </div>
          <div className="bg-emerald-900/40 backdrop-blur-xs rounded-xl p-3 border border-emerald-500/20">
            <div className="text-2xl font-bold text-rose-300">
              {items.filter(i => getDaysUntilExpiry(i.expiryDate) < 0 || i.quantity <= i.minThreshold).length}
            </div>
            <div className="text-xs text-emerald-200">Low Stock / Expired</div>
          </div>
          <div className="bg-emerald-900/40 backdrop-blur-xs rounded-xl p-3 border border-emerald-500/20">
            <div className="text-2xl font-bold text-teal-200">
              ${items.reduce((acc, i) => acc + (i.price || 3.99) * i.quantity, 0).toFixed(2)}
            </div>
            <div className="text-xs text-emerald-200">Estimated Stock Value</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search rations, fridge items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'All' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => {
          const daysLeft = getDaysUntilExpiry(item.expiryDate);
          const isExpired = daysLeft < 0;
          const isExpiringSoon = daysLeft <= 3 && !isExpired;
          const isLowStock = item.quantity <= item.minThreshold;

          return (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
              {/* Status Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug">{item.name}</h3>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(item)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-50">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quantity & Expiry Badges */}
              <div className="my-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center">-</button>
                    <span className="font-bold text-slate-900">{item.quantity} {item.unit}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center">+</button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Expires:</span>
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${
                    isExpired ? 'bg-rose-100 text-rose-700' : isExpiringSoon ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isExpired ? 'Expired' : `${daysLeft} days left (${item.expiryDate})`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Source Store:</span>
                  <span className="text-slate-700 font-semibold">{item.storeName || 'Supermarket'}</span>
                </div>
              </div>

              {/* Alert / Reorder Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {isLowStock || isExpired ? (
                  <div className="flex items-center space-x-1 text-rose-600 text-xs font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{isExpired ? 'Expired item' : 'Low stock level'}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-emerald-600 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sufficient Stock</span>
                  </div>
                )}

                <button
                  onClick={() => addToShoppingList(item)}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 shadow-2xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Reorder</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-slate-500 text-sm">No ration or fridge items match your search.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-xs hover:bg-emerald-700 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingItem ? 'Edit Ration Item' : 'Add New Ration / Fridge Item'}
            </h2>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Organic Whole Milk"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pcs, kg, liters, pack"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
