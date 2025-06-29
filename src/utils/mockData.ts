import { Transaction, Budget, Category, Goal, User } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'User',
  email: 'user@example.com',
  totalBalance: 0,
  monthlyBudget: 0
};

export const mockCategories: Category[] = [
  { id: '1', name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#EF4444', type: 'expense' },
  { id: '2', name: 'Transportation', icon: 'Car', color: '#3B82F6', type: 'expense' },
  { id: '3', name: 'Shopping', icon: 'ShoppingBag', color: '#8B5CF6', type: 'expense' },
  { id: '4', name: 'Entertainment', icon: 'Film', color: '#F59E0B', type: 'expense' },
  { id: '5', name: 'Bills & Utilities', icon: 'Receipt', color: '#6B7280', type: 'expense' },
  { id: '6', name: 'Healthcare', icon: 'Heart', color: '#EC4899', type: 'expense' },
  { id: '7', name: 'Education', icon: 'BookOpen', color: '#14B8A6', type: 'expense' },
  { id: '8', name: 'Groceries', icon: 'ShoppingCart', color: '#F97316', type: 'expense' },
  { id: '9', name: 'Travel', icon: 'Plane', color: '#06B6D4', type: 'expense' },
  { id: '10', name: 'Personal Care', icon: 'Scissors', color: '#84CC16', type: 'expense' },
  { id: '11', name: 'Gifts & Donations', icon: 'Gift', color: '#F472B6', type: 'expense' },
  { id: '12', name: 'Insurance', icon: 'Shield', color: '#64748B', type: 'expense' },
  { id: '13', name: 'Salary', icon: 'Banknote', color: '#10B981', type: 'income' },
  { id: '14', name: 'Freelance', icon: 'Laptop', color: '#06B6D4', type: 'income' },
  { id: '15', name: 'Business', icon: 'Briefcase', color: '#8B5CF6', type: 'income' },
  { id: '16', name: 'Investment', icon: 'TrendingUp', color: '#10B981', type: 'income' },
  { id: '17', name: 'Rental Income', icon: 'Home', color: '#F59E0B', type: 'income' },
  { id: '18', name: 'Other Income', icon: 'Plus', color: '#22C55E', type: 'income' },
];

// Empty arrays - data will be loaded from localStorage
export const mockTransactions: Transaction[] = [];
export const mockBudgets: Budget[] = [];
export const mockGoals: Goal[] = [];