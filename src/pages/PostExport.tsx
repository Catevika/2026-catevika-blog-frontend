import { getPost } from "@/api/postApi";
import AuthorForPost from "@/components/AuthorForPost";
import PostContent from "@/components/PostContent";
import { Card, CardHeader } from "@/components/ui/card";
import type { SerializedPost } from "@/types";
import { formatDate } from "@/utils/formatDate";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function PostExport() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<SerializedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError("No post ID provided");
        setLoading(false);
        return;
      }

      try {
        const fetchedPost = await getPost(id);
        setPost(fetchedPost);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    void fetchPost();
  }, [id]);

  useEffect(() => {
    const el = document.getElementById("post-content");
    if (!el) return;

    el.classList.remove("dark");
    el.setAttribute("data-color-mode", "light");
  }, []);

  // Force light theme on html element
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Remove dark/light classes
    html.classList.remove("light", "dark");
    body.classList.remove("light", "dark");

    // Add light class and data-color-mode
    html.classList.add("light");
    html.setAttribute("data-color-mode", "light");
    html.style.colorScheme = "light";

    body.setAttribute("data-color-mode", "light");
    body.style.colorScheme = "light";

    return () => {
      html.classList.remove("light");
      html.removeAttribute("data-color-mode");
      html.style.colorScheme = "";
      body.removeAttribute("data-color-mode");
      body.style.colorScheme = "";
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error ?? "Post not found"}</p>
      </div>
    );
  }

  return (
    <div
      id="post-export"
      className="bg-background text-foreground container mx-auto px-4 py-8"
    >
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <div className="text-muted-foreground mt-4 text-sm">
            <AuthorForPost post={post} />
            {post.createdAt && (
              <p>Published: {formatDate(new Date(post.createdAt))}</p>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card className="mt-6 w-full">
        <div
          id="post-content"
          className="prose-sm prose max-w-none"
          data-color-mode="light"
        >
          <PostContent content={post.content} />
        </div>
      </Card>

      {/* 
        Signal to Puppeteer that the page is ready for PDF generation.
        Backend checks for this element before calling page.pdf()
      */}
      <div id="export-ready" style={{ display: "none" }}></div>
    </div>
  );
}
