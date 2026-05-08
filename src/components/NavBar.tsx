import CatevikaLogo from "@/components/CatevikaLogo";
import LogInButton from "@/components/LogInButton";
import LogOutButton from "@/components/LogOutButton";
import ThemeButton from "@/components/ThemeButton";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useAuthStore } from "@/stores/authStore";
import { useLocation } from "react-router";

export default function NavBar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  return (
    <nav
      className="fixed top-0 left-0 right-0 px-2 pt-2 mx-auto md:px-4 bg-card/50 z-100 backdrop-blur-md shrink-0"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <CatevikaLogo />

        <NavigationMenu className="hidden w-57 sm:block">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="font-semibold text-md/relaxed">
                Menu
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/" className="rounded-xs">
                  Dashboard
                </NavigationMenuLink>
                <NavigationMenuLink href="/posts" className="rounded-xs">
                  Posts
                </NavigationMenuLink>
                <NavigationMenuLink href="/posts/feed" className="rounded-xs">
                  Feed
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center">
          <ThemeButton />
          {isAuthenticated ? (
            <LogOutButton />
          ) : (
            location.pathname !== "/auth" && <LogInButton />
          )}
        </div>
      </div>
    </nav>
  );
}
