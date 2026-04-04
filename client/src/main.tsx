import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

const queryClient = new QueryClient();
import Layout from "@/components/layout";
import AdminRoute from "@/components/admin-route";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import UsersPage from "@/pages/users";
import TicketsPage from "@/pages/tickets";
import TicketDetailPage from "@/pages/ticket-detail";

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
        path: "/tickets",
        element: <TicketsPage />,
      },
      {
        path: "/tickets/:id",
        element: <TicketDetailPage />,
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
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
