import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      const pathname = location.pathname;

      // Correct protected routes based on your real App.tsx
      const isProtectedRoute =
        pathname === "/posts" ||
        pathname === "/posts/new" ||
        pathname === "/trash" ||
        pathname.endsWith("/edit");

      if (isProtectedRoute) {
        void navigate("/auth", { replace: true, state: { from: pathname } });
      }
    }
  }, [isInitialized, isAuthenticated, navigate, location.pathname]);

  if (!isInitialized)
    return (
      <div
        className="flex-center min-h-50"
        role="status"
        aria-live="polite"
        aria-label="Checking authentication"
      >
        Loading...
      </div>
    );

  if (!isAuthenticated)
    return (
      <div
        className="flex-center min-h-50"
        role="status"
        aria-live="assertive"
        aria-label="Authentication required"
      >
        Redirecting to login...
      </div>
    );

  return <Outlet />;
};

export default ProtectedRoute;
