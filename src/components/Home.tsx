import React, { useState } from 'react';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { UserBookings } from './UserBookings';
import { SalonList } from './SalonList';
import { UserProfile } from './UserProfile';
import { User, Salon } from '../types';
import logoImage from 'figma:asset/c797bd506da08fa515a696a1c063bd0b0178a7ef.png';

interface HomeProps {
  user: User;
  onSalonSelect: (salon: Salon) => void;
  onLocationRequest: () => void;
  onFaceRecognitionRequest?: () => void;
  onCameraPreviewRequest?: () => void;
  detectedGender?: 'male' | 'female' | null;
  onSignOut?: () => void;
}

export function Home({ 
  user, 
  onSalonSelect, 
  onLocationRequest, 
  onFaceRecognitionRequest,
  onCameraPreviewRequest, 
  detectedGender,
  onSignOut 
}: HomeProps) {
  const [activeTab, setActiveTab] = useState('salons');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto lg:max-w-4xl">
        <div className="bg-white min-h-screen flex flex-col lg:bg-background lg:pt-4">
          <div className="bg-white lg:rounded-lg lg:shadow-lg lg:border lg:border-border flex flex-col min-h-screen lg:min-h-[calc(100vh-2rem)]">
            
            <div className="p-4">
              {/* Header with logo and sign out */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-8">
                    <img 
                      src={logoImage} 
                      alt="Groomer" 
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl">Welcome back!</h1>
                    <p className="text-sm text-muted-foreground">
                      {user.user_metadata?.name || user.email}
                    </p>
                  </div>
                </div>
                {onSignOut && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSignOut}
                    className="text-xs"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Sign Out
                  </Button>
                )}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="salons">Find Salons</TabsTrigger>
                  <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>
                
                <TabsContent value="salons" className="mt-6">
                  <SalonList
                    onSalonSelect={onSalonSelect}
                    onLocationRequest={onLocationRequest}
                    onFaceRecognitionRequest={onFaceRecognitionRequest}
                    onCameraPreviewRequest={onCameraPreviewRequest}
                    detectedGender={detectedGender}
                  />
                </TabsContent>
                
                <TabsContent value="bookings" className="mt-6">
                  <div className="space-y-4">
                    <div className="text-center lg:text-left">
                      <h2 className="text-xl">My Bookings</h2>
                      <p className="text-sm text-muted-foreground">
                        View and manage your salon appointments
                      </p>
                    </div>
                    <UserBookings userId={user.id} />
                  </div>
                </TabsContent>
                
                <TabsContent value="profile" className="mt-6">
                  <UserProfile user={user} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}