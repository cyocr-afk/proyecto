import React from 'react';
import Sidebar from '../components/Sidebar';

const LayoutDashboard = ({ children }) => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4" style={{ marginLeft: '250px' }}>
        {children}
      </div>
    </div>
  );
};

export default LayoutDashboard;
