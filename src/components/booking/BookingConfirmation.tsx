import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Salon, Service } from '../../types';
import logoImage from 'figma:asset/c797bd506da08fa515a696a1c063bd0b0178a7ef.png';

interface BookingConfirmationProps {
  salon: Salon;
  selectedService: Service;
  selectedDate: string;
  selectedTime: string;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
  };
  onComplete: () => void;
}

export function BookingConfirmation({
  salon,
  selectedService,
  selectedDate,
  selectedTime,
  customerDetails,
  onComplete
}: BookingConfirmationProps) {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-10 h-10 text-green-600" />
      </div>
      
      <div>
        <div className="h-8 mb-3 flex items-center justify-center">
          <img 
            src={logoImage} 
            alt="Groomer" 
            className="h-full w-auto object-contain opacity-70"
          />
        </div>
        <h2 className="text-xl mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground">
          Your appointment has been successfully booked.
        </p>
      </div>

      <div className="p-4 bg-muted rounded-lg text-left">
        <h3 className="mb-3">Appointment Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Salon</span>
            <span>{salon.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Service</span>
            <span>{selectedService.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Date</span>
            <span>{new Date(selectedDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Time</span>
            <span>{selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer</span>
            <span>{customerDetails.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Phone</span>
            <span>{customerDetails.phone}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          A confirmation message will be sent to your phone number.
        </p>
        <Button 
          onClick={onComplete}
          className="w-full"
        >
          Back to Salon Search
        </Button>
      </div>
    </div>
  );
}