import { useLogout } from "@/hooks/useLogout";
import { useAuthStore } from "@/stores/authStore";
import { BiLogOutCircle } from "react-icons/bi";
import { useNavigate } from "react-router";

export default function LogOutButton() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { logout } = useLogout();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    void navigate("/");
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Desktop */}
      <button
        type="button"
        onClick={() => void onLogout()}
        className="duration-200 hover:opacity-70 transition-opacity cursor-pointer border-transparent! bg-transparent! p-2 font-medium hover:bg-transparent! hidden md:inline"
        title="Log out and go to login page"
        aria-label="Go to login page"
      >
        Logout
      </button>

      {/* Mobile */}
      <button
        type="button"
        onClick={() => void onLogout()}
        className="duration-200 hover:opacity-70 transition-opacity cursor-pointer border-transparent! bg-transparent! p-2 font-medium hover:bg-transparent! inline md:hidden"
        title="Log out and go to login page"
        aria-label="Go to login page"
      >
        <BiLogOutCircle size={24} aria-hidden="true" />
        <span className="sr-only">Logout</span>
      </button>
    </>
  );
}
