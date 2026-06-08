import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router";

const NoCommentsYet = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8 text-center" aria-live="polite">
      <Card>
        <CardHeader className="mb-4 flex items-center gap-3">
          <CardTitle>Join the conversation</CardTitle>
        </CardHeader>
        <CardContent className="border-accent bg-accent/5 mb-4 rounded-md border px-4 py-6">
          <div className="text-lg">No comments yet.</div>
          <p className="text-center text-lg">
            {isLoggedIn ? (
              <span className="font-medium">Be the first to comment!</span>
            ) : (
              <span>
                Log in to share your thoughts and engage with the community.
              </span>
            )}
          </p>
        </CardContent>
        {!isLoggedIn ? (
          <CardFooter>
            <Button className="mx-auto" onClick={() => void navigate("/auth")}>
              Log in
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
};

export default NoCommentsYet;
