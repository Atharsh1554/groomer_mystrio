import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Service } from '../../types';
import { TIME_SLOTS } from '../../constants/services';
import { getNextWeekDates } from '../../utils/dateUtils';

interface DateTimeSelectionProps {
  selectedService: Service;
  selectedDate: string;
  selectedTime: string;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  onContinue: () => void;
}

export function DateTimeSelection({
  selectedService,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  onContinue
}: DateTimeSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-2">Book Appointment</h2>
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={selectedService.image}
                alt={selectedService.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-sm">{selectedService.name}</h4>
              <p className="text-xs text-muted-foreground">
                {selectedService.duration} • {selectedService.price}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Select Date
        </h3>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {getNextWeekDates().map((date) => (
            <Button
              key={date.value}
              variant={selectedDate === date.value ? 'default' : 'outline'}
              onClick={() => onDateSelect(date.value)}
              className="h-12 flex flex-col text-xs"
            >
              {date.display}
            </Button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div>
          <h3 className="mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Select Time
          </h3>
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">
            {TIME_SLOTS.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? 'default' : 'outline'}
                onClick={() => onTimeSelect(time)}
                className="h-10 text-sm"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
        <Button onClick={onContinue} className="w-full">
          Continue
        </Button>
      )}
    </div>
  );
}