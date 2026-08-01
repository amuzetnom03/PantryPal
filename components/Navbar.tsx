'use client';

import React from 'react';
import { Refrigerator, ScanLine, UtensilsCrossed, ShoppingCart, MapPin, Settings, PackageCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  inventoryCount: number;
  expiringCount: number;
  shoppingCount: number;
  openOnboarding?: () => void;
}

export default function Navbar({ activeTab, setActiveTab, inventoryCount, expiringCount, shoppingCount, openOnboarding }: NavbarProps) {
  const tabs = [
    { id: 'inventory', label: 'Fridge & Rations', icon: Refrigerator, badge: inventoryCount },
    { id: 'scanner', label: 'AI OCR & Barcode', icon: ScanLine },
    { id: 'recipes', label: 'Global Cuisine & Cook', icon: UtensilsCrossed },
    { id: 'shopping', label: 'Shopping & Delivery', icon: ShoppingCart, badge: shoppingCount > 0 ? shoppingCount : undefined },
    { id: 'stores', label: 'Store Locator Map', icon: MapPin },
    { id: 'settings', label: 'Payment Gateways', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('inventory')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                PantryPal
              </span>
              <span className="block text-xs font-medium text-emerald-600">Smart Rations & Fridge Stocking</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full ${
                      tab.id === 'inventory' ? 'bg-slate-200 text-slate-700' : 'bg-amber-500 text-white'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                  {tab.id === 'inventory' && expiringCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-pulse" title={`${expiringCount} items expiring soon`} />
                  )}
                </button>
              );
            })}
          </nav>

          {openOnboarding && (
            <button
              onClick={openOnboarding}
              className="hidden lg:flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-all border border-emerald-200 shadow-2xs"
            >
              <span>Guide & Tutorial</span>
            </button>
          )}
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-2 scrollbar-none border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 ${
                  isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white text-emerald-700' : 'bg-slate-300 text-slate-800'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
