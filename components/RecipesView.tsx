'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InventoryItem, Recipe } from '@/app/types';
import { UtensilsCrossed, Sparkles, Flame, Clock, CheckCircle2, AlertCircle, ChefHat, ArrowRight, Loader2 } from 'lucide-react';

interface RecipesViewProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

const CUISINES = ['All Global', 'Italian', 'Japanese', 'Mexican', 'French', 'Indian', 'Thai', 'Mediterranean', 'American'];

export default function RecipesView({ inventory, setInventory }: RecipesViewProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: 'rec-1',
      title: 'Truffle & Herb Ribeye Steak with Sautéed Spinach',
      cuisine: 'French',
      prepTime: '20 mins',
      difficulty: 'Medium',
      matchPercentage: 92,
      availableIngredients: ['Grass-fed Ribeye Steak', 'Fresh Baby Spinach', 'Extra Virgin Olive Oil'],
      missingIngredients: ['Truffle Butter'],
      instructions: [
        'Season the ribeye steak generously with sea salt, cracked black pepper, and crushed garlic.',
        'Heat extra virgin olive oil in a cast-iron skillet over high heat until smoking.',
        'Sear the steak for 4 minutes per side for medium-rare, basting with butter.',
        'Toss baby spinach in the residual pan juices until wilted.',
        'Serve hot with a side of toasted sourdough.'
      ],
      calories: 680,
      description: 'A luxurious French-inspired steak dinner utilizing available fridge ribeye and fresh baby spinach.'
    },
    {
      id: 'rec-2',
      title: 'Avocado & Egg Sourdough Bruschetta',
      cuisine: 'Mediterranean',
      prepTime: '10 mins',
      difficulty: 'Easy',
      matchPercentage: 100,
      availableIngredients: ['Hass Avocados', 'Free Range Eggs', 'Sourdough Bread', 'Extra Virgin Olive Oil'],
      missingIngredients: [],
      instructions: [
        'Toast thick slices of sourdough bread until golden and crisp.',
        'Mash ripe Hass avocados with sea salt, lemon juice, and black pepper.',
        'Poach free range eggs to soft-set perfection.',
        'Layer mashed avocado onto toast, top with poached egg and a drizzle of olive oil.'
      ],
      calories: 420,
      description: 'A nutritious Mediterranean breakfast packed with healthy fats and protein.'
    },
    {
      id: 'rec-3',
      title: 'Creamy Garlic Jasmine Rice Pilaf',
      cuisine: 'Asian Fusion',
      prepTime: '25 mins',
      difficulty: 'Easy',
      matchPercentage: 88,
      availableIngredients: ['Jasmine Rice', 'Organic Whole Milk', 'Extra Virgin Olive Oil'],
      missingIngredients: ['Shallots', 'Chicken Broth'],
      instructions: [
        'Rinse jasmine rice thoroughly under cold water.',
        'Sauté minced aromatics in olive oil until translucent.',
        'Simmer rice in a blend of organic whole milk and broth until fluffy and creamy.',
        'Garnish with fresh herbs and serve warm.'
      ],
      calories: 350,
      description: 'Comforting creamy jasmine rice cooked with aromatic spices.'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState('All Global');
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchRecipes = useCallback(async (cuisine: string) => {
    setLoading(true);
    setSelectedCuisine(cuisine);
    try {
      const res = await fetch('/api/gemini/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory, cuisinePreference: cuisine })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRecipes(data.recipes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [inventory]);

  const cookRecipe = (recipe: Recipe) => {
    // Automatically deduct available ingredients from inventory
    let updated = [...inventory];
    recipe.availableIngredients.forEach(ingName => {
      updated = updated.map(item => {
        if (item.name.toLowerCase().includes(ingName.toLowerCase()) && item.quantity > 0) {
          return { ...item, quantity: Math.max(0, item.quantity - 1) };
        }
        return item;
      });
    });
    setInventory(updated);
    setSuccessMsg(`Successfully prepared ${recipe.title}! Requisite ingredients automatically deducted from your fridge.`);
    setTimeout(() => setSuccessMsg(null), 5000);
    setActiveRecipe(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Global Cuisine & Smart Recipe Matcher</h1>
          <p className="text-teal-100 text-sm mt-1">
            Exhaustive worldwide recipes tailored to your available fridge rations with automatic ingredient deductions.
          </p>
        </div>
        <button
          onClick={() => fetchRecipes(selectedCuisine)}
          disabled={loading}
          className="bg-white text-emerald-800 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:bg-emerald-50 transition-all flex items-center space-x-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Refresh AI Recipes</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      {/* Cuisine Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {CUISINES.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCuisine(c)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCuisine === c ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-medium">Generating exhaustive global cuisine recipes from available fridge items...</p>
        </div>
      )}

      {/* Recipes Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">
                    {recipe.cuisine}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    recipe.matchPercentage >= 80 ? 'bg-emerald-100 text-emerald-800' : recipe.matchPercentage >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {recipe.matchPercentage}% Match
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-1">{recipe.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{recipe.description}</p>

                <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{recipe.prepTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>{recipe.calories} kcal</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ChefHat className="w-4 h-4 text-teal-600" />
                    <span>{recipe.difficulty}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-xs font-bold text-slate-700">Available Ingredients in Fridge:</div>
                  <div className="flex flex-wrap gap-1">
                    {recipe.availableIngredients.map((ing, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[11px] font-medium flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{ing}</span>
                      </span>
                    ))}
                  </div>

                  {recipe.missingIngredients.length > 0 && (
                    <>
                      <div className="text-xs font-bold text-slate-700 mt-2">Missing Ingredients:</div>
                      <div className="flex flex-wrap gap-1">
                        {recipe.missingIngredients.map((ing, i) => (
                          <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[11px] font-medium flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{ing}</span>
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveRecipe(recipe)}
                className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>View Full Recipe & Cook</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {activeRecipe && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold mb-2 inline-block">
                  {activeRecipe.cuisine} • {activeRecipe.difficulty}
                </span>
                <h2 className="text-2xl font-bold text-slate-900">{activeRecipe.title}</h2>
                <p className="text-xs text-slate-500 mt-1">{activeRecipe.description}</p>
              </div>
              <button
                onClick={() => setActiveRecipe(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <div>
                <div className="text-xs text-slate-500">Prep Time</div>
                <div className="font-bold text-slate-900 text-sm">{activeRecipe.prepTime}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Calories</div>
                <div className="font-bold text-slate-900 text-sm">{activeRecipe.calories} kcal</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Inventory Match</div>
                <div className="font-bold text-emerald-600 text-sm">{activeRecipe.matchPercentage}%</div>
              </div>
            </div>

            <div className="space-y-4 my-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Ingredients Needed:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeRecipe.availableIngredients.map((ing, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm text-slate-700 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{ing} (In Fridge)</span>
                    </div>
                  ))}
                  {activeRecipe.missingIngredients.map((ing, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm text-slate-700 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{ing} (Missing)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base mb-2">Step-by-Step Cooking Method:</h3>
                <ol className="space-y-3">
                  {activeRecipe.instructions.map((step, i) => (
                    <li key={i} className="flex items-start space-x-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveRecipe(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
              >
                Close
              </button>
              <button
                onClick={() => cookRecipe(activeRecipe)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center space-x-2"
              >
                <ChefHat className="w-4 h-4" />
                <span>Cook & Deduct Ingredients from Fridge</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
