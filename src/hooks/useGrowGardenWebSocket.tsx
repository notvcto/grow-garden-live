
import { useState, useEffect, useRef } from 'react';

interface StockItem {
  item_id: string;
  display_name: string;
  quantity: number;
  icon: string;
  Date_Start: string;
  Date_End: string;
}

interface WeatherItem {
  weather_id: string;
  weather_name: string;
  icon: string;
  active: boolean;
}

interface WebSocketData {
  seed_stock: StockItem[];
  gear_stock: StockItem[];
  egg_stock: StockItem[];
  cosmetic_stock: StockItem[];
  eventshop_stock: StockItem[];
  weather: WeatherItem[];
  lastUpdated?: Date;
  updateId?: string;
}

export const useGrowGardenWebSocket = () => {
  const [data, setData] = useState<WebSocketData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      const ws = new WebSocket('wss://websocket.joshlei.com/growagarden/');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to Grow a Garden');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          console.log('Received WebSocket data:', parsedData);
          
          // Create completely new object with unique identifier to force re-render
          const newData: WebSocketData = {
            seed_stock: [...(parsedData.seed_stock || [])],
            gear_stock: [...(parsedData.gear_stock || [])],
            egg_stock: [...(parsedData.egg_stock || [])],
            cosmetic_stock: [...(parsedData.cosmetic_stock || [])],
            eventshop_stock: [...(parsedData.eventshop_stock || [])],
            weather: [...(parsedData.weather || [])],
            lastUpdated: new Date(),
            updateId: `${Date.now()}-${Math.random()}`
          };
          
          console.log('Setting new data with updateId:', newData.updateId);
          setData(newData);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          setError('Failed to parse WebSocket data');
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setIsConnected(false);
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect to WebSocket');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    data,
    isConnected,
    error,
    reconnect: connect
  };
};