import React, { useState } from 'react';
import Sidebar from '../admin/Sidebar';

const AdminLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <div
        className={`
          flex-1 transition-all duration-300 min-w-0 overflow-x-hidden
          ${isCollapsed ? 'ml-20' : 'ml-64'}
        `}
      >
        {/* Page Content - Full height */}
        <main className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;