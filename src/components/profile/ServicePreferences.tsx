import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { Save, Heart, DollarSign, Clock, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '../LoadingSpinner';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ServicePreference {
  categoryId: string;
  categoryName: string;
  isPreferred: boolean;
  services: string[];
}

interface PreferenceData {
  favoriteServices: ServicePreference[];
  preferredTimeSlots: string[];
  budgetRange: [number, number];
  specialRequests: string;
  allowSmsNotifications: boolean;
  allowEmailPromotions: boolean;
  preferredStylistGender: 'male' | 'female' | 'no-preference';
  skinSensitivities: string[];
  hairType: string;
  stylePreferences: string[];
}

interface ServicePreferencesProps {
  userId: string;
}

const TIME_SLOTS = [
  '9:00 AM - 12:00 PM',
  '12:00 PM - 3:00 PM', 
  '3:00 PM - 6:00 PM',
  '6:00 PM - 9:00 PM'
];

const HAIR_TYPES = [
  'Straight',
  'Wavy',
  'Curly',
  'Coily',
  'Fine',
  'Thick',
  'Oily',
  'Dry',
  'Color-treated'
];

const STYLE_PREFERENCES = [
  'Classic',
  'Modern',
  'Trendy',
  'Minimalist',
  'Bold',
  'Natural',
  'Professional',
  'Casual'
];

const SKIN_SENSITIVITIES = [
  'Sensitive skin',
  'Allergic to fragrances',
  'Eczema',
  'Dermatitis',
  'Chemical sensitivities',
  'Pregnancy safe only'
];

export function ServicePreferences({ userId }: ServicePreferencesProps) {
  const [preferences, setPreferences] = useState<PreferenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a5b926ad/preferences/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      } else {
        // Initialize with defaults if no preferences exist
        setPreferences({
          favoriteServices: [],
          preferredTimeSlots: [],
          budgetRange: [50, 200],
          specialRequests: '',
          allowSmsNotifications: true,
          allowEmailPromotions: false,
          preferredStylistGender: 'no-preference',
          skinSensitivities: [],
          hairType: '',
          stylePreferences: []
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a5b926ad/preferences/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success('Preferences saved successfully');
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = <K extends keyof PreferenceData>(
    key: K,
    value: PreferenceData[K]
  ) => {
    if (!preferences) return;
    setPreferences(prev => ({
      ...prev!,
      [key]: value
    }));
  };

  const toggleArrayItem = <K extends keyof PreferenceData>(
    key: K,
    item: string
  ) => {
    if (!preferences) return;
    const currentArray = preferences[key] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updatePreference(key, newArray as PreferenceData[K]);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error || !preferences) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <p className="text-muted-foreground mb-4">{error || 'No preferences found'}</p>
          <Button onClick={fetchPreferences} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Budget Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred Budget Range</Label>
            <div className="mt-4 mb-2">
              <Slider
                value={preferences.budgetRange}
                onValueChange={(value) => updatePreference('budgetRange', value as [number, number])}
                max={500}
                min={20}
                step={10}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${preferences.budgetRange[0]}</span>
              <span>${preferences.budgetRange[1]}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Time Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="mb-3 block">Preferred Time Slots</Label>
            <div className="grid grid-cols-1 gap-2">
              {TIME_SLOTS.map((slot) => (
                <div key={slot} className="flex items-center space-x-2">
                  <Switch
                    checked={preferences.preferredTimeSlots.includes(slot)}
                    onCheckedChange={() => toggleArrayItem('preferredTimeSlots', slot)}
                  />
                  <Label>{slot}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hair & Style Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Hair & Style Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-3 block">Hair Type (select all that apply)</Label>
            <div className="flex flex-wrap gap-2">
              {HAIR_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={preferences.hairType.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const hairTypes = preferences.hairType.split(',').filter(Boolean);
                    const newTypes = hairTypes.includes(type)
                      ? hairTypes.filter(t => t !== type)
                      : [...hairTypes, type];
                    updatePreference('hairType', newTypes.join(','));
                  }}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Style Preferences</Label>
            <div className="flex flex-wrap gap-2">
              {STYLE_PREFERENCES.map((style) => (
                <Button
                  key={style}
                  variant={preferences.stylePreferences.includes(style) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleArrayItem('stylePreferences', style)}
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Preferred Stylist Gender</Label>
            <div className="flex gap-2">
              {[
                { value: 'no-preference', label: 'No Preference' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={preferences.preferredStylistGender === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePreference('preferredStylistGender', option.value as any)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health & Allergies */}
      <Card>
        <CardHeader>
          <CardTitle>Health & Allergies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-3 block">Skin Sensitivities & Allergies</Label>
            <div className="flex flex-wrap gap-2">
              {SKIN_SENSITIVITIES.map((sensitivity) => (
                <Button
                  key={sensitivity}
                  variant={preferences.skinSensitivities.includes(sensitivity) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleArrayItem('skinSensitivities', sensitivity)}
                >
                  {sensitivity}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="specialRequests">Special Requests & Notes</Label>
            <Textarea
              id="specialRequests"
              value={preferences.specialRequests}
              onChange={(e) => updatePreference('specialRequests', e.target.value)}
              placeholder="Any special requests, allergies, or notes for your stylist..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Appointment reminders and updates
              </p>
            </div>
            <Switch
              checked={preferences.allowSmsNotifications}
              onCheckedChange={(checked) => updatePreference('allowSmsNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Email Promotions</Label>
              <p className="text-sm text-muted-foreground">
                Special offers and salon news
              </p>
            </div>
            <Switch
              checked={preferences.allowEmailPromotions}
              onCheckedChange={(checked) => updatePreference('allowEmailPromotions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={savePreferences} disabled={saving} className="w-full">
        <Save className="w-4 h-4 mr-2" />
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}