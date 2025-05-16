import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Make sure we have the required Cloudinary credentials before configuring
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: Missing Cloudinary credentials in .env file');
  console.error('\x1b[33m%s\x1b[0m', 'Make sure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set');
} else {
  console.log('Cloudinary credentials found in environment variables');
}

// Configure Cloudinary with proper error handling
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check Cloudinary configuration
try {
  console.log('Testing Cloudinary connection...');
  console.log('Using cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
  
  // Wrapped in a timeout to ensure the config has time to apply
  setTimeout(() => {
    cloudinary.api.ping((error, result) => {
      if (error) {
        console.error('Cloudinary connection error:', error);
      } else {
        console.log('Cloudinary connected successfully!');
      }
    });
  }, 1000);
} catch (error) {
  console.error('Failed to test Cloudinary connection:', error);
}

// Set up CloudinaryStorage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'employee_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    // Use public_id to create a unique name
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = file.originalname.split('.')[0];
      return `${filename}-${uniqueSuffix}`;
    }
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  if (!file) {
    return cb(null, true); // No file provided, continue
  }
  
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'), false);
  }
};

// Initialize upload with error handling
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter
});

// Custom error handler for multer
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({
      message: err.message || 'An unknown error occurred during file upload'
    });
  }
  next();
};

export { handleMulterErrors };
export default upload;
