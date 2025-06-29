import React, { useState } from 'react';
import { Target, Edit3, AlertTriangle, TrendingUp, Plus, Trash2, X } from 'lucide-react';
import { useExpensesDB } from '../hooks/useExpensesDB';
import { mockCategories } from '../utils/mockData';

const BudgetOverview: React.FC = () => {
  const { budgets, addBudget, updateBudget, deleteBudget, categorySpending, loading, error } = useExpensesDB();
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly'
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Budgets</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleEditStart = (budgetId: string, currentAmount: number) => {
    setEditingBudget(budgetId);
    setEditAmount(currentAmount.toString());
  };

  const handleEditSave = async (budgetId: string) => {
    const newAmount = parseFloat(editAmount);
    if (newAmount > 0) {
      await updateBudget(budgetId, newAmount);
    }
    setEditingBudget(null);
    setEditAmount('');
  };

  const handleEditCancel = () => {
    setEditingBudget(null);
    setEditAmount('');
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBudget.category && newBudget.amount) {
      const category = mockCategories.find(cat => cat.name === newBudget.category);
      await addBudget({
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        period: newBudget.period,
        color: category?.color || '#6B7280'
      });
      setNewBudget({ category: '', amount: '', period: 'monthly' });
      setShowAddForm(false);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      await deleteBudget(budgetId);
    }
  };

  const getBudgetStatus = (budget: any) => {
    const percentage = (budget.spent / budget.amount) * 100;
    if (percentage >= 100) return { status: 'over', color: 'red' };
    if (percentage >= 80) return { status: 'warning', color: 'yellow' };
    if (percentage >= 60) return { status: 'good', color: 'blue' };
    return { status: 'excellent', color: 'green' };
  };

  const availableCategories = mockCategories
    .filter(cat => cat.type === 'expense')
    .filter(cat => !budgets.some(budget => budget.category === cat.name));

  if (budgets.length === 0 && !showAddForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
            <p className="text-gray-600 mt-1">Set spending limits and track your progress</p>
          </div>

          {/* Empty State */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-blue-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your First Budget</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Budgets help you control your spending by setting limits for different categories. 
                Start by creating a budget for your most frequent expenses.
              </p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center mx-auto"
              >
                <Plus size={20} className="mr-2" />
                Create Budget
              </button>
            </div>

            {/* Budget Tips */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Budget Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="space-y-2">
                  <p>• Start with the 50/30/20 rule: 50% needs, 30% wants, 20% savings</p>
                  <p>• Review your past expenses to set realistic budgets</p>
                  <p>• Begin with major categories like food, transport, and entertainment</p>
                </div>
                <div className="space-y-2">
                  <p>• Set aside 10-20% of income for unexpected expenses</p>
                  <p>• Adjust budgets monthly based on your spending patterns</p>
                  <p>• Use alerts to stay on track throughout the month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
            <p className="text-gray-600 mt-1">Track and manage your spending limits</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Budget
          </button>
        </div>

        {/* Add Budget Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Budget</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddBudget} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={newBudget.category}
                onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {availableCategories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newBudget.amount}
                onChange={(e) => setNewBudget(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Budget Amount (₹)"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <select
                value={newBudget.period}
                onChange={(e) => setNewBudget(prev => ({ ...prev, period: e.target.value as 'monthly' | 'weekly' }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Add Budget
              </button>
            </form>
          </div>
        )}

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100;
            const remaining = budget.amount - budget.spent;
            const budgetStatus = getBudgetStatus(budget);
            
            return (
              <div key={budget.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: budget.color }}
                    />
                    <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditStart(budget.id, budget.amount)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {editingBudget === budget.id ? (
                  <div className="space-y-3">
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter budget amount"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSave(budget.id)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Spent</span>
                      <span className="font-semibold">₹{budget.spent.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Budget</span>
                      <span className="font-semibold">₹{budget.amount.toFixed(2)}</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          budgetStatus.status === 'over' ? 'bg-red-500' :
                          budgetStatus.status === 'warning' ? 'bg-yellow-500' :
                          budgetStatus.status === 'good' ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className={`font-medium ${
                        budgetStatus.status === 'over' ? 'text-red-600' :
                        budgetStatus.status === 'warning' ? 'text-yellow-600' :
                        budgetStatus.status === 'good' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {percentage.toFixed(1)}% used
                      </span>
                      <span className={`${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{Math.abs(remaining).toFixed(2)} {remaining >= 0 ? 'left' : 'over'}
                      </span>
                    </div>

                    {budgetStatus.status === 'over' && (
                      <div className="flex items-center text-red-600 text-sm bg-red-50 p-2 rounded-md">
                        <AlertTriangle size={16} className="mr-2" />
                        Over budget!
                      </div>
                    )}

                    {budgetStatus.status === 'warning' && (
                      <div className="flex items-center text-yellow-600 text-sm bg-yellow-50 p-2 rounded-md">
                        <AlertTriangle size={16} className="mr-2" />
                        Approaching limit
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Budget Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Budget Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="mr-2 text-blue-600" size={20} />
              Monthly Budget Breakdown
            </h3>
            {budgets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No budgets created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.map((budget) => (
                  <div key={budget.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: budget.color }}
                      />
                      <span className="text-gray-700">{budget.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{budget.amount}</div>
                      <div className="text-sm text-gray-500">
                        {budgets.length > 0 ? ((budget.amount / budgets.reduce((sum, b) => sum + b.amount, 0)) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Budget</span>
                    <span>₹{budgets.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Spending Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="mr-2 text-green-600" size={20} />
              Spending Insights
            </h3>
            {Object.keys(categorySpending).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No spending data available yet</p>
                <p className="text-sm text-gray-400 mt-1">Add some transactions to see insights</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(categorySpending)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([category, amount]) => {
                    const budget = budgets.find(b => b.category === category);
                    const percentage = budget ? (amount / budget.amount) * 100 : 0;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{category}</div>
                          <div className="text-sm text-gray-500">
                            {budget ? `${percentage.toFixed(1)}% of budget` : 'No budget set'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{amount.toFixed(2)}</div>
                          <div className={`text-sm ${
                            percentage > 100 ? 'text-red-500' : 
                            percentage > 80 ? 'text-yellow-500' : 'text-green-500'
                          }`}>
                            {percentage > 100 ? 'Over budget' : 
                             percentage > 80 ? 'Near limit' : 'On track'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Budget Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Budget Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <p>• Review and adjust budgets monthly based on spending patterns</p>
              <p>• Set aside 10-20% of income for unexpected expenses</p>
              <p>• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</p>
            </div>
            <div className="space-y-2">
              <p>• Track spending in real-time to avoid budget overruns</p>
              <p>• Consider seasonal variations in expenses (holidays, vacations)</p>
              <p>• Automate savings to make budgeting easier</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;