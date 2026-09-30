import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LandingPage from "./screens/LandingPage";
import RegisterPage from "./screens/RegisterPage";
import LoginPage from "./screens/LoginPage";
import EmailVerificationPage from "./screens/EmailVerificationPage";
import "./index.css";

function renderPage() {
  switch (window.location.pathname) {
    case "/landing":
      return <LandingPage />;

    case "/register":
      return <RegisterPage />;

    case "/login":
      return <LoginPage />;

    case "/verify-email":
      return <EmailVerificationPage />;

    default:
      return <App />;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>{renderPage()}</React.StrictMode>,
);