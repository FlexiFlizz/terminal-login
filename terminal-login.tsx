"use client";

import { useState, useEffect, useRef } from "react";

interface TerminalLoginProps {
  /** Password to validate against */
  password?: string;
  /** Callback on successful login */
  onSuccess: () => void;
  /** Logo URL (clickable) */
  logoUrl?: string;
  /** Auto-lock timeout in minutes (0 = disabled) */
  autoLockMinutes?: number;
  /** Session storage key */
  sessionKey?: string;
  /** Custom logo SVG (replaces default S. logo) */
  customLogo?: React.ReactNode;
}

export function TerminalLogin({
  password = "acab1312",
  onSuccess,
  logoUrl = "https://solilok.fr",
  autoLockMinutes = 20,
  sessionKey = "authenticated",
  customLogo,
}: TerminalLoginProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleClick = () => inputRef.current?.focus();
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === password) {
      sessionStorage.setItem(sessionKey, "true");
      sessionStorage.setItem("lastActivity", Date.now().toString());
      onSuccess();
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 1000);
    }
  };

  const defaultLogo = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className="w-16 h-16 sm:w-20 sm:h-20"
    >
      <rect width="32" height="32" rx="4" fill="#111" />
      <text x="2" y="26" fontFamily="ui-monospace, monospace" fontSize="26" fontWeight="bold" fill="#fff">S</text>
      <text x="18" y="26" fontFamily="ui-monospace, monospace" fontSize="26" fontWeight="bold" fill="#666">.</text>
    </svg>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace",
      }}
    >
      <style>{`
        @keyframes terminal-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .terminal-cursor-blink {
          animation: terminal-blink 1s infinite;
        }
      `}</style>

      {/* Logo */}
      <a
        href={logoUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ marginBottom: "2rem", transition: "opacity 0.2s", textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        onClick={(e) => e.stopPropagation()}
      >
        {customLogo || defaultLogo}
      </a>

      {/* Terminal prompt */}
      <form onSubmit={handleSubmit} style={{ textAlign: "center" }}>
        <div style={{ fontSize: "1rem" }}>
          <span style={{ color: error ? "#ef4444" : "transparent", transition: "color 0.1s" }}>
            {error ? "Access denied" : "_"}
          </span>
          <span
            className="terminal-cursor-blink"
            style={{
              display: "inline-block",
              width: "12px",
              height: "24px",
              background: "#fff",
              verticalAlign: "middle",
            }}
          />
        </div>
        <input
          ref={inputRef}
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
          autoFocus
          autoComplete="off"
        />
      </form>
    </div>
  );
}

/**
 * Hook to manage terminal login session
 */
export function useTerminalAuth(sessionKey = "authenticated", autoLockMinutes = 20) {
  const [authenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAuth = sessionStorage.getItem(sessionKey) === "true";
    const lastActivity = parseInt(sessionStorage.getItem("lastActivity") || "0");
    const timeout = autoLockMinutes * 60 * 1000;

    if (isAuth && timeout > 0 && Date.now() - lastActivity > timeout) {
      sessionStorage.removeItem(sessionKey);
      sessionStorage.removeItem("lastActivity");
      setAuthenticated(false);
    } else if (isAuth) {
      setAuthenticated(true);
    }
    setIsLoading(false);
  }, [sessionKey, autoLockMinutes]);

  // Auto-lock timer
  useEffect(() => {
    if (!authenticated || autoLockMinutes <= 0) return;

    const timeout = autoLockMinutes * 60 * 1000;
    const updateActivity = () => sessionStorage.setItem("lastActivity", Date.now().toString());
    const checkTimeout = () => {
      const last = parseInt(sessionStorage.getItem("lastActivity") || "0");
      if (Date.now() - last > timeout) lock();
    };

    window.addEventListener("click", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("scroll", updateActivity);
    const interval = setInterval(checkTimeout, 60000);

    return () => {
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("scroll", updateActivity);
      clearInterval(interval);
    };
  }, [authenticated, autoLockMinutes, sessionKey]);

  const lock = () => {
    sessionStorage.removeItem(sessionKey);
    sessionStorage.removeItem("lastActivity");
    setAuthenticated(false);
  };

  return { authenticated, isLoading, lock, onSuccess: () => setAuthenticated(true) };
}
