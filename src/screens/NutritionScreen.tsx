import React, { useState, useEffect } from 'react';
import { Language, FoodItem, MealEntry, HealthProfile } from '../types';
import { translations } from '../locales/translations';
import { api } from '../api';
import {
  Utensils,
  Plus,
  Trash2,
  Heart,
  Search,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';

interface NutritionScreenProps {
  language: Language;
  healthProfile: HealthProfile | null;
  onRefreshData: () => void;
}

export const NutritionScreen: React.FC<NutritionScreenProps> = ({
  language,
  healthProfile,
  onRefreshData,
}) => {
  const t = translations[language];
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(false);

  // Add Food Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMealType, setActiveMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingQuantity, setServingQuantity] = useState<number>(1);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Custom Food Form
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  const targetCalories = healthProfile?.targetCalories || 2000;
  const targetProtein = healthProfile?.targetProteinG || 140;
  const targetCarbs = healthProfile?.targetCarbsG || 220;
  const targetFat = healthProfile?.targetFatG || 65;

  const loadDiary = async (date: string) => {
    try {
      setLoading(true);
      const res = await api.getDiary(date);
      setEntries(res.entries || []);
      setTotals(res.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 });
    } catch (err) {
      console.error('Failed to load food diary', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFoods = async () => {
    try {
      const res = await api.getFoods(searchQuery, selectedCategory);
      setFoods(res.foods || []);
      const favRes = await api.getFavorites();
      setFavorites(favRes.favoriteFoods?.map((f) => f.id) || []);
    } catch (err) {
      console.error('Failed to load foods', err);
    }
  };

  useEffect(() => {
    loadDiary(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (showAddModal) {
      loadFoods();
    }
  }, [showAddModal, searchQuery, selectedCategory]);

  const handleAddMeal = async () => {
    if (!selectedFood) return;
    try {
      await api.addMealEntry({
        foodId: selectedFood.id,
        mealType: activeMealType,
        quantity: servingQuantity,
        loggedDate: selectedDate,
      });
      setShowAddModal(false);
      setSelectedFood(null);
      setServingQuantity(1);
      loadDiary(selectedDate);
      onRefreshData();
    } catch (err) {
      console.error('Failed to log meal entry', err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await api.deleteMealEntry(id);
      loadDiary(selectedDate);
      onRefreshData();
    } catch (err) {
      console.error('Failed to delete meal entry', err);
    }
  };

  const handleToggleFavorite = async (foodId: string) => {
    try {
      await api.toggleFavorite(foodId);
      setFavorites((prev) =>
        prev.includes(foodId) ? prev.filter((id) => id !== foodId) : [...prev, foodId]
      );
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleCreateCustomFood = async () => {
    if (!customName || !customCalories || !customProtein) return;
    try {
      const res = await api.createCustomFood({
        name: customName,
        calories: Number(customCalories),
        protein: Number(customProtein),
        carbs: Number(customCarbs || 0),
        fat: Number(customFat || 0),
        category: 'international',
      });
      setShowCustomForm(false);
      setCustomName('');
      setCustomCalories('');
      setCustomProtein('');
      setCustomCarbs('');
      setCustomFat('');
      setSelectedFood(res.food);
      loadFoods();
    } catch (err) {
      console.error('Failed to create custom food', err);
    }
  };

  const changeDateByDays = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
  ];

  const getMealTitle = (type: string) => {
    if (type === 'breakfast') return t.nutrition.breakfast;
    if (type === 'lunch') return t.nutrition.lunch;
    if (type === 'dinner') return t.nutrition.dinner;
    return t.nutrition.snacks;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Title & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-500" />
            <span>{t.nutrition.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.nutrition.subtitle}
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <button
            onClick={() => changeDateByDays(-1)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          <div className="flex items-center gap-2 px-3 text-xs font-bold text-slate-800 dark:text-slate-100">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>{selectedDate}</span>
          </div>
          <button
            onClick={() => changeDateByDays(1)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Daily Macro Bar Summary */}
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.nutrition.totals}
          </h2>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {totals.calories} / {targetCalories} kcal
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] block font-semibold">{t.home.calories}</span>
            <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block">{totals.calories}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/50">
            <span className="text-blue-500 text-[10px] block font-semibold">{t.home.protein}</span>
            <span className="font-extrabold text-blue-700 dark:text-blue-300 mt-0.5 block">{totals.protein}g</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/50">
            <span className="text-amber-500 text-[10px] block font-semibold">{t.home.carbs}</span>
            <span className="font-extrabold text-amber-700 dark:text-amber-300 mt-0.5 block">{totals.carbs}g</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/50">
            <span className="text-rose-500 text-[10px] block font-semibold">{t.home.fat}</span>
            <span className="font-extrabold text-rose-700 dark:text-rose-300 mt-0.5 block">{totals.fat}g</span>
          </div>
        </div>
      </div>

      {/* Meals Sections: Breakfast, Lunch, Dinner, Snack */}
      <div className="space-y-4">
        {mealTypes.map((type) => {
          const typeEntries = entries.filter((e) => e.mealType === type);
          const typeCalories = typeEntries.reduce((s, e) => s + e.calories, 0);

          return (
            <div
              key={type}
              className="rounded-3xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-slate-900 dark:text-white capitalize">
                    {getMealTitle(type)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                    {typeCalories} kcal
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveMealType(type);
                    setShowAddModal(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.nutrition.addFood}</span>
                </button>
              </div>

              {typeEntries.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center italic">
                  {t.nutrition.noMealsYet}
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {typeEntries.map((entry) => {
                    const localizedName =
                      language === 'ar' ? entry.foodNameAr : language === 'fr' ? entry.foodNameFr : entry.foodName;
                    return (
                      <div key={entry.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {localizedName}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {entry.quantity} × {entry.servingName} • {entry.protein}g P • {entry.carbs}g C • {entry.fat}g F
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {entry.calories} kcal
                          </span>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Food Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.nutrition.addFood} → {getMealTitle(activeMealType)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select an item or create a custom dish
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowCustomForm(false);
                  setSelectedFood(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {showCustomForm ? (
                /* Custom Food Creation Form */
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t.nutrition.createCustomTitle}
                  </h4>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      {t.nutrition.foodName} *
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Homemade Couscous / Homemade Granola"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        {t.nutrition.calories} *
                      </label>
                      <input
                        type="number"
                        value={customCalories}
                        onChange={(e) => setCustomCalories(e.target.value)}
                        placeholder="kcal"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        {t.nutrition.protein} *
                      </label>
                      <input
                        type="number"
                        value={customProtein}
                        onChange={(e) => setCustomProtein(e.target.value)}
                        placeholder="g"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        {t.nutrition.carbs}
                      </label>
                      <input
                        type="number"
                        value={customCarbs}
                        onChange={(e) => setCustomCarbs(e.target.value)}
                        placeholder="g"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        {t.nutrition.fat}
                      </label>
                      <input
                        type="number"
                        value={customFat}
                        onChange={(e) => setCustomFat(e.target.value)}
                        placeholder="g"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleCreateCustomFood}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                    >
                      {t.common.save}
                    </button>
                    <button
                      onClick={() => setShowCustomForm(false)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                    >
                      {t.common.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                /* Food Search and Selection */
                <>
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 rtl:right-3 rtl:left-auto top-3 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.nutrition.searchPlaceholder}
                      className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {[
                      { id: 'all', label: t.nutrition.categoryAll },
                      { id: 'algerian', label: t.nutrition.categoryAlgerian },
                      { id: 'north_african', label: t.nutrition.categoryNorthAfrican },
                      { id: 'international', label: t.nutrition.categoryInternational },
                      { id: 'produce', label: t.nutrition.categoryProduce },
                      { id: 'packaged', label: t.nutrition.categoryPackaged },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1 rounded-full whitespace-nowrap transition text-[11px] font-semibold ${
                          selectedCategory === cat.id
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom food trigger */}
                  <button
                    onClick={() => setShowCustomForm(true)}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-dashed border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.nutrition.createCustomTitle}</span>
                  </button>

                  {/* Food items list */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-60 overflow-y-auto">
                    {foods.map((food) => {
                      const isSelected = selectedFood?.id === food.id;
                      const isFav = favorites.includes(food.id);
                      const localizedName =
                        language === 'ar' ? food.nameAr : language === 'fr' ? food.nameFr : food.name;
                      return (
                        <div
                          key={food.id}
                          onClick={() => setSelectedFood(food)}
                          className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                {localizedName}
                              </h4>
                              {food.isVerified && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {food.servingUnit} • {food.protein}g P • {food.carbs}g C • {food.fat}g F
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {food.calories} kcal
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(food.id);
                              }}
                              className={`p-1.5 rounded-lg transition ${
                                isFav ? 'text-rose-500' : 'text-slate-300 hover:text-slate-500'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Quantity selector & Confirmation footer */}
              {selectedFood && !showCustomForm && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                      {language === 'ar' ? selectedFood.nameAr : selectedFood.name}
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Total: {Math.round(selectedFood.calories * servingQuantity)} kcal
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="10"
                      value={servingQuantity}
                      onChange={(e) => setServingQuantity(Math.max(0.1, Number(e.target.value)))}
                      className="w-16 px-2 py-1 text-xs text-center font-bold rounded-lg border border-emerald-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={handleAddMeal}
                      className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                    >
                      {t.nutrition.saveFood}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
