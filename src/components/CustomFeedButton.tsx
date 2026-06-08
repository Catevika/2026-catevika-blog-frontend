import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { useNavigate } from "react-router";

const CustomFeedButton = () => {
  const navigate = useNavigate();

  const handleNavigateToFeed = useCallback(() => {
    void navigate("/posts/feed");
  }, [navigate]);

  return <Button onClick={handleNavigateToFeed}>Feed</Button>;
};

export default CustomFeedButton;
