import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getEmployeeById, deleteEmployee } from '../../services/api';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user] = useOutletContext();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const data = await getEmployeeById(id);
        setEmployee(data);
      } catch (error) {
        console.error('Error fetching employee details:', error);
        toast.error('Failed to fetch employee details');
        navigate('/dashboard/employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id, navigate]);

  const handleDeleteClick = () => {
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteEmployee(id);
      toast.success('Employee deleted successfully');
      navigate('/dashboard/employees');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    } finally {
      setDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (!employee) {
    return <div>Employee not found</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 bg-card-bg rounded-full hover:bg-bg-secondary"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Employee Details</h1>
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/dashboard/employees/edit/${id}`}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            <FiEdit2 size={18} />
            <span>Edit</span>
          </Link>
          
          {user?.isAdmin && (
            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-2 bg-danger hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              <FiTrash2 size={18} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-card-bg border border-white/5 rounded-lg p-6 text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-accent-primary/20">
            {employee.profilePicture && employee.profilePicture !== 'default-profile.jpg' ? (
              <img 
                src={employee.profilePicture} 
                alt={`${employee.firstName} ${employee.lastName}`}
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-accent-primary flex items-center justify-center text-white text-4xl">
                {employee.firstName.charAt(0)}
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-bold mb-1">{`${employee.firstName} ${employee.lastName}`}</h2>
          <p className="text-text-secondary mb-4">{employee.position}</p>
          
          <div className="border-t border-white/5 pt-4 mt-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FiMail className="text-text-secondary" />
              <a href={`mailto:${employee.email}`} className="text-accent-primary hover:text-accent-secondary">
                {employee.email}
              </a>
            </div>
            <div className="flex items-center justify-center gap-2">
              <FiPhone className="text-text-secondary" />
              <a href={`tel:${employee.phone}`} className="text-accent-primary hover:text-accent-secondary">
                {employee.phone}
              </a>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-4 mt-4">
            <p className="text-text-secondary text-sm">Employee since</p>
            <p className="font-semibold">{new Date(employee.joinDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Main Info */}
        <div className="lg:col-span-2">
          <div className="bg-card-bg border border-white/5 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Employment Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-text-secondary text-sm mb-1">Department</p>
                <div className="flex items-center gap-2">
                  <FiBriefcase className="text-accent-primary" />
                  <p>{employee.department}</p>
                </div>
              </div>
              
              <div>
                <p className="text-text-secondary text-sm mb-1">Position</p>
                <div className="flex items-center gap-2">
                  <FiBriefcase className="text-accent-primary" />
                  <p>{employee.position}</p>
                </div>
              </div>
              
              <div>
                <p className="text-text-secondary text-sm mb-1">Employee Type</p>
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-accent-primary" />
                  <p>{employee.employeeType}</p>
                </div>
              </div>
              
              <div>
                <p className="text-text-secondary text-sm mb-1">Salary</p>
                <div className="flex items-center gap-2">
                  <FiDollarSign className="text-accent-primary" />
                  <p>₹{employee.salary.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card-bg border border-white/5 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            
            <div className="mb-4">
              <p className="text-text-secondary text-sm mb-1">Address</p>
              <div className="flex items-start gap-2">
                <FiMapPin className="text-accent-primary mt-0.5" />
                <p>
                  {employee.address.street}, {employee.address.city}, {employee.address.state}, {employee.address.zipCode}, {employee.address.country}
                </p>
              </div>
            </div>
            
            {employee.emergencyContact && (
              <div>
                <p className="text-text-secondary text-sm mb-1">Emergency Contact</p>
                <p className="font-medium">{employee.emergencyContact.name}</p>
                <p className="text-text-secondary text-sm">{employee.emergencyContact.relationship}</p>
                <p>{employee.emergencyContact.phone}</p>
              </div>
            )}
          </div>
          
          <div className="bg-card-bg border border-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Skills & Education</h3>
            
            {employee.skills && employee.skills.length > 0 && (
              <div className="mb-6">
                <p className="text-text-secondary text-sm mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {employee.education && employee.education.length > 0 && (
              <div>
                <p className="text-text-secondary text-sm mb-2">Education</p>
                <div className="space-y-3">
                  {employee.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-accent-primary/30 pl-3">
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-text-secondary">{edu.institution}</p>
                      <p className="text-sm text-text-secondary">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete {employee.firstName} {employee.lastName}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 bg-bg-secondary hover:bg-bg-primary text-text-primary rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-danger hover:bg-red-700 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
