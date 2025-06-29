
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const LoginPage = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDiscordLogin = () => {
    setIsLoading(true);
    
    // Simulate Discord OAuth flow
    setTimeout(() => {
      const mockUser = {
        id: '123456789',
        username: 'GardenMaster',
        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
        discriminator: '0001'
      };
      onLogin(mockUser);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Grow Garden Live</h1>
          <p className="text-gray-300">Real-time stock tracking for Grow a Garden</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-6 rounded-2xl border border-gray-600">
            <h2 className="text-lg font-semibold text-white mb-2">Welcome to the Garden!</h2>
            <p className="text-sm text-gray-300 mb-4">
              Track item stocks, set up webhooks, and never miss a restock again.
            </p>
            <div className="flex justify-center space-x-4 text-2xl">
              <span>🌸</span>
              <span>🌿</span>
              <span>🌺</span>
              <span>🌻</span>
              <span>🌹</span>
            </div>
          </div>

          <Button
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Login with Discord</span>
              </div>
            )}
          </Button>
        </div>

        <div className="mt-8 text-xs text-gray-400">
          <p>By logging in, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
