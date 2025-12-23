import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateToken } from '../middleware/auth.js';
import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * User login with hashed password verification
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
      statusCode: 400
    });
  }

  // Find user in database
  const [users] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      statusCode: 401
    });
  }

  const user = users[0];

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      statusCode: 401
    });
  }

  // Generate JWT token
  const token = generateToken(user);

  // Return user data (without password)
  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    profilePicture: user.profile_picture_url
  };

  res.json({
    success: true,
    data: {
      user: userData,
      token
    },
    statusCode: 200
  });
});

/**
 * User registration
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, name, role = 'customer' } = req.body;

  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: 'Email, password, and name are required',
      statusCode: 400
    });
  }

  // Password strength validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long',
      statusCode: 400
    });
  }

  // Check if user already exists
  const [existingUsers] = await pool.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUsers.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'User with this email already exists',
      statusCode: 409
    });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert user into database
  const userId = crypto.randomUUID();
  await pool.query(
    `INSERT INTO users (id, email, password_hash, name, role) 
     VALUES (?, ?, ?, ?, ?)`,
    [userId, email, passwordHash, name, role]
  );

  // Fetch created user
  const [newUsers] = await pool.query(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );

  const newUser = newUsers[0];

  // Generate JWT token
  const token = generateToken(newUser);

  // Return user data
  const userData = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    phone: newUser.phone,
    profilePicture: newUser.profile_picture_url
  };

  res.status(201).json({
    success: true,
    data: {
      user: userData,
      token
    },
    statusCode: 201
  });
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const [users] = await pool.query(
    'SELECT * FROM users WHERE id = ?',
    [req.user.userId]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      statusCode: 404
    });
  }

  const user = users[0];

  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    profilePicture: user.profile_picture_url
  };

  res.json({
    success: true,
    data: userData,
    statusCode: 200
  });
});

export default { login, register, getProfile };
