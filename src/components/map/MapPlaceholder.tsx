import React from 'react';
import { MapPin } from 'lucide-react';

interface MapPlaceholderProps {
  userLocation: { lat: number; lng: number } | null;
}

export function MapPlaceholder({ userLocation }: MapPlaceholderProps) {
  return (
    <div className="h-48 bg-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        <div className="text-center p-4">
          <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">Interactive map will show here</p>
          <p className="text-xs text-gray-500">
            {userLocation ? 
              `Your location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 
              'Location access required for personalized results'
            }
          </p>
        </div>
      </div>
      
      {/* Map Markers Simulation */}
      <div className="absolute top-4 left-8 w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
      <div className="absolute bottom-8 right-12 w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
      <div className="absolute top-16 right-8 w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  );
}