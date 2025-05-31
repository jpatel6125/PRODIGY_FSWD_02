import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/common/PrivateRoute';
import EmployeeForm from './components/employees/EmployeeForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-primary">
        <ToastContainer 
          position="top-right" 
          theme="light" 
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
        />
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<AuthPage />} />
          
          {/* Protected Dashboard Route */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          {/* Add/Edit Employee Route */}
          <Route path="/employees/add" element={
            <PrivateRoute>
              <EmployeeForm isEdit={false} />
            </PrivateRoute>
          } />
          
          <Route path="/employees/edit/:id" element={
            <PrivateRoute>
              <EmployeeForm isEdit={true} />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
