import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingCalendar } from '@/components/BookingCalendar';
import { createBooking } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface CustomerBookingProps {
  onBookingSuccess: () => void;
}

export function CustomerBooking({ onBookingSuccess }: CustomerBookingProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [guestCount, setGuestCount] = useState('2');
  const [loading, setLoading] = useState(false);

  const handleCalendarSelect = (date: string, time: string) => {
    setSelectedDate(date);
    if (time) {
      setSelectedTime(time);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    if (!user) {
      toast.error('Please log in to book a table');
      return;
    }

    setLoading(true);

    try {
      const response = await createBooking({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        date: selectedDate,
        timeSlot: selectedTime,
        guestCount: parseInt(guestCount),
        status: 'pending',
      });

      if (response.success) {
        toast.success('Table booked successfully!');
        onBookingSuccess();
      } else {
        toast.error(response.error || 'Failed to book table');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Book a Table</CardTitle>
          <CardDescription>
            Select your preferred date, time, and number of guests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <BookingCalendar
              onSelect={handleCalendarSelect}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
            />

            <div className="space-y-2">
              <Label htmlFor="guests">Number of Guests</Label>
              <Select value={guestCount} onValueChange={setGuestCount}>
                <SelectTrigger id="guests">
                  <SelectValue placeholder="Select guests" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDate && selectedTime && (
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guests:</span>
                      <span className="font-medium">{guestCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !selectedDate || !selectedTime}
            >
              {loading ? 'Booking...' : 'Book Table'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
