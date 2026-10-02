import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) return <Navigate to="/login" replace />;

  const map = { admin: '/admin/dashboard', instructor: '/instructor/dashboard', member: '/member/dashboard' };
  return <Navigate to={map[user.role] || '/login'} replace />;
}
