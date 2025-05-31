import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Check if user is logged in
  const userInfo = localStorage.getItem('userInfo');
  
  // If not logged in, redirect to login page
  if (!userInfo) {
    return <Navigate to="/" replace />;
  }
  
  // Otherwise, render the protected component
  return children;
};

export default PrivateRoute;
