import pool from '../config/database.js';
import { uploadProfilePicture } from '../config/cloudStorage.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { name, phone } = req.body;

  // Get current user data
  const [users] = await pool.query(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      statusCode: 404
    });
  }

  const currentUser = users[0];
  let profilePictureUrl = currentUser.profile_picture_url;

  // If profile picture is uploaded, upload to S3
  if (req.file) {
    try {
      console.log('Uploading profile picture to S3...');
      profilePictureUrl = await uploadProfilePicture(
        req.file.buffer,
        userId,
        req.file.originalname,
        req.file.mimetype
      );
    } catch (error) {
      if (error.message.includes('upload failed')) {
        return res.status(503).json({
          success: false,
          error: error.message,
          statusCode: 503
        });
      }
      throw error;
    }
  }

  // Update user profile
  await pool.query(
    `UPDATE users 
     SET name = ?, phone = ?, profile_picture_url = ? 
     WHERE id = ?`,
    [
      name || currentUser.name,
      phone !== undefined ? phone : currentUser.phone,
      profilePictureUrl,
      userId
    ]
  );

  // Fetch updated user
  const [updatedUsers] = await pool.query(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );

  const updatedUser = updatedUsers[0];

  const userData = {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    phone: updatedUser.phone,
    profilePicture: updatedUser.profile_picture_url
  };

  res.json({
    success: true,
    data: userData,
    statusCode: 200
  });
});

export default { updateProfile };
