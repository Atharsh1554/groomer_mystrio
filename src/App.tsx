import React, { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { FaceRecognition } from './components/FaceRecognition';
import { GenderSelection } from './components/GenderSelection';
import { HairstyleSuggestions } from './components/HairstyleSuggestions';
import { Home } from './components/Home';
import { BookingFlow } from './components/BookingFlow';
import { AppHeader } from './components/AppHeader';
import { LoadingSpinner } from './components/LoadingSpinner';
import { WorkingCameraTest } from './components/WorkingCameraTest';
import { Toaster } from './components/ui/sonner';
import { auth } from './utils/supabase/client';
import { User, Salon, ViewType } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('auth');
  const [loading, setLoading] = useState(true);
  const [detectedGender, setDetectedGender] = useState<'male' | 'female' | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { session, error } = await auth.getSession();
      if (session?.user) {
        setUser(session.user as User);
        setCurrentView('home');
      } else {
        setCurrentView('auth');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setCurrentView('auth');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (authUser: User) => {
    setUser(authUser);
    // Go directly to home - face recognition is now optional and offered within the flow
    setCurrentView('home');
  };

  const handleSalonSelect = (salon: Salon) => {
    setSelectedSalon(salon);
    setCurrentView('booking');
  };

  const handleBackToHome = () => {
    setSelectedSalon(null);
    setCurrentView('home');
  };

  const handleBookingComplete = () => {
    setSelectedSalon(null);
    setCurrentView('home');
  };

  const handleGenderDetected = (gender: 'male' | 'female', selectedStyle?: any) => {
    setDetectedGender(gender);
    // If a specific style was selected in face recognition, go directly to home
    // Otherwise go to hairstyle suggestions
    if (selectedStyle) {
      setCurrentView('home');
    } else {
      setCurrentView('hairstyleSuggestions');
    }
  };

  const handleSkipFaceRecognition = () => {
    setCurrentView('genderSelection');
  };

  const handleFaceRecognitionRequest = () => {
    setCurrentView('faceRecognition');
  };

  const handleCameraPreviewRequest = () => {
    setCurrentView('cameraPreview');
  };

  const handleCameraPreviewClose = () => {
    setCurrentView('home');
  };

  const handleCameraPreviewCapture = (imageData: string) => {
    console.log('Photo captured from camera preview:', imageData);
    // You could save this image or process it further
  };

  const handleHairstyleSuggestionsComplete = () => {
    setCurrentView('home');
  };

  const handleBackToFaceRecognition = () => {
    setCurrentView('faceRecognition');
  };

  const handleGenderSelection = (gender: 'male' | 'female') => {
    setDetectedGender(gender);
    setCurrentView('home');
  };

  const handleBackToGenderSelection = () => {
    setCurrentView('genderSelection');
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setSelectedSalon(null);
      setDetectedGender(null);
      setCurrentView('auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleLocationRequest = () => {
    // This could trigger additional location-based functionality
    // For now, it just triggers the geolocation request in Home
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (currentView === 'auth') {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  if (currentView === 'faceRecognition') {
    return (
      <FaceRecognition 
        onGenderDetected={handleGenderDetected}
        onSkip={handleSkipFaceRecognition}
      />
    );
  }

  if (currentView === 'genderSelection') {
    return (
      <GenderSelection 
        onGenderSelect={handleGenderSelection}
        onBack={handleBackToFaceRecognition}
      />
    );
  }

  if (currentView === 'hairstyleSuggestions' && detectedGender) {
    return (
      <HairstyleSuggestions
        gender={detectedGender}
        onBack={handleBackToGenderSelection}
        onContinue={handleHairstyleSuggestionsComplete}
      />
    );
  }

  if (currentView === 'cameraPreview') {
    return (
      <WorkingCameraTest
        onClose={handleCameraPreviewClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'booking' && (
        <AppHeader
          user={user}
          currentView={currentView}
          selectedSalon={selectedSalon}
          onSignOut={handleSignOut}
        />
      )}

      {currentView === 'home' && user && (
        <Home 
          user={user}
          onSalonSelect={handleSalonSelect}
          onLocationRequest={handleLocationRequest}
          onFaceRecognitionRequest={handleFaceRecognitionRequest}
          onCameraPreviewRequest={handleCameraPreviewRequest}
          detectedGender={detectedGender}
          onSignOut={handleSignOut}
        />
      )}

      {currentView === 'booking' && selectedSalon && user && (
        <BookingFlow
          salon={selectedSalon}
          user={user}
          onBack={handleBackToHome}
          onBookingComplete={handleBookingComplete}
          detectedGender={detectedGender}
        />
      )}
      
      <Toaster />
    </div>  );
}