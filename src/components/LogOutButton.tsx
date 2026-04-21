import { BiLogOutCircle } from "react-icons/bi";

export default function LogOutButton() {
  const isAuthenticated = true;

  const handleLogout = () => {
    return null;
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Desktop */}
      <button
        type="button"
        onClick={handleLogout}
        className="duration-200 hover:opacity-70 transition-opacity cursor-pointer border-transparent! bg-transparent! p-2 font-medium hover:bg-transparent! hidden md:inline"
        title="Log out and go to login page"
        aria-label="Go to login page"
      >
        Logout
      </button>

      {/* Mobile */}
      <button
        type="button"
        onClick={handleLogout}
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
