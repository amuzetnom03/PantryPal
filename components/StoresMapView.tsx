'use client';

import React, { useState } from 'react';
import { GroceryStore, Category } from '@/app/types';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Store, Plus, Star, Truck, Clock, DollarSign, ExternalLink } from 'lucide-react';

interface StoresMapViewProps {
  stores: GroceryStore[];
  setStores: React.Dispatch<React.SetStateAction<GroceryStore[]>>;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (typeof window !== 'undefined' && (window as any).GOOGLE_MAPS_PLATFORM_KEY) ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY !== 'MY_GOOGLE_MAPS_KEY';

export default function StoresMapView({ stores, setStores }: StoresMapViewProps) {
  const [selectedStore, setSelectedStore] = useState<GroceryStore | null>(stores[0] || null);
  const [isAddingStore, setIsAddingStore] = useState(false);

  // New store form
  const [newStoreData, setNewStoreData] = useState({
    name: '',
    address: '',
    deliveryTimeMins: 30,
    minOrder: 15.0,
    deliveryFee: 3.99
  });

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreData.name.trim()) return;

    const newStore: GroceryStore = {
      id: 'store-' + Date.now(),
      name: newStoreData.name,
      lat: 37.42 + (Math.random() - 0.5) * 0.05,
      lng: -122.08 + (Math.random() - 0.5) * 0.05,
      address: newStoreData.address || 'Local Marketplace Avenue',
      rating: 4.8,
      deliveryTimeMins: newStoreData.deliveryTimeMins,
      minOrder: newStoreData.minOrder,
      deliveryFee: newStoreData.deliveryFee,
      catalog: [
        { name: 'Organic Whole Milk', price: 4.99, unit: 'gallon', category: 'Dairy' },
        { name: 'Artisan Sourdough', price: 4.50, unit: 'loaf', category: 'Bakery' },
        { name: 'Avocados', price: 3.49, unit: 'pack', category: 'Produce' }
      ]
    };

    setStores([...stores, newStore]);
    setSelectedStore(newStore);
    setNewStoreData({ name: '', address: '', deliveryTimeMins: 30, minOrder: 15.0, deliveryFee: 3.99 });
    setIsAddingStore(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supermarket & Local Shop Locator</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Discover nearby grocery stores, view live catalogs, and dispatch automated delivery queries.
          </p>
        </div>
        <button
          onClick={() => setIsAddingStore(true)}
          className="bg-white text-emerald-800 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:bg-emerald-50 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supermarket / Shop</span>
        </button>
      </div>

      {/* Map & Store List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Store Directory */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
            <Store className="w-5 h-5 text-emerald-600" />
            <span>Integrated Partner Shops ({stores.length})</span>
          </h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {stores.map(store => {
              const isSelected = selectedStore?.id === store.id;
              return (
                <div
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={`bg-white rounded-2xl p-4 border cursor-pointer transition-all shadow-xs hover:shadow-md ${
                    isSelected ? 'border-emerald-600 bg-emerald-50/30 ring-2 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-slate-900 text-base">{store.name}</h3>
                    <span className="flex items-center space-x-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{store.rating}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{store.address}</p>

                  <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <div>
                      <div className="text-slate-400">Delivery</div>
                      <div>~{store.deliveryTimeMins}m</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Fee</div>
                      <div>${store.deliveryFee}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Min Order</div>
                      <div>${store.minOrder}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Google Maps View & Store Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="h-[400px] w-full relative">
              {!hasValidKey ? (
                <div className="absolute inset-0 bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
                  <MapPin className="w-12 h-12 text-emerald-400 mb-3" />
                  <h3 className="text-lg font-bold">Google Maps API Key Required for Store Locator</h3>
                  <p className="text-xs text-slate-300 max-w-md mt-1 mb-4">
                    Add your <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">GOOGLE_MAPS_PLATFORM_KEY</code> in the AI Studio Settings &gt; Secrets panel to enable interactive mapping.
                  </p>
                  <div className="bg-slate-800 p-4 rounded-xl text-left text-xs space-y-1 max-w-md w-full">
                    <div>1. Open Settings (⚙️ gear icon, top-right)</div>
                    <div>2. Select Secrets</div>
                    <div>3. Add <code>GOOGLE_MAPS_PLATFORM_KEY</code></div>
                  </div>
                </div>
              ) : (
                <APIProvider apiKey={API_KEY} version="weekly">
                  <Map
                    defaultCenter={{ lat: 37.42, lng: -122.08 }}
                    defaultZoom={13}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    {stores.map(store => (
                      <AdvancedMarker
                        key={store.id}
                        position={{ lat: store.lat, lng: store.lng }}
                        onClick={() => setSelectedStore(store)}
                      >
                        <Pin background={selectedStore?.id === store.id ? '#059669' : '#4285F4'} glyphColor="#fff" />
                      </AdvancedMarker>
                    ))}
                  </Map>
                </APIProvider>
              )}
            </div>

            {/* Selected Store Catalog Preview */}
            {selectedStore && (
              <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{selectedStore.name} Catalog</h3>
                    <p className="text-xs text-slate-500">Instant purchase query dispatch available.</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                    Partner Store Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedStore.catalog.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                        <span className="text-[11px] text-slate-500">{item.category} • per {item.unit}</span>
                      </div>
                      <div className="font-bold text-emerald-600 text-sm">${item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Supermarket Modal */}
      {isAddingStore && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Add New Supermarket / Local Shop</h2>
            <form onSubmit={handleAddStore} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Store / Shop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metro Organic Grocer"
                  value={newStoreData.name}
                  onChange={(e) => setNewStoreData({ ...newStoreData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 456 Market St, San Francisco"
                  value={newStoreData.address}
                  onChange={(e) => setNewStoreData({ ...newStoreData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery (mins)</label>
                  <input
                    type="number"
                    min="10"
                    value={newStoreData.deliveryTimeMins}
                    onChange={(e) => setNewStoreData({ ...newStoreData, deliveryTimeMins: parseInt(e.target.value) || 30 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newStoreData.deliveryFee}
                    onChange={(e) => setNewStoreData({ ...newStoreData, deliveryFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Order ($)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={newStoreData.minOrder}
                    onChange={(e) => setNewStoreData({ ...newStoreData, minOrder: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingStore(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md"
                >
                  Add Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
