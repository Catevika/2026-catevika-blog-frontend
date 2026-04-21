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

export default function Dashboard() {
  const isAuthenticated = true;

  return (
    <section className="relative md:w-2xl md:h-2xl">
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
      <div className="block m-5 md:absolute md:inset-0 md:flex md:flex-col md:items-center md:flex-wrap">
        <div className="md:pb-25">
          <TypographyH1>Welcome&nbsp;to&nbsp;my Tech&nbsp;Blog!</TypographyH1>
        </div>
        <Item
          variant="default"
          className="md:bg-background/20 md:dark:bg-foreground/20 md:backdrop-blur-md"
        >
          <ItemContent>
            <ItemHeader className="text-xl font-semibold md:dark:text-background">
              Read&nbsp;Ultra&nbsp;Expert&nbsp;Posts!
            </ItemHeader>
          </ItemContent>
          <ItemActions>
            <Button variant="default" size="lg">
              {isAuthenticated ? "Start Reading Now" : "No account needed"}
              <SlArrowRight />
            </Button>
          </ItemActions>
        </Item>
        <div
          className="hidden md:flex md:w-full md:items-center md:justify-center md:gap-4 md:px-8 md:py-8"
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
          className="md:bg-background/20 md:dark:bg-foreground/20 md:backdrop-blur-md"
        >
          <ItemContent>
            <ItemHeader className="text-xl font-semibold md:dark:text-background">
              Write&nbsp;Meaningful&nbsp;Posts!
            </ItemHeader>
          </ItemContent>
          <ItemActions>
            <Button variant="default" size="lg">
              {isAuthenticated ? "Start Writing Now" : "Create an Account"}
              <SlArrowRight />
            </Button>
          </ItemActions>
        </Item>
      </div>
    </section>
  );
}
