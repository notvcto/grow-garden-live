
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isConnected, setIsConnected] = useState(false);

  // Mock data for demonstration
  const mockItems = [
    { id: 1, name: 'Placeholder', type: 'seed', inStock: true, lastUpdate: new Date(), price: 150 },
    { id: 2, name: 'Placeholder', type: 'seed', inStock: false, lastUpdate: new Date(), price: 200 },
    { id: 3, name: 'Placeholder', type: 'seed', inStock: true, lastUpdate: new Date(), price: 75 },
    { id: 4, name: 'Placeholder', type: 'gear', inStock: false, lastUpdate: new Date(), price: 500 },
    { id: 5, name: 'Placeholder', type: 'gear', inStock: true, lastUpdate: new Date(), price: 100 },
    { id: 6, name: 'Placeholder', type: 'seed', inStock: true, lastUpdate: new Date(), price: 300 },
    { id: 7, name: 'Placeholder', type: 'gear', inStock: false, lastUpdate: new Date(), price: 750 },
    { id: 8, name: 'Placeholder', type: 'seed', inStock: true, lastUpdate: new Date(), price: 120 },
    { id: 9, name: 'Placeholder', type: 'egg', inStock: true, lastUpdate: new Date(), price: 120 },
  ];

  useEffect(() => {
    // Simulate WebSocket connection
    setItems(mockItems);
    setFilteredItems(mockItems);
    setIsConnected(true);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setItems(prevItems => 
        prevItems.map(item => ({
          ...item,
          inStock: Math.random() > 0.3, // 70% chance of being in stock
          lastUpdate: new Date()
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedType]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'seed': return 'bg-emerald-900 text-emerald-300 border-emerald-700';
      case 'gear': return 'bg-blue-900 text-blue-300 border-blue-700';
      case 'egg': return 'bg-blue-900 text-blue-300 border-blue-700';
      default: return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'seed': return '🌱';
      case 'gear': return '🔧';
      case 'egg': return '🪺';
      default: return '📦';
    }
  };

  return (
    <div className="space-y-6">
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
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-2xl shadow-sm border border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'seed', 'gear', 'egg'].map(type => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                onClick={() => setSelectedType(type)}
                className={`capitalize ${
                  selectedType === type 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent'
                }`}
              >
                {type === 'all' ? 'All Items' : `${type}s`}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Items</p>
              <p className="text-2xl font-bold text-white">{filteredItems.length}</p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">In Stock</p>
              <p className="text-2xl font-bold text-emerald-400">{filteredItems.filter(item => item.inStock).length}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Out of Stock</p>
              <p className="text-2xl font-bold text-red-400">{filteredItems.filter(item => !item.inStock).length}</p>
            </div>
            <div className="text-3xl">❌</div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Stock Rate</p>
              <p className="text-2xl font-bold text-blue-400">
                {filteredItems.length > 0 ? Math.round((filteredItems.filter(item => item.inStock).length / filteredItems.length) * 100) : 0}%
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`bg-gray-800 rounded-xl shadow-sm border-2 transition-all duration-300 hover:shadow-md transform hover:scale-105 ${
              item.inStock ? 'border-emerald-600 hover:border-emerald-500' : 'border-red-600 hover:border-red-500'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">{getTypeIcon(item.type)}</div>
                <Badge
                  className={`${
                    item.inStock 
                      ? 'bg-emerald-900 text-emerald-300 border-emerald-700' 
                      : 'bg-red-900 text-red-300 border-red-700'
                  }`}
                >
                  {item.inStock ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>
              
              <h3 className="font-semibold text-white mb-2">{item.name}</h3>
              
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className={getTypeColor(item.type)}>
                  {item.type}
                </Badge>
                <span className="text-lg font-bold text-white">{item.price} 🪙</span>
              </div>
              
              <p className="text-xs text-gray-400">
                Updated: {item.lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
          <p className="text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
