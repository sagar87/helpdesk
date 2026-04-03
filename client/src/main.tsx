import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Layout from "@/components/layout";
import AdminRoute from "@/components/admin-route";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import UsersPage from "@/pages/users";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        element: <AdminRoute />,
        children: [
          {
            path: "/users",
            element: <UsersPage />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
