import React from 'react';
import { SearchManagementHub } from '../../components/admin/SearchManagementHub';

export const AdminSearchEnginePage: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      <SearchManagementHub />
    </div>
  );
};

export default AdminSearchEnginePage;
