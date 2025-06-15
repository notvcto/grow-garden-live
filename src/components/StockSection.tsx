
import { Badge } from '@/components/ui/badge';

interface StockItem {
  item_id: string;
  display_name: string;
  quantity: number;
  icon: string;
  Date_Start: string;
  Date_End: string;
}

interface StockSectionProps {
  title: string;
  items: StockItem[];
  icon: string;
  colorScheme: string;
}

const StockSection = ({ title, items, icon, colorScheme }: StockSectionProps) => {
  // Only show items that are in stock
  const availableItems = items.filter(item => item.quantity > 0);

  if (!availableItems || availableItems.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-400 text-center py-8">No items currently available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6 transition-all duration-300 animate-fade-in">
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <Badge className="bg-emerald-900 text-emerald-300 border-emerald-700">
          {availableItems.length} available
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableItems.map((item, index) => (
          <div
            key={`${title}-${item.item_id}-${index}-${Date.now()}`}
            className={`bg-gray-700 rounded-lg p-4 border-l-4 transition-all duration-200 hover:bg-gray-600 ${colorScheme}`}
          >
            <div className="flex items-center space-x-3">
              <img 
                src={item.icon} 
                alt={item.display_name}
                className="w-8 h-8 rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjNjM2MzYzIiByeD0iNCIvPgo8dGV4dCB4PSIxMiIgeT0iMTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0ZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Pz88L3RleHQ+Cjwvc3ZnPgo=';
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{item.display_name}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-emerald-600 text-emerald-200 border-emerald-500">
                    Qty: {item.quantity}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockSection;