import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, Clock, MapPin, Star, RefreshCw } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { LoadingSpinner } from '../LoadingSpinner';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface BookingRecord {
  id: string;
  salonName: string;
  salonImage?: string;
  salonAddress: string;
  services: Array<{
    name: string;
    price: number;
    duration: number;
  }>;
  date: string;
  time: string;
  status: 'completed' | 'cancelled' | 'no-show';
  totalAmount: number;
  rating?: number;
  review?: string;
  loyaltyPointsEarned?: number;
}

interface BookingHistoryProps {
  userId: string;
}

export function BookingHistory({ userId }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingHistory();
  }, [userId]);

  const fetchBookingHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a5b926ad/bookings/history/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        setError('Failed to load booking history');
      }
    } catch (error) {
      console.error('Error fetching booking history:', error);
      setError('Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
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

  if (error) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchBookingHistory} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking History</CardTitle>
        <p className="text-sm text-muted-foreground">
          {bookings.length} total appointments
        </p>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No booking history yet</p>
            <p className="text-sm text-muted-foreground">
              Your completed appointments will appear here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <ImageWithFallback
                            src={booking.salonImage}
                            alt={booking.salonName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">
                            {booking.salonName}
                          </h4>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{booking.salonAddress}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.replace('-', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatDate(booking.date)}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatTime(booking.time)}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium mb-2">Services:</p>
                      <div className="space-y-1">
                        {booking.services.map((service, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{service.name}</span>
                            <span className="text-muted-foreground">
                              ${service.price} • {service.duration}min
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">
                          Total: ${booking.totalAmount}
                        </span>
                        {booking.loyaltyPointsEarned && (
                          <span className="text-muted-foreground">
                            +{booking.loyaltyPointsEarned} points
                          </span>
                        )}
                      </div>
                      {booking.rating && (
                        <div className="flex items-center space-x-1">
                          {renderStars(booking.rating)}
                        </div>
                      )}
                    </div>

                    {booking.review && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm italic">"{booking.review}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}