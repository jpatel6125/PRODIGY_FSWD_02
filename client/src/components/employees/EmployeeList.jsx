import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getEmployees, deleteEmployee, searchEmployees } from '../../services/api';

const EmployeeList = () => {
  const [user] = useOutletContext();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchEmployees = async (page = 1, keyword = '') => {
    setLoading(true);
    try {
      const data = await getEmployees(page, keyword);
      setEmployees(data.employees);
      setTotalPages(data.pages);
      setCurrentPage(data.page);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchEmployees(1, search);
  };

  const handleDeleteClick = (id) => {
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

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchEmployees(page, search);
  };

  return (
    <div className="h-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Employees</h1>
        
        <div className="flex gap-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 py-2 pl-4 rounded-md bg-input-bg border border-white/10 focus:border-accent-primary"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent-primary">
              <FiSearch size={18} />
            </button>
          </form>
          
          <Link
            to="/dashboard/employees/add"
            className="flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-secondary text-white py-2 px-4 rounded-md transition-colors"
          >
            <FiPlus size={18} />
            <span>New Employee</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
        </div>
      ) : (
        <>
          <div className="bg-card-bg border border-white/5 rounded-lg overflow-hidden">
            {employees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-white/10 bg-bg-secondary">
                      <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Join Date</th>
                      <th className="px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee._id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                              {employee.profilePicture && employee.profilePicture !== 'default-profile.jpg' ? (
                                <img 
                                  src={employee.profilePicture} 
                                  alt={`${employee.firstName} ${employee.lastName}`} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-accent-primary flex items-center justify-center text-white">
                                  {employee.firstName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{`${employee.firstName} ${employee.lastName}`}</div>
                              <div className="text-sm text-text-secondary">{employee.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{employee.position}</td>
                        <td className="px-6 py-4">{employee.department}</td>
                        <td className="px-6 py-4">{employee.email}</td>
                        <td className="px-6 py-4">{new Date(employee.joinDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Link 
                              to={`/dashboard/employees/${employee._id}`}
                              className="p-1.5 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20 transition-colors"
                              title="View details"
                            >
                              <FiEye size={16} />
                            </Link>
                            <Link 
                              to={`/dashboard/employees/edit/${employee._id}`}
                              className="p-1.5 bg-amber-500/10 text-amber-500 rounded hover:bg-amber-500/20 transition-colors"
                              title="Edit employee"
                            >
                              <FiEdit2 size={16} />
                            </Link>
                            {user?.isAdmin && (
                              <button
                                onClick={() => handleDeleteClick(employee._id)}
                                className="p-1.5 bg-danger/10 text-danger rounded hover:bg-danger/20 transition-colors"
                                title="Delete employee"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 px-6 text-center">
                <p className="text-text-secondary">No employees found.</p>
                <Link to="/dashboard/employees/add" className="text-accent-primary hover:text-accent-secondary mt-2 inline-block">
                  Add your first employee
                </Link>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md bg-card-bg border border-white/10 text-text-secondary disabled:opacity-50"
              >
                <FiChevronLeft />
              </button>
              
              <div className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </div>
              
              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md bg-card-bg border border-white/10 text-text-secondary disabled:opacity-50"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete this employee? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
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

export default EmployeeList;
