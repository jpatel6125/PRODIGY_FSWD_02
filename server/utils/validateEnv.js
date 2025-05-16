const validateEnv = () => {
  const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 
      `ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('\x1b[33m%s\x1b[0m', 
      'Please add these variables to your .env file');
    return false;
  }
  
  return true;
};

export default validateEnv;
