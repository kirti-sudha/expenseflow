import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Auth: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ExpenseFlow
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account to start tracking expenses' : 'Welcome back! Sign in to your account'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name (Sign Up Only) */}
            {isSignUp && (
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <User size={16} className="mr-2 text-gray-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required={isSignUp}
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Mail size={16} className="mr-2 text-gray-400" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Lock size={16} className="mr-2 text-gray-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center py-3 px-6 rounded-lg font-medium transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              ) : isSignUp ? (
                <UserPlus size={20} className="mr-2" />
              ) : (
                <LogIn size={20} className="mr-2" />
              )}
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle Sign In/Sign Up */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setFormData({ email: '', password: '', fullName: '' });
                }}
                className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Demo Credentials</h4>
          <p className="text-sm text-blue-700">
            Email: demo@expenseflow.com<br />
            Password: demo123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;