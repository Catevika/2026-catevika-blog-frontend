import { Link } from "react-router";

export default function PexelsLogo() {
  return (
    <div className="relative hidden h-6 w-16 cursor-pointer md:inline">
      <Link to="https://www.pexels.com" title="Go to Pexels site">
        <img
          src="https://images.pexels.com/lib/api/pexels-white.png"
          alt="BlogCraft"
          className="absolute hidden h-full w-full object-contain dark:inline"
        />
      </Link>
      <Link to="https://www.pexels.com" title="Go to Pexels site">
        <img
          src="https://images.pexels.com/lib/api/pexels.png"
          alt="BlogCraft"
          className="absolute inline h-full w-full object-contain dark:hidden"
        />
      </Link>
    </div>
  );
}
