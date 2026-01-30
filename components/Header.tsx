
import React, { useState } from 'react';
import { Search, Bell, User } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const handleActionClick = (action: string) => {
        console.log(`${action} clicked`);
        setIsDropdownOpen(false);
    };

  return (
    <header className="bg-white shadow-md h-20 flex items-center justify-between px-6 z-10 shrink-0">
      <h1 className="text-xl md:text-2xl font-semibold text-gray-800 hidden sm:block">{title}</h1>

      <div className="flex-1 flex justify-center px-4">
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
            />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
            <Bell className="h-6 w-6 text-gray-600" />
        </button>
        <div className="relative">
          <button onClick={() => setIsDropdownOpen(prev => !prev)} onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)} className="focus:outline-none">
            <img
                className="h-10 w-10 rounded-full object-cover"
                src="https://picsum.photos/100/100"
                alt="User avatar"
            />
          </button>
          {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 border-b">
                      <p className="text-sm font-semibold text-gray-800">Admin User</p>
                      <p className="text-xs text-gray-500">admin@example.com</p>
                  </div>
                  <button onClick={() => handleActionClick('Profile')} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User size={16} className="mr-3 text-gray-500" /> Profile
                  </button>
              </div>
          )}
        </div>
      </div>
    </header>
  );
};
