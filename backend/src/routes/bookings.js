import express from 'express';
import {
  createBooking,
  getBookings,
  getBookedTimeSlots,
  updateBookingStatus,
  deleteBooking
} from '../controllers/bookingController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/bookings - Create new booking
router.post('/', createBooking);

// GET /api/bookings - Get bookings (filtered by user role)
router.get('/', getBookings);

// GET /api/bookings/slots/:date - Get booked time slots for a date
router.get('/slots/:date', getBookedTimeSlots);

// PATCH /api/bookings/:id/status - Update booking status
router.patch('/:id/status', updateBookingStatus);

// DELETE /api/bookings/:id - Delete booking (admin only)
router.delete('/:id', requireAdmin, deleteBooking);

export default router;
