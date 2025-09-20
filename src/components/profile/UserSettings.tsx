import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Settings, Shield, Bell, Trash2, Download, Eye, EyeOff, Save } from 'lucide-react';
import { LoadingSpinner } from '../LoadingSpinner';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface UserSettingsData {
  privacy: {
    profileVisibility: 'public' | 'private';
    showBookingHistory: boolean;
    allowRecommendations: boolean;
  };
  notifications: {
    appointmentReminders: boolean;
    promotionalEmails: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    reminderTiming: '1hour' | '3hours' | '1day' | '3days';
  };
  security: {
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };
}

interface UserSettingsProps {
  userId: string;
}

export function UserSettings({ userId }: UserSettingsProps) {
  const [settings, setSettings] = useState<UserSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [userId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a5b926ad/settings/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        // Initialize with defaults
        setSettings({
          privacy: {
            profileVisibility: 'private',
            showBookingHistory: false,
            allowRecommendations: true,
          },
          notifications: {
            appointmentReminders: true,
            promotionalEmails: false,
            smsNotifications: true,
            pushNotifications: true,
            reminderTiming: '1day',
          },
          security: {
            twoFactorEnabled: false,
            loginAlerts: true,
          },
          preferences: {
            theme: 'system',
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a5b926ad/settings/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a5b926ad/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  const downloadData = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a5b926ad/data/export/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-salon-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Data exported successfully');
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a5b926ad/account/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        toast.success('Account deleted successfully');
        // Redirect to login or handle sign out
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const updateSetting = <K extends keyof UserSettingsData>(
    section: K,
    key: keyof UserSettingsData[K],
    value: any
  ) => {
    if (!settings) return;
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value
      }
    }));
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

  if (!settings) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <p className="text-muted-foreground">Failed to load settings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Control who can see your profile
              </p>
            </div>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
              className="p-2 border border-border rounded-md bg-input-background"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Booking History</Label>
              <p className="text-sm text-muted-foreground">
                Allow salons to see your booking history for better recommendations
              </p>
            </div>
            <Switch
              checked={settings.privacy.showBookingHistory}
              onCheckedChange={(checked) => updateSetting('privacy', 'showBookingHistory', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Personalized Recommendations</Label>
              <p className="text-sm text-muted-foreground">
                Use your data to provide personalized salon and service recommendations
              </p>
            </div>
            <Switch
              checked={settings.privacy.allowRecommendations}
              onCheckedChange={(checked) => updateSetting('privacy', 'allowRecommendations', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Appointment Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get notified before your appointments
              </p>
            </div>
            <Switch
              checked={settings.notifications.appointmentReminders}
              onCheckedChange={(checked) => updateSetting('notifications', 'appointmentReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Reminder Timing</Label>
              <p className="text-sm text-muted-foreground">
                When to send appointment reminders
              </p>
            </div>
            <select
              value={settings.notifications.reminderTiming}
              onChange={(e) => updateSetting('notifications', 'reminderTiming', e.target.value)}
              className="p-2 border border-border rounded-md bg-input-background"
              disabled={!settings.notifications.appointmentReminders}
            >
              <option value="1hour">1 hour before</option>
              <option value="3hours">3 hours before</option>
              <option value="1day">1 day before</option>
              <option value="3days">3 days before</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive text message notifications
              </p>
            </div>
            <Switch
              checked={settings.notifications.smsNotifications}
              onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Promotional Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about deals and promotions
              </p>
            </div>
            <Switch
              checked={settings.notifications.promotionalEmails}
              onCheckedChange={(checked) => updateSetting('notifications', 'promotionalEmails', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Login Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone logs into your account
              </p>
            </div>
            <Switch
              checked={settings.security.loginAlerts}
              onCheckedChange={(checked) => updateSetting('security', 'loginAlerts', checked)}
            />
          </div>

          <div className="space-y-3">
            <Label>Change Password</Label>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button 
                onClick={changePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
                size="sm"
              >
                Change Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Account */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Download Your Data</Label>
              <p className="text-sm text-muted-foreground">
                Export all your account data
              </p>
            </div>
            <Button onClick={downloadData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-destructive">Delete Account</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAccount} className="bg-destructive">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveSettings} disabled={saving} className="w-full">
        <Save className="w-4 h-4 mr-2" />
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}