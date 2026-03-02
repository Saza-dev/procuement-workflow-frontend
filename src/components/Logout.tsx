"use client";

import axios from "axios";
import { useRouter } from "next/navigation";

export const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`,
        {},
        { withCredentials: true },
      );
      router.push("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150"
      style={{
        background: "transparent",
        color: "#ef4444",
        fontFamily: "'Geist', 'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#fef2f2";
        (e.currentTarget as HTMLElement).style.color = "#dc2626";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.color = "#ef4444";
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#fee2e2";
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#fef2f2";
      }}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150"
        style={{ background: "#fef2f2" }}
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
          <polyline points="10 12 14 8 10 4" />
          <line x1="14" y1="8" x2="6" y2="8" />
        </svg>
      </span>
      Logout
    </button>
  );
};
