import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import { Spinner } from '@/components/ui';

export default function ProtectedRoute() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-main">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" className="text-cyan" />
          <p className="text-muted-text text-sm">Loading FundFlow...</p>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/signin" replace />;
}