import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Search, Navigation, MapPin, Camera, Palette } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { Salon } from '../types';
import { calculateDistance } from '../utils/dateUtils';
import { SalonCard } from './map/SalonCard';
import logoImage from 'figma:asset/c797bd506da08fa515a696a1c063bd0b0178a7ef.png';

interface SalonListProps {
  onSalonSelect: (salon: Salon) => void;
  onLocationRequest: () => void;
  onFaceRecognitionRequest?: () => void;
  onCameraPreviewRequest?: () => void;
  detectedGender?: 'male' | 'female' | null;
}

export function SalonList({ onSalonSelect, onLocationRequest, onFaceRecognitionRequest, onCameraPreviewRequest, detectedGender }: SalonListProps) {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([]);

  useEffect(() => {
    fetchSalons();
    requestLocation();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = salons.filter(salon =>
        salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.services.some(service => 
          service.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredSalons(filtered);
    } else {
      setFilteredSalons(salons);
    }
  }, [searchQuery, salons]);

  const fetchSalons = async () => {
    try {
      // First clear old salon data if needed
      try {
        await fetch(`https://vrsyqrcbtyqjprnokouh.supabase.co/functions/v1/make-server-a5b926ad/salons`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyc3lxcmNidHlxanBybm9rb3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTgzNTQsImV4cCI6MjA3MjIzNDM1NH0.hl_CdNP_dzn9AfhXm02VVpKcK7kjPvjWrQR8DBG6S98`
          }
        });
      } catch (e) {
        // Ignore errors from delete - might not exist
      }

      const response = await fetch(`https://vrsyqrcbtyqjprnokouh.supabase.co/functions/v1/make-server-a5b926ad/salons`, {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyc3lxcmNidHlxanBybm9rb3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTgzNTQsImV4cCI6MjA3MjIzNDM1NH0.hl_CdNP_dzn9AfhXm02VVpKcK7kjPvjWrQR8DBG6S98`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch salons');
      }
      
      const data = await response.json();
      console.log('Fetched salon data:', data.salons); // Debug log
      setSalons(data.salons || []);
      setFilteredSalons(data.salons || []);
    } catch (error) {
      console.error('Error fetching salons:', error);
      setSalons([]);
      setFilteredSalons([]);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const getSalonsWithDistance = () => {
    if (!userLocation) return filteredSalons;
    
    return filteredSalons.map(salon => ({
      ...salon,
      distance: calculateDistance(userLocation.lat, userLocation.lng, salon.location.lat, salon.location.lng)
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  };

  if (loading) {
    return <LoadingSpinner message="Finding salons near you..." />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8">
            <img 
              src={logoImage} 
              alt="Groomer" 
              className="h-full w-auto object-contain opacity-80"
            />
          </div>
          <div>
            <h2 className="text-xl">Nearby Salons</h2>
            <p className="text-sm text-muted-foreground">
              {detectedGender 
                ? `Showing ${detectedGender === 'male' ? "men's" : "women's"} focused results`
                : "Discover top-rated salons in your area"
              }
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {onCameraPreviewRequest && (
            <Button
              variant="outline"
              size="icon"
              onClick={onCameraPreviewRequest}
              title="Try hairstyles with camera"
            >
              <Palette className="w-4 h-4" />
            </Button>
          )}
          {onFaceRecognitionRequest && !detectedGender && (
            <Button
              variant="outline"
              size="icon"
              onClick={onFaceRecognitionRequest}
              title="Personalize with face recognition"
            >
              <Camera className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              requestLocation();
              onLocationRequest();
            }}
            title="Find my location"
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search salons, services, or locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results count and sorting indicator */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">
          {filteredSalons.length} salon{filteredSalons.length !== 1 ? 's' : ''} found
        </h3>
        {userLocation && (
          <Badge variant="outline" className="text-xs">
            Sorted by distance
          </Badge>
        )}
      </div>

      {/* Salon List */}
      <div className="space-y-4">
        {getSalonsWithDistance().map((salon: any) => (
          <SalonCard
            key={salon.id}
            salon={salon}
            onSelect={onSalonSelect}
          />
        ))}

        {filteredSalons.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg mb-2">No salons found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or location
            </p>
          </div>
        )}
      </div>
    </div>
  );
}