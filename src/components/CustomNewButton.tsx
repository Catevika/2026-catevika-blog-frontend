import { Button } from "@/components/ui/button";
import { useCallback } from "react";
import { useNavigate } from "react-router";

const CustomNewButton = () => {
  const navigate = useNavigate();

  const handleNavigateToNewDraft = useCallback(() => {
    void navigate("/posts/new");
  }, [navigate]);

  return <Button onClick={handleNavigateToNewDraft}>New</Button>;
};

export default CustomNewButton;
