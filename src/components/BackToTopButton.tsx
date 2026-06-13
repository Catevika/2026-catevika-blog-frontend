import { useEffect, useState } from "react";
import { PiArrowUp } from "react-icons/pi";

export default function BackTopButton({
  /** Optional scroll container. Defaults to window. */
  scrollContainer,
}: {
  scrollContainer?: HTMLElement | null;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = scrollContainer ?? window;

    function handleScroll() {
      const y = scrollContainer ? scrollContainer.scrollTop : window.scrollY;

      setVisible(y > 200); // choose threshold you prefer
    }

    target.addEventListener("scroll", handleScroll);
    return () => target.removeEventListener("scroll", handleScroll);
  }, [scrollContainer]);

  function scrollToTop() {
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="bg-primary text-primary-foreground fixed right-6 bottom-6 z-50 cursor-pointer rounded-full p-2 shadow-lg transition-opacity duration-200 hover:opacity-70"
      aria-label="Go back to top"
    >
      <PiArrowUp size={24} />
    </button>
  );
}
