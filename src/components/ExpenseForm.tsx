import React, { useState } from 'react';
import { Plus, Calendar, CreditCard, Tag, DollarSign } from 'lucide-react';
import { useExpensesDB } from '../hooks/useExpensesDB';
import { mockCategories } from '../utils/mockData';
import { parseCurrency } from '../utils/currency';

const ExpenseForm: React.FC = () => {
  const { addTransaction } = useExpensesDB();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'expense' | 'income',
    paymentMethod: 'Credit Card',
    tags: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.description) return;

    setIsSubmitting(true);
    
    const amount = parseCurrency(formData.amount);
    const transaction = {
      amount: formData.type === 'expense' ? -Math.abs(amount) : amount,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      type: formData.type,
      paymentMethod: formData.paymentMethod,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
    };

    await addTransaction(transaction);
    
    setIsSubmitting(false);
    setSuccessMessage(`${formData.type === 'expense' ? 'Expense' : 'Income'} added successfully!`);
    
    // Reset form
    setFormData({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      paymentMethod: 'Credit Card',
      tags: ''
    });

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const availableCategories = mockCategories.filter(cat => cat.type === formData.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Transaction</h1>
            <p className="text-gray-600">Track your income and expenses with ease</p>
          </div>

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transaction Type Toggle */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    formData.type === 'expense'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                    formData.type === 'income'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <DollarSign size={16} className="mr-2 text-gray-400" />
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Tag size={16} className="mr-2 text-gray-400" />
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select a category</option>
                  {availableCategories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="What was this transaction for?"
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <CreditCard size={16} className="mr-2 text-gray-400" />
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Digital Wallet">Digital Wallet</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tags (optional)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="food, restaurant, dinner (comma separated)"
                />
                <p className="text-xs text-gray-500">Add tags to better organize your transactions</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center py-3 px-6 rounded-lg font-medium transition-all ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : formData.type === 'expense'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                ) : (
                  <Plus size={20} className="mr-2" />
                )}
                {isSubmitting ? 'Adding...' : `Add ${formData.type === 'expense' ? 'Expense' : 'Income'}`}
              </button>
            </form>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Tea/Coffee', amount: '50', category: 'Food & Dining' },
                { label: 'Auto/Taxi', amount: '150', category: 'Transportation' },
                { label: 'Lunch', amount: '200', category: 'Food & Dining' },
                { label: 'Groceries', amount: '800', category: 'Groceries' },
              ].map((quick, index) => (
                <button
                  key={index}
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    amount: quick.amount,
                    description: quick.label,
                    category: quick.category,
                    type: 'expense'
                  }))}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all text-left"
                >
                  <p className="font-medium text-gray-900">{quick.label}</p>
                  <p className="text-sm text-gray-500">₹{quick.amount}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;