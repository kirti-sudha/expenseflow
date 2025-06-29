import React, { useState } from 'react';
import { Target, Plus, Calendar, DollarSign, Trophy, TrendingUp, Edit3, Trash2, X } from 'lucide-react';
import { useExpensesDB } from '../hooks/useExpensesDB';

const GoalsPage: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, addMoneyToGoal, loading, error } = useExpensesDB();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [showAddMoney, setShowAddMoney] = useState<string | null>(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    color: '#3B82F6'
  });
  const [editGoalData, setEditGoalData] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    color: '#3B82F6'
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Goals</h2>
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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getTimeRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    if (diffDays < 30) return `${diffDays} days left`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months left`;
    return `${Math.ceil(diffDays / 365)} years left`;
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.title && newGoal.targetAmount && newGoal.deadline) {
      await addGoal({
        title: newGoal.title,
        targetAmount: parseFloat(newGoal.targetAmount),
        currentAmount: parseFloat(newGoal.currentAmount) || 0,
        deadline: newGoal.deadline,
        color: newGoal.color
      });
      setNewGoal({
        title: '',
        targetAmount: '',
        currentAmount: '',
        deadline: '',
        color: '#3B82F6'
      });
      setShowAddForm(false);
    }
  };

  const handleEditGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setEditGoalData({
        title: goal.title,
        targetAmount: goal.targetAmount.toString(),
        deadline: goal.deadline,
        color: goal.color
      });
      setEditingGoal(goalId);
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal && editGoalData.title && editGoalData.targetAmount && editGoalData.deadline) {
      await updateGoal(editingGoal, {
        title: editGoalData.title,
        targetAmount: parseFloat(editGoalData.targetAmount),
        deadline: editGoalData.deadline,
        color: editGoalData.color
      });
      setEditingGoal(null);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(goalId);
    }
  };

  const handleAddMoney = async (goalId: string) => {
    const amount = parseFloat(addMoneyAmount);
    if (amount > 0) {
      await addMoneyToGoal(goalId, amount);
      setAddMoneyAmount('');
      setShowAddMoney(null);
    }
  };

  if (goals.length === 0 && !showAddForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
            <p className="text-gray-600 mt-1">Set and track your financial objectives</p>
          </div>

          {/* Empty State */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-purple-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Set Your First Goal</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Create savings goals to stay motivated and track your progress towards achieving your financial dreams.
              </p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center mx-auto"
              >
                <Plus size={20} className="mr-2" />
                Create Your First Goal
              </button>
            </div>

            {/* Goal Ideas */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Goal Ideas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Emergency Fund', amount: '₹1,00,000', description: '6 months of expenses' },
                  { title: 'Vacation', amount: '₹50,000', description: 'Dream holiday fund' },
                  { title: 'New Phone', amount: '₹80,000', description: 'Latest smartphone' },
                  { title: 'Home Down Payment', amount: '₹5,00,000', description: 'First home purchase' },
                ].map((idea, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <h4 className="font-medium text-gray-900">{idea.title}</h4>
                    <p className="text-lg font-bold text-purple-600">{idea.amount}</p>
                    <p className="text-sm text-gray-500">{idea.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Goal Setting Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="space-y-2">
                  <p>• Set specific, measurable goals with deadlines</p>
                  <p>• Start with smaller, achievable goals to build momentum</p>
                  <p>• Automate savings to make progress effortless</p>
                </div>
                <div className="space-y-2">
                  <p>• Review and adjust goals regularly</p>
                  <p>• Celebrate milestones to stay motivated</p>
                  <p>• Consider multiple goals for different priorities</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Savings Goals</h1>
            <p className="text-gray-600 mt-1">Track your progress towards financial milestones</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            New Goal
          </button>
        </div>

        {/* Add Goal Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Goal</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Goal Title"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
                placeholder="Target Amount (₹)"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={newGoal.currentAmount}
                onChange={(e) => setNewGoal(prev => ({ ...prev, currentAmount: e.target.value }))}
                placeholder="Current Amount (₹)"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals Overview Stats */}
        {goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Goals</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{goals.length}</p>
                </div>
                <Target className="text-blue-600" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Target</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    ₹{goals.reduce((sum, goal) => sum + goal.targetAmount, 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <DollarSign className="text-purple-600" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Saved</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ₹{goals.reduce((sum, goal) => sum + goal.currentAmount, 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {goals.filter(goal => goal.currentAmount >= goal.targetAmount).length}
                  </p>
                </div>
                <Trophy className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            const remaining = goal.targetAmount - goal.currentAmount;
            const timeRemaining = getTimeRemaining(goal.deadline);
            const isCompleted = percentage >= 100;
            
            return (
              <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
                {editingGoal === goal.id ? (
                  <form onSubmit={handleUpdateGoal} className="space-y-4">
                    <input
                      type="text"
                      value={editGoalData.title}
                      onChange={(e) => setEditGoalData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editGoalData.targetAmount}
                      onChange={(e) => setEditGoalData(prev => ({ ...prev, targetAmount: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="date"
                      value={editGoalData.deadline}
                      onChange={(e) => setEditGoalData(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingGoal(null)}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{goal.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {timeRemaining}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isCompleted && (
                          <div className="bg-green-100 p-2 rounded-full">
                            <Trophy className="text-green-600" size={16} />
                          </div>
                        )}
                        <button
                          onClick={() => handleEditGoal(goal.id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-bold text-gray-900">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Amount Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Current</p>
                          <p className="font-semibold text-lg">₹{goal.currentAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Target</p>
                          <p className="font-semibold text-lg">₹{goal.targetAmount.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      {/* Remaining Amount */}
                      {!isCompleted && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600">Remaining</p>
                          <p className="font-semibold text-gray-900">₹{remaining.toLocaleString('en-IN')}</p>
                        </div>
                      )}

                      {/* Add Money Form */}
                      {showAddMoney === goal.id ? (
                        <div className="space-y-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={addMoneyAmount}
                            onChange={(e) => setAddMoneyAmount(e.target.value)}
                            placeholder="Amount to add (₹)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAddMoney(goal.id)}
                              className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              Add Money
                            </button>
                            <button
                              onClick={() => setShowAddMoney(null)}
                              className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Action Buttons */
                        <div className="flex space-x-2 pt-2">
                          <button 
                            onClick={() => setShowAddMoney(goal.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
                          >
                            Add Money
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Monthly Savings Tracker */}
        {goals.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Savings Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {goals.map((goal) => {
                const monthsRemaining = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
                const monthlyTarget = monthsRemaining > 0 ? (goal.targetAmount - goal.currentAmount) / monthsRemaining : 0;
                
                return (
                  <div key={goal.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{goal.title}</h4>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: goal.color }}
                      />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Monthly target</p>
                      <p className="font-semibold text-lg">₹{monthlyTarget.toFixed(0)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {monthsRemaining > 0 ? `${monthsRemaining} months remaining` : 'Goal deadline passed'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Savings Tips */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Savings Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <p>• Automate your savings to make consistent progress</p>
              <p>• Break large goals into smaller monthly targets</p>
              <p>• Celebrate milestones to stay motivated</p>
            </div>
            <div className="space-y-2">
              <p>• Review and adjust goals quarterly</p>
              <p>• Consider high-yield savings accounts for better returns</p>
              <p>• Track your progress weekly to stay on course</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;