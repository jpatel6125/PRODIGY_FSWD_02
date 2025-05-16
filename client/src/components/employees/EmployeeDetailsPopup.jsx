import { FiX, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const EmployeeDetailsPopup = ({ employee, onClose }) => {
  if (!employee) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-text-primary">Employee Details</h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-accent-primary/20 shadow-md">
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
            
            <div className="w-full border-t border-gray-200 pt-4 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <FiMail className="text-accent-primary" />
                <a href={`mailto:${employee.email}`} className="text-accent-primary hover:text-accent-secondary">
                  {employee.email}
                </a>
              </div>
              
              <div className="flex items-center gap-2">
                <FiPhone className="text-accent-primary" />
                <a href={`tel:${employee.phone}`} className="text-accent-primary hover:text-accent-secondary">
                  {employee.phone}
                </a>
              </div>
            </div>
            
            <div className="w-full border-t border-gray-200 pt-4 mt-4">
              <p className="text-text-secondary text-sm">Employee since</p>
              <p>{new Date(employee.joinDate).toLocaleDateString()}</p>
            </div>
            
            <Link 
              to={`/employees/edit/${employee._id}`}
              className="mt-6 py-2 px-4 bg-accent-primary hover:bg-accent-secondary text-white rounded-md transition-colors w-full text-center shadow-sm"
            >
              Edit Profile
            </Link>
          </div>
          
          {/* Main Details */}
          <div className="md:col-span-2">
            {/* Employment Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-text-primary">Employment Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            
            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-text-primary">Contact Information</h3>
              
              <div className="mb-4">
                <p className="text-text-secondary text-sm mb-1">Address</p>
                <div className="flex items-start gap-2">
                  <FiMapPin className="text-accent-primary mt-0.5" />
                  <p>
                    {employee.address.street}, {employee.address.city}, {employee.address.state}, {employee.address.zipCode}, {employee.address.country}
                  </p>
                </div>
              </div>
              
              {employee.emergencyContact && employee.emergencyContact.name && (
                <div>
                  <p className="text-text-secondary text-sm mb-1">Emergency Contact</p>
                  <p className="font-medium">{employee.emergencyContact.name}</p>
                  <p className="text-text-secondary text-sm">{employee.emergencyContact.relationship}</p>
                  <p>{employee.emergencyContact.phone}</p>
                </div>
              )}
            </div>
            
            {/* Skills & Education */}
            <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-text-primary">Skills & Education</h3>
              
              {employee.skills && employee.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-text-secondary text-sm mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {employee.skills.map((skill, index) => (
                      skill.trim() && (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}
              
              {employee.education && employee.education.length > 0 && (
                <div>
                  <p className="text-text-secondary text-sm mb-2">Education</p>
                  <div className="space-y-3">
                    {employee.education.map((edu, index) => (
                      (edu.degree || edu.institution) && (
                        <div key={index} className="border-l-2 border-accent-primary/50 pl-3">
                          <p className="font-medium">{edu.degree}</p>
                          <p className="text-text-secondary">{edu.institution}</p>
                          {edu.year && <p className="text-sm text-text-secondary">{edu.year}</p>}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsPopup;
