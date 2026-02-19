import { useState } from 'react';
import { loginUser } from '../../services/userService';
import {useNavigate, Link } from 'react-router-dom';
import { showError, showSuccess } from '../../utils/notifications';

export default function Login({ onLoginSuccess, onSwitchToSignUp }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userData = await loginUser(formData);
      
      if (userData && userData.id) {
        // 1. Update the parent state (App.jsx)
        onLoginSuccess(userData.id);
        showSuccess('Welcome back! 🎉');
        
        // 2. IMMEDIATELY move to the dashboard
        navigate('/dashboard'); 
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-lg border border-slate-100">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-900 mb-2">WELCOME</h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
            <input
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              type="email"
              name="email"
              placeholder="abc@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="w-full py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-8">
  <p className="text-slate-600 text-sm">
    Don't have an account?{' '}
    <Link
      to="/signup"
      className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
    >
      Sign Up
    </Link>
  </p>
</div>
      </div>
    </div>
  );
}