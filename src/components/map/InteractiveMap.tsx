import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import OSM from 'ol/source/OSM.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import { Style, Icon, Circle, Fill, Stroke } from 'ol/style.js';
import { fromLonLat, toLonLat } from 'ol/proj.js';
import { Salon } from '../../types';

interface InteractiveMapProps {
  salons: Salon[];
  userLocation: { lat: number; lng: number } | null;
  onSalonSelect: (salon: Salon) => void;
  className?: string;
}

export function InteractiveMap({ salons, userLocation, onSalonSelect, className }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create the map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    mapInstanceRef.current = map;
    setIsMapReady(true);
    
    // Hide loading after a short delay to ensure map is rendered
    setTimeout(() => setIsLoading(false), 1000);

    return () => {
      map.setTarget(undefined);
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    const map = mapInstanceRef.current;
    
    // Clear existing vector layers
    const vectorLayers = map.getLayers().getArray().filter(layer => layer instanceof VectorLayer);
    vectorLayers.forEach(layer => map.removeLayer(layer));

    // Create vector source for salon markers
    const salonSource = new VectorSource();

    // If no salons provided, just show empty map
    if (!salons || salons.length === 0) {
      return;
    }
    
    // Add salon markers
    salons.forEach((salon) => {
      // Check if salon has valid location data
      if (!salon.location || typeof salon.location.lng !== 'number' || typeof salon.location.lat !== 'number') {
        console.warn('Salon missing valid location data:', salon);
        return;
      }

      const feature = new Feature({
        geometry: new Point(fromLonLat([salon.location.lng, salon.location.lat])),
        salon: salon,
      });

      feature.setStyle(new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({
            color: '#8b5cf6',
          }),
          stroke: new Stroke({
            color: '#ffffff',
            width: 2,
          }),
        }),
      }));

      salonSource.addFeature(feature);
    });

    // Create salon layer
    const salonLayer = new VectorLayer({
      source: salonSource,
    });

    map.addLayer(salonLayer);

    // Add user location marker if available
    if (userLocation) {
      const userSource = new VectorSource();
      const userFeature = new Feature({
        geometry: new Point(fromLonLat([userLocation.lng, userLocation.lat])),
      });

      userFeature.setStyle(new Style({
        image: new Circle({
          radius: 10,
          fill: new Fill({
            color: '#3b82f6',
          }),
          stroke: new Stroke({
            color: '#ffffff',
            width: 3,
          }),
        }),
      }));

      userSource.addFeature(userFeature);
      
      const userLayer = new VectorLayer({
        source: userSource,
      });

      map.addLayer(userLayer);

      // Center map on user location with appropriate zoom
      map.getView().setCenter(fromLonLat([userLocation.lng, userLocation.lat]));
      map.getView().setZoom(13);
    } else if (salons.length > 0) {
      // Center on salons if no user location
      const validSalons = salons.filter(salon => 
        salon.location && 
        typeof salon.location.lng === 'number' && 
        typeof salon.location.lat === 'number'
      );

      if (validSalons.length === 1) {
        // Single salon - center on it with good zoom level
        const salon = validSalons[0];
        map.getView().setCenter(fromLonLat([salon.location.lng, salon.location.lat]));
        map.getView().setZoom(15);
      } else if (validSalons.length > 1) {
        // Multiple salons - fit all in view
        const bounds = salonSource.getExtent();
        if (bounds) {
          map.getView().fit(bounds, { padding: [50, 50, 50, 50], maxZoom: 15 });
        }
      } else {
        // No valid salons, show a default view (India)
        map.getView().setCenter(fromLonLat([78.9629, 20.5937]));
        map.getView().setZoom(5);
      }
    } else {
      // No salons at all, show default view (India)
      map.getView().setCenter(fromLonLat([78.9629, 20.5937]));
      map.getView().setZoom(5);
    }

    // Handle salon marker clicks
    const handleClick = (event: any) => {
      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        const salon = feature.get('salon');
        if (salon) {
          onSalonSelect(salon);
        }
      });
    };

    // Handle pointer movement for cursor changes
    const handlePointerMove = (event: any) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      const salon = feature?.get('salon');
      
      if (salon) {
        map.getTarget().style.cursor = 'pointer';
      } else {
        map.getTarget().style.cursor = '';
      }
    };

    map.on('click', handleClick);
    map.on('pointermove', handlePointerMove);

    // Cleanup
    return () => {
      map.un('click', handleClick);
      map.un('pointermove', handlePointerMove);
    };
  }, [salons, userLocation, isMapReady, onSalonSelect]);

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '300px' }}
      />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            Loading map...
          </div>
        </div>
      )}
      
      {/* Map Legend */}
      {!isLoading && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full border-2 border-white"></div>
              <span>Salons</span>
            </div>
            {userLocation && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                <span>Your Location</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Controls Info */}
      {!isLoading && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border">
          <p className="text-xs text-muted-foreground">Click markers to select salon</p>
        </div>
      )}
    </div>
  );
}