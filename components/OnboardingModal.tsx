'use client';

import React, { useState } from 'react';
import { Sparkles, ScanLine, Refrigerator, ShoppingCart, ArrowRight, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to PantryPal",
      subtitle: "Your intelligent house rations and fridge stocking assistant.",
      desc: "Automate your kitchen inventory, track expiration dates, reduce food waste, and enjoy exhaustive global cuisine recipes tailored to what you have.",
      icon: Refrigerator,
      color: "from-blue-600 to-indigo-600"
    },
    {
      title: "AI Receipt & Barcode Scanning",
      subtitle: "Instant stock ingestion",
      desc: "Upload supermarket paper receipts or barcode photos. Gemini Vision AI instantly extracts item names, quantities, categories, prices, and shelf life.",
      icon: ScanLine,
      color: "from-emerald-600 to-teal-600"
    },
    {
      title: "Expiration Date Alerts & Prioritization",
      subtitle: "Zero food waste kitchen",
      desc: "PantryPal monitors your rations daily. Items approaching expiration are highlighted with warning badges and automatically prioritized in your recipe suggestions.",
      icon: Sparkles,
      color: "from-amber-600 to-orange-600"
    },
    {
      title: "Smart Shopping List & Auto-Delivery",
      subtitle: "Connected grocery stores",
      desc: "When items drop below your threshold or you cook a recipe with missing ingredients, PantryPal automatically builds your shopping list. Checkout securely with Stripe, PayPal, or Bank Transfer for rapid local delivery.",
      icon: ShoppingCart,
      color: "from-teal-600 to-emerald-700"
    }
  ];

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col justify-between">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${current.color} flex items-center justify-center text-white shadow-lg`}>
            <Icon className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{current.subtitle}</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">{current.title}</h2>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">{current.desc}</p>
          </div>

          {/* Dots Indicator */}
          <div className="flex space-x-2 pt-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  step === i ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-100">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700"
          >
            Skip Tutorial
          </button>

          <button
            onClick={() => {
              if (step < steps.length - 1) {
                setStep(step + 1);
              } else {
                onClose();
              }
            }}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <span>{step === steps.length - 1 ? 'Get Started' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
