import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PersonalInfo } from './profile/PersonalInfo';
import { BookingHistory } from './profile/BookingHistory';
import { LoyaltyPoints } from './profile/LoyaltyPoints';
import { ServicePreferences } from './profile/ServicePreferences';
import { UserSettings } from './profile/UserSettings';
import { User } from '../types';

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <h2 className="text-xl">My Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="personal" className="text-xs">Personal</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
          <TabsTrigger value="loyalty" className="text-xs">Rewards</TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs">Preferences</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <PersonalInfo user={user} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <BookingHistory userId={user.id} />
        </TabsContent>

        <TabsContent value="loyalty" className="mt-6">
          <LoyaltyPoints userId={user.id} />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <ServicePreferences userId={user.id} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <UserSettings userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}