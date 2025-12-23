import express from 'express';
import multer from 'multer';
import { updateProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for profile pictures
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max for profile pictures
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// All routes require authentication
router.use(authenticateToken);

// PUT /api/user/profile - Update user profile
router.put('/profile', upload.single('profilePicture'), updateProfile);

export default router;
