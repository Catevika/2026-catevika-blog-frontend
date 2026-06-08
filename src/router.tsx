import InitializeAuth from "@/components/InitializeAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/layout/Layout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Feed from "@/pages/Feed";
import PostEdit from "@/pages/PostEdit";
import PostExport from "@/pages/PostExport";
import PostList from "@/pages/PostList";
import PostView from "@/pages/PostView";
import Trending from "@/pages/Trending";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    element: <InitializeAuth />, // runs on every load />,
    children: [
      // Export route without Layout (for PDF generation)
      { path: "/export/:id", element: <PostExport /> },
      {
        element: <Layout />, // runs on every load />,
        children: [
          // PUBLIC ROUTES
          { path: "/", element: <Dashboard /> },
          { path: "/posts", element: <PostList /> },
          { path: "/posts/favorites", element: <Trending /> },
          { path: "/posts/feed", element: <Feed /> },
          { path: "/posts/:postId", element: <PostView /> },
          { path: "/auth", element: <Auth /> },
          // PROTECTED
          {
            element: <ProtectedRoute />,
            children: [
              { path: "/posts/new", element: <PostEdit /> },
              { path: "/posts/:id/edit", element: <PostEdit /> },
              { path: "/posts/trash", element: <PostEdit /> },
            ],
          },
        ],
      },
    ],
  },
]);
