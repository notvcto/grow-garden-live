import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGrowGardenWebSocket } from '@/hooks/useGrowGardenWebSocket';
import StockSection from './StockSection';
import WeatherSection from './WeatherSection';

const Dashboard = () => {
  const { data, isConnected, error, reconnect } = useGrowGardenWebSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Log when data changes to debug
  useEffect(() => {
    console.log('Dashboard data updated:', data?.updateId);
    console.log('Full data object:', data);
  }, [data]);

  // Filter function for search
  const filterItems = (items: any[]) => {
    if (!items || !Array.isArray(items)) return [];
    if (!searchTerm) return items;
    return items.filter(item =>
      item.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get only available items (quantity > 0) with proper null checking
  const getAvailableItems = () => {
    if (!data) return [];
    const allItems = [
      ...(Array.isArray(data.seed_stock) ? data.seed_stock.filter(item => item && item.quantity > 0) : []),
      ...(Array.isArray(data.gear_stock) ? data.gear_stock.filter(item => item && item.quantity > 0) : []),
      ...(Array.isArray(data.egg_stock) ? data.egg_stock.filter(item => item && item.quantity > 0) : []),
      ...(Array.isArray(data.cosmetic_stock) ? data.cosmetic_stock.filter(item => item && item.quantity > 0) : []),
      ...(Array.isArray(data.eventshop_stock) ? data.eventshop_stock.filter(item => item && item.quantity > 0) : [])
    ];
    console.log('Available items:', allItems);
    return allItems;
  };

  const availableItems = getAvailableItems();
  
  // Properly filter each category with null checking
  const filteredSeedStock = filterItems(Array.isArray(data?.seed_stock) ? data.seed_stock.filter(item => item && item.quantity > 0) : []);
  const filteredGearStock = filterItems(Array.isArray(data?.gear_stock) ? data.gear_stock.filter(item => item && item.quantity > 0) : []);
  const filteredEggStock = filterItems(Array.isArray(data?.egg_stock) ? data.egg_stock.filter(item => item && item.quantity > 0) : []);
  const filteredCosmeticStock = filterItems(Array.isArray(data?.cosmetic_stock) ? data.cosmetic_stock.filter(item => item && item.quantity > 0) : []);
  const filteredEventStock = filterItems(Array.isArray(data?.eventshop_stock) ? data.eventshop_stock.filter(item => item && item.quantity > 0) : []);

  // Log filtered results for debugging
  useEffect(() => {
    console.log('Filtered results:', {
      seeds: filteredSeedStock.length,
      gear: filteredGearStock.length,
      eggs: filteredEggStock.length,
      cosmetics: filteredCosmeticStock.length,
      event: filteredEventStock.length
    });
  }, [filteredSeedStock, filteredGearStock, filteredEggStock, filteredCosmeticStock, filteredEventStock]);

  // Filter by category
  const getItemsByCategory = () => {
    switch (selectedCategory) {
      case 'seeds':
        return filteredSeedStock;
      case 'gear':
        return filteredGearStock;
      case 'eggs':
        return filteredEggStock;
      case 'cosmetics':
        return filteredCosmeticStock;
      case 'event':
        return filteredEventStock;
      default:
        return availableItems.filter(item =>
          item && item.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
  };

  const categories = [
    { id: 'all', label: 'All Items', icon: '📦' },
    { id: 'seeds', label: 'Seeds', icon: '🌱' },
    { id: 'gear', label: 'Gear', icon: '🔧' },
    { id: 'eggs', label: 'Eggs', icon: '🥚' },
    { id: 'cosmetics', label: 'Cosmetics', icon: '💄' },
    { id: 'event', label: 'Event Shop', icon: '🎪' }
  ];

  // Format last updated time
  const formatLastUpdated = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6" key={data?.updateId || 'no-data'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Stock Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time inventory tracking for Grow a Garden</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${
            isConnected ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          {error && !isConnected && (
            <Button onClick={reconnect} size="sm" className="bg-blue-600 hover:bg-blue-700">
              Reconnect
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
          <p className="font-medium">Connection Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 rounded-2xl shadow-sm border border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search available items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className={`capitalize ${
                  selectedCategory === category.id 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Available Items</p>
              <p className="text-2xl font-bold text-emerald-400">{availableItems.length}</p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Categories</p>
              <p className="text-2xl font-bold text-blue-400">
                {[filteredSeedStock, filteredGearStock, filteredEggStock, filteredCosmeticStock, filteredEventStock]
                  .filter(arr => arr.length > 0).length}
              </p>
            </div>
            <div className="text-3xl">🏷️</div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Weather</p>
              <p className="text-2xl font-bold text-cyan-400">
                {Array.isArray(data?.weather) ? data.weather.filter(w => w && w.active).length : 0}
              </p>
            </div>
            <div className="text-3xl">🌤️</div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Last Updated</p>
              <p className="text-sm font-bold text-white">
                {data?.lastUpdated ? formatLastUpdated(data.lastUpdated) : 'Never'}
              </p>
            </div>
            <div className="text-3xl">🕐</div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {!data && isConnected && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-pulse">🌱</div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading stock data...</h3>
          <p className="text-gray-400">Waiting for WebSocket data</p>
        </div>
      )}

      {/* Weather Section */}
      {data?.weather && Array.isArray(data.weather) && (
        <WeatherSection weather={data.weather} key={`weather-${data.updateId}`} />
      )}

      {/* Stock Sections */}
      {data && selectedCategory === 'all' && (
        <div className="space-y-6">
          <StockSection 
            key={`seeds-${data.updateId}`}
            title="Seeds" 
            items={filteredSeedStock} 
            icon="🌱" 
            colorScheme="border-emerald-500"
          />
          <StockSection 
            key={`gear-${data.updateId}`}
            title="Gear" 
            items={filteredGearStock} 
            icon="🔧" 
            colorScheme="border-blue-500"
          />
          <StockSection 
            key={`eggs-${data.updateId}`}
            title="Eggs" 
            items={filteredEggStock} 
            icon="🥚" 
            colorScheme="border-yellow-500"
          />
          <StockSection 
            key={`cosmetics-${data.updateId}`}
            title="Cosmetics" 
            items={filteredCosmeticStock} 
            icon="💄" 
            colorScheme="border-pink-500"
          />
          <StockSection 
            key={`event-${data.updateId}`}
            title="Event Shop" 
            items={filteredEventStock} 
            icon="🎪" 
            colorScheme="border-purple-500"
          />
        </div>
      )}

      {/* Category-specific view */}
      {data && selectedCategory !== 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {getItemsByCategory().map((item, index) => (
            <div
              key={`${selectedCategory}-${item.item_id}-${index}-${data.updateId}`}
              className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-4 transition-all duration-300 hover:shadow-md transform hover:scale-105"
            >
              <div className="flex items-center space-x-3 mb-3">
                <img 
                  src={item.icon} 
                  alt={item.display_name}
                  className="w-8 h-8 rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNjM2MzYzIiByeD0iNCIvPgo8dGV4dCB4PSIxMiIgeT0iMTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo=';
                  }}
                />
                <Badge className="bg-emerald-900 text-emerald-300 border-emerald-700">
                  Available
                </Badge>
              </div>
              
              <h3 className="font-semibold text-white mb-2">{item.display_name}</h3>
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-gray-700 text-gray-300 border-gray-600">
                  Qty: {item.quantity}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Data State */}
      {data && getItemsByCategory().length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No available items found</h3>
          <p className="text-gray-400">All items in this category are currently out of stock</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;