import { useAuthStore } from "@/stores/authStore";
import { BiLogInCircle } from "react-icons/bi";
import { useNavigate } from "react-router";

export default function LogInButton() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  if (isAuthenticated) return null;

  return (
    <>
      {/* Desktop */}
      <button
        type="button"
        onClick={() => {
          void navigate("/auth");
        }}
        className="hidden cursor-pointer border-transparent! bg-transparent! p-2 font-medium transition-opacity duration-200 hover:bg-transparent! hover:opacity-70 sm:inline"
        title="Go to login page"
        aria-label="Go to login page"
      >
        Login
      </button>

      {/* Mobile */}
      <button
        type="button"
        onClick={() => {
          void navigate("/auth");
        }}
        className="inline cursor-pointer border-transparent! bg-transparent! p-2 font-medium transition-opacity duration-200 hover:bg-transparent! hover:opacity-70 sm:hidden"
        title="Go to login page"
        aria-label="Go to login page"
      >
        <BiLogInCircle size={24} aria-hidden="true" />
        <span className="sr-only">Login</span>
      </button>
    </>
  );
}
