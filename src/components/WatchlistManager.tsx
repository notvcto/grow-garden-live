import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const WatchlistManager = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    alertOnRestock: true,
    alertOnSoldOut: false,
    priceThreshold: ''
  });

  // Mock available items for suggestions
  const availableItems = [
    'Peach Tree Seeds', 'Mango Tree Seeds', 'Watermelon Seeds', 'Cherry Blossom Seeds',
    'Rose Seeds', 'Golden Watering Can', 'Magic Shovel', 'Super Fertilizer'
  ];

  const [suggestions, setSuggestions] = useState([]);

    const safeParseDate = (dateValue) => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  // Helper function to safely format dates
  const formatDate = (dateValue) => {
    const date = safeParseDate(dateValue);
    return date ? date.toLocaleDateString() : 'Invalid Date';
  };

  useEffect(() => {
    // Load saved watchlist from localStorage
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist);
        // Convert date strings back to Date objects with safe parsing
        const withDates = parsed.map(item => ({
          ...item,
          createdAt: safeParseDate(item.createdAt),
          lastTriggered: item.lastTriggered ? safeParseDate(item.lastTriggered) : null,
          triggerCount: item.triggerCount || 0
        }));
        setWatchlist(withDates);
      } catch (error) {
        console.error('Error parsing watchlist from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('watchlist');
        setWatchlist([]);
      }
    }
  }, []);

  const saveWatchlist = (newWatchlist) => {
    setWatchlist(newWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
  };

  const handleItemNameChange = (value) => {
    setFormData(prev => ({ ...prev, itemName: value }));
    
    // Show suggestions
    if (value.length > 0) {
      const filtered = availableItems.filter(item =>
        item.toLowerCase().includes(value.toLowerCase()) &&
        !watchlist.some(w => w.itemName.toLowerCase() === item.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.itemName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive"
      });
      return;
    }

    // Check if item already exists in watchlist
    if (watchlist.some(item => item.itemName.toLowerCase() === formData.itemName.toLowerCase())) {
      toast({
        title: "Error",
        description: "This item is already in your watchlist",
        variant: "destructive"
      });
      return;
    }

    const newWatchItem = {
      id: Date.now(),
      ...formData,
      itemName: formData.itemName.trim(),
      isActive: true,
      createdAt: new Date(),
      lastTriggered: null,
      triggerCount: 0
    };

    const updatedWatchlist = [...watchlist, newWatchItem];
    saveWatchlist(updatedWatchlist);

    setFormData({
      itemName: '',
      alertOnRestock: true,
      alertOnSoldOut: false,
      priceThreshold: ''
    });
    setSuggestions([]);
    setShowForm(false);

    toast({
      title: "Success",
      description: `${newWatchItem.itemName} added to watchlist!`,
    });
  };

  const toggleWatchItem = (id) => {
    const updatedWatchlist = watchlist.map(item =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    saveWatchlist(updatedWatchlist);
    
    const item = watchlist.find(w => w.id === id);
    toast({
      title: item?.isActive ? "Item muted" : "Item activated",
      description: `${item?.itemName} ${item?.isActive ? 'will no longer' : 'will now'} send alerts`,
    });
  };

  const deleteWatchItem = (id) => {
    const item = watchlist.find(w => w.id === id);
    const updatedWatchlist = watchlist.filter(w => w.id !== id);
    saveWatchlist(updatedWatchlist);
    
    toast({
      title: "Item removed",
      description: `${item?.itemName} removed from watchlist`,
    });
  };

  const selectSuggestion = (itemName) => {
    setFormData(prev => ({ ...prev, itemName }));
    setSuggestions([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Watchlist Manager</h1>
          <p className="text-gray-400 mt-1">Track your favorite items and get notified when they're available</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {showForm ? 'Cancel' : 'Add Item'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-white">{watchlist.length}</p>
              </div>
              <div className="text-3xl">👁️</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Alerts</p>
                <p className="text-2xl font-bold text-emerald-400">{watchlist.filter(item => item.isActive).length}</p>
              </div>
              <div className="text-3xl">🔔</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Alerts</p>
                <p className="text-2xl font-bold text-blue-400">{watchlist.reduce((sum, item) => sum + item.triggerCount, 0)}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Item Form */}
      {showForm && (
        <Card className="border-emerald-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <span>➕</span>
              <span>Add Item to Watchlist</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Label htmlFor="itemName" className="text-gray-300">Item Name</Label>
                <Input
                  id="itemName"
                  placeholder="Enter item name..."
                  value={formData.itemName}
                  onChange={(e) => handleItemNameChange(e.target.value)}
                  className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                
                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectSuggestion(item)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg text-gray-300"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-700">
                  <div>
                    <Label htmlFor="alertOnRestock" className="text-sm font-medium text-gray-300">
                      Alert on Restock
                    </Label>
                    <p className="text-sm text-gray-400">Get notified when item comes back in stock</p>
                  </div>
                  <Switch
                    id="alertOnRestock"
                    checked={formData.alertOnRestock}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, alertOnRestock: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-700">
                  <div>
                    <Label htmlFor="alertOnSoldOut" className="text-sm font-medium text-gray-300">
                      Alert on Sold Out
                    </Label>
                    <p className="text-sm text-gray-400">Get notified when item goes out of stock</p>
                  </div>
                  <Switch
                    id="alertOnSoldOut"
                    checked={formData.alertOnSoldOut}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, alertOnSoldOut: checked }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="priceThreshold" className="text-gray-300">Price Alert Threshold (Optional)</Label>
                <Input
                  id="priceThreshold"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.priceThreshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceThreshold: e.target.value }))}
                  className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Get notified when price drops below this amount
                </p>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Add to Watchlist
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Watchlist Items */}
      <div className="space-y-4">
        {watchlist.length === 0 ? (
          <Card className="text-center py-12 bg-gray-800 border-gray-700">
            <CardContent>
              <div className="text-6xl mb-4">👁️</div>
              <h3 className="text-xl font-semibold text-white mb-2">No items in watchlist</h3>
              <p className="text-gray-400 mb-4">Add items to track their availability and get alerts</p>
              <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
                Add First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          watchlist.map(item => (
            <Card key={item.id} className={`border-2 transition-all duration-200 ${
              item.isActive ? 'border-emerald-700 bg-gray-800' : 'border-gray-600 bg-gray-800/50'
            }`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">📦</span>
                      <h3 className="text-lg font-semibold text-white">{item.itemName}</h3>
                      <Badge className={item.isActive ? 'bg-emerald-900 text-emerald-300' : 'bg-gray-700 text-gray-300'}>
                        {item.isActive ? 'Active' : 'Muted'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {item.alertOnRestock && (
                        <Badge variant="outline" className="text-xs bg-emerald-900 text-emerald-300 border-emerald-700">
                          🔔 Restock Alert
                        </Badge>
                      )}
                      {item.alertOnSoldOut && (
                        <Badge variant="outline" className="text-xs bg-red-900 text-red-300 border-red-700">
                          ⚠️ Sold Out Alert
                        </Badge>
                      )}
                      {item.priceThreshold && (
                        <Badge variant="outline" className="text-xs bg-blue-900 text-blue-300 border-blue-700">
                          💰 Price Alert: {item.priceThreshold} 🪙
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      Added: {item.createdAt.toLocaleDateString()} | 
                      Alerts sent: {item.triggerCount}
                      {item.lastTriggered && ` | Last: ${item.lastTriggered.toLocaleDateString()}`}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => toggleWatchItem(item.id)}
                      variant="outline"
                      size="sm"
                      className={item.isActive 
                        ? "text-orange-400 border-orange-700 hover:bg-orange-900/50"
                        : "text-emerald-400 border-emerald-700 hover:bg-emerald-900/50"
                      }
                    >
                      {item.isActive ? 'Mute' : 'Activate'}
                    </Button>
                    <Button
                      onClick={() => deleteWatchItem(item.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-400 border-red-700 hover:bg-red-900/50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WatchlistManager;
