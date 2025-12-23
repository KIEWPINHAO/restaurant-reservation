export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  profilePicture?: string | File;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  date: string; // ISO date string
  timeSlot: string; // e.g., "18:30"
  guestCount: number;
  status: BookingStatus;
  createdAt: string; // ISO date string
}

export interface MenuItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  description?: string;
}

export interface AuthToken {
  userId: string;
  email: string;
  role: UserRole;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}
