import { useState } from 'react';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = ({ setIsLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await axios.post('http://localhost:5000/api/users', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Show success message
      toast.success('Account created successfully! Please login.');
      
      // Switch to login form
      setIsLogin(true);
    } catch (error) {
      const message = 
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Registration failed. Please try again.';
      
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      className="mt-6 w-full"
      onSubmit={handleSubmit}
    >
      {errors.general && (
        <div className="bg-danger/10 border border-danger rounded-custom text-danger p-3 mb-6 text-center w-full">
          {errors.general}
        </div>
      )}
      
      <div className="mb-6">
        <div className="relative flex items-center w-full">
          <FiUser className="absolute left-4 text-text-secondary text-lg z-[1] pointer-events-none" />
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            className={`pl-12 pr-4 py-3 text-base bg-input-bg border ${errors.name ? 'border-danger' : 'border-white/10'} rounded-custom w-full focus:outline-none focus:border-accent-primary`}
          />
        </div>
        {errors.name && <div className="text-danger text-sm mt-1">{errors.name}</div>}
      </div>
      
      <div className="mb-6">
        <div className="relative flex items-center w-full">
          <FiMail className="absolute left-4 text-text-secondary text-lg z-[1] pointer-events-none" />
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className={`pl-12 pr-4 py-3 text-base bg-input-bg border ${errors.email ? 'border-danger' : 'border-white/10'} rounded-custom w-full focus:outline-none focus:border-accent-primary`}
          />
        </div>
        {errors.email && <div className="text-danger text-sm mt-1">{errors.email}</div>}
      </div>
      
      <div className="mb-6">
        <div className="relative flex items-center w-full">
          <FiLock className="absolute left-4 text-text-secondary text-lg z-[1] pointer-events-none" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`pl-12 pr-12 py-3 text-base bg-input-bg border ${errors.password ? 'border-danger' : 'border-white/10'} rounded-custom w-full focus:outline-none focus:border-accent-primary`}
          />
          <button
            type="button"
            className="absolute right-4 bg-transparent border-none p-0 cursor-pointer text-text-secondary flex items-center justify-center h-auto w-auto min-w-[24px] z-[1] hover:text-text-primary"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        {errors.password && <div className="text-danger text-sm mt-1">{errors.password}</div>}
      </div>
      
      <div className="mb-6">
        <div className="relative flex items-center w-full">
          <FiLock className="absolute left-4 text-text-secondary text-lg z-[1] pointer-events-none" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`pl-12 pr-12 py-3 text-base bg-input-bg border ${errors.confirmPassword ? 'border-danger' : 'border-white/10'} rounded-custom w-full focus:outline-none focus:border-accent-primary`}
          />
          <button
            type="button"
            className="absolute right-4 bg-transparent border-none p-0 cursor-pointer text-text-secondary flex items-center justify-center h-auto w-auto min-w-[24px] z-[1] hover:text-text-primary"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        {errors.confirmPassword && <div className="text-danger text-sm mt-1">{errors.confirmPassword}</div>}
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-4 text-base font-medium bg-accent-primary text-white rounded-custom cursor-pointer transition-colors duration-200 hover:bg-accent-secondary disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
      
      <p className="text-center mt-6 text-[0.9rem] text-text-secondary">
        By registering, you agree to our <a href="#" className="text-accent-primary font-medium hover:text-accent-secondary">Terms of Service</a> and <a href="#" className="text-accent-primary font-medium hover:text-accent-secondary">Privacy Policy</a>.
      </p>
    </form>
  );
};

export default Register;
