import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Create a new booking
 */
export const createBooking = asyncHandler(async (req, res) => {
  const { date, timeSlot, guestCount } = req.body;
  const userId = req.user.userId;

  // Validation
  if (!date || !timeSlot || !guestCount) {
    return res.status(400).json({
      success: false,
      error: 'Date, time slot, and guest count are required',
      statusCode: 400
    });
  }

  // Get user details
  const [users] = await pool.query(
    'SELECT email, name FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      statusCode: 404
    });
  }

  const user = users[0];

  // Check if time slot is already booked
  const [existingBookings] = await pool.query(
    `SELECT id FROM bookings 
     WHERE booking_date = ? 
     AND time_slot = ? 
     AND status IN ('pending', 'confirmed')`,
    [date, timeSlot]
  );

  if (existingBookings.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'This time slot is already booked',
      statusCode: 409
    });
  }

  // Create booking
  const bookingId = crypto.randomUUID();
  await pool.query(
    `INSERT INTO bookings 
     (id, user_id, user_email, user_name, booking_date, time_slot, guest_count, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [bookingId, userId, user.email, user.name, date, timeSlot, guestCount]
  );

  // Fetch created booking
  const [newBookings] = await pool.query(
    'SELECT * FROM bookings WHERE id = ?',
    [bookingId]
  );

  const booking = formatBooking(newBookings[0]);

  res.status(201).json({
    success: true,
    data: booking,
    statusCode: 201
  });
});

/**
 * Get bookings (user's own or all for admin)
 */
export const getBookings = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const isAdmin = req.user.role === 'admin';

  let query;
  let params;

  if (isAdmin) {
    // Admin can see all bookings
    query = 'SELECT * FROM bookings ORDER BY booking_date DESC, time_slot DESC';
    params = [];
  } else {
    // Customers see only their bookings
    query = 'SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC, time_slot DESC';
    params = [userId];
  }

  const [bookings] = await pool.query(query, params);

  const formattedBookings = bookings.map(formatBooking);

  res.json({
    success: true,
    data: formattedBookings,
    statusCode: 200
  });
});

/**
 * Get booked time slots for a specific date
 */
export const getBookedTimeSlots = asyncHandler(async (req, res) => {
  const { date } = req.params;

  if (!date) {
    return res.status(400).json({
      success: false,
      error: 'Date parameter is required',
      statusCode: 400
    });
  }

  const [bookings] = await pool.query(
    `SELECT time_slot FROM bookings 
     WHERE booking_date = ? 
     AND status IN ('pending', 'confirmed')`,
    [date]
  );

  const bookedSlots = bookings.map(b => b.time_slot);

  res.json({
    success: true,
    data: bookedSlots,
    statusCode: 200
  });
});

/**
 * Update booking status
 */
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.userId;
  const isAdmin = req.user.role === 'admin';

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status value',
      statusCode: 400
    });
  }

  // Get booking
  const [bookings] = await pool.query(
    'SELECT * FROM bookings WHERE id = ?',
    [id]
  );

  if (bookings.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Booking not found',
      statusCode: 404
    });
  }

  const booking = bookings[0];

  // Check permissions (customers can only cancel their own bookings)
  if (!isAdmin && booking.user_id !== userId) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to modify this booking',
      statusCode: 403
    });
  }

  if (!isAdmin && status !== 'cancelled') {
    return res.status(403).json({
      success: false,
      error: 'Customers can only cancel bookings',
      statusCode: 403
    });
  }

  // Update booking
  await pool.query(
    'UPDATE bookings SET status = ? WHERE id = ?',
    [status, id]
  );

  // Fetch updated booking
  const [updatedBookings] = await pool.query(
    'SELECT * FROM bookings WHERE id = ?',
    [id]
  );

  const updatedBooking = formatBooking(updatedBookings[0]);

  res.json({
    success: true,
    data: updatedBooking,
    statusCode: 200
  });
});

/**
 * Delete booking (admin only)
 */
export const deleteBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [result] = await pool.query(
    'DELETE FROM bookings WHERE id = ?',
    [id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      error: 'Booking not found',
      statusCode: 404
    });
  }

  res.json({
    success: true,
    data: { message: 'Booking deleted successfully' },
    statusCode: 200
  });
});

/**
 * Format booking for response
 */
function formatBooking(booking) {
  return {
    id: booking.id,
    userId: booking.user_id,
    userEmail: booking.user_email,
    userName: booking.user_name,
    date: booking.booking_date,
    timeSlot: booking.time_slot,
    guestCount: booking.guest_count,
    status: booking.status,
    createdAt: booking.created_at
  };
}

export default {
  createBooking,
  getBookings,
  getBookedTimeSlots,
  updateBookingStatus,
  deleteBooking
};
