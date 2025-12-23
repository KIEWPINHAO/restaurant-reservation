import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getBookings, updateBookingStatus } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import type { Booking } from '@/types';
import { format, isBefore, startOfDay } from 'date-fns';

export function MyReservations() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    setLoading(true);
    const response = await getBookings(user.id);
    
    if (response.success && response.data) {
      setBookings(response.data);
    } else {
      toast.error(response.error || 'Failed to fetch bookings');
    }
    
    setLoading(false);
  };

  const handleCancel = async (bookingId: string) => {
    const response = await updateBookingStatus(bookingId, 'cancelled');
    
    if (response.success) {
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } else {
      toast.error(response.error || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const today = startOfDay(new Date());
  const upcomingBookings = bookings.filter(
    (b) => !isBefore(new Date(b.date), today) && b.status !== 'cancelled' && b.status !== 'completed'
  );
  const pastBookings = bookings.filter(
    (b) => isBefore(new Date(b.date), today) || b.status === 'cancelled' || b.status === 'completed'
  );

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading reservations...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const BookingCard = ({ booking, isPast }: { booking: Booking; isPast: boolean }) => (
    <Card key={booking.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}
            </CardTitle>
            <CardDescription>
              {booking.timeSlot} • {booking.guestCount} {booking.guestCount === 1 ? 'Guest' : 'Guests'}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Booked on {format(new Date(booking.createdAt), 'MMM d, yyyy')}
          </div>
          {!isPast && booking.status !== 'cancelled' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleCancel(booking.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Reservations</h1>
        <p className="text-muted-foreground">View and manage your table bookings</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You don't have any reservations yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {upcomingBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Upcoming Reservations</h2>
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isPast={false} />
              ))}
            </div>
          )}

          {pastBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Past Reservations</h2>
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isPast={true} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
