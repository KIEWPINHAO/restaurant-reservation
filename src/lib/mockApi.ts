import type { User, Booking, MenuItem, ApiResponse, BookingStatus } from '@/types';

// Mock data storage
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'customer@test.com',
    name: 'John Doe',
    role: 'customer',
    phone: '555-0123',
  },
  {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'admin',
    phone: '555-9999',
  },
];

let mockBookings: Booking[] = [
  {
    id: 'booking-1',
    userId: 'user-1',
    userEmail: 'customer@test.com',
    userName: 'John Doe',
    date: '2025-12-15',
    timeSlot: '19:00',
    guestCount: 4,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'booking-2',
    userId: 'user-1',
    userEmail: 'customer@test.com',
    userName: 'John Doe',
    date: '2025-12-20',
    timeSlot: '20:30',
    guestCount: 2,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

let mockMenuItems: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Grilled Salmon',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    price: 28.99,
    description: 'Fresh Atlantic salmon with herbs',
  },
  {
    id: 'menu-2',
    name: 'Caesar Salad',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    price: 12.99,
    description: 'Classic Caesar with parmesan',
  },
  {
    id: 'menu-3',
    name: 'Ribeye Steak',
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400',
    price: 42.99,
    description: 'Premium USDA ribeye, 12oz',
  },
  {
    id: 'menu-4',
    name: 'Margherita Pizza',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    price: 16.99,
    description: 'Fresh mozzarella and basil',
  },
  {
    id: 'menu-5',
    name: 'Pasta Carbonara',
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
    price: 18.99,
    description: 'Creamy carbonara with pancetta',
  },
  {
    id: 'menu-6',
    name: 'Chocolate Lava Cake',
    imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
    price: 9.99,
    description: 'Warm chocolate with vanilla ice cream',
  },
];

// Helper to simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to simulate random failures (10% chance)
const shouldFail = () => Math.random() < 0.1;

// Auth functions
export async function login(email: string, password: string): Promise<ApiResponse<User>> {
  try {
    await delay();
    
    if (shouldFail()) {
      return {
        success: false,
        error: 'Server error occurred',
        statusCode: 500,
      };
    }

    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return {
        success: false,
        error: 'Invalid credentials',
        statusCode: 404,
      };
    }

    // Store auth token
    const authToken = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    localStorage.setItem('authToken', JSON.stringify(authToken));
    localStorage.setItem('currentUser', JSON.stringify(user));

    return {
      success: true,
      data: user,
      statusCode: 200,
    };
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred',
      statusCode: 500,
    };
  }
}

export async function logout(): Promise<void> {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
}

export function getCurrentUser(): User | null {
  try {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

// Booking functions
export async function getBookings(userId?: string): Promise<ApiResponse<Booking[]>> {
  try {
    await delay();
    
    if (shouldFail()) {
      return {
        success: false,
        error: 'Failed to fetch bookings',
        statusCode: 500,
      };
    }

    let bookings = mockBookings;
    if (userId) {
      bookings = mockBookings.filter(b => b.userId === userId);
    }

    return {
      success: true,
      data: bookings,
      statusCode: 200,
    };
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred',
      statusCode: 500,
    };
  }
}

export async function createBooking(
  booking: Omit<Booking, 'id' | 'createdAt'>
): Promise<ApiResponse<Booking>> {
  try {
    await delay();
    
    if (shouldFail()) {
      return {
        success: false,
        error: 'Failed to create booking',
        statusCode: 500,
      };
    }

    // Check if time slot is already booked
    const existingBooking = mockBookings.find(
      b => b.date === booking.date && b.timeSlot === booking.timeSlot && b.status !== 'cancelled'
    );

    if (existingBooking) {
      return {
        success: false,
        error: 'This time slot is already booked',
        statusCode: 400,
      };
    }

    const newBooking: Booking = {
      ...booking,
      id: `booking-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    mockBookings.push(newBooking);

    return {
      success: true,
      data: newBooking,
      statusCode: 200,
    };
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred',
      statusCode: 500,
    };
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<ApiResponse<Booking>> {
  try {
    await delay();
    
    if (shouldFail()) {
      return {
        success: false,
        error: 'Failed to update booking',
        statusCode: 500,
      };
    }

    const booking = mockBookings.find(b => b.id === bookingId);
    
    if (!booking) {
      return {
        success: false,
        error: 'Booking not found',
        statusCode: 404,
      };
    }

    booking.status = status;

    return {
      success: true,
      data: booking,
      statusCode: 200,
    };
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred',
      statusCode: 500,
    };
  }
}

// Menu functions
export async function getMenuItems(): Promise<ApiResponse<MenuItem[]>> {
  try {
    await delay();
    
    if (shouldFail()) {
      return {
        success: false,
        error: 'Failed to fetch menu items',
        statusCode: 500,
      };
    }

    return {
      success: true,
      data: mockMenuItems,
      statusCode: 200,
    };
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred',
      statusCode: 500,
    };
  }
}

export async function uploadMenuImage(file: File, name?: string, description?: string, price?: number | string): Promise<ApiResponse<MenuItem>> {
  try {
    await delay(1000); // Longer delay for file upload simulation
    
    if (shouldFail()) {
      return {
        success: false,
        error: 'Failed to upload image',
        statusCode: 500,
      };
    }

    // Simulate multipart upload by converting to data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newItem: MenuItem = {
          id: `menu-${Date.now()}`,
          name: name ?? file.name.replace(/\.[^/.]+$/, ''),
          imageUrl: reader.result as string,
          price: typeof price === 'number' ? price : parseFloat((price as string) || '0') || 0,
          description: description || undefined,
        };

        mockMenuItems.push(newItem);

        resolve({
          success: true,
          data: newItem,
          statusCode: 200,
        });
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred',
      statusCode: 500,
    };
  }
}

// User profile functions
export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<ApiResponse<User>> {
  try {
    await delay();
    
    if (shouldFail()) {
      return {
        success: false,
        error: 'Failed to update profile',
        statusCode: 500,
      };
    }

    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return {
        success: false,
        error: 'User not found',
        statusCode: 404,
      };
    }

    Object.assign(user, updates);
    localStorage.setItem('currentUser', JSON.stringify(user));

    return {
      success: true,
      data: user,
      statusCode: 200,
    };
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred',
      statusCode: 500,
    };
  }
}

// Get booked time slots for a specific date
export async function getBookedTimeSlots(date: string): Promise<ApiResponse<string[]>> {
  try {
    await delay();
    
    if (shouldFail()) {
      return {
        success: false,
        error: 'Failed to fetch time slots',
        statusCode: 500,
      };
    }

    const bookedSlots = mockBookings
      .filter(b => b.date === date && b.status !== 'cancelled')
      .map(b => b.timeSlot);

    return {
      success: true,
      data: bookedSlots,
      statusCode: 200,
    };
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred',
      statusCode: 500,
    };
  }
}
