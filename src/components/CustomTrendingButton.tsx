import { useCallback } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

const CustomTrendingButton = () => {
  const navigate = useNavigate();

  const handleNavigateToTrending = useCallback(() => {
    void navigate("/posts/favorites");
  }, [navigate]);

  return <Button onClick={handleNavigateToTrending}>Trending</Button>;
};

export default CustomTrendingButton;
