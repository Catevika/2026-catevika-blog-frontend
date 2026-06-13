import { Link } from "react-router";

const CatevikaLogo = () => {
  return (
    <Link
      to="/"
      className="border-l-primary border-l-4 pl-2 font-semibold transition-opacity duration-200 hover:opacity-70"
      aria-label="Catevika Web Dev home"
    >
      Catevika Web Dev
    </Link>
  );
};

export default CatevikaLogo;
