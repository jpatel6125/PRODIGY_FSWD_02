const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // If the status code is 200 but there's an error, set it to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  console.log(`Error occurred: ${err.message}`);
  if (err.stack) {
    console.log(`Stack: ${err.stack}`);
  }
  
  // Handle mongoose validation errors
  let message = err.message;
  let details = null;
  
  if (err.name === 'ValidationError') {
    message = 'Validation Error';
    details = Object.values(err.errors).map(e => e.message);
  }
  
  // If there's a JSON parsing error in the request body
  if (err.type === 'entity.parse.failed') {
    message = 'Invalid JSON in request body';
  }
  
  res.status(statusCode);
  res.json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    details: details || err.details || null
  });
};

export { notFound, errorHandler };
