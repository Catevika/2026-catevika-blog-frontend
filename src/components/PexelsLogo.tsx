import { Link } from "react-router";

export default function PexelsLogo() {
  return (
    <div className="relative hidden w-16 h-6 cursor-pointer md:inline">
      <Link to="https://www.pexels.com" title="Go to Pexels site">
        <img
          src="https://images.pexels.com/lib/api/pexels-white.png"
          alt="BlogCraft"
          className="absolute hidden object-contain w-full h-full dark:inline"
        />
      </Link>
      <Link to="https://www.pexels.com" title="Go to Pexels site">
        <img
          src="https://images.pexels.com/lib/api/pexels.png"
          alt="BlogCraft"
          className="absolute inline object-contain w-full h-full dark:hidden"
        />
      </Link>
    </div>
  );
}
