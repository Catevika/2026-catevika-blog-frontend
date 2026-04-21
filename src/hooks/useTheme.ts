import { useLayoutEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  className: "light" | "dark";
  dataColorMode: "light" | "dark";
} {
  const getInitialTheme = (): Theme => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme && (storedTheme === "light" || storedTheme === "dark")) {
      return storedTheme as Theme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  useLayoutEffect(() => {
    // Update HTML classes
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);

    // Set data-color-mode on BOTH html + body
    document.body.setAttribute("data-color-mode", theme);
    document.documentElement.setAttribute("data-color-mode", theme);

    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const className = theme;
  const dataColorMode = theme;

  return {
    theme,
    setTheme,
    className,
    dataColorMode,
  };
}
