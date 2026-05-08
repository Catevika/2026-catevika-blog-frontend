import TypographyH1 from "@/components/TypographyH1";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemHeader,
} from "@/components/ui/item";
import { Link } from "react-router";
import { SlArrowRight } from "react-icons/sl";
import { useAuthStore } from "@/stores/authStore";

export default function Dashboard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <section className="relative w-auto h-auto max-w-5xl mx-auto max-h-150 grow">
      <figure className="flex flex-col items-center justify-center">
        <img
          src="assets/windows-11-bloom-light-variants-v1.png"
          alt=""
          aria-hidden="true"
          className="object-center rounded-2xl"
        />
        <figcaption className="text-xs text-center">
          <Link
            rel="noopener noreferrer"
            to="https://www.behance.net/gallery/202329689/Windows-11-Wallpaper-(2022)"
            target="_blank"
            className="no-underline transition-opacity duration-200 hover:opacity-70 text-muted-foreground"
          >
            CG Artists: Danny Yoon, Brian Townsend and Ziye Liu -
            Product&nbsp;Designers: Quan Jasinski and Kaeling Gurr -
            Initial&nbsp;Concept:&nbsp;Six&nbsp;N&nbsp;Five
          </Link>
        </figcaption>
      </figure>
      <div className="block m-5 sm:absolute sm:inset-0 sm:flex sm:flex-col sm:items-center sm:flex-wrap">
        <div className="sm:pb-25 dark:text-secondary">
          <TypographyH1>Welcome&nbsp;to&nbsp;my Tech&nbsp;Blog!</TypographyH1>
        </div>
        <Item
          variant="default"
          className="sm:bg-background/20 sm:dark:bg-foreground/20 sm:backdrop-blur-md"
        >
          <ItemContent>
            <ItemHeader className="text-xl font-semibold sm:dark:text-background">
              Read&nbsp;Ultra&nbsp;Expert&nbsp;Posts!
            </ItemHeader>
          </ItemContent>
          <ItemActions>
            <Link to="/posts">
              <Button variant="default" size="lg">
                {isAuthenticated ? "Start Reading Now" : "No account needed"}
                <SlArrowRight />
              </Button>
            </Link>
          </ItemActions>
        </Item>
        <div
          className="hidden sm:flex sm:w-full sm:items-center sm:justify-center sm:gap-4 sm:px-8 sm:py-8"
          aria-hidden="true"
          role="separator"
        >
          <div className="z-20 border-primary max-w-[35%] flex-1 grow border" />
          <span className="z-20 px-4 mx-4 text-xl font-bold text-background dark:text-foreground shrink lg:text-2xl">
            OR
          </span>
          <div className="z-20 border-primary max-w-[35%] flex-1 grow border" />
        </div>
        <Item
          variant="default"
          className="sm:bg-background/20 sm:dark:bg-foreground/20 sm:backdrop-blur-md"
        >
          <ItemContent>
            <ItemHeader className="text-xl font-semibold sm:dark:text-background">
              Write&nbsp;Meaningful&nbsp;Posts!
            </ItemHeader>
          </ItemContent>
          <ItemActions>
            <Link to="/posts/new">
              <Button variant="default" size="lg">
                {isAuthenticated ? "Start Writing Now" : "Create an Account"}
                <SlArrowRight />
              </Button>
            </Link>
          </ItemActions>
        </Item>
      </div>
    </section>
  );
}
