import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    events: [],
    keywords: '',
    itemTypes: []
  });

  const eventTypes = [
    { id: 'restocked', label: 'Item Restocked', icon: '✅' },
    { id: 'sold_out', label: 'Item Sold Out', icon: '❌' },
    { id: 'price_change', label: 'Price Change', icon: '💰' },
    { id: 'new_item', label: 'New Item Added', icon: '🆕' }
  ];

  const itemTypes = [
    { id: 'seed', label: 'Seeds', icon: '🌱' },
    { id: 'gear', label: 'Gear', icon: '🔧' },
    { id: 'consumable', label: 'Consumables', icon: '🧪' }
  ];

  // Helper function to safely convert date strings to Date objects
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
    // Load saved webhooks from localStorage
    const savedWebhooks = localStorage.getItem('webhooks');
    if (savedWebhooks) {
      try {
        const parsed = JSON.parse(savedWebhooks);
        // Convert date strings back to Date objects with safe parsing
        const withDates = parsed.map(webhook => ({
          ...webhook,
          createdAt: safeParseDate(webhook.createdAt),
          deliveryCount: webhook.deliveryCount || 0
        }));
        setWebhooks(withDates);
      } catch (error) {
        console.error('Error parsing webhooks from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('webhooks');
        setWebhooks([]);
      }
    }
  }, []);

  const saveWebhooks = (newWebhooks) => {
    setWebhooks(newWebhooks);
    localStorage.setItem('webhooks', JSON.stringify(newWebhooks));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.url) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive"
      });
      return;
    }

    if (formData.events.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one event type",
        variant: "destructive"
      });
      return;
    }

    const newWebhook = {
      id: Date.now(),
      ...formData,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      createdAt: new Date(),
      lastStatus: 'pending',
      deliveryCount: 0
    };

    const updatedWebhooks = [...webhooks, newWebhook];
    saveWebhooks(updatedWebhooks);

    setFormData({
      url: '',
      events: [],
      keywords: '',
      itemTypes: []
    });
    setShowForm(false);

    toast({
      title: "Success",
      description: "Webhook added successfully!",
    });
  };

  const handleEventChange = (eventId, checked) => {
    setFormData(prev => ({
      ...prev,
      events: checked 
        ? [...prev.events, eventId]
        : prev.events.filter(e => e !== eventId)
    }));
  };

  const handleItemTypeChange = (typeId, checked) => {
    setFormData(prev => ({
      ...prev,
      itemTypes: checked 
        ? [...prev.itemTypes, typeId]
        : prev.itemTypes.filter(t => t !== typeId)
    }));
  };

  const testWebhook = async (webhook) => {
    toast({
      title: "Testing webhook...",
      description: "Sending test payload",
    });

    // Simulate webhook test
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      const updatedWebhooks = webhooks.map(w => 
        w.id === webhook.id 
          ? { ...w, lastStatus: success ? 'success' : 'failed', deliveryCount: w.deliveryCount + 1 }
          : w
      );
      saveWebhooks(updatedWebhooks);

      toast({
        title: success ? "Test successful!" : "Test failed",
        description: success ? "Webhook received the test payload" : "Failed to deliver test payload",
        variant: success ? "default" : "destructive"
      });
    }, 2000);
  };

  const deleteWebhook = (id) => {
    const updatedWebhooks = webhooks.filter(w => w.id !== id);
    saveWebhooks(updatedWebhooks);
    toast({
      title: "Webhook deleted",
      description: "Webhook has been removed successfully",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-emerald-900 text-emerald-300';
      case 'failed': return 'bg-red-900 text-red-300';
      case 'pending': return 'bg-yellow-900 text-yellow-300';
      default: return 'bg-gray-800 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Webhook Manager</h1>
          <p className="text-gray-400 mt-1">Configure webhooks to receive real-time notifications</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {showForm ? 'Cancel' : 'Add Webhook'}
        </Button>
      </div>

      {/* Add Webhook Form */}
      {showForm && (
        <Card className="border-emerald-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <span>🔗</span>
              <span>Add New Webhook</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="url" className="text-gray-300">Webhook URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://your-app.com/webhook"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label className="text-gray-300">Event Types</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {eventTypes.map(event => (
                    <div key={event.id} className="flex items-center space-x-3 p-3 border border-gray-600 rounded-lg hover:bg-gray-700 bg-gray-800">
                      <Checkbox
                        id={event.id}
                        checked={formData.events.includes(event.id)}
                        onCheckedChange={(checked) => handleEventChange(event.id, checked)}
                      />
                      <Label htmlFor={event.id} className="flex items-center space-x-2 cursor-pointer text-gray-300">
                        <span>{event.icon}</span>
                        <span>{event.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Item Types (Optional)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  {itemTypes.map(type => (
                    <div key={type.id} className="flex items-center space-x-3 p-3 border border-gray-600 rounded-lg hover:bg-gray-700 bg-gray-800">
                      <Checkbox
                        id={type.id}
                        checked={formData.itemTypes.includes(type.id)}
                        onCheckedChange={(checked) => handleItemTypeChange(type.id, checked)}
                      />
                      <Label htmlFor={type.id} className="flex items-center space-x-2 cursor-pointer text-gray-300">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="keywords" className="text-gray-300">Keywords (Optional)</Label>
                <Input
                  id="keywords"
                  placeholder="peach, mango, golden (comma separated)"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Filter notifications by item names containing these keywords
                </p>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Create Webhook
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <Card className="text-center py-12 bg-gray-800 border-gray-700">
            <CardContent>
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold text-white mb-2">No webhooks configured</h3>
              <p className="text-gray-400 mb-4">Add your first webhook to start receiving notifications</p>
              <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
                Add Webhook
              </Button>
            </CardContent>
          </Card>
        ) : (
          webhooks.map(webhook => (
            <Card key={webhook.id} className="border-emerald-700 bg-gray-800">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">🔗</span>
                      <code className="bg-gray-700 px-2 py-1 rounded text-sm font-mono text-gray-300">
                        {webhook.url}
                      </code>
                      <Badge className={getStatusColor(webhook.lastStatus)}>
                        {webhook.lastStatus}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {webhook.events.map(eventId => {
                        const event = eventTypes.find(e => e.id === eventId);
                        return event ? (
                          <Badge key={eventId} variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {event.icon} {event.label}
                          </Badge>
                        ) : null;
                      })}
                    </div>

                    {webhook.itemTypes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {webhook.itemTypes.map(typeId => {
                          const type = itemTypes.find(t => t.id === typeId);
                          return type ? (
                            <Badge key={typeId} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                              {type.icon} {type.label}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}

                    {webhook.keywords.length > 0 && (
                      <div className="text-sm text-gray-400">
                        <strong>Keywords:</strong> {webhook.keywords.join(', ')}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                      Created: {formatDate(webhook.createdAt)} | 
                      Deliveries: {webhook.deliveryCount || 0}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => testWebhook(webhook)}
                      variant="outline"
                      size="sm"
                      className="text-blue-400 border-blue-700 hover:bg-blue-900/50"
                    >
                      Test
                    </Button>
                    <Button
                      onClick={() => deleteWebhook(webhook.id)}
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

export default WebhookManager;
