import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { getBookedTimeSlots } from '@/lib/api';
import { format, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  onSelect: (date: string, timeSlot: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

// Generate time slots from 9am to 9pm in 30min intervals
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 21 && minute > 0) break; // Stop at 9:00pm
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

export function BookingCalendar({ onSelect, selectedDate, selectedTime }: BookingCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  );
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');

  useEffect(() => {
    if (date) {
      const fetchBookedSlots = async () => {
        setLoading(true);
        const dateStr = format(date, 'yyyy-MM-dd');
        const response = await getBookedTimeSlots(dateStr);
        if (response.success && response.data) {
          setBookedSlots(response.data);
        }
        setLoading(false);
      };
      fetchBookedSlots();
    }
  }, [date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      const dateStr = format(newDate, 'yyyy-MM-dd');
      onSelect(dateStr, '');
    }
  };

  const handleTimeSelect = (timeSlot: string) => {
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      onSelect(dateStr, timeSlot);
    }
  };

  const formatTime = (time: string) => {
    if (timeFormat === '24h') return time;
    
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isTimeSlotAvailable = (timeSlot: string) => {
    return !bookedSlots.includes(timeSlot);
  };

  const today = startOfDay(new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-medium">Select Date & Time</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={timeFormat === '12h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFormat('12h')}
          >
            12h
          </Button>
          <Button
            type="button"
            variant={timeFormat === '24h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFormat('24h')}
          >
            24h
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={(date) => isBefore(date, today)}
          className="rounded-md"
        />
      </Card>

      {date && (
        <div className="space-y-3">
          <Label className="text-base">
            Available time slots for {format(date, 'MMMM d, yyyy')}
          </Label>
          
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading available slots...</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {TIME_SLOTS.map((timeSlot) => {
                const available = isTimeSlotAvailable(timeSlot);
                const isSelected = selectedTime === timeSlot;
                
                return (
                  <Button
                    key={timeSlot}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    disabled={!available}
                    onClick={() => handleTimeSelect(timeSlot)}
                    className={cn(
                      'h-auto py-2',
                      !available && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {formatTime(timeSlot)}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
