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

const STORAGE_KEYS = {
  DATA: 'websocket_data',
  LAST_REFRESHED: 'websocket_last_refreshed',
  CONNECTION_STATE: 'websocket_connection_state'
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  // Initialize state from sessionStorage to persist across page refreshes
  const [data, setData] = useState<WebSocketData | null>(() => {
    try {
      const storedData = sessionStorage.getItem(STORAGE_KEYS.DATA);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        // Convert lastUpdated back to Date object
        if (parsed.lastUpdated) {
          parsed.lastUpdated = new Date(parsed.lastUpdated);
        }
        console.log('Restored WebSocket data from sessionStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to restore WebSocket data from sessionStorage:', error);
    }
    return null;
  });

  const [isConnected, setIsConnected] = useState(() => {
    try {
      const storedState = sessionStorage.getItem(STORAGE_KEYS.CONNECTION_STATE);
      return storedState ? JSON.parse(storedState).isConnected : false;
    } catch {
      return false;
    }
  });

  const [error, setError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(() => {
    try {
      const storedTime = sessionStorage.getItem(STORAGE_KEYS.LAST_REFRESHED);
      return storedTime ? new Date(storedTime) : null;
    } catch {
      return null;
    }
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000;

  // Persist data to sessionStorage whenever it changes
  useEffect(() => {
    if (data) {
      try {
        sessionStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(data));
        console.log('Persisted WebSocket data to sessionStorage');
      } catch (error) {
        console.error('Failed to persist WebSocket data:', error);
      }
    }
  }, [data]);

  // Persist connection state
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.CONNECTION_STATE, JSON.stringify({ isConnected }));
    } catch (error) {
      console.error('Failed to persist connection state:', error);
    }
  }, [isConnected]);

  // Persist last refreshed time
  useEffect(() => {
    if (lastRefreshed) {
      try {
        sessionStorage.setItem(STORAGE_KEYS.LAST_REFRESHED, lastRefreshed.toISOString());
      } catch (error) {
        console.error('Failed to persist last refreshed time:', error);
      }
    }
  }, [lastRefreshed]);

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (connectionAttempts >= maxReconnectAttempts) {
      setError('Maximum reconnection attempts reached. Please try manual reconnect.');
      return;
    }

    isConnectingRef.current = true;
    console.log(`WebSocket connection attempt ${connectionAttempts + 1}`);

    try {
      const ws = new WebSocket('wss://websocket.joshlei.com/growagarden?user_id=991667792897326416');
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
          console.log('Received WebSocket data - forcing complete refresh:', parsedData);
          
          const refreshTime = new Date();
          const uniqueUpdateId = `${Date.now()}-${Math.random()}`;
          
          // Force complete data refresh with new arrays and unique ID
          const newData: WebSocketData = {
            seed_stock: parsedData.seed_stock ? [...parsedData.seed_stock] : [],
            gear_stock: parsedData.gear_stock ? [...parsedData.gear_stock] : [],
            egg_stock: parsedData.egg_stock ? [...parsedData.egg_stock] : [],
            cosmetic_stock: parsedData.cosmetic_stock ? [...parsedData.cosmetic_stock] : [],
            eventshop_stock: parsedData.eventshop_stock ? [...parsedData.eventshop_stock] : [],
            weather: parsedData.weather ? [...parsedData.weather] : [],
            lastUpdated: refreshTime,
            updateId: uniqueUpdateId
          };
          
          console.log('Setting new data with updateId:', uniqueUpdateId);
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
    
    // Clear persisted data on manual reconnect
    try {
      sessionStorage.removeItem(STORAGE_KEYS.DATA);
      sessionStorage.removeItem(STORAGE_KEYS.LAST_REFRESHED);
      sessionStorage.removeItem(STORAGE_KEYS.CONNECTION_STATE);
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
    
    setData(null);
    setLastRefreshed(null);
    setConnectionAttempts(0);
    setError(null);
    setTimeout(connect, 100);
  }, [connect]);

  // Initial connection - only if not already connected
  useEffect(() => {
    // Only connect if we don't have an active connection
    if (!isConnected || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connect();
    }

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Set up beforeunload handler
      const handleBeforeUnload = () => {
        if (wsRef.current) {
          wsRef.current.close(1000, 'Page unloading');
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Clean up the event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Page visibility change handling - maintain connection
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
