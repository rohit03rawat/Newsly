import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const Navbar: React.FC = () => {
  const { isAuthenticated, isLoading, logout, username } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    localStorage.getItem("news_theme") === "dark" ? "dark" : "light",
  );
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("news_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAccountMenuOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  const handleLogout = async () => {
    setIsAccountMenuOpen(false);
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">NewsApp</Link>
      </div>
      <div className="navbar-links">
        {!isLoading && isAuthenticated ? (
          <>
            <Link to="/news">News</Link>
            <div className="navbar-account" ref={accountMenuRef}>
              <button
                type="button"
                className="navbar-account-trigger"
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                aria-controls="navbar-account-menu"
                onClick={() => setIsAccountMenuOpen((open) => !open)}
              >
                <span className="navbar-account-name">
                  {username || "Account"}
                </span>
                <span className="navbar-account-chevron" aria-hidden="true" />
              </button>
              {isAccountMenuOpen && (
                <div
                  className="navbar-account-menu"
                  id="navbar-account-menu"
                  role="menu"
                >
                  <button type="button" role="menuitem" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : !isLoading ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        ) : null}
        <button
          type="button"
          className="navbar-theme-toggle"
          aria-label={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
          title={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
          onClick={() =>
            setTheme((current) => (current === "light" ? "dark" : "light"))
          }
        >
          {theme === "light" ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.1 13.1A8.5 8.5 0 0 1 10.9 3a8.5 8.5 0 1 0 9.2 10.1Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m17.1 7.1-1.4-1.4M6.3 6.3 4.9 4.9m14.2 0-1.4 1.4m-11.4 11.4-1.4 1.4" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
