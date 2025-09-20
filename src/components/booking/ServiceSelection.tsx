import React from 'react';
import { Clock, Scissors, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Service, CategoryType } from '../../types';

interface ServiceSelectionProps {
  services: { women: Service[]; men: Service[] };
  selectedCategory: CategoryType;
  onCategorySelect: (category: CategoryType) => void;
  onServiceSelect: (service: Service) => void;
}

export function ServiceSelection({ 
  services, 
  selectedCategory, 
  onCategorySelect, 
  onServiceSelect 
}: ServiceSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-4">Choose Category</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={selectedCategory === 'women' ? 'default' : 'outline'}
            onClick={() => onCategorySelect('women')}
            className="h-12 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Women
          </Button>
          <Button
            variant={selectedCategory === 'men' ? 'default' : 'outline'}
            onClick={() => onCategorySelect('men')}
            className="h-12 flex items-center gap-2"
          >
            <Scissors className="w-4 h-4" />
            Men
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-4">Select Service</h3>
        <div className="space-y-3">
          {services[selectedCategory].map((service) => (
            <Card
              key={service.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onServiceSelect(service)}
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="mb-1">{service.name}</h4>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.duration}
                    </span>
                    <span className="font-semibold text-foreground">
                      {service.price}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}