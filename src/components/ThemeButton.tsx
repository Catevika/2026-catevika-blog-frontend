import { PiMoon } from "react-icons/pi";
import { PiSun } from "react-icons/pi";
import { useTheme } from "@/hooks/useTheme";
import PexelsLogo from "@/components/PexelsLogo";

export default function ThemeButton() {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <>
      <PexelsLogo />

      <button
        onClick={handleToggle}
        className="duration-200 hover:opacity-70 transition-opacity border-transparent! bg-transparent! p-2 hover:bg-transparent!"
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        aria-pressed={theme === "dark"}
      >
        {theme === "dark" ? (
          <PiMoon aria-hidden="true" size={24} className="font-semibold" />
        ) : (
          <PiSun aria-hidden="true" size={24} className="font-semibold" />
        )}
        <span className="sr-only">
          {theme === "dark" ? "Dark mode active" : "Light mode active"}
        </span>
      </button>
    </>
  );
}
