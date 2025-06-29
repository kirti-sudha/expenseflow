import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Plus,
  PieChart,
  User
} from 'lucide-react';
import { useExpensesDB } from '../hooks/useExpensesDB';
import { useAuth } from '../hooks/useAuth';
import { formatIndianCurrency } from '../utils/currency';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { monthlyStats, budgets, transactions, categorySpending, loading, error } = useExpensesDB();

  const recentTransactions = transactions.slice(0, 5);
  
  const budgetAlerts = budgets.filter(budget => {
    const percentage = (budget.spent / budget.amount) * 100;
    return percentage > 80;
  });

  const hasData = transactions.length > 0 || budgets.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
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

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to ExpenseFlow!</h1>
            <p className="text-gray-600 text-lg">Start tracking your expenses and take control of your finances</p>
            <p className="text-sm text-gray-500 mt-2">Signed in as: {user?.email}</p>
          </div>

          {/* Getting Started Cards */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Your First Transaction</h3>
              <p className="text-gray-600 mb-4">Start by recording your income or expenses to begin tracking your finances.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Add Transaction
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Set Up Budgets</h3>
              <p className="text-gray-600 mb-4">Create monthly budgets for different categories to stay on track with your spending.</p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Create Budget
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-md transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PieChart className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Your Goals</h3>
              <p className="text-gray-600 mb-4">Set savings goals and monitor your progress towards achieving them.</p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Set Goals
              </button>
            </div>
          </div>

          {/* Features Overview */}
          <div className="max-w-6xl mx-auto mt-16">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Everything you need to manage your money</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-red-50 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingDown className="text-red-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Expense Tracking</h4>
                <p className="text-sm text-gray-600">Monitor where your money goes with detailed categorization</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="text-blue-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Budget Management</h4>
                <p className="text-sm text-gray-600">Set limits and get alerts when you're close to overspending</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Financial Reports</h4>
                <p className="text-sm text-gray-600">Analyze your spending patterns with detailed insights</p>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-50 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="text-yellow-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Savings Goals</h4>
                <p className="text-sm text-gray-600">Set and track progress towards your financial objectives</p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="max-w-4xl mx-auto mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">💡 Quick Tips to Get Started</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div className="space-y-3">
                <p>• Start by adding your regular income sources</p>
                <p>• Record your daily expenses as they happen</p>
                <p>• Set realistic budgets based on your spending history</p>
              </div>
              <div className="space-y-3">
                <p>• Use categories to organize your transactions</p>
                <p>• Review your spending weekly to stay on track</p>
                <p>• Set up savings goals to stay motivated</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600 mt-1">Here's your financial overview for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Net Balance</p>
              <p className={`text-2xl font-bold ${monthlyStats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{formatIndianCurrency(monthlyStats.netIncome)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ₹{formatIndianCurrency(monthlyStats.totalIncome)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  ₹{formatIndianCurrency(monthlyStats.totalExpenses)}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <TrendingDown className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Income</p>
                <p className={`text-2xl font-bold mt-1 ${monthlyStats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{formatIndianCurrency(monthlyStats.netIncome)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${monthlyStats.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={monthlyStats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{monthlyStats.transactionCount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CreditCard className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Budget Overview & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h3>
            {budgets.length === 0 ? (
              <div className="text-center py-8">
                <Target className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 mb-4">No budgets set up yet</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Create Your First Budget
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.slice(0, 4).map((budget) => {
                  const percentage = (budget.spent / budget.amount) * 100;
                  const isOverBudget = percentage > 100;
                  
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{budget.category}</span>
                        <span className="text-sm text-gray-500">
                          ₹{formatIndianCurrency(budget.spent)} / ₹{formatIndianCurrency(budget.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      {isOverBudget && (
                        <p className="text-xs text-red-600 font-medium">
                          Over budget by ₹{formatIndianCurrency(budget.spent - budget.amount)}
                        </p>
                      )}
                    </div>
                  );
                })}
                {budgets.length > 4 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    +{budgets.length - 4} more budgets
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 mb-4">No transactions yet</p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Add Your First Transaction
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="text-green-600" size={16} />
                        ) : (
                          <ArrowDownRight className="text-red-600" size={16} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : ''}₹{formatIndianCurrency(Math.abs(transaction.amount))}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Budget Alerts</h3>
            <div className="space-y-2">
              {budgetAlerts.map((budget) => {
                const percentage = (budget.spent / budget.amount) * 100;
                return (
                  <p key={budget.id} className="text-yellow-700">
                    You've spent {percentage.toFixed(0)}% of your {budget.category} budget (₹{formatIndianCurrency(budget.spent)} / ₹{formatIndianCurrency(budget.amount)})
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Spending Overview */}
        {Object.keys(categorySpending).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Spending Categories This Month</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categorySpending)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">{category}</span>
                    <span className="font-bold text-red-600">₹{formatIndianCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;