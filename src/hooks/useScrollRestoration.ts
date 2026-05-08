import { useEffect } from "react";
import { useLocation } from "react-router";

export const useScrollRestoration = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle hash links first (e.g. #my-heading)
    if (location.hash) {
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100); // Small delay for content to render
      return;
    }

    // Default: scroll to top (unless hash)
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location.pathname, location.hash]);
};
