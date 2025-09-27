import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUserPlus, FaCheckCircle, FaChartBar, FaBars, FaTimes, FaChartLine, FaSignOutAlt } from 'react-icons/fa';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const token = localStorage.getItem('token');

  const links = [
    { to: '/home', label: 'Home', icon: FaHome },
    { to: '/register', label: 'Register', icon: FaUserPlus },
    { to: '/attendance', label: 'Attendance', icon: FaCheckCircle },
    { to: '/dashboard', label: 'Dashboard', icon: FaChartLine },
    { to: '/reports', label: 'Reports', icon: FaChartBar },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold">Smart Classroom</div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {links.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    location.pathname === to
                      ? 'bg-white text-blue-600'
                      : 'text-white hover:bg-blue-500'
                  }`}
                >
                  <Icon className="mr-2" />
                  {label}
                </Link>
              ))}
              {token && (
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-500 transition-colors duration-200"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-blue-600 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === to
                    ? 'bg-white text-blue-600'
                    : 'text-white hover:bg-blue-500'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="mr-2" />
                {label}
              </Link>
            ))}
            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-500 w-full text-left"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
