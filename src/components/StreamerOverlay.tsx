
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const StreamerOverlay = () => {
  const [overlayConfig, setOverlayConfig] = useState({
    theme: 'dark',
    showPrices: true,
    showOnlyInStock: false,
    compact: false,
    position: 'right'
  });

  const [recentUpdates, setRecentUpdates] = useState([
    { id: 1, name: 'Peach Tree Seeds', status: 'restocked', timestamp: new Date(), price: 150 },
    { id: 2, name: 'Golden Watering Can', status: 'sold_out', timestamp: new Date(Date.now() - 30000), price: 500 },
    { id: 3, name: 'Cherry Blossom Seeds', status: 'restocked', timestamp: new Date(Date.now() - 60000), price: 300 },
  ]);

  const [overlayUrl, setOverlayUrl] = useState('');

  useEffect(() => {
    // Generate overlay URL with query parameters
    const params = new URLSearchParams({
      theme: overlayConfig.theme,
      showPrices: overlayConfig.showPrices.toString(),
      showOnlyInStock: overlayConfig.showOnlyInStock.toString(),
      compact: overlayConfig.compact.toString(),
      position: overlayConfig.position
    });
    
    const baseUrl = window.location.origin;
    setOverlayUrl(`${baseUrl}/overlay?${params.toString()}`);
  }, [overlayConfig]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const mockItems = [
        'Mango Tree Seeds', 'Watermelon Seeds', 'Rose Seeds', 'Magic Shovel', 'Super Fertilizer'
      ];
      const randomItem = mockItems[Math.floor(Math.random() * mockItems.length)];
      const randomStatus = Math.random() > 0.5 ? 'restocked' : 'sold_out';
      const randomPrice = Math.floor(Math.random() * 500) + 50;

      const newUpdate = {
        id: Date.now(),
        name: randomItem,
        status: randomStatus,
        timestamp: new Date(),
        price: randomPrice
      };

      setRecentUpdates(prev => [newUpdate, ...prev.slice(0, 9)]); // Keep last 10 updates
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const copyOverlayUrl = () => {
    navigator.clipboard.writeText(overlayUrl);
    // Could add toast notification here
  };

  const OverlayPreview = () => {
    const isDark = overlayConfig.theme === 'dark';
    const bgClass = isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';
    const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

    return (
      <div className={`${bgClass} ${borderClass} border-2 rounded-lg p-4 ${overlayConfig.compact ? 'max-w-xs' : 'max-w-sm'}`}>
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg">🌱</span>
          <span className="font-semibold text-sm">Garden Stock</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="space-y-2">
          {recentUpdates.slice(0, overlayConfig.compact ? 3 : 5).map(update => {
            if (overlayConfig.showOnlyInStock && update.status === 'sold_out') return null;
            
            return (
              <div key={update.id} className={`flex items-center justify-between text-xs ${
                overlayConfig.compact ? 'py-1' : 'py-2'
              } ${isDark ? 'border-gray-700' : 'border-gray-200'} border-b last:border-b-0`}>
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <span className={update.status === 'restocked' ? '✅' : '❌'}></span>
                  <span className="truncate font-medium">{update.name}</span>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {overlayConfig.showPrices && (
                    <span className="text-yellow-500 font-semibold">{update.price}🪙</span>
                  )}
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {Math.floor((Date.now() - update.timestamp.getTime()) / 1000)}s
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Streamer Overlay</h1>
        <p className="text-gray-400 mt-1">Create a customizable overlay for your streaming setup</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <span>⚙️</span>
                <span>Overlay Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                <div className="flex space-x-2">
                  <Button
                    variant={overlayConfig.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOverlayConfig(prev => ({ ...prev, theme: 'light' }))}
                    className={overlayConfig.theme === 'light' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
                  >
                    ☀️ Light
                  </Button>
                  <Button
                    variant={overlayConfig.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOverlayConfig(prev => ({ ...prev, theme: 'dark' }))}
                    className={overlayConfig.theme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
                  >
                    🌙 Dark
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                    <Button
                      key={pos}
                      variant={overlayConfig.position === pos ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOverlayConfig(prev => ({ ...prev, position: pos }))}
                      className={`text-xs ${overlayConfig.position === pos ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {pos.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Show Prices</label>
                  <Button
                    variant={overlayConfig.showPrices ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOverlayConfig(prev => ({ ...prev, showPrices: !prev.showPrices }))}
                    className={overlayConfig.showPrices ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
                  >
                    {overlayConfig.showPrices ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Only In Stock</label>
                  <Button
                    variant={overlayConfig.showOnlyInStock ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOverlayConfig(prev => ({ ...prev, showOnlyInStock: !prev.showOnlyInStock }))}
                    className={overlayConfig.showOnlyInStock ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
                  >
                    {overlayConfig.showOnlyInStock ? 'On' : 'Off'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Compact Mode</label>
                  <Button
                    variant={overlayConfig.compact ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOverlayConfig(prev => ({ ...prev, compact: !prev.compact }))}
                    className={overlayConfig.compact ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
                  >
                    {overlayConfig.compact ? 'On' : 'Off'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <span>🔗</span>
                <span>Overlay URL</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <code className="text-xs break-all text-gray-300">{overlayUrl}</code>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={copyOverlayUrl} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    📋 Copy URL
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(overlayUrl, '_blank')}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    🔗 Open
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                <p className="font-medium mb-2 text-gray-300">How to use:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Copy the overlay URL above</li>
                  <li>Add a "Browser Source" in OBS/Streamlabs</li>
                  <li>Paste the URL and set dimensions (400x300 recommended)</li>
                  <li>Position the overlay on your stream</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <span>👁️</span>
                <span>Live Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center p-6 bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg">
                <OverlayPreview />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <span>📈</span>
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentUpdates.slice(0, 6).map(update => (
                  <div key={update.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={update.status === 'restocked' ? '✅' : '❌'}></span>
                      <span className="font-medium text-sm text-gray-300">{update.name}</span>
                      <Badge variant={update.status === 'restocked' ? 'default' : 'secondary'} 
                            className={update.status === 'restocked' ? 'bg-emerald-900 text-emerald-300' : 'bg-gray-600 text-gray-300'}>
                        {update.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.floor((Date.now() - update.timestamp.getTime()) / 1000)}s ago
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StreamerOverlay;
