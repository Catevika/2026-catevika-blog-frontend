import { useCallback } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

const CustomNewButton = () => {
  const navigate = useNavigate();

  const handleNavigateToNewDraft = useCallback(() => {
    void navigate("/posts/new");
  }, [navigate]);

  return <Button onClick={handleNavigateToNewDraft}>New</Button>;
};

export default CustomNewButton;
