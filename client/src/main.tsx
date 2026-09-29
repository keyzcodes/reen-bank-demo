import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LandingPage from "./screens/LandingPage";
import RegisterPage from "./screens/RegisterPage";
import LoginPage from "./screens/LoginPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {window.location.pathname === "/landing" ? (
  <LandingPage />
) : window.location.pathname === "/register" ? (
  <RegisterPage />
) : window.location.pathname === "/login" ? (
  <LoginPage />
) : (
  <App />
)}
  </React.StrictMode>,
);