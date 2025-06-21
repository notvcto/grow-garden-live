
import { Badge } from '@/components/ui/badge';

interface WeatherItem {
  weather_id: string;
  weather_name: string;
  icon: string;
  active: boolean;
}

interface WeatherSectionProps {
  weather: WeatherItem[];
}

const WeatherSection = ({ weather }: WeatherSectionProps) => {
  const activeWeather = weather?.filter(w => w.active) || [];

  return (
    <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6 transition-all duration-300 animate-fade-in">
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-2xl">🌤️</span>
        <h3 className="text-xl font-bold text-white">Current Weather</h3>
        <Badge className="bg-blue-900 text-blue-300 border-blue-700">
          {activeWeather.length} active
        </Badge>
      </div>
      
      {activeWeather.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No active weather conditions</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeWeather.map((weatherItem) => (
            <div
              key={weatherItem.weather_id}
              className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg p-4 border border-blue-500/30 transition-all duration-200 hover:border-blue-400/50"
            >
              <div className="flex items-center space-x-3">
                <img 
                  src={weatherItem.icon} 
                  alt={weatherItem.weather_name}
                  className="w-8 h-8 rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNjM2MzYzIiByeD0iNCIvPgo8dGV4dCB4PSIxMiIgeT0iMTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+🌤️</dGV4dD4KPC9zdmc+Cg==';
                  }}
                />
                <div className="flex-1">
                  <h4 className="text-white font-medium">{weatherItem.weather_name}</h4>
                  <Badge className="text-xs bg-green-900 text-green-300 border-green-700 mt-1">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherSection;
