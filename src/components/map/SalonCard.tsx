import React from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Salon } from '../../types';

interface SalonCardProps {
  salon: Salon & { distance?: number };
  onSelect: (salon: Salon) => void;
}

export function SalonCard({ salon, onSelect }: SalonCardProps) {
  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onSelect(salon)}
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <ImageWithFallback
            src={salon.image}
            alt={salon.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{salon.name}</h4>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{salon.rating}</span>
                  <span className="text-muted-foreground">({salon.reviews})</span>
                </div>
                {salon.distance && (
                  <Badge variant="secondary" className="text-xs">
                    {salon.distance.toFixed(1)} km
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{salon.address}</span>
          </div>
          
          <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{salon.openTime} - {salon.closeTime}</span>
            <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
              Open
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {salon.services.slice(0, 3).map((service: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {service}
              </Badge>
            ))}
            {salon.services.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{salon.services.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}