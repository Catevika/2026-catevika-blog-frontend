import InitializeAuth from "@/components/InitializeAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/layout/Layout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Feed from "@/pages/Feed";
import PostCreate from "@/pages/PostCreate";
import PostEdit from "@/pages/PostEdit";
import PostView from "@/pages/PostView";
import PostList from "@/pages/PostList";
import Trending from "@/pages/Trending";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    element: <InitializeAuth />, // runs on every load />,
    children: [
      {
        element: <Layout />, // runs on every load />,
        children: [
          // PUBLIC ROUTES
          { path: "/", element: <Dashboard /> },
          { path: "/posts", element: <PostList /> },
          { path: "/posts/favorites", element: <Trending /> },
          { path: "/posts/feed", element: <Feed /> },
          { path: "/posts/:id", element: <PostView /> },
          { path: "/auth", element: <Auth /> },
          // PROTECTED
          {
            element: <ProtectedRoute />,
            children: [
              { path: "/posts/new", element: <PostCreate /> },
              { path: "/posts/:id/edit", element: <PostEdit /> },
              { path: "/posts/trash", element: <PostEdit /> },
            ],
          },
        ],
      },
    ],
  },
]);
