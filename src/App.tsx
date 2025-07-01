import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import BudgetOverview from './components/BudgetOverview';
import TransactionList from './components/TransactionList';
import GoalsPage from './components/GoalsPage';
import { LogOut, User } from 'lucide-react';

function App() {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ExpenseFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'add':
        return <ExpenseForm />;
      case 'budgets':
        return <BudgetOverview />;
      case 'reports':
        return <TransactionList />;
      case 'goals':
        return <GoalsPage />;
      case 'settings':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <div className="text-center bg-white rounded-xl shadow-sm border border-gray-100 p-12">
              <User className="mx-auto text-gray-400 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">User Settings</h2>
              <p className="text-gray-600 mb-6">Manage your account preferences</p>
              <div className="space-y-4">
                <div className="text-left">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <LogOut size={20} className="mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {[
            { id: 'dashboard', label: 'Home', icon: '🏠' },
            { id: 'add', label: 'Add', icon: '➕' },
            { id: 'budgets', label: 'Budget', icon: '🎯' },
            { id: 'reports', label: 'Reports', icon: '📊' },
            { id: 'goals', label: 'Goals', icon: '💰' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <span className="text-lg mb-1">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;