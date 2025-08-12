import React, { ReactNode } from 'react';
import { useAuthStore } from '../store/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, permission }) => {
  const { user } = useAuthStore();

  // For now, allow all authenticated users
  // In a real app, you'd check user permissions here
  if (permission && !hasPermission(user, permission)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600 mt-2">You don't have permission to access this resource.</p>
      </div>
    );
  }

  return <>{children}</>;
};

// Helper function to check permissions
function hasPermission(user: any, permission: string): boolean {
  // Placeholder implementation - in a real app, check user roles/permissions
  return true;
}

export default ProtectedRoute;
