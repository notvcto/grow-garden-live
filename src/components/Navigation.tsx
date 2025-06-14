
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navigation = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/webhooks', label: 'Webhooks', icon: '🔗' },
    { path: '/watchlist', label: 'Watchlist', icon: '👁️' },
    { path: '/overlay', label: 'Overlay', icon: '🎥' },
  ];

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-xl">🌱</span>
            </div>
            <span className="text-xl font-bold text-white">Grow Garden Live</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  location.pathname === item.path
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-300 hover:text-emerald-400 hover:bg-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-8 h-8 rounded-full border-2 border-emerald-400"
              />
              <span className="text-sm font-medium text-gray-300 hidden sm:block">
                {user.username}
              </span>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="text-gray-300 hover:text-red-400 border-gray-600 hover:border-red-500 bg-transparent hover:bg-gray-700"
            >
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-emerald-400 hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                    location.pathname === item.path
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-300 hover:text-emerald-400 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
