"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WorkflowAPI } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {

      // 1. Capture the response from your backend
      const res = await WorkflowAPI.login({ email, password });
      // 2. Extract the role (Adjust 'res.data.user.role' to match your actual backend JSON structure)
      const userRole = res.data.data.user.role;

      // 3. Define a map of roles to their specific dashboard routes
      const roleRoutes: Record<string, string> = {
        DH: "/dh", 
        PE: "/pe", 
        HR: "/hr", 
        FM: "/db",
        OM: "/db", 
        CEO: "/db", 
      };

      // 4. Find the correct route, or fallback to a default if the role isn't mapped
      const destination = roleRoutes[userRole] || "/";

      // 5. Redirect the user!
      router.push(destination);
    } catch (err: unknown) {
      setError("Invalid credentials. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // The shared input style from our other components
  const inputStyles =
    "w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-blue-300 text-blue-900 bg-white";

  return (
    <div className="min-h-screen bg-blue-50/50 flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <div className="flex justify-center items-center w-16 h-16 bg-blue-600 rounded-2xl shadow-md mx-auto mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-blue-950">Procurement Portal</h1>
        <p className="text-blue-600 mt-2">Sign in to manage your workflow.</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-blue-100">
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">
              Work Email
            </label>
            <input
              type="email"
              placeholder="you@company.com"
              className={inputStyles}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-blue-900">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className={inputStyles}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>



          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-4 py-3.5 rounded-lg font-bold text-base hover:bg-blue-700 shadow-md focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>


    </div>
  );
}
