import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User } from 'lucide-react';

interface NavigationProps {
  address: string | null;
}

export function Navigation({ address }: NavigationProps) {
  return (
    <nav className="hidden md:flex items-center space-x-4">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            isActive
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </NavLink>
      {address && (
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              isActive
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>My Profile</span>
        </NavLink>
      )}
    </nav>
  );
}