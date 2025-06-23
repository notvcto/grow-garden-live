import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

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
}

interface WebSocketContextType {
  data: WebSocketData | null;
  isConnected: boolean;
  error: string | null;
  connectionAttempts: number;
  forceReconnect: () => void;
  lastRefreshed: Date | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const useWebSocketData = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocketData must be used within a WebSocketProvider");
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

// Global WebSocket instance and state
let globalWS: WebSocket | null = null;
let globalIsConnected = false;
let globalConnectionAttempts = 0;
let subscribers: Set<(data: any) => void> = new Set();
let connectionSubscribers: Set<(connected: boolean) => void> = new Set();
let errorSubscribers: Set<(error: string | null) => void> = new Set();
let attemptsSubscribers: Set<(attempts: number) => void> = new Set();

const notifyDataSubscribers = (data: WebSocketData) => {
  subscribers.forEach((callback) => callback(data));
};

const notifyConnectionSubscribers = (connected: boolean) => {
  globalIsConnected = connected;
  connectionSubscribers.forEach((callback) => callback(connected));
};

const notifyErrorSubscribers = (error: string | null) => {
  errorSubscribers.forEach((callback) => callback(error));
};

const notifyAttemptsSubscribers = (attempts: number) => {
  globalConnectionAttempts = attempts;
  attemptsSubscribers.forEach((callback) => callback(attempts));
};

const createWebSocketConnection = () => {
  if (
    globalWS &&
    (globalWS.readyState === WebSocket.CONNECTING ||
      globalWS.readyState === WebSocket.OPEN)
  ) {
    console.log("WebSocket already exists and is connecting/connected");
    return;
  }

  console.log("Creating new WebSocket connection");

  try {
    globalWS = new WebSocket(
      "wss://websocket.joshlei.com/growagarden?user_id=991667792897326416"
    );

    globalWS.onopen = () => {
      console.log("WebSocket connected successfully");
      notifyConnectionSubscribers(true);
      notifyErrorSubscribers(null);
      notifyAttemptsSubscribers(0);
    };

    globalWS.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        console.log("Received WebSocket data:", parsedData);

        const refreshTime = new Date();

        const newData: WebSocketData = {
          seed_stock: parsedData.seed_stock || [],
          gear_stock: parsedData.gear_stock || [],
          egg_stock: parsedData.egg_stock || [],
          cosmetic_stock: parsedData.cosmetic_stock || [],
          eventshop_stock: parsedData.eventshop_stock || [],
          weather: parsedData.weather || [],
          lastUpdated: refreshTime,
        };

        notifyDataSubscribers(newData);
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
        notifyErrorSubscribers("Failed to parse WebSocket data");
      }
    };

    globalWS.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      notifyConnectionSubscribers(false);
      globalWS = null;

      // Only attempt reconnect if it wasn't a deliberate close and we haven't hit max attempts
      if (event.code !== 1000 && globalConnectionAttempts < 5) {
        const delay = Math.min(
          2000 * Math.pow(1.5, globalConnectionAttempts),
          10000
        );
        console.log(
          `Reconnecting in ${delay}ms... (attempt ${
            globalConnectionAttempts + 1
          }/5)`
        );

        setTimeout(() => {
          notifyAttemptsSubscribers(globalConnectionAttempts + 1);
          createWebSocketConnection();
        }, delay);
      } else if (globalConnectionAttempts >= 5) {
        notifyErrorSubscribers(
          "Connection lost. Click reconnect to try again."
        );
      }
    };

    globalWS.onerror = (error) => {
      console.error("WebSocket error:", error);
      notifyErrorSubscribers("WebSocket connection error");
      notifyConnectionSubscribers(false);
      globalWS = null;
    };
  } catch (err) {
    console.error("Failed to create WebSocket connection:", err);
    notifyErrorSubscribers("Failed to connect to WebSocket");
    globalWS = null;
  }
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const [data, setData] = useState<WebSocketData | null>(null);
  const [isConnected, setIsConnected] = useState(globalIsConnected);
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(
    globalConnectionAttempts
  );
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const forceReconnect = useCallback(() => {
    console.log("Force reconnecting WebSocket...");

    // Close existing connection
    if (globalWS) {
      globalWS.close(1000, "Manual reconnect");
      globalWS = null;
    }

    // Reset state
    notifyAttemptsSubscribers(0);
    notifyErrorSubscribers(null);
    notifyConnectionSubscribers(false);

    // Start new connection
    setTimeout(() => {
      createWebSocketConnection();
    }, 100);
  }, []);

  // Subscribe to global state changes
  useEffect(() => {
    const dataCallback = (newData: WebSocketData) => {
      console.log("Dashboard receiving new data from WebSocket");
      setData(newData);
      setLastRefreshed(newData.lastUpdated || new Date());
    };

    const connectionCallback = (connected: boolean) => {
      setIsConnected(connected);
    };

    const errorCallback = (newError: string | null) => {
      setError(newError);
    };

    const attemptsCallback = (attempts: number) => {
      setConnectionAttempts(attempts);
    };

    subscribers.add(dataCallback);
    connectionSubscribers.add(connectionCallback);
    errorSubscribers.add(errorCallback);
    attemptsSubscribers.add(attemptsCallback);

    // Initialize connection if it doesn't exist
    if (!globalWS || globalWS.readyState === WebSocket.CLOSED) {
      createWebSocketConnection();
    } else if (globalWS.readyState === WebSocket.OPEN) {
      setIsConnected(true);
    }

    return () => {
      subscribers.delete(dataCallback);
      connectionSubscribers.delete(connectionCallback);
      errorSubscribers.delete(errorCallback);
      attemptsSubscribers.delete(attemptsCallback);
    };
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        (!globalWS || globalWS.readyState !== WebSocket.OPEN)
      ) {
        console.log("Page became visible, checking connection...");
        createWebSocketConnection();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const value: WebSocketContextType = {
    data,
    isConnected,
    error,
    connectionAttempts,
    forceReconnect,
    lastRefreshed,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
