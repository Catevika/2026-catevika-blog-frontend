import BackTopButton from "@/components/BackToTopButton";
import NavBar from "@/components/NavBar";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="flex min-h-screen max-w-5xl flex-col items-center justify-center px-2 pt-2 md:px-4">
      <NavBar />
      <main className="mx-auto w-full flex-1 overflow-y-auto pt-10">
        <Outlet />
        <BackTopButton />
      </main>
      <footer className="mx-auto w-full shrink-0 justify-end py-2 text-center backdrop-blur-md">
        © 2026 - Catevika Web Dev -&nbsp;All&nbsp;rights&nbsp;reserved
      </footer>
    </div>
  );
}
