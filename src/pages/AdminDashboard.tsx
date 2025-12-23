import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getBookings, updateBookingStatus } from '@/lib/api';
import { toast } from 'sonner';
import type { Booking, BookingStatus } from '@/types';
import { format } from 'date-fns';
import { ArrowUpDown } from 'lucide-react';

type SortField = 'date' | 'time' | 'name' | 'guests';
type SortOrder = 'asc' | 'desc';

export function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, searchQuery, sortField, sortOrder]);

  const fetchBookings = async () => {
    setLoading(true);
    const response = await getBookings(); // Get all bookings (admin view)
    
    if (response.success && response.data) {
      setBookings(response.data);
    } else {
      toast.error(response.error || 'Failed to fetch bookings');
    }
    
    setLoading(false);
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.userName.toLowerCase().includes(query) ||
          b.userEmail.toLowerCase().includes(query) ||
          b.id.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'time':
          comparison = a.timeSlot.localeCompare(b.timeSlot);
          break;
        case 'name':
          comparison = a.userName.localeCompare(b.userName);
          break;
        case 'guests':
          comparison = a.guestCount - b.guestCount;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredBookings(filtered);
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    const response = await updateBookingStatus(bookingId, newStatus);
    
    if (response.success) {
      toast.success('Booking status updated');
      fetchBookings();
    } else {
      toast.error(response.error || 'Failed to update status');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
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

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage all restaurant bookings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reservations</CardTitle>
          <CardDescription>
            View and manage all customer bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 -ml-3"
                    >
                      Customer
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-1 -ml-3"
                    >
                      Date
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('time')}
                      className="flex items-center gap-1 -ml-3"
                    >
                      Time
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('guests')}
                      className="flex items-center gap-1 -ml-3"
                    >
                      Guests
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-xs">
                        {booking.id.split('-')[1]}
                      </TableCell>
                      <TableCell className="font-medium">{booking.userName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {booking.userEmail}
                      </TableCell>
                      <TableCell>
                        {format(new Date(booking.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{booking.timeSlot}</TableCell>
                      <TableCell>{booking.guestCount}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={booking.status}
                          onValueChange={(value) =>
                            handleStatusChange(booking.id, value as BookingStatus)
                          }
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredBookings.length} of {bookings.length} total bookings
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
