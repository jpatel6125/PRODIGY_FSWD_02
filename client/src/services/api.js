import axios from 'axios';

// API base URL
const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include token in all requests
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const loginUser = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Employee services
export const getEmployees = async (page = 1, keyword = '') => {
  const response = await api.get(`/employees?pageNumber=${page}&keyword=${keyword}`);
  return response.data;
};

export const getEmployeeById = async (id) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

export const createEmployee = async (employeeData) => {
  try {
    // For file uploads, we need to use FormData
    const formData = new FormData();
    
    // Add all employee fields to FormData
    Object.entries(employeeData).forEach(([key, value]) => {
      if (key === 'skills' && Array.isArray(value)) {
        // Filter out empty skills and join as comma-separated string
        const filteredSkills = value.filter(skill => skill.trim() !== '');
        formData.append('skills', filteredSkills.join(','));
      } 
      else if (key === 'address' || key === 'education' || key === 'emergencyContact') {
        // Convert objects to JSON strings
        formData.append(key, JSON.stringify(value));
      } 
      else if (key === 'profilePicture') {
        // Only append file if it exists and is a File object
        if (value instanceof File) {
          formData.append('profilePicture', value);
        }
      } 
      else if (value !== null && value !== undefined) {
        // Only append valid values
        formData.append(key, value);
      }
    });
    
    // Log keys for debugging
    console.log('Form data keys:', [...formData.keys()]);
    
    // If there's a profile picture, log its size for debugging
    if (formData.has('profilePicture')) {
      const file = formData.get('profilePicture');
      console.log('Profile picture size:', file.size);
    }
    
    // Make sure we're sending multipart/form-data content type
    const response = await api.post('/employees', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    // Enhanced error logging
    console.error('API Error Details:', error.response?.data || error.message);
    console.error('Full error object:', error);
    throw error;
  }
};

export const updateEmployee = async (id, employeeData) => {
  try {
    // For file uploads, we need to use FormData
    const formData = new FormData();
    
    // Add all employee fields to FormData
    Object.entries(employeeData).forEach(([key, value]) => {
      if (key === 'skills' && Array.isArray(value)) {
        // Filter out empty skills and join as comma-separated string
        const filteredSkills = value.filter(skill => skill.trim() !== '');
        if (filteredSkills.length > 0) {
          formData.append('skills', filteredSkills.join(','));
        } else {
          formData.append('skills', '');
        }
      } else if (key === 'address' || key === 'education' || key === 'emergencyContact') {
        // Convert objects to JSON strings
        formData.append(key, JSON.stringify(value));
      } else if (key === 'profilePicture') {
        // Only append file if it exists and is a File object
        if (value instanceof File) {
          formData.append('profilePicture', value);
        }
      } else if (value !== null && value !== undefined) {
        // Only append valid values
        formData.append(key, value);
      }
    });
    
    console.log('Update form data created with keys:', [...formData.keys()]);
    
    const response = await api.put(`/employees/${id}`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error Details:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}`);
  return response.data;
};

export const searchEmployees = async (query) => {
  const response = await api.get(`/employees/search?query=${query}`);
  return response.data;
};

export default api;
