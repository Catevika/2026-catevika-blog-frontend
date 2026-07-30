import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import NoCommentsYet from "@/components/NoCommentsYet";
import { renderWithProvider } from "../utils/renderWithProvider";

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
  CardContent: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  CardFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn((_path: string) => {}),
  };
});

afterEach(() => {
  cleanup(); // Clear DOM after each test
});

describe("NoCommentsYet", () => {
  it("should render correctly when not logged in", () => {
    renderWithProvider(<NoCommentsYet isLoggedIn={false} />);

    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  it("should render 'Join the conversation' title", () => {
    renderWithProvider(<NoCommentsYet isLoggedIn={false} />);

    expect(screen.getByText("Join the conversation")).toBeInTheDocument();
  });

  it("should show login prompt when user is not logged in", () => {
    renderWithProvider(<NoCommentsYet isLoggedIn={false} />);

    expect(
      screen.getByText(
        "Log in to share your thoughts and engage with the community.",
      ),
    ).toBeInTheDocument();
  });

  it("should show 'Be the first to comment!' when user is logged in", () => {
    renderWithProvider(<NoCommentsYet isLoggedIn={true} />);

    expect(screen.getByText("Be the first to comment!")).toBeInTheDocument();
  });

  it("should show Log in button when user is not logged in", () => {
    renderWithProvider(<NoCommentsYet isLoggedIn={false} />);

    expect(screen.getByText("Log in")).toBeInTheDocument();
  });

  it("should not show Log in button when user is logged in", () => {
    renderWithProvider(<NoCommentsYet isLoggedIn={true} />);

    expect(screen.queryByText("Log in")).not.toBeInTheDocument();
  });

  it("should have aria-live attribute", () => {
    const { container } = renderWithProvider(
      <NoCommentsYet isLoggedIn={false} />,
    );

    const div = container.querySelector("div[aria-live='polite']");
    expect(div).toBeInTheDocument();
  });
});
