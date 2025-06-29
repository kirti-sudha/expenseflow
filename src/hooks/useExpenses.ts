import { useState, useMemo, useEffect } from 'react';
import { Transaction, Budget, Goal } from '../types';
import { mockCategories } from '../utils/mockData';

// Storage keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'expense_tracker_transactions',
  BUDGETS: 'expense_tracker_budgets',
  GOALS: 'expense_tracker_goals'
};

// Helper functions for localStorage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const useExpenses = () => {
  // Initialize state from localStorage
  const [transactions, setTransactions] = useState<Transaction[]>(() => 
    loadFromStorage(STORAGE_KEYS.TRANSACTIONS, [])
  );
  const [budgets, setBudgets] = useState<Budget[]>(() => 
    loadFromStorage(STORAGE_KEYS.BUDGETS, [])
  );
  const [goals, setGoals] = useState<Goal[]>(() => 
    loadFromStorage(STORAGE_KEYS.GOALS, [])
  );

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
  }, [transactions]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.BUDGETS, budgets);
  }, [budgets]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GOALS, goals);
  }, [goals]);

  // Transaction CRUD operations
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setTransactions(prev => {
      const updated = [newTransaction, ...prev];
      return updated;
    });
    
    // Update budget spending in real-time
    if (transaction.type === 'expense') {
      updateBudgetSpending(transaction.category, Math.abs(transaction.amount));
    }
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev => {
      const updated = prev.map(t => 
        t.id === id ? { ...t, ...updatedTransaction } : t
      );
      return updated;
    });
    
    // Recalculate all budget spending when transaction is updated
    setTimeout(() => recalculateBudgetSpending(), 0);
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(prev => {
        const updated = prev.filter(t => t.id !== id);
        return updated;
      });
      
      // Update budget spending when transaction is deleted
      if (transaction && transaction.type === 'expense') {
        updateBudgetSpending(transaction.category, -Math.abs(transaction.amount));
      }
    }
  };

  // Budget CRUD operations
  const addBudget = (budget: Omit<Budget, 'id' | 'spent'>) => {
    const categorySpending = getCurrentCategorySpending(budget.category);
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      spent: categorySpending,
    };
    setBudgets(prev => {
      const updated = [...prev, newBudget];
      return updated;
    });
  };

  const updateBudget = (budgetId: string, newAmount: number) => {
    setBudgets(prev => {
      const updated = prev.map(budget => 
        budget.id === budgetId ? { ...budget, amount: newAmount } : budget
      );
      return updated;
    });
  };

  const deleteBudget = (budgetId: string) => {
    setBudgets(prev => {
      const updated = prev.filter(b => b.id !== budgetId);
      return updated;
    });
  };

  // Goal CRUD operations
  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setGoals(prev => {
      const updated = [...prev, newGoal];
      return updated;
    });
  };

  const updateGoal = (goalId: string, updatedGoal: Partial<Goal>) => {
    setGoals(prev => {
      const updated = prev.map(goal => 
        goal.id === goalId ? { ...goal, ...updatedGoal } : goal
      );
      return updated;
    });
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => {
      const updated = prev.filter(g => g.id !== goalId);
      return updated;
    });
  };

  const addMoneyToGoal = (goalId: string, amount: number) => {
    setGoals(prev => {
      const updated = prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount) }
          : goal
      );
      return updated;
    });
  };

  // Helper functions
  const getCurrentCategorySpending = (category: string) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               t.category === category &&
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const updateBudgetSpending = (category: string, amountChange: number) => {
    setBudgets(prev => {
      const updated = prev.map(budget => 
        budget.category === category 
          ? { ...budget, spent: Math.max(0, budget.spent + amountChange) }
          : budget
      );
      return updated;
    });
  };

  const recalculateBudgetSpending = () => {
    setBudgets(prev => {
      const updated = prev.map(budget => ({
        ...budget,
        spent: getCurrentCategorySpending(budget.category)
      }));
      return updated;
    });
  };

  // Real-time calculated stats
  const monthlyStats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = Math.abs(currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0));

    const netIncome = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      transactionCount: currentMonthTransactions.length
    };
  }, [transactions]);

  const categorySpending = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const spending: Record<string, number> = {};
    
    transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .forEach(t => {
        spending[t.category] = (spending[t.category] || 0) + Math.abs(t.amount);
      });

    return spending;
  }, [transactions]);

  // Update budget spending whenever transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      recalculateBudgetSpending();
    }
  }, [transactions]);

  // Clear all data function (useful for testing or reset)
  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.BUDGETS);
      localStorage.removeItem(STORAGE_KEYS.GOALS);
    }
  };

  return {
    // Data
    transactions,
    budgets,
    goals,
    monthlyStats,
    categorySpending,
    
    // Transaction operations
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Budget operations
    addBudget,
    updateBudget,
    deleteBudget,
    
    // Goal operations
    addGoal,
    updateGoal,
    deleteGoal,
    addMoneyToGoal,

    // Utility
    clearAllData,
  };
};