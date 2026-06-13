import TypographyH1 from "@/components/TypographyH1";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemHeader,
} from "@/components/ui/item";
import { useAuthStore } from "@/stores/authStore";
import { SlArrowRight } from "react-icons/sl";
import { Link } from "react-router";

export default function Dashboard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <section className="relative mx-auto h-auto max-h-120 w-auto max-w-2xl grow">
      <figure className="flex flex-col items-center justify-center">
        <picture>
          <source
            srcSet="assets/windows-11-bloom-light-variants-v1.webp"
            type="image/webp"
          />
          <img
            src="assets/windows-11-bloom-light-variants-v1.png"
            alt="Hero banner"
            width="960"
            height="600"
            aria-hidden="true"
            className="rounded-2xl object-center"
            loading="lazy"
          />
        </picture>
        <figcaption className="text-center text-xs">
          <Link
            rel="noopener noreferrer"
            to="https://www.behance.net/gallery/202329689/Windows-11-Wallpaper-(2022)"
            target="_blank"
            className="text-muted-foreground no-underline transition-opacity duration-200 hover:opacity-70"
          >
            CG Artists: Danny Yoon, Brian Townsend and Ziye Liu -
            Product&nbsp;Designers: Quan Jasinski and Kaeling Gurr -
            Initial&nbsp;Concept:&nbsp;Six&nbsp;N&nbsp;Five
          </Link>
        </figcaption>
      </figure>
      <div className="m-5 block sm:absolute sm:inset-0 sm:flex sm:flex-col sm:flex-wrap sm:items-center">
        <div className="dark:text-foreground! dark:sm:text-background! sm:pb-25">
          <TypographyH1>Welcome&nbsp;to&nbsp;my Tech&nbsp;Blog!</TypographyH1>
        </div>
        <Item
          variant="default"
          className="sm:bg-background/20 sm:dark:bg-foreground/20 sm:backdrop-blur-md"
        >
          <ItemContent>
            <ItemHeader className="sm:dark:text-background text-xl font-semibold">
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
          <div className="border-primary z-20 max-w-[35%] flex-1 grow border" />
          <span className="text-background dark:text-foreground z-20 mx-4 shrink px-4 text-xl font-bold lg:text-2xl">
            OR
          </span>
          <div className="border-primary z-20 max-w-[35%] flex-1 grow border" />
        </div>
        <Item
          variant="default"
          className="sm:bg-background/20 sm:dark:bg-foreground/20 sm:backdrop-blur-md"
        >
          <ItemContent>
            <ItemHeader className="sm:dark:text-background text-xl font-semibold">
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
