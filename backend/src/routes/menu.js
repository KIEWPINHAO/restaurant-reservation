import express from 'express';
import multer from 'multer';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage (files stored in buffer for S3 upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// GET /api/menu - Get all menu items (public)
router.get('/', getMenuItems);

// POST /api/menu - Create menu item with image (admin only)
router.post('/', authenticateToken, requireAdmin, upload.single('image'), createMenuItem);

// PUT /api/menu/:id - Update menu item (admin only)
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), updateMenuItem);

// DELETE /api/menu/:id - Delete menu item (admin only)
router.delete('/:id', authenticateToken, requireAdmin, deleteMenuItem);

export default router;
