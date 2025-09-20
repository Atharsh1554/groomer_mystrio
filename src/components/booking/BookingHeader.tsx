import React from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Salon } from '../../types';
import logoImage from 'figma:asset/c797bd506da08fa515a696a1c063bd0b0178a7ef.png';

interface BookingHeaderProps {
  salon: Salon;
  onBack: () => void;
}

export function BookingHeader({ salon, onBack }: BookingHeaderProps) {
  return (
    <div className="relative">
      <div className="h-48 lg:h-64 overflow-hidden lg:rounded-t-lg">
        <ImageWithFallback
          src={salon.image}
          alt={salon.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="bg-white/90 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1">
          <img 
            src={logoImage} 
            alt="Groomer" 
            className="h-6 w-auto object-contain opacity-90"
          />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-white">
          <h1 className="text-2xl mb-2">{salon.name}</h1>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{salon.rating} ({salon.reviews}+ reviews)</span>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Open Now
            </Badge>
          </div>
          <p className="text-sm text-white/80">{salon.address}</p>
        </div>
      </div>
    </div>
  );
}