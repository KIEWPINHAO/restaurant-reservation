import type { User, Booking, MenuItem, ApiResponse, BookingStatus } from '@/types';

// API Base URL - Change this when deploying to cloud
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://restaurant-alb-701349099.us-east-1.elb.amazonaws.com/api';

// Helper function to get auth token
function getAuthToken(): string | null {
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    const parsed = JSON.parse(authToken);
    return parsed.token;
  }
  return null;
}

// Helper function to make authenticated requests
async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add Content-Type for JSON requests
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  return response;
}

// Auth functions
export async function login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success && data.data) {
      // Store auth token
      localStorage.setItem('authToken', JSON.stringify({
        userId: data.data.user.id,
        email: data.data.user.email,
        role: data.data.user.role,
        token: data.data.token,
      }));
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection.',
      statusCode: 500,
    };
  }
}

export async function register(
  email: string,
  password: string,
  name: string,
  role: 'customer' | 'admin' = 'customer'
): Promise<ApiResponse<{ user: User; token: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, role }),
    });

    const data = await response.json();

    if (data.success && data.data) {
      localStorage.setItem('authToken', JSON.stringify({
        userId: data.data.user.id,
        email: data.data.user.email,
        role: data.data.user.role,
        token: data.data.token,
      }));
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection.',
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
    const response = await fetchWithAuth('/bookings');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get bookings error:', error);
    return {
      success: false,
      error: 'Failed to fetch bookings. Please check your connection.',
      statusCode: 500,
    };
  }
}

export async function createBooking(
  booking: Omit<Booking, 'id' | 'createdAt'>
): Promise<ApiResponse<Booking>> {
  try {
    const response = await fetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        date: booking.date,
        timeSlot: booking.timeSlot,
        guestCount: booking.guestCount,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create booking error:', error);
    return {
      success: false,
      error: 'Failed to create booking. Please try again.',
      statusCode: 500,
    };
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<ApiResponse<Booking>> {
  try {
    const response = await fetchWithAuth(`/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update booking status error:', error);
    return {
      success: false,
      error: 'Failed to update booking status.',
      statusCode: 500,
    };
  }
}

// Menu functions
export async function getMenuItems(): Promise<ApiResponse<MenuItem[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get menu items error:', error);
    return {
      success: false,
      error: 'Failed to fetch menu items.',
      statusCode: 500,
    };
  }
}

export async function uploadMenuImage(
  file: File,
  name: string,
  description?: string,
  price?: number | string
): Promise<ApiResponse<MenuItem>> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', name);
    if (description !== undefined) formData.append('description', description);
    if (price !== undefined) formData.append('price', String(price));

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Upload menu image error:', error);
    return {
      success: false,
      error: 'Failed to upload image. Please try again.',
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
    // If profile picture is being updated and it's a File, use FormData
    if (updates.profilePicture && typeof updates.profilePicture !== 'string') {
      const formData = new FormData();
      formData.append('profilePicture', updates.profilePicture);
      if (updates.name) formData.append('name', updates.name);
      if (updates.phone) formData.append('phone', updates.phone);

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data.data));
      }
      
      return data;
    }

    // Regular JSON update
    const response = await fetchWithAuth('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('currentUser', JSON.stringify(data.data));
    }
    
    return data;
  } catch (error) {
    console.error('Update user profile error:', error);
    return {
      success: false,
      error: 'Failed to update profile.',
      statusCode: 500,
    };
  }
}

// Get booked time slots for a specific date
export async function getBookedTimeSlots(date: string): Promise<ApiResponse<string[]>> {
  try {
    const response = await fetchWithAuth(`/bookings/slots/${date}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get booked time slots error:', error);
    return {
      success: false,
      error: 'Failed to fetch available time slots.',
      statusCode: 500,
    };
  }
}
