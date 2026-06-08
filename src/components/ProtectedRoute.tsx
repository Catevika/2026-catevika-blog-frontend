import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      const pathname = location.pathname;

      const isProtectedRoute =
        pathname === "/posts/new" ||
        pathname === "/posts/trash" ||
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
