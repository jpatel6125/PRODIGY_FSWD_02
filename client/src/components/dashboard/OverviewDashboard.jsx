import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FiUsers, FiBriefcase, FiDollarSign, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import axios from 'axios';

const OverviewDashboard = () => {
  const [user] = useOutletContext();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    departments: [],
    recentEmployees: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };

        // Fetch employees
        const employeeRes = await axios.get('http://localhost:5000/api/employees', config);
        const employees = employeeRes.data.employees;

        // Calculate departmental stats
        const departments = employees.reduce((acc, employee) => {
          const dept = employee.department;
          if (!acc[dept]) {
            acc[dept] = 0;
          }
          acc[dept]++;
          return acc;
        }, {});

        // Convert to array for easier rendering
        const departmentArray = Object.keys(departments).map(name => ({
          name,
          count: departments[name]
        })).sort((a, b) => b.count - a.count);

        setStats({
          totalEmployees: employeeRes.data.total || employees.length,
          departments: departmentArray.slice(0, 5), // Top 5 departments
          recentEmployees: employees.slice(0, 5) // 5 most recent employees
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Stat card component
  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-card-bg border border-white/5 rounded-lg p-6 flex items-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-text-secondary text-sm font-medium">{title}</h3>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-text-secondary">Welcome back, {user?.name}!</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Employees" 
              value={stats.totalEmployees} 
              icon={<FiUsers className="text-blue-500" size={24} />} 
              color="bg-blue-500/10 text-blue-500"
            />
            <StatCard 
              title="Departments" 
              value={stats.departments.length} 
              icon={<FiBriefcase className="text-purple-500" size={24} />} 
              color="bg-purple-500/10 text-purple-500"
            />
            <StatCard 
              title="Average Salary" 
              value="₹45,000" 
              icon={<FiDollarSign className="text-green-500" size={24} />} 
              color="bg-green-500/10 text-green-500"
            />
            <StatCard 
              title="New This Month" 
              value="12" 
              icon={<FiCalendar className="text-orange-500" size={24} />} 
              color="bg-orange-500/10 text-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Distribution */}
            <div className="bg-card-bg border border-white/5 rounded-lg p-6 lg:col-span-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Department Distribution</h2>
                <FiBarChart2 size={20} className="text-text-secondary" />
              </div>
              
              <div className="space-y-4">
                {stats.departments.map((dept, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-text-secondary">{dept.name}</span>
                      <span className="text-sm font-medium">{dept.count}</span>
                    </div>
                    <div className="w-full bg-bg-secondary rounded-full h-2">
                      <div 
                        className="bg-accent-primary h-2 rounded-full" 
                        style={{ width: `${(dept.count / stats.totalEmployees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Employees */}
            <div className="bg-card-bg border border-white/5 rounded-lg p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Recent Employees</h2>
                <Link to="/dashboard/employees" className="text-sm text-accent-primary hover:text-accent-secondary">
                  View All
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Position</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Join Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentEmployees.map((employee) => (
                      <tr key={employee._id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3">
                          <Link to={`/dashboard/employees/${employee._id}`} className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white mr-3">
                              {employee.firstName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-medium">{`${employee.firstName} ${employee.lastName}`}</span>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm">{employee.position}</td>
                        <td className="px-4 py-3 text-sm">{employee.department}</td>
                        <td className="px-4 py-3 text-sm">{new Date(employee.joinDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OverviewDashboard;
