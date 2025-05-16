import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiSearch, FiBell, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Header = ({ toggleSidebar, user }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <header className="bg-card-bg border-b border-white/5 py-3 px-4 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          
          <div className="hidden md:flex items-center bg-input-bg rounded-md">
            <FiSearch className="ml-3 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none text-sm py-2 px-3 focus:outline-none w-64"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors relative">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full"></span>
          </button>
          
          <div className="relative">
            <button 
              onClick={toggleDropdown}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white font-medium">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block text-sm font-medium">{user?.name}</span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card-bg rounded-md shadow-lg py-1 z-50 border border-white/5">
                <div className="px-4 py-2 border-b border-white/5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-text-secondary">{user?.email}</p>
                </div>
                
                <button className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-bg-secondary">
                  <FiUser className="mr-3 text-text-secondary" />
                  Profile
                </button>
                
                <button className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-bg-secondary">
                  <FiSettings className="mr-3 text-text-secondary" />
                  Settings
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-danger hover:bg-bg-secondary border-t border-white/5"
                >
                  <FiLogOut className="mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
