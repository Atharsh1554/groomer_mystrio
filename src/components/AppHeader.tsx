import React from 'react';
import { Button } from './ui/button';
import { LogOut, Calendar, MapPin } from 'lucide-react';
import { User, Salon, ViewType } from '../types';
import logoImage from 'figma:asset/c797bd506da08fa515a696a1c063bd0b0178a7ef.png';

interface AppHeaderProps {
  user: User | null;
  currentView: ViewType;
  selectedSalon: Salon | null;
  onSignOut: () => void;
}

export function AppHeader({ user, currentView, selectedSalon, onSignOut }: AppHeaderProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-md mx-auto lg:max-w-4xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8">
              <img 
                src={logoImage} 
                alt="Groomer" 
                className="h-full w-auto object-contain"
              />
            </div>
            <div>
              {user && (
                <p className="text-sm text-muted-foreground">
                  Welcome, {user.user_metadata?.name || user.email}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {currentView === 'map' && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  Near You
                </Button>
              </div>
            )}
            
            {currentView === 'booking' && selectedSalon && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  Booking
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="text-xs"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}