import { Link } from "react-router";

const CatevikaLogo = () => {
  return (
    <Link
      to="/"
      className="pl-2 font-semibold transition-opacity duration-200 border-l-4 border-l-primary hover:opacity-70"
      aria-label="Catevika Web Dev home"
    >
      Catevika Web Dev
    </Link>
  );
};

export default CatevikaLogo;
