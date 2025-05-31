import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiLogOut, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getEmployees, deleteEmployee } from '../../services/api';
import EmployeeDetailsPopup from '../employees/EmployeeDetailsPopup';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user authentication
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(userInfo));
    
    // Fetch employees
    fetchEmployees();
  }, [navigate]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteEmployee(deleteConfirm);
      setEmployees(employees.filter(emp => emp._id !== deleteConfirm));
      toast.success('Employee deleted successfully');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-accent-primary">Employee Management</h1>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-text-secondary">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-bg-secondary hover:bg-gray-200 text-text-secondary"
                title="Logout"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto py-6 px-4 mt-4">
        <div className="flex justify-between items-center mb-6 mt-6">
          <h2 className="text-xl font-semibold">Employee List</h2>
          <Link
            to="/employees/add"
            className="flex items-center gap-2 bg-accent-primary hover:bg-accent-secondary text-white py-2 px-4 rounded-md transition-colors"
          >
            <FiPlus size={18} />
            <span>Add Employee</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {employees.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {employees.map((employee) => (
                  <div 
                    key={employee._id} 
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4 shadow-sm">
                        {employee.profilePicture && employee.profilePicture !== 'default-profile.jpg' ? (
                          <img 
                            src={employee.profilePicture} 
                            alt={`${employee.firstName} ${employee.lastName}`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-accent-primary flex items-center justify-center text-white font-medium">
                            {employee.firstName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{`${employee.firstName} ${employee.lastName}`}</h3>
                        <p className="text-sm text-text-secondary">{employee.position} • {employee.department}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/employees/edit/${employee._id}`}
                        className="p-2 bg-accent-primary/10 text-accent-primary rounded hover:bg-accent-primary/20 transition-colors"
                        title="Edit employee"
                      >
                        <FiEdit2 size={18} />
                      </Link>
                      
                      {user?.isAdmin && (
                        <button
                          onClick={(e) => handleDeleteClick(e, employee._id)}
                          className="p-2 bg-danger/10 text-danger rounded hover:bg-danger/20 transition-colors"
                          title="Delete employee"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 px-6 text-center">
                <p className="text-text-secondary">No employees found.</p>
                <Link to="/employees/add" className="text-accent-primary hover:text-accent-secondary mt-2 inline-block">
                  Add your first employee
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Employee Details Popup */}
      {selectedEmployee && (
        <EmployeeDetailsPopup 
          employee={selectedEmployee} 
          onClose={() => setSelectedEmployee(null)} 
        />
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete this employee? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-text-primary rounded-md"
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

export default Dashboard;
