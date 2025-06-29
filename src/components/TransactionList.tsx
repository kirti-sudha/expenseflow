import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, ArrowUpRight, ArrowDownRight, Trash2, Edit3, X } from 'lucide-react';
import { useExpensesDB } from '../hooks/useExpensesDB';
import { mockCategories } from '../utils/mockData';

const TransactionList: React.FC = () => {
  const { transactions, deleteTransaction, updateTransaction, loading, error } = useExpensesDB();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    amount: '',
    category: '',
    description: '',
    date: '',
    paymentMethod: ''
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Transactions</h2>
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

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || transaction.category === selectedCategory;
      const matchesType = !selectedType || transaction.type === selectedType;
      
      let matchesDate = true;
      if (dateRange !== 'all') {
        const transactionDate = new Date(transaction.date);
        const now = new Date();
        
        switch (dateRange) {
          case 'today':
            matchesDate = transactionDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = transactionDate >= weekAgo;
            break;
          case 'month':
            matchesDate = transactionDate.getMonth() === now.getMonth() && 
                         transactionDate.getFullYear() === now.getFullYear();
            break;
          case 'year':
            matchesDate = transactionDate.getFullYear() === now.getFullYear();
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesType && matchesDate;
    });
  }, [transactions, searchTerm, selectedCategory, selectedType, dateRange]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [filteredTransactions]);

  const getCategoryIcon = (categoryName: string) => {
    const category = mockCategories.find(cat => cat.name === categoryName);
    return category?.icon || 'DollarSign';
  };

  const getCategoryColor = (categoryName: string) => {
    const category = mockCategories.find(cat => cat.name === categoryName);
    return category?.color || '#6B7280';
  };

  const handleEditStart = (transaction: any) => {
    setEditingTransaction(transaction.id);
    setEditData({
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      paymentMethod: transaction.paymentMethod
    });
  };

  const handleEditSave = async () => {
    if (editingTransaction) {
      const transaction = transactions.find(t => t.id === editingTransaction);
      if (transaction) {
        const updatedAmount = transaction.type === 'expense' 
          ? -Math.abs(parseFloat(editData.amount))
          : parseFloat(editData.amount);
        
        await updateTransaction(editingTransaction, {
          amount: updatedAmount,
          category: editData.category,
          description: editData.description,
          date: editData.date,
          paymentMethod: editData.paymentMethod
        });
      }
      setEditingTransaction(null);
    }
  };

  const handleEditCancel = () => {
    setEditingTransaction(null);
    setEditData({
      amount: '',
      category: '',
      description: '',
      date: '',
      paymentMethod: ''
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600 mt-1">View and manage all your transactions</p>
          </div>

          {/* Empty State */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter className="text-blue-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Transactions Yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start tracking your finances by adding your first transaction. 
                Record your income and expenses to get insights into your spending patterns.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Add Your First Transaction
              </button>
            </div>

            {/* Tips */}
            <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Getting Started Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="space-y-2">
                  <p>• Record transactions as they happen for accuracy</p>
                  <p>• Use clear, descriptive names for easy identification</p>
                  <p>• Categorize transactions to track spending patterns</p>
                </div>
                <div className="space-y-2">
                  <p>• Add tags to group related expenses</p>
                  <p>• Review your transactions weekly</p>
                  <p>• Use filters to analyze specific time periods</p>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-1">View and manage all your transactions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {mockCategories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Filtered Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{filteredTransactions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className={`text-2xl font-bold ${totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalAmount >= 0 ? '+' : ''}₹{Math.abs(totalAmount).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Average</p>
              <p className="text-2xl font-bold text-gray-700">
                ₹{filteredTransactions.length > 0 ? Math.abs(totalAmount / filteredTransactions.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <Filter className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                  {editingTransaction === transaction.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editData.amount}
                          onChange={(e) => setEditData(prev => ({ ...prev, amount: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Amount"
                        />
                        <select
                          value={editData.category}
                          onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {mockCategories
                            .filter(cat => cat.type === transaction.type)
                            .map(category => (
                              <option key={category.id} value={category.name}>
                                {category.name}
                              </option>
                            ))}
                        </select>
                        <input
                          type="text"
                          value={editData.description}
                          onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Description"
                        />
                        <input
                          type="date"
                          value={editData.date}
                          onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleEditSave}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="text-green-600" size={20} />
                          ) : (
                            <ArrowDownRight className="text-red-600" size={20} />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                            {transaction.recurring && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                Recurring
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: getCategoryColor(transaction.category) }}
                              />
                              {transaction.category}
                            </span>
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {new Date(transaction.date).toLocaleDateString()}
                            </span>
                            <span>{transaction.paymentMethod}</span>
                          </div>
                          {transaction.tags && transaction.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {transaction.tags.map((tag, index) => (
                                <span 
                                  key={index}
                                  className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : ''}₹{Math.abs(transaction.amount).toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditStart(transaction)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                            title="Edit transaction"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            title="Delete transaction"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionList;