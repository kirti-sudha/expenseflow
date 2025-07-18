import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Transaction, Budget, Goal } from '../types';
import { parseCurrency, addCurrency, subtractCurrency } from '../utils/currency';

export const useExpensesDB = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [transactionsRes, budgetsRes, goalsRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (transactionsRes.error) throw transactionsRes.error;
      if (budgetsRes.error) throw budgetsRes.error;
      if (goalsRes.error) throw goalsRes.error;

      // Transform database data to match frontend types with proper decimal handling
      const transformedTransactions: Transaction[] = transactionsRes.data.map(t => ({
        id: t.id,
        amount: parseCurrency(t.amount.toString()),
        category: t.category,
        description: t.description,
        date: t.date,
        type: t.type as 'expense' | 'income',
        paymentMethod: t.payment_method,
        tags: t.tags || [],
        recurring: t.recurring,
      }));

      const transformedBudgets: Budget[] = budgetsRes.data.map(b => ({
        id: b.id,
        category: b.category,
        amount: parseCurrency(b.amount.toString()),
        spent: parseCurrency(b.spent.toString()),
        period: b.period as 'monthly' | 'weekly',
        color: b.color,
      }));

      const transformedGoals: Goal[] = goalsRes.data.map(g => ({
        id: g.id,
        title: g.title,
        targetAmount: parseCurrency(g.target_amount.toString()),
        currentAmount: parseCurrency(g.current_amount.toString()),
        deadline: g.deadline,
        color: g.color,
      }));

      setTransactions(transformedTransactions);
      setBudgets(transformedBudgets);
      setGoals(transformedGoals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Transaction CRUD operations
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    try {
      // Ensure proper decimal precision
      const amount = parseCurrency(transaction.amount.toString());
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          category: transaction.category,
          description: transaction.description,
          date: transaction.date,
          type: transaction.type,
          payment_method: transaction.paymentMethod,
          tags: transaction.tags || null,
          recurring: transaction.recurring || false,
        })
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        amount: parseCurrency(data.amount.toString()),
        category: data.category,
        description: data.description,
        date: data.date,
        type: data.type as 'expense' | 'income',
        paymentMethod: data.payment_method,
        tags: data.tags || [],
        recurring: data.recurring,
      };

      setTransactions(prev => [newTransaction, ...prev]);

      // Update budget spending if it's an expense
      if (transaction.type === 'expense') {
        await updateBudgetSpending(transaction.category, Math.abs(amount));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    }
  };

  const updateTransaction = async (id: string, updatedTransaction: Partial<Transaction>) => {
    if (!user) return;

    try {
      // Ensure proper decimal precision for amount if provided
      const updateData: any = { ...updatedTransaction };
      if (updateData.amount !== undefined) {
        updateData.amount = parseCurrency(updateData.amount.toString());
      }

      const { error } = await supabase
        .from('transactions')
        .update({
          amount: updateData.amount,
          category: updateData.category,
          description: updateData.description,
          date: updateData.date,
          payment_method: updateData.paymentMethod,
          tags: updateData.tags || null,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, ...updateData } : t))
      );

      // Recalculate budget spending
      await recalculateBudgetSpending();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      const transaction = transactions.find(t => t.id === id);
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));

      // Update budget spending if it was an expense
      if (transaction && transaction.type === 'expense') {
        await updateBudgetSpending(transaction.category, -Math.abs(transaction.amount));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
    }
  };

  // Budget CRUD operations
  const addBudget = async (budget: Omit<Budget, 'id' | 'spent'>) => {
    if (!user) return;

    try {
      const categorySpending = getCurrentCategorySpending(budget.category);
      const amount = parseCurrency(budget.amount.toString());
      
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category: budget.category,
          amount: amount,
          spent: categorySpending,
          period: budget.period,
          color: budget.color,
        })
        .select()
        .single();

      if (error) throw error;

      const newBudget: Budget = {
        id: data.id,
        category: data.category,
        amount: parseCurrency(data.amount.toString()),
        spent: parseCurrency(data.spent.toString()),
        period: data.period as 'monthly' | 'weekly',
        color: data.color,
      };

      setBudgets(prev => [...prev, newBudget]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add budget');
    }
  };

  const updateBudget = async (budgetId: string, newAmount: number) => {
    if (!user) return;

    try {
      const amount = parseCurrency(newAmount.toString());
      
      const { error } = await supabase
        .from('budgets')
        .update({ amount: amount })
        .eq('id', budgetId)
        .eq('user_id', user.id);

      if (error) throw error;

      setBudgets(prev =>
        prev.map(budget =>
          budget.id === budgetId ? { ...budget, amount: amount } : budget
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget');
    }
  };

  const deleteBudget = async (budgetId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId)
        .eq('user_id', user.id);

      if (error) throw error;

      setBudgets(prev => prev.filter(b => b.id !== budgetId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget');
    }
  };

  // Goal CRUD operations
  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    if (!user) return;

    try {
      const targetAmount = parseCurrency(goal.targetAmount.toString());
      const currentAmount = parseCurrency(goal.currentAmount.toString());
      
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: goal.title,
          target_amount: targetAmount,
          current_amount: currentAmount,
          deadline: goal.deadline,
          color: goal.color,
        })
        .select()
        .single();

      if (error) throw error;

      const newGoal: Goal = {
        id: data.id,
        title: data.title,
        targetAmount: parseCurrency(data.target_amount.toString()),
        currentAmount: parseCurrency(data.current_amount.toString()),
        deadline: data.deadline,
        color: data.color,
      };

      setGoals(prev => [...prev, newGoal]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add goal');
    }
  };

  const updateGoal = async (goalId: string, updatedGoal: Partial<Goal>) => {
    if (!user) return;

    try {
      const updateData: any = { ...updatedGoal };
      if (updateData.targetAmount !== undefined) {
        updateData.target_amount = parseCurrency(updateData.targetAmount.toString());
        delete updateData.targetAmount;
      }

      const { error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev =>
        prev.map(goal =>
          goal.id === goalId ? { ...goal, ...updatedGoal } : goal
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
    }
  };

  const addMoneyToGoal = async (goalId: string, amount: number) => {
    if (!user) return;

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const addAmount = parseCurrency(amount.toString());
      const newCurrentAmount = Math.min(
        addCurrency(goal.currentAmount, addAmount), 
        goal.targetAmount
      );

      const { error } = await supabase
        .from('goals')
        .update({ current_amount: newCurrentAmount })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev =>
        prev.map(goal =>
          goal.id === goalId
            ? { ...goal, currentAmount: newCurrentAmount }
            : goal
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add money to goal');
    }
  };

  // Helper functions
  const getCurrentCategorySpending = (category: string) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          t.category === category &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => addCurrency(sum, Math.abs(t.amount)), 0);
  };

  const updateBudgetSpending = async (category: string, amountChange: number) => {
    if (!user) return;

    const budget = budgets.find(b => b.category === category);
    if (!budget) return;

    const newSpent = Math.max(0, addCurrency(budget.spent, amountChange));

    try {
      const { error } = await supabase
        .from('budgets')
        .update({ spent: newSpent })
        .eq('id', budget.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setBudgets(prev =>
        prev.map(b =>
          b.category === category ? { ...b, spent: newSpent } : b
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget spending');
    }
  };

  const recalculateBudgetSpending = async () => {
    if (!user) return;

    const updatedBudgets = budgets.map(budget => ({
      ...budget,
      spent: getCurrentCategorySpending(budget.category),
    }));

    // Update all budgets in database
    for (const budget of updatedBudgets) {
      try {
        await supabase
          .from('budgets')
          .update({ spent: budget.spent })
          .eq('id', budget.id)
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to update budget spending:', err);
      }
    }

    setBudgets(updatedBudgets);
  };

  // Real-time calculated stats
  const monthlyStats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => addCurrency(sum, t.amount), 0);

    const totalExpenses = Math.abs(
      currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => addCurrency(sum, t.amount), 0)
    );

    const netIncome = subtractCurrency(totalIncome, totalExpenses);

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      transactionCount: currentMonthTransactions.length,
    };
  }, [transactions]);

  const categorySpending = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const spending: Record<string, number> = {};

    transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .forEach(t => {
        spending[t.category] = addCurrency(spending[t.category] || 0, Math.abs(t.amount));
      });

    return spending;
  }, [transactions]);

  return {
    // Data
    transactions,
    budgets,
    goals,
    monthlyStats,
    categorySpending,
    loading,
    error,

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
    fetchAllData,
  };
};