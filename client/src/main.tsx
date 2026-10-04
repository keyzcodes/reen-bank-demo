import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LandingPage from "./screens/LandingPage";
import RegisterPage from "./screens/RegisterPage";
import LoginPage from "./screens/LoginPage";
import EmailVerificationPage from "./screens/EmailVerificationPage";
import "./index.css";

// ROUTES: Public entry pages and the login-protected dashboard.
function renderPage() {
  switch (window.location.pathname) {
    case "/":
    case "/landing":
      return <LandingPage />;

    case "/register":
      return <RegisterPage />;

    case "/login":
      return <LoginPage />;

    case "/verify-email":
      return <EmailVerificationPage />;

    case "/dashboard":
      return <App />;

    default:
      return <LandingPage />;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>{renderPage()}</React.StrictMode>,
);