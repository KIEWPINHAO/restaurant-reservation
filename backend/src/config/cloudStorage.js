import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  // Retry configuration for cloud resilience
  maxRetries: 3,
  httpOptions: {
    timeout: 30000,
    connectTimeout: 5000
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Upload menu image to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - Public URL of uploaded image
 */
export async function uploadMenuImage(fileBuffer, fileName, mimeType) {
  try {
    const fileKey = `menu/${Date.now()}_${fileName.replace(/\s/g, '_')}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: mimeType,
      // ACL configuration - coordinate with Security Lead (Role 3)
      //ACL: 'public-read',
      // Add metadata
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'upload-type': 'menu-item'
      }
    };

    console.log(`📤 Uploading to S3: ${fileKey}`);
    const result = await s3.upload(params).promise();
    console.log(`✅ Upload successful: ${result.Location}`);
    
    return result.Location; // Returns the public URL
  } catch (error) {
    console.error('❌ S3 Upload Error:', error);
    
    // Specific error handling for CloudWatch tracking
    if (error.code === 'NetworkingError') {
      throw new Error('Connection to Cloud Storage failed. Please check network configuration.');
    } else if (error.code === 'NoSuchBucket') {
      throw new Error(`S3 bucket '${BUCKET_NAME}' does not exist. Please create it first.`);
    } else if (error.code === 'InvalidAccessKeyId') {
      throw new Error('Invalid AWS credentials. Please check your access keys.');
    } else {
      throw new Error(`Cloud storage upload failed: ${error.message}`);
    }
  }
}

/**
 * Upload profile picture to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} userId - User ID
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - Public URL of uploaded image
 */
export async function uploadProfilePicture(fileBuffer, userId, fileName, mimeType) {
  try {
    const fileKey = `profiles/${userId}/${Date.now()}_${fileName.replace(/\s/g, '_')}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read',
      Metadata: {
        'user-id': userId,
        'uploaded-at': new Date().toISOString(),
        'upload-type': 'profile-picture'
      }
    };

    console.log(`📤 Uploading profile picture to S3: ${fileKey}`);
    const result = await s3.upload(params).promise();
    console.log(`✅ Profile picture upload successful: ${result.Location}`);
    
    return result.Location;
  } catch (error) {
    console.error('❌ S3 Profile Picture Upload Error:', error);
    throw new Error(`Profile picture upload failed: ${error.message}`);
  }
}

/**
 * Delete image from S3
 * @param {string} imageUrl - Full S3 URL
 * @returns {Promise<boolean>}
 */
export async function deleteImage(imageUrl) {
  try {
    // Extract key from URL
    const urlParts = imageUrl.split('.com/');
    if (urlParts.length < 2) {
      throw new Error('Invalid S3 URL format');
    }
    
    const fileKey = urlParts[1];
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };

    console.log(`🗑️ Deleting from S3: ${fileKey}`);
    await s3.deleteObject(params).promise();
    console.log(`✅ Delete successful: ${fileKey}`);
    
    return true;
  } catch (error) {
    console.error('❌ S3 Delete Error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Test S3 connection
 */
export async function testS3Connection() {
  try {
    await s3.listBuckets().promise();
    console.log('✅ S3 connection successful');
    console.log(`   Bucket: ${BUCKET_NAME}`);
    console.log(`   Region: ${process.env.AWS_REGION}`);
    return true;
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    if (error.code === 'InvalidAccessKeyId') {
      console.error('   → Invalid AWS credentials');
    } else if (error.code === 'SignatureDoesNotMatch') {
      console.error('   → AWS secret key is incorrect');
    }
    return false;
  }
}

export default { uploadMenuImage, uploadProfilePicture, deleteImage, testS3Connection };
