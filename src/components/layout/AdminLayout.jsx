import React, { useState } from 'react';
import Sidebar from '../admin/Sidebar';

const AdminLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <div
        className={`
          flex-1 transition-all duration-300
          ${isCollapsed ? 'ml-20' : 'ml-64'}
        `}
      >
        {/* Page Content - Full height */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;