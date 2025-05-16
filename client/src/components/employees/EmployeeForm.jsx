import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiTrash, FiUpload, FiPlus, FiMinus, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getEmployeeById, createEmployee, updateEmployee } from '../../services/api';

const EmployeeForm = ({ isEdit }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(userInfo));
  }, [navigate]);

  const initialFormState = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeType: 'Full-time',
    department: '',
    position: '',
    joinDate: new Date().toISOString().split('T')[0],
    salary: '',
    profilePicture: null,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    skills: [''],
    education: [{ degree: '', institution: '', year: '' }],
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(isEdit);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && id) {
      const fetchEmployeeData = async () => {
        try {
          const data = await getEmployeeById(id);
          
          const formattedDate = new Date(data.joinDate).toISOString().split('T')[0];
          
          setFormData({
            ...data,
            joinDate: formattedDate,
            profilePicture: null
          });
          
          if (data.profilePicture && data.profilePicture !== 'default-profile.jpg') {
            setImagePreview(data.profilePicture);
          }
        } catch (error) {
          console.error('Error fetching employee:', error);
          toast.error('Failed to fetch employee data');
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      };
      
      fetchEmployeeData();
    } else {
      setLoading(false);
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, JPG, PNG, GIF)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should not exceed 5MB');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      profilePicture: file
    }));
    
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = value;
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const removeSkill = (index) => {
    if (formData.skills.length === 1) return;
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '' }]
    }));
  };

  const removeEducation = (index) => {
    if (formData.education.length === 1) return;
    const updatedEducation = formData.education.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    
    if (!formData.salary) {
      newErrors.salary = 'Salary is required';
    } else if (isNaN(formData.salary) || Number(formData.salary) <= 0) {
      newErrors.salary = 'Salary must be a positive number';
    }
    
    if (!formData.address.street.trim()) newErrors['address.street'] = 'Street is required';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
    if (!formData.address.zipCode.trim()) newErrors['address.zipCode'] = 'Zip code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting.');
      return;
    }
    
    setLoading(true);
    
    try {
      const submissionData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        employeeType: formData.employeeType,
        department: formData.department.trim(),
        position: formData.position.trim(),
        joinDate: formData.joinDate,
        salary: parseFloat(formData.salary) || 0,
        ...(formData.profilePicture instanceof File && { profilePicture: formData.profilePicture }),
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          zipCode: formData.address.zipCode.trim(),
          country: formData.address.country.trim() || 'India'
        },
        skills: formData.skills.filter(skill => skill.trim() !== ''),
        education: formData.education.filter(edu => 
          edu.degree?.trim() !== '' || edu.institution?.trim() !== '' || edu.year
        ),
        emergencyContact: {
          name: formData.emergencyContact.name?.trim() || '',
          relationship: formData.emergencyContact.relationship?.trim() || '',
          phone: formData.emergencyContact.phone?.trim() || ''
        }
      };
      
      console.log('Submitting employee data:', submissionData);
      
      if (formData.profilePicture instanceof File) {
        console.log('Profile picture details:', {
          name: formData.profilePicture.name,
          type: formData.profilePicture.type,
          size: formData.profilePicture.size
        });
      }
      
      let response;
      if (isEdit) {
        response = await updateEmployee(id, submissionData);
        toast.success('Employee updated successfully');
      } else {
        response = await createEmployee(submissionData);
        toast.success('Employee created successfully');
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving employee:', error);
      let errorMessage = 'Failed to save employee. Please try again.';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-4 md:p-8">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Link 
              to="/dashboard"
              className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 shadow-sm"
            >
              <FiArrowLeft size={20} className="text-accent-primary" />
            </Link>
            <h1 className="text-2xl font-bold text-text-primary">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-accent-primary">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 mb-4 rounded-full overflow-hidden border-2 border-white/10">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-bg-secondary flex items-center justify-center text-text-secondary">
                        <FiUser size={48} />
                      </div>
                    )}
                  </div>
                  
                  <label className="flex items-center justify-center gap-2 cursor-pointer bg-accent-primary hover:bg-accent-secondary text-white py-2 px-4 rounded-md transition-colors">
                    <FiUpload size={16} />
                    <span>Upload Photo</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-text-secondary mt-2">
                    Max 5MB. JPG, PNG or GIF.
                  </p>
                </div>
              </div>
              
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`bg-input-bg border ${errors.firstName ? 'border-danger' : 'border-white/10'} rounded-md w-full`}
                  />
                  {errors.firstName && <p className="text-danger text-xs mt-1">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`bg-input-bg border ${errors.lastName ? 'border-danger' : 'border-white/10'} rounded-md w-full`}
                  />
                  {errors.lastName && <p className="text-danger text-xs mt-1">{errors.lastName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`bg-input-bg border ${errors.email ? 'border-danger' : 'border-white/10'} rounded-md w-full`}
                  />
                  {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`bg-input-bg border ${errors.phone ? 'border-danger' : 'border-white/10'} rounded-md w-full`}
                  />
                  {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-accent-primary">Employment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Employee Type *
                </label>
                <select
                  name="employeeType"
                  value={formData.employeeType}
                  onChange={handleChange}
                  className="bg-input-bg border border-white/10 rounded-md w-full"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`bg-input-bg border ${errors.department ? 'border-danger' : 'border-white/10'} rounded-md w-full`}
                />
                {errors.department && <p className="text-danger text-xs mt-1">{errors.department}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Position *
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={`bg-input-bg border ${errors.position ? 'border-danger' : 'border-white/10'} rounded-md w-full`}
                />
                {errors.position && <p className="text-danger text-xs mt-1">{errors.position}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Join Date *
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                  className="bg-input-bg border border-white/10 rounded-md w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Salary (₹) *
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className={`bg-input-bg border ${errors.salary ? 'border-danger' : 'border-white/10'} rounded-md w-full`}
                />
                {errors.salary && <p className="text-danger text-xs mt-1">{errors.salary}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-accent-primary">Address Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className={`bg-input-bg border ${errors['address.street'] ? 'border-danger' : 'border-white/10'} rounded-md w-full`}
                />
                {errors['address.street'] && <p className="text-danger text-xs mt-1">{errors['address.street']}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className={`bg-input-bg border ${errors['address.city'] ? 'border-danger' : 'border-white/10'} rounded-md w-full`}
                />
                {errors['address.city'] && <p className="text-danger text-xs mt-1">{errors['address.city']}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className={`bg-input-bg border ${errors['address.state'] ? 'border-danger' : 'border-white/10'} rounded-md w-full`}
                />
                {errors['address.state'] && <p className="text-danger text-xs mt-1">{errors['address.state']}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className={`bg-input-bg border ${errors['address.zipCode'] ? 'border-danger' : 'border-white/10'} rounded-md w-full`}
                />
                {errors['address.zipCode'] && <p className="text-danger text-xs mt-1">{errors['address.zipCode']}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="bg-input-bg border border-white/10 rounded-md w-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-accent-primary">Skills</h2>
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center gap-1 text-sm bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary py-1 px-3 rounded-md transition-colors"
              >
                <FiPlus size={16} /> Add Skill
              </button>
            </div>
            
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  placeholder="Enter skill"
                  className="bg-input-bg border border-white/10 rounded-md flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="p-2 bg-danger/20 hover:bg-danger/30 text-danger rounded-md transition-colors"
                  disabled={formData.skills.length === 1}
                >
                  <FiMinus size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-accent-primary">Education</h2>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-1 text-sm bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary py-1 px-3 rounded-md transition-colors"
              >
                <FiPlus size={16} /> Add Education
              </button>
            </div>
            
            {formData.education.map((edu, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4 pb-4 border-b border-white/5 last:border-0 last:pb-0 last:mb-0">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Degree/Certificate
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    className="bg-input-bg border border-white/10 rounded-md w-full"
                  />
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    className="bg-input-bg border border-white/10 rounded-md w-full"
                  />
                </div>
                
                <div className="md:col-span-1 flex flex-col">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Year
                  </label>
                  <div className="flex gap-2 h-[42px]">
                    <input
                      type="number"
                      value={edu.year}
                      onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                      className="bg-input-bg border border-white/10 rounded-md flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="p-2 bg-danger/20 hover:bg-danger/30 text-danger rounded-md transition-colors"
                      disabled={formData.education.length === 1}
                    >
                      <FiMinus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-accent-primary">Emergency Contact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleChange}
                  className="bg-input-bg border border-white/10 rounded-md w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  name="emergencyContact.relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={handleChange}
                  className="bg-input-bg border border-white/10 rounded-md w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  name="emergencyContact.phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleChange}
                  className="bg-input-bg border border-white/10 rounded-md w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mb-6">
            <Link
              to="/dashboard"
              className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-text-primary rounded-md transition-colors"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 py-2 px-4 bg-accent-primary hover:bg-accent-secondary text-white rounded-md transition-colors shadow-sm"
            >
              <FiSave size={18} />
              <span>{isEdit ? 'Update' : 'Save'} Employee</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
