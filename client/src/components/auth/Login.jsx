import { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
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
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', formData);
      
      // Save user data to localStorage
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      
      // Show success message
      toast.success('Login successful!');
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      const message = 
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Something went wrong. Please try again.';
      
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
      
      <div className="text-center mt-4 text-[0.9rem] text-text-secondary w-full">
        <div className="flex justify-between items-center mt-2 mb-4">
          <label className="flex items-center cursor-pointer text-text-secondary">
            <input type="checkbox" className="mr-2 w-auto h-auto min-w-[16px] min-h-[16px]" />
            Remember me
          </label>
          <a href="#" className="text-accent-primary text-[0.9rem] hover:text-accent-secondary">
            Forgot password?
          </a>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-4 text-base font-medium bg-accent-primary text-white rounded-custom cursor-pointer transition-colors duration-200 hover:bg-accent-secondary disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
};

export default Login;
