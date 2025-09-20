import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface Booking {
  id: string;
  salonName: string;
  salonAddress: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'upcoming';
  price: string;
}

interface UserBookingsProps {
  userId: string;
}

export function UserBookings({ userId }: UserBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserBookings();
  }, [userId]);

  const fetchUserBookings = async () => {
    try {
      const response = await fetch(`https://vrsyqrcbtyqjprnokouh.supabase.co/functions/v1/make-server-a5b926ad/bookings/user/${userId}`, {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyc3lxcmNidHlxanBybm9rb3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTgzNTQsImV4cCI6MjA3MjIzNDM1NH0.hl_CdNP_dzn9AfhXm02VVpKcK7kjPvjWrQR8DBG6S98`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        console.error('Failed to fetch user bookings');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'upcoming':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium mb-2">No bookings yet</h3>
        <p className="text-sm text-muted-foreground">
          Your salon appointments will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <Card key={booking.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{booking.salonName}</h4>
              <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${getStatusColor(booking.status)}`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(booking.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{booking.time}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{booking.salonAddress}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}