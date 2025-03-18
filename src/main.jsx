import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './authContext/context.jsx';
import ErrorPage from './components/ErrorPage.jsx'
import Login from './components/Login.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import Register from './components/Register.jsx';
import AlertPage from './components/AlertPage.jsx';
import UnLogged from './components/UnLogged.jsx';
import Room from './components/Room.jsx';
import CreateRoom from './components/CreateRoom.jsx';
import UpdateRoom from './components/UpdateRoom.jsx';
import Profile from './components/Profile.jsx';
import EditProfile from './components/EditProfile.jsx';
import BrowseTopics from './components/BrowseTopics.jsx';
import ActivityFeed from './components/ActivityFeed.jsx';
import ResetPassword from './components/ResetPassword.jsx';
// import RoomFeed from './components/RoomFeed.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "feed",
    element: <UnLogged />,
    errorElement: <ErrorPage />,
  },
  {
    path: "login",
    element: <Login />,
    errorElement: <ErrorPage />
  },
  {
    path: "forgot-password",
    element: <ForgotPassword />,
    errorElement: <ErrorPage />
  },
  {
    path: "reset-password",
    element: <ResetPassword />,
    errorElement: <ErrorPage />
  },
  {
    path: "register",
    element: <Register />,
    errorElement: <ErrorPage />
  },
  {
    path: "alert-page",
    element: <AlertPage />,
    errorElement: <ErrorPage />
  },
  {
    path: "room/:id",
    element: <Room />,
    errorElement: <ErrorPage />
  },
  {
    path: "create-room",
    element: <CreateRoom />,
    errorElement: <ErrorPage />
  },
  {
    path: "update-room/:id",
    element: <UpdateRoom />,
    errorElement: <ErrorPage />
  },
  {
    path: "profile/:id",
    element: <Profile />,
    errorElement: <ErrorPage />
  },
  {
    path: "update-profile/:id",
    element: <EditProfile />,
    errorElement: <ErrorPage />
  },
  {
    path: "topics",
    element: <BrowseTopics />,
    errorElement: <ErrorPage />
  },
  {
    path: "activities",
    element: <ActivityFeed />,
    errorElement: <ErrorPage />
  },
]);

// Create a QueryClient instance
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </QueryClientProvider>
);
