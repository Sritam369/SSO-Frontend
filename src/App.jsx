import { useEffect, useState } from "react";
import "./App.css";

const BACKEND_URL = "http://localhost:8047";

function getCookie(name) {
  const cookies = document.cookie.split(";");

  const cookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${name}=`)
  );

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(
    cookie.trim().substring(name.length + 1)
  );
}

function LoginPage() {
  const [providers, setProviders] = useState([]);
  const [showProviders, setShowProviders] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/public/providers`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch providers");
        }

        return response.json();
      })
      .then((data) => {
        setProviders(data.providers || []);
      })
      .catch((error) => {
        console.error("Error fetching providers:", error);
        setError("Unable to load login providers.");
      });
  }, []);

  const handleSSOClick = () => {
    setShowProviders((previousValue) => !previousValue);
    setError("");
  };

  const handleLogin = (providerId) => {
    if (!providerId) {
      return;
    }

    setLoading(true);

    window.location.assign(
      `${BACKEND_URL}/api/public/login/sso/${providerId}`
    );
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand">
          <div className="brand-logo">
            S
          </div>

          <span>
            SSO Portal
          </span>
        </div>

        <div className="login-content">
          <h1>
            Welcome
          </h1>

          <p className="subtitle">
            Sign in securely using your
            organization account
          </p>

          <button
            type="button"
            className="sso-button"
            onClick={handleSSOClick}
            disabled={loading}
          >
            {loading
              ? "Redirecting..."
              : showProviders
                ? "Hide Providers"
                : "Continue with SSO"}
          </button>

          {showProviders && (
            <div className="provider-section">
              <div className="provider-title">
                Choose your provider
              </div>

              {providers.length === 0 &&
                !error && (
                  <div className="loading">
                    Loading providers...
                  </div>
                )}

              {providers.map((provider) => (
                <button
                  type="button"
                  key={provider.provider}
                  className="provider-button"
                  onClick={() =>
                    handleLogin(provider.provider)
                  }
                  disabled={loading}
                >
                  <div className="provider-icon">
                    {provider.provider
                      ? provider.provider
                          .charAt(0)
                          .toUpperCase()
                      : "?"}
                  </div>

                  <div className="provider-info">
                    <span className="provider-name">
                      Continue with {provider.providerName}
                    </span>
                  </div>

                  <span className="arrow">
                    →
                  </span>
                </button>
              ))}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="login-footer">
          Secure Single Sign-On
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const email = getCookie("userEmail");
  const provider = getCookie("loginProvider");

  const providerNames = {
    google: "Google",
    azure: "Azure",
    aws: "AWS",
    github: "GitHub"
  };

  const providerName =
    providerNames[provider] ||
    provider ||
    "SSO";

  const handleLogout = () => {
    document.cookie =
      "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    document.cookie =
      "loginProvider=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    window.location.assign("/");
  };

  return (
    <div className="dashboard-page">
      <main className="dashboard-content">
        <div className="welcome-card">
          <div className="success-icon">
            ✓
          </div>

          <h1>
            Welcome!
          </h1>

          {email ? (
            <>
              <p className="dashboard-subtitle">
                You have successfully
                signed in using{" "}
                <strong>
                  {providerName}
                </strong>.
              </p>

              <div className="email-box">
                <span className="email-label">
                  EMAIL
                </span>

                <span className="email-value">
                  {email}
                </span>
              </div>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <p className="dashboard-subtitle">
              Email information is not
              available.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  const currentPath =
    window.location.pathname;

  const email =
    getCookie("userEmail");

  if (
    currentPath === "/dashboard" &&
    email
  ) {
    return <Dashboard />;
  }

  return <LoginPage />;
}

export default App;