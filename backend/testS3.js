import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN, // Important for student labs
  region: process.env.AWS_REGION
});

async function checkS3() {
  console.log("Testing S3 Connection...");
  console.log("Bucket:", process.env.S3_BUCKET_NAME);
  
  try {
    await s3.headBucket({ Bucket: process.env.S3_BUCKET_NAME }).promise();
    console.log("✅ Success! Your laptop can talk to S3.");
  } catch (err) {
    console.error("❌ Failed:", err.code);
    console.error("   Message:", err.message);
    if (err.code === 'Forbidden') console.log("   -> Check your permissions or Session Token.");
    if (err.code === 'NotFound') console.log("   -> Check your Bucket Name.");
  }
}

checkS3();