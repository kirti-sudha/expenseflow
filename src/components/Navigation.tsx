import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Target, 
  BarChart3, 
  Settings, 
  Wallet 
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add', label: 'Add Expense', icon: PlusCircle },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-lg border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ExpenseFlow
          </h1>
          <p className="text-gray-500 text-sm mt-1">Smart Expense Tracking</p>
        </div>
        
        <div className="flex-1 py-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center px-6 py-3 text-left transition-all duration-200 hover:bg-blue-50 group ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-r-3 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`mr-3 transition-colors ${
                    activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                  }`} 
                />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;