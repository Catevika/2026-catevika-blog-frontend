import { useCallback } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

const CustomFeedButton = () => {
  const navigate = useNavigate();

  const handleNavigateToFeed = useCallback(() => {
    void navigate("/posts/feed");
  }, [navigate]);

  return <Button onClick={handleNavigateToFeed}>Feed</Button>;
};

export default CustomFeedButton;
