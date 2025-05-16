import asyncHandler from 'express-async-handler';
import Employee from '../models/employeeModel.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const getEmployees = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  
  const keyword = req.query.keyword
    ? {
        $or: [
          { firstName: { $regex: req.query.keyword, $options: 'i' } },
          { lastName: { $regex: req.query.keyword, $options: 'i' } },
          { email: { $regex: req.query.keyword, $options: 'i' } },
          { department: { $regex: req.query.keyword, $options: 'i' } },
          { position: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const count = await Employee.countDocuments({ ...keyword });
  const employees = await Employee.find({ ...keyword })
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .sort({ createdAt: -1 });

  res.json({
    employees,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (employee) {
    res.json(employee);
  } else {
    res.status(404);
    throw new Error('Employee not found');
  }
});

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private
const createEmployee = asyncHandler(async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('File:', req.file);

    const {
      firstName,
      lastName,
      email,
      phone,
      employeeType,
      department,
      position,
      joinDate,
      salary,
      address,
      skills,
      education,
      emergencyContact
    } = req.body;

    // Check if employee already exists with the same email
    const employeeExists = await Employee.findOne({ email });

    if (employeeExists) {
      res.status(400);
      throw new Error('Employee with this email already exists');
    }

    // Set default profile picture
    let profilePicture = 'default-profile.jpg';

    // Handle profile picture if uploaded
    if (req.file) {
      console.log('Processing uploaded file:', req.file);
      
      try {
        // Check if req.file already has a path from Cloudinary storage
        if (req.file.path) {
          console.log('Using Cloudinary storage path:', req.file.path);
          profilePicture = req.file.path;
        }
        // If no path is available but there's a buffer, upload directly
        else if (req.file.buffer) {
          console.log('Uploading file buffer to Cloudinary manually');
          
          // Make sure Cloudinary is configured
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
          });
          
          // Return a promise for the upload
          const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'employee_profiles',
                transformation: [{ width: 500, height: 500, crop: 'limit' }]
              },
              (error, result) => {
                if (error) {
                  console.error('Manual Cloudinary upload error:', error);
                  reject(error);
                } else {
                  console.log('Manual Cloudinary upload success:', result.secure_url);
                  resolve(result.secure_url);
                }
              }
            );
            
            uploadStream.end(req.file.buffer);
          });
          
          // Wait for the upload to complete
          profilePicture = await uploadPromise;
          console.log('Final profile picture URL:', profilePicture);
        }
      } catch (uploadError) {
        console.error('Profile picture upload error:', uploadError);
        // Continue with default picture if upload fails
      }
    }

    // Parse JSON strings if they're passed as strings
    let parsedAddress;
    let parsedEducation;
    let parsedEmergencyContact;
    let parsedSkills = skills;

    try {
      if (typeof address === 'string') {
        parsedAddress = JSON.parse(address);
      } else if (address) {
        parsedAddress = address;
      } else {
        // Provide default address object if missing
        parsedAddress = {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        };
      }

      if (typeof education === 'string') {
        parsedEducation = JSON.parse(education);
      } else if (education) {
        parsedEducation = education;
      } else {
        parsedEducation = [];
      }

      if (typeof emergencyContact === 'string') {
        parsedEmergencyContact = JSON.parse(emergencyContact);
      } else if (emergencyContact) {
        parsedEmergencyContact = emergencyContact;
      } else {
        parsedEmergencyContact = {};
      }

      // Handle skills, which might be a comma-separated string
      if (typeof skills === 'string') {
        if (skills.trim() !== '') {
          parsedSkills = skills.split(',').map(skill => skill.trim()).filter(Boolean);
        } else {
          parsedSkills = [];
        }
      } else if (Array.isArray(skills)) {
        parsedSkills = skills.filter(skill => skill && skill.trim() !== '');
      } else {
        parsedSkills = [];
      }
    } catch (parseError) {
      console.error('Error parsing form data:', parseError);
      res.status(400);
      throw new Error(`Invalid data format: ${parseError.message}`);
    }

    // Create the employee with parsed data
    const employee = await Employee.create({
      firstName,
      lastName,
      email,
      phone,
      employeeType: employeeType || 'Full-time',
      department: department || '',
      position: position || '',
      joinDate: joinDate || new Date(),
      salary: salary ? parseFloat(salary) : 0,
      profilePicture,
      address: parsedAddress,
      skills: parsedSkills,
      education: parsedEducation,
      emergencyContact: parsedEmergencyContact,
      createdBy: req.user._id
    });

    if (employee) {
      res.status(201).json(employee);
    } else {
      res.status(400);
      throw new Error('Invalid employee data');
    }
  } catch (error) {
    console.error('Employee creation error:', error);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Failed to create employee');
  }
});

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = asyncHandler(async (req, res) => {
  try {
    console.log('Update request body:', req.body);
    console.log('Update file:', req.file);
    
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }

    // Handle profile picture update
    let profilePicture = employee.profilePicture;
    
    if (req.file) {
      // Delete the old image from Cloudinary if it's not the default image
      if (employee.profilePicture && employee.profilePicture !== 'default-profile.jpg') {
        try {
          const publicId = employee.profilePicture.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`employee_profiles/${publicId}`);
        } catch (error) {
          console.error('Error deleting old profile picture:', error);
        }
      }
      profilePicture = req.file.path;
    }

    // Parse request body
    const {
      firstName,
      lastName,
      email,
      phone,
      employeeType,
      department,
      position,
      joinDate,
      salary,
      address,
      skills,
      education,
      emergencyContact
    } = req.body;

    // Parse JSON strings
    let parsedAddress;
    let parsedEducation;
    let parsedEmergencyContact;
    let parsedSkills = skills;

    try {
      if (typeof address === 'string') {
        parsedAddress = JSON.parse(address);
      } else if (address) {
        parsedAddress = address;
      }

      if (typeof education === 'string') {
        parsedEducation = JSON.parse(education);
      } else if (education) {
        parsedEducation = education;
      }

      if (typeof emergencyContact === 'string') {
        parsedEmergencyContact = JSON.parse(emergencyContact);
      } else if (emergencyContact) {
        parsedEmergencyContact = emergencyContact;
      }

      // Handle skills, which might be a comma-separated string
      if (typeof skills === 'string') {
        parsedSkills = skills.split(',').map(skill => skill.trim()).filter(Boolean);
      }
    } catch (parseError) {
      console.error('Error parsing form data in update:', parseError);
      res.status(400);
      throw new Error(`Invalid data format: ${parseError.message}`);
    }

    // Update all the employee fields
    employee.firstName = firstName || employee.firstName;
    employee.lastName = lastName || employee.lastName;
    employee.email = email || employee.email;
    employee.phone = phone || employee.phone;
    employee.employeeType = employeeType || employee.employeeType;
    employee.department = department || employee.department;
    employee.position = position || employee.position;
    employee.joinDate = joinDate || employee.joinDate;
    employee.salary = salary ? parseFloat(salary) : employee.salary;
    employee.profilePicture = profilePicture;
    
    if (parsedAddress) {
      employee.address = {
        ...employee.address,
        ...parsedAddress
      };
    }
    
    if (parsedSkills) {
      employee.skills = parsedSkills;
    }
    
    if (parsedEducation) {
      employee.education = parsedEducation;
    }
    
    if (parsedEmergencyContact) {
      employee.emergencyContact = parsedEmergencyContact;
    }

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Employee update error:', error);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Failed to update employee');
  }
});

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (employee) {
    // Delete profile picture from Cloudinary if it's not the default
    if (employee.profilePicture && employee.profilePicture !== 'default-profile.jpg') {
      try {
        const publicId = employee.profilePicture.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`employee_profiles/${publicId}`);
      } catch (error) {
        console.error('Error deleting profile picture:', error);
      }
    }

    await Employee.deleteOne({ _id: employee._id });
    res.json({ message: 'Employee removed' });
  } else {
    res.status(404);
    throw new Error('Employee not found');
  }
});

// @desc    Search employees
// @route   GET /api/employees/search
// @access  Private
const searchEmployees = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    res.status(400);
    throw new Error('Search query is required');
  }
  
  const employees = await Employee.find({
    $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { department: { $regex: query, $options: 'i' } },
      { position: { $regex: query, $options: 'i' } }
    ]
  });
  
  res.json(employees);
});

export { 
  getEmployees, 
  getEmployeeById, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  searchEmployees
};
