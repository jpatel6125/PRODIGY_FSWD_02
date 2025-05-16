import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import validateEnv from './utils/validateEnv.js';
import { v2 as cloudinary } from 'cloudinary';

// Load env vars - Do this at the top before any other imports might need env vars
dotenv.config();

// Validate environment variables
const envValid = validateEnv();
if (!envValid) {
  console.error('Environment validation failed. Server will start but may not function correctly.');
}

// Print Cloudinary config for debugging
console.log('Cloudinary Configuration:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set (hidden for security)' : 'Not set');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set (hidden for security)' : 'Not set');

// Test Cloudinary config early
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  
  console.log('Cloudinary configured in server.js');
} catch (error) {
  console.error('Failed to configure Cloudinary in server.js:', error);
}

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);

// Set static folder for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// API root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
