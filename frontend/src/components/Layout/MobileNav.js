import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiList, FiTag, FiLogOut, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../../Context/AuthContext';

const MobileNav = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/expenses', icon: FiList, label: 'Expenses' },
    { path: '/categories', icon: FiTag, label: 'Categories' },
  ];

  return (
    <div className="mobile-bottom-nav">
      <div className="flex items-center justify-around h-16">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-red-600"
        >
          <FiLogOut className="h-5 w-5" />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNav;