import { createBrowserRouter } from "react-router";
import InitializeAuth from "@/components/InitializeAuth";

import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Layout from "@/layout/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PostEdit from "@/pages/PostEdit";

export const router = createBrowserRouter([
  {
    element: <InitializeAuth />, // runs on every load />,
    children: [
      {
        element: <Layout />, // runs on every load />,
        children: [
          // PUBLIC ROUTES
          { path: "/", element: <Dashboard /> },
          { path: "/auth", element: <Auth /> },
          // PROTECTED
          {
            element: <ProtectedRoute />,
            children: [{ path: "/posts/new", element: <PostEdit /> }],
          },
        ],
      },
    ],
  },
]);
