import { Outlet } from "react-router";
import BackTopButton from "../components/BackToTopButton";
import NavBar from "../components/NavBar";

export default function Layout() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-w-5xl px-2 pt-2 md:px-4">
      <NavBar />
      <main className="flex-1 overflow-y-auto pt-15">
        <Outlet />
        <BackTopButton />
      </main>
      <footer className="justify-end w-full py-4 mx-auto text-center backdrop-blur-md shrink-0">
        © 2026 - Catevika Web Dev -&nbsp;All&nbsp;rights&nbsp;reserved
      </footer>
    </div>
  );
}
