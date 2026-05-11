import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3EF] dark:bg-[#0C0C0D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/sg.jpeg" alt="Stonegate" width={40} height={40}
            style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]"
                style={{ animation: `bounce 1s infinite ${i * 0.15}s` }} />
            ))}
          </div>
          <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/** Redirect logged-in users away from auth pages */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
