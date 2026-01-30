import React from 'react';
import type { Page } from '../types';
import { NAV_LINKS } from '../constants';
import { NavLink } from "react-router-dom";


interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <div className="w-16 md:w-64 bg-primary text-white flex flex-col transition-all duration-300">
      <div className="flex items-center justify-center h-20 border-b border-blue-800">
        <h1 className="text-xl md:text-2xl font-bold hidden md:block">Admin Panel</h1>
        <h1 className="text-2xl font-bold md:hidden">CA</h1>
      </div>
    <nav className="flex-1 px-2 py-4 space-y-2">
  {NAV_LINKS.map(({ page, label, icon: Icon }) => (
    <NavLink
      key={page}
      to={`/${page === "dashboard" ? "" : page}`}
      onClick={() => setCurrentPage(page)}
      className={({ isActive }) =>
        `flex items-center p-2 md:p-3 text-sm md:text-base rounded-lg transition-colors duration-200 ${
          currentPage === page || isActive
            ? 'bg-secondary text-white'
            : 'text-blue-100 hover:bg-accent hover:text-white'
        }`
      }
    >
      {/* 🔴 YE CONTENT MISSING THA */}
      <Icon className="h-5 w-5 md:h-6 md:w-6" />
      <span className="ml-4 hidden md:block">{label}</span>
    </NavLink>
  ))}
</nav>

    </div>
  );
};
