import pool from '../config/database.js';
import { uploadMenuImage } from '../config/cloudStorage.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all menu items
 */
export const getMenuItems = asyncHandler(async (req, res) => {
  const [menuItems] = await pool.query(
    'SELECT * FROM menu_items ORDER BY name ASC'
  );

  const formattedItems = menuItems.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: parseFloat(item.price),
    imageUrl: item.image_url,
    createdAt: item.created_at
  }));

  res.json({
    success: true,
    data: formattedItems,
    statusCode: 200
  });
});

/**
 * Upload menu item image to S3 and create database entry
 */
export const createMenuItem = asyncHandler(async (req, res) => {
  // File is available via multer middleware
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Image file is required',
      statusCode: 400
    });
  }

  const { name, description, price } = req.body;

  // Validation
  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Menu item name is required',
      statusCode: 400
    });
  }

  try {
    // Upload image to S3
    console.log('Uploading menu image to S3...');
    const imageUrl = await uploadMenuImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Create menu item in database
    const menuItemId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO menu_items (id, name, description, price, image_url) 
       VALUES (?, ?, ?, ?, ?)`,
      [menuItemId, name, description || null, price || 0, imageUrl]
    );

    // Fetch created menu item
    const [newItems] = await pool.query(
      'SELECT * FROM menu_items WHERE id = ?',
      [menuItemId]
    );

    const menuItem = {
      id: newItems[0].id,
      name: newItems[0].name,
      description: newItems[0].description,
      price: parseFloat(newItems[0].price),
      imageUrl: newItems[0].image_url,
      createdAt: newItems[0].created_at
    };

    res.status(201).json({
      success: true,
      data: menuItem,
      statusCode: 201
    });
  } catch (error) {
    // Handle S3 upload errors specifically
    if (error.message.includes('Cloud storage')) {
      return res.status(503).json({
        success: false,
        error: error.message,
        statusCode: 503
      });
    }
    throw error; // Let error handler middleware deal with it
  }
});

/**
 * Update menu item
 */
export const updateMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  // Check if menu item exists
  const [existingItems] = await pool.query(
    'SELECT * FROM menu_items WHERE id = ?',
    [id]
  );

  if (existingItems.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Menu item not found',
      statusCode: 404
    });
  }

  let imageUrl = existingItems[0].image_url;

  // If new image is uploaded, upload to S3
  if (req.file) {
    try {
      console.log('Uploading new menu image to S3...');
      imageUrl = await uploadMenuImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    } catch (error) {
      if (error.message.includes('Cloud storage')) {
        return res.status(503).json({
          success: false,
          error: error.message,
          statusCode: 503
        });
      }
      throw error;
    }
  }

  // Update menu item
  await pool.query(
    `UPDATE menu_items 
     SET name = ?, description = ?, price = ?, image_url = ? 
     WHERE id = ?`,
    [
      name || existingItems[0].name,
      description !== undefined ? description : existingItems[0].description,
      price !== undefined ? price : existingItems[0].price,
      imageUrl,
      id
    ]
  );

  // Fetch updated item
  const [updatedItems] = await pool.query(
    'SELECT * FROM menu_items WHERE id = ?',
    [id]
  );

  const menuItem = {
    id: updatedItems[0].id,
    name: updatedItems[0].name,
    description: updatedItems[0].description,
    price: parseFloat(updatedItems[0].price),
    imageUrl: updatedItems[0].image_url,
    createdAt: updatedItems[0].created_at
  };

  res.json({
    success: true,
    data: menuItem,
    statusCode: 200
  });
});

/**
 * Delete menu item
 */
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [result] = await pool.query(
    'DELETE FROM menu_items WHERE id = ?',
    [id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      error: 'Menu item not found',
      statusCode: 404
    });
  }

  res.json({
    success: true,
    data: { message: 'Menu item deleted successfully' },
    statusCode: 200
  });
});

export default {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
