
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

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

interface WebSocketContextType {
  data: WebSocketData | null;
  isConnected: boolean;
  error: string | null;
  connectionAttempts: number;
  forceReconnect: () => void;
  lastRefreshed: Date | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketData = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketData must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [data, setData] = useState<WebSocketData | null>(() => {
    // Try to restore data from sessionStorage on initialization
    try {
      const saved = sessionStorage.getItem('websocket-data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(() => {
    // Try to restore last refresh time from sessionStorage
    try {
      const saved = sessionStorage.getItem('last-refreshed');
      return saved ? new Date(saved) : null;
    } catch {
      return null;
    }
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000;

  // Calculate next refresh time aligned to 5-minute intervals with 5-second grace period
  const calculateNextRefresh = () => {
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    
    // Calculate the next 5-minute mark (0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55)
    const nextFiveMinuteMark = Math.ceil(currentMinutes / 5) * 5;
    
    const nextRefreshTime = new Date(now);
    nextRefreshTime.setMinutes(nextFiveMinuteMark);
    nextRefreshTime.setSeconds(5); // 5-second grace period
    nextRefreshTime.setMilliseconds(0);
    
    // If we've already passed this 5-minute mark + grace period, move to the next one
    if (nextRefreshTime.getTime() <= now.getTime()) {
      nextRefreshTime.setMinutes(nextRefreshTime.getMinutes() + 5);
    }
    
    return nextRefreshTime;
  };

  // Save data to sessionStorage whenever it changes
  useEffect(() => {
    if (data) {
      try {
        sessionStorage.setItem('websocket-data', JSON.stringify(data));
      } catch (err) {
        console.warn('Failed to save WebSocket data to sessionStorage:', err);
      }
    }
  }, [data]);

  // Save last refresh time to sessionStorage whenever it changes
  useEffect(() => {
    if (lastRefreshed) {
      try {
        sessionStorage.setItem('last-refreshed', lastRefreshed.toISOString());
      } catch (err) {
        console.warn('Failed to save last refresh time to sessionStorage:', err);
      }
    }
  }, [lastRefreshed]);

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (connectionAttempts >= maxReconnectAttempts) {
      setError('Maximum reconnection attempts reached. Will retry at next scheduled refresh.');
      return;
    }

    isConnectingRef.current = true;
    console.log(`WebSocket connection attempt ${connectionAttempts + 1}`);

    try {
      const ws = new WebSocket('wss://websocket.joshlei.com/growagarden/');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setError(null);
        setConnectionAttempts(0);
        isConnectingRef.current = false;
      };

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          console.log('Received WebSocket data:', parsedData);
          
          const refreshTime = new Date();
          const newData: WebSocketData = {
            seed_stock: [...(parsedData.seed_stock || [])],
            gear_stock: [...(parsedData.gear_stock || [])],
            egg_stock: [...(parsedData.egg_stock || [])],
            cosmetic_stock: [...(parsedData.cosmetic_stock || [])],
            eventshop_stock: [...(parsedData.eventshop_stock || [])],
            weather: [...(parsedData.weather || [])],
            lastUpdated: refreshTime,
            updateId: `${Date.now()}-${Math.random()}`
          };
          
          setData(newData);
          setLastRefreshed(refreshTime);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          setError('Failed to parse WebSocket data');
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        isConnectingRef.current = false;
        
        // Only attempt immediate reconnect if it wasn't a deliberate close and we haven't hit max attempts
        if (event.code !== 1000 && connectionAttempts < maxReconnectAttempts) {
          const delay = Math.min(baseReconnectDelay * Math.pow(1.5, connectionAttempts), 15000);
          console.log(`Reconnecting in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setIsConnected(false);
        isConnectingRef.current = false;
      };

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect to WebSocket');
      setConnectionAttempts(prev => prev + 1);
      isConnectingRef.current = false;
    }
  }, [connectionAttempts]);

  const forceReconnect = useCallback(() => {
    console.log('Force reconnecting WebSocket...');
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual reconnect');
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setConnectionAttempts(0);
    setError(null);
    setTimeout(connect, 100);
  }, [connect]);

  // Scheduled refresh every 5 minutes aligned to clock
  const scheduleRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearTimeout(refreshIntervalRef.current);
    }

    const now = new Date();
    const next = calculateNextRefresh();
    const timeUntilRefresh = next.getTime() - now.getTime();

    console.log(`Next refresh scheduled for: ${next.toLocaleTimeString()} (in ${Math.round(timeUntilRefresh / 1000)}s)`);

    refreshIntervalRef.current = setTimeout(() => {
      console.log('Scheduled refresh: Reconnecting to get fresh data...');
      forceReconnect();
      scheduleRefresh(); // Schedule next refresh
    }, timeUntilRefresh);
  }, [forceReconnect]);

  // Initial connection
  useEffect(() => {
    connect();
    scheduleRefresh();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (refreshIntervalRef.current) {
        clearTimeout(refreshIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, []); // Only run once on mount

  // Page visibility change handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected) {
        console.log('Page became visible, checking connection...');
        setTimeout(connect, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isConnected, connect]);

  const value: WebSocketContextType = {
    data,
    isConnected,
    error,
    connectionAttempts,
    forceReconnect,
    lastRefreshed
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
