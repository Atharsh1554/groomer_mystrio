import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface GenderSelectionProps {
  onGenderSelect: (gender: 'male' | 'female') => void;
  onBack?: () => void;
}

export function GenderSelection({ onGenderSelect, onBack }: GenderSelectionProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl">Choose Your Style Preference</h1>
        <p className="text-muted-foreground max-w-sm">
          Select your preferred category to see personalized hairstyle recommendations and salon services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onGenderSelect('male')}>
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">👨</span>
            </div>
            <div>
              <h3 className="font-medium">Men's Styles</h3>
              <p className="text-sm text-muted-foreground">
                Modern cuts, fades, classic styles
              </p>
            </div>
            <Button className="w-full">
              Browse Men's Services
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onGenderSelect('female')}>
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">👩</span>
            </div>
            <div>
              <h3 className="font-medium">Women's Styles</h3>
              <p className="text-sm text-muted-foreground">
                Cuts, colors, styling, treatments
              </p>
            </div>
            <Button className="w-full">
              Browse Women's Services
            </Button>
          </CardContent>
        </Card>
      </div>

      {onBack && (
        <Button variant="ghost" onClick={onBack} className="text-sm">
          ← Back to camera option
        </Button>
      )}
    </div>
  );
}