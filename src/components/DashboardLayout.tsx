"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { LogoutButton } from "./Logout";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  userRole?: string;
}

export default function DashboardLayout({
  children,
  navItems,
  userRole = "Dashboard",
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{
        background: "#f5f7fa",
        fontFamily: "'Geist', 'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{
            background: "rgba(15,23,42,0.35)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 flex-col transition-transform duration-300 lg:static lg:flex lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0 flex" : "-translate-x-full"
        }`}
        style={{
          background: "#ffffff",
          borderRight: "1px solid #e8edf3",
          boxShadow: "4px 0 24px rgba(0,0,0,0.04)",
        }}
      >
        {/* Sidebar Header */}
        <div
          className="flex h-16 items-center justify-between px-6"
          style={{ borderBottom: "1px solid #eef1f6" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              <span className="text-white text-xs font-bold">
                {userRole.charAt(0).toUpperCase()}
              </span>
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: "#1e293b", letterSpacing: "-0.01em" }}
            >
              {userRole}
            </span>
          </div>
          <button
            className="lg:hidden rounded-md p-1 transition-colors"
            style={{ color: "#94a3b8" }}
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Label */}
        <div className="px-6 pt-5 pb-2">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#94a3b8", letterSpacing: "0.1em" }}
          >
            Menu
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #eef2ff, #f5f3ff)"
                    : "transparent",
                  color: isActive ? "#4f46e5" : "#64748b",
                  fontWeight: isActive ? 600 : 450,
                  boxShadow: isActive
                    ? "inset 0 0 0 1px rgba(99,102,241,0.15)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background =
                      "#f8fafc";
                    (e.currentTarget as HTMLElement).style.color = "#334155";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#64748b";
                  }
                }}
              >
                <span
                  style={{
                    color: isActive ? "#6366f1" : "#94a3b8",
                    transition: "color 0.15s",
                  }}
                >
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4" style={{ borderTop: "1px solid #eef1f6" }}>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header
          className="flex h-16 items-center justify-between px-5 sm:px-7"
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e8edf3",
            boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
          }}
        >
          <button
            className="lg:hidden rounded-lg p-2 transition-colors"
            style={{ color: "#64748b", background: "#f1f5f9" }}
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center justify-end gap-3">
            {/* Status pill */}
            <div
              className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: "#f0fdf4",
                color: "#16a34a",
                border: "1px solid #bbf7d0",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#22c55e" }}
              />
              Online
            </div>

            {/* Avatar */}
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
              }}
            >
              <User className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto p-5 sm:p-7 lg:p-9"
          style={{ background: "#f5f7fa" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
