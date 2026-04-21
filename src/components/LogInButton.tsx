import { BiLogInCircle } from "react-icons/bi";

export default function LogInButton() {
  const isAuthenticated = true;
  const handleLogin = () => {
    return null;
  };

  if (isAuthenticated) return null;

  return (
    <>
      {/* Desktop */}
      <button
        type="button"
        onClick={handleLogin}
        className="duration-200 hover:opacity-70 transition-opacity cursor-pointer border-transparent! bg-transparent! p-2 font-medium hover:bg-transparent! hidden md:inline"
        title="Go to login page"
        aria-label="Go to login page"
      >
        Login
      </button>

      {/* Mobile */}
      <button
        type="button"
        onClick={handleLogin}
        className="duration-200 hover:opacity-70 transition-opacity cursor-pointer border-transparent! bg-transparent! p-2 font-medium hover:bg-transparent! inline md:hidden"
        title="Go to login page"
        aria-label="Go to login page"
      >
        <BiLogInCircle size={24} aria-hidden="true" />
        <span className="sr-only">Login</span>
      </button>
    </>
  );
}
