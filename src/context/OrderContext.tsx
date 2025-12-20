import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CupSize, Flavor, Topping, ToppingSelection, OrderState, OrderStep } from '../types';

// Cup sizes available
export const CUP_SIZES: CupSize[] = [
  { id: 'small', name: 'Little Cup', size: 'small', price: 4.99, ounces: 8, emoji: '🥤' },
  { id: 'medium', name: 'Regular Cup', size: 'medium', price: 6.99, ounces: 12, emoji: '🍵' },
  { id: 'large', name: 'Big Cup', size: 'large', price: 8.99, ounces: 16, emoji: '🪣' },
];

// Order steps in sequence
export const ORDER_STEPS: OrderStep[] = ['size', 'flavors', 'toppings', 'sauces', 'review'];

export const STEP_INFO: Record<OrderStep, { title: string; subtitle: string; emoji: string; color: string }> = {
  size: {
    title: 'Choose Your Cup',
    subtitle: 'Pick the perfect size for your craving',
    emoji: '🥤',
    color: '#FF6B6B',
  },
  flavors: {
    title: 'Pick Your Flavors',
    subtitle: 'Mix up to 3 delicious flavors',
    emoji: '🍦',
    color: '#4ECDC4',
  },
  toppings: {
    title: 'Add Toppings',
    subtitle: 'Make it extra special',
    emoji: '🍓',
    color: '#FFE66D',
  },
  sauces: {
    title: 'Drizzle Some Love',
    subtitle: 'Choose your favorite sauces',
    emoji: '🍫',
    color: '#95E1D3',
  },
  review: {
    title: 'Review Your Order',
    subtitle: 'Looking delicious!',
    emoji: '✨',
    color: '#DDA0DD',
  },
};

interface OrderContextType {
  // State
  order: OrderState;
  currentStep: OrderStep;
  stepIndex: number;

  // Actions
  setCupSize: (size: CupSize) => void;
  addFlavor: (flavor: Flavor) => void;
  removeFlavor: (flavorId: string) => void;
  addTopping: (topping: Topping, grams?: number) => void;
  updateToppingGrams: (toppingId: string, grams: number) => void;
  removeTopping: (toppingId: string) => void;
  addSauce: (sauce: Topping) => void;
  removeSauce: (sauceId: string) => void;

  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: OrderStep) => void;
  canGoNext: () => boolean;
  canGoPrev: () => boolean;

  // Reset
  resetOrder: () => void;

  // Helpers
  getProgress: () => number;
  getTotalPrice: () => number;
  isStepComplete: (step: OrderStep) => boolean;
}

const initialOrder: OrderState = {
  cupSize: null,
  flavors: [],
  toppings: [],
  sauces: [],
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [order, setOrder] = useState<OrderState>(initialOrder);
  const [stepIndex, setStepIndex] = useState(0);

  const currentStep = ORDER_STEPS[stepIndex];

  // Cup size
  const setCupSize = useCallback((size: CupSize) => {
    setOrder(prev => ({ ...prev, cupSize: size }));
  }, []);

  // Flavors (max 3)
  const addFlavor = useCallback((flavor: Flavor) => {
    setOrder(prev => {
      if (prev.flavors.length >= 3) return prev;
      if (prev.flavors.find(f => f.id === flavor.id)) return prev;
      return { ...prev, flavors: [...prev.flavors, flavor] };
    });
  }, []);

  const removeFlavor = useCallback((flavorId: string) => {
    setOrder(prev => ({
      ...prev,
      flavors: prev.flavors.filter(f => f.id !== flavorId),
    }));
  }, []);

  // Toppings with weight tracking
  const addTopping = useCallback((topping: Topping, grams: number = 10) => {
    setOrder(prev => {
      if (prev.toppings.find(t => t.topping.id === topping.id)) return prev;
      const selection: ToppingSelection = { topping, grams };
      return { ...prev, toppings: [...prev.toppings, selection] };
    });
  }, []);

  const updateToppingGrams = useCallback((toppingId: string, grams: number) => {
    setOrder(prev => ({
      ...prev,
      toppings: prev.toppings.map(t =>
        t.topping.id === toppingId ? { ...t, grams } : t
      ),
    }));
  }, []);

  const removeTopping = useCallback((toppingId: string) => {
    setOrder(prev => ({
      ...prev,
      toppings: prev.toppings.filter(t => t.topping.id !== toppingId),
    }));
  }, []);

  // Sauces
  const addSauce = useCallback((sauce: Topping) => {
    setOrder(prev => {
      if (prev.sauces.find(s => s.id === sauce.id)) return prev;
      return { ...prev, sauces: [...prev.sauces, sauce] };
    });
  }, []);

  const removeSauce = useCallback((sauceId: string) => {
    setOrder(prev => ({
      ...prev,
      sauces: prev.sauces.filter(s => s.id !== sauceId),
    }));
  }, []);

  // Check if step is complete
  const isStepComplete = useCallback((step: OrderStep): boolean => {
    switch (step) {
      case 'size':
        return order.cupSize !== null;
      case 'flavors':
        return order.flavors.length > 0;
      case 'toppings':
        return true; // Toppings are optional
      case 'sauces':
        return true; // Sauces are optional
      case 'review':
        return true;
      default:
        return false;
    }
  }, [order]);

  // Navigation
  const canGoNext = useCallback(() => {
    return isStepComplete(currentStep) && stepIndex < ORDER_STEPS.length - 1;
  }, [currentStep, stepIndex, isStepComplete]);

  const canGoPrev = useCallback(() => {
    return stepIndex > 0;
  }, [stepIndex]);

  const nextStep = useCallback(() => {
    if (canGoNext()) {
      setStepIndex(prev => prev + 1);
    }
  }, [canGoNext]);

  const prevStep = useCallback(() => {
    if (canGoPrev()) {
      setStepIndex(prev => prev - 1);
    }
  }, [canGoPrev]);

  const goToStep = useCallback((step: OrderStep) => {
    const index = ORDER_STEPS.indexOf(step);
    if (index !== -1) {
      setStepIndex(index);
    }
  }, []);

  // Progress (0-100)
  const getProgress = useCallback(() => {
    return ((stepIndex + 1) / ORDER_STEPS.length) * 100;
  }, [stepIndex]);

  // Total price
  const getTotalPrice = useCallback(() => {
    let total = order.cupSize?.price || 0;
    // Add topping prices based on grams
    order.toppings.forEach(selection => {
      const pricePerGram = selection.topping.pricePerGram || 0.05; // Default $0.05/gram
      total += pricePerGram * selection.grams;
    });
    order.sauces.forEach(s => {
      if (s.price) total += s.price;
    });
    return total;
  }, [order]);

  // Reset
  const resetOrder = useCallback(() => {
    setOrder(initialOrder);
    setStepIndex(0);
  }, []);

  return (
    <OrderContext.Provider
      value={{
        order,
        currentStep,
        stepIndex,
        setCupSize,
        addFlavor,
        removeFlavor,
        addTopping,
        updateToppingGrams,
        removeTopping,
        addSauce,
        removeSauce,
        nextStep,
        prevStep,
        goToStep,
        canGoNext,
        canGoPrev,
        resetOrder,
        getProgress,
        getTotalPrice,
        isStepComplete,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;
