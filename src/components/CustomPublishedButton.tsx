import { useCallback } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

const CustomPublishedButton = () => {
  const navigate = useNavigate();

  const handleNavigateToPublished = useCallback(() => {
    void navigate("/posts");
  }, [navigate]);

  return <Button onClick={handleNavigateToPublished}>Posts</Button>;
};

export default CustomPublishedButton;
