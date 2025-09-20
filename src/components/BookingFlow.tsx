import React, { useState } from 'react';
import { Salon, User as UserType, Service, CategoryType, BookingStep } from '../types';
import { getServicesByCategory } from '../constants/services';
import { BookingHeader } from './booking/BookingHeader';
import { ServiceSelection } from './booking/ServiceSelection';
import { DateTimeSelection } from './booking/DateTimeSelection';
import { CustomerDetails } from './booking/CustomerDetails';
import { BookingConfirmation } from './booking/BookingConfirmation';

interface BookingFlowProps {
  salon: Salon;
  user: UserType;
  onBack: () => void;
  onBookingComplete: () => void;
  detectedGender?: 'male' | 'female' | null;
}

export function BookingFlow({ salon, user, onBack, onBookingComplete, detectedGender }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('services');
  // Set initial category based on detected gender, fallback to 'women'
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(
    detectedGender === 'male' ? 'men' : 'women'
  );
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    name: user?.user_metadata?.name || '',
    phone: '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);

  const services = getServicesByCategory(salon.image);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep('datetime');
  };

  const handleDateTimeSelect = () => {
    console.log('Date/Time selection:', { selectedDate, selectedTime });
    if (selectedDate && selectedTime) {
      console.log('Moving to details step');
      setCurrentStep('details');
    } else {
      alert('Please select both date and time');
    }
  };

  const handleBooking = async () => {
    console.log('Current booking state:', {
      selectedService,
      selectedDate,
      selectedTime,
      customerDetails,
      salon: { id: salon.id, name: salon.name }
    });

    if (!customerDetails.name.trim() || !customerDetails.phone.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      alert('Missing booking information. Please go back and select all options.');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Starting booking process...');
      const { session, error: sessionError } = await (await import('../utils/supabase/client')).auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error: Please sign in again');
      }

      console.log('Session verified, user authenticated');
      const { projectId } = await import('../utils/supabase/info');
      
      const bookingData = {
        salonId: salon.id,
        salonName: salon.name,
        salonAddress: salon.address,
        service: {
          id: selectedService.id,
          name: selectedService.name,
          price: selectedService.price,
          duration: selectedService.duration,
          category: selectedService.category
        },
        date: selectedDate,
        time: selectedTime,
        customerDetails: {
          name: customerDetails.name.trim(),
          phone: customerDetails.phone.trim(),
          email: customerDetails.email.trim()
        }
      };

      console.log('Sending booking request with data:', bookingData);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a5b926ad/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(bookingData)
      });

      console.log('Booking API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Booking API error response:', errorText);
        throw new Error(`Failed to create booking: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Booking created successfully:', result);
      console.log('Setting current step to confirmation');
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Booking error details:', error);
      alert(`Failed to create booking: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'services') onBack();
    if (currentStep === 'datetime') setCurrentStep('services');
    if (currentStep === 'details') setCurrentStep('datetime');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto lg:max-w-4xl">
        <div className="bg-white min-h-screen flex flex-col lg:bg-background lg:pt-4">
          <div className="bg-white lg:rounded-lg lg:shadow-lg lg:border lg:border-border flex flex-col min-h-screen lg:min-h-[calc(100vh-2rem)]">
            
            <BookingHeader salon={salon} onBack={handleBack} />

            <div className="flex-1 p-4">
              {currentStep === 'services' && (
                <ServiceSelection
                  services={services}
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                  onServiceSelect={handleServiceSelect}
                />
              )}

              {currentStep === 'datetime' && selectedService && (
                <DateTimeSelection
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateSelect={setSelectedDate}
                  onTimeSelect={setSelectedTime}
                  onContinue={handleDateTimeSelect}
                />
              )}

              {currentStep === 'details' && selectedService && (
                <CustomerDetails
                  salon={salon}
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  customerDetails={customerDetails}
                  onDetailsChange={setCustomerDetails}
                  onBooking={handleBooking}
                  loading={loading}
                />
              )}

              {currentStep === 'confirmation' && selectedService && (
                <BookingConfirmation
                  salon={salon}
                  selectedService={selectedService}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  customerDetails={customerDetails}
                  onComplete={onBookingComplete}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}