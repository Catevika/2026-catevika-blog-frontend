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
      className="bg-card/50 fixed top-0 right-0 left-0 z-100 mx-auto shrink-0 px-2 pt-2 backdrop-blur-md md:px-4"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <CatevikaLogo />

        <NavigationMenu className="hidden w-57 sm:block">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-md/relaxed font-semibold">
                Menu
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/" className="rounded-xs">
                  Dashboard
                </NavigationMenuLink>
                <NavigationMenuLink href="/posts/feed" className="rounded-xs">
                  Feed
                </NavigationMenuLink>
                <NavigationMenuLink
                  href="/posts/favorites"
                  className="rounded-xs"
                >
                  Trending
                </NavigationMenuLink>
                <NavigationMenuLink href="/posts" className="rounded-xs">
                  Posts
                </NavigationMenuLink>
                <NavigationMenuLink href="/posts/new" className="rounded-xs">
                  New post
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
