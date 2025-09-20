import React from 'react';
import { User, Phone, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Salon, Service } from '../../types';

interface CustomerDetailsProps {
  salon: Salon;
  selectedService: Service;
  selectedDate: string;
  selectedTime: string;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
  };
  onDetailsChange: (details: { name: string; phone: string; email: string }) => void;
  onBooking: () => void;
  loading: boolean;
}

export function CustomerDetails({
  salon,
  selectedService,
  selectedDate,
  selectedTime,
  customerDetails,
  onDetailsChange,
  onBooking,
  loading
}: CustomerDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-4">Contact Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name *
            </label>
            <Input
              value={customerDetails.name}
              onChange={(e) => onDetailsChange({
                ...customerDetails,
                name: e.target.value
              })}
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number *
            </label>
            <Input
              value={customerDetails.phone}
              onChange={(e) => onDetailsChange({
                ...customerDetails,
                phone: e.target.value
              })}
              placeholder="Enter your phone number"
              type="tel"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <Input
              value={customerDetails.email}
              onChange={(e) => onDetailsChange({
                ...customerDetails,
                email: e.target.value
              })}
              placeholder="Enter your email address"
              type="email"
              disabled
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="mb-3">Booking Summary</h3>
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
            <span>Duration</span>
            <span>{selectedService.duration}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Total</span>
            <span>{selectedService.price}</span>
          </div>
        </div>
      </div>

      <Button 
        onClick={onBooking} 
        className="w-full"
        disabled={!customerDetails.name || !customerDetails.phone || loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Booking...
          </div>
        ) : (
          'Confirm Booking'
        )}
      </Button>
    </div>
  );
}