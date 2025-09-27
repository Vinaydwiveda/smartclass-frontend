import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserPlus, FaCheckCircle, FaChartBar } from 'react-icons/fa';

export default function Home() {
  const cards = [
    {
      to: '/register',
      title: 'Register Student',
      description: 'Add new students using face recognition.',
      icon: FaUserPlus,
      color: 'from-blue-500 to-blue-600',
    },
    {
      to: '/attendance',
      title: 'Mark Attendance',
      description: 'Use camera to mark attendance automatically.',
      icon: FaCheckCircle,
      color: 'from-green-500 to-green-600',
    },
    {
      to: '/reports',
      title: 'View Reports',
      description: 'Generate and download attendance reports.',
      icon: FaChartBar,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Smart Classroom</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage student attendance effortlessly with AI-powered face recognition technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(({ to, title, description, icon: Icon, color }, index) => (
            <Link
              key={to}
              to={to}
              className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`p-6 rounded-t-lg bg-gradient-to-r ${color}`}>
                <Icon className="text-3xl text-white mx-auto mb-2" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
