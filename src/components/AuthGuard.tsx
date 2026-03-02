"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkflowAPI } from "@/lib/api";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await WorkflowAPI.me();
        setLoading(false);
      } catch (err) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <p className="animate-pulse">Loading secure session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
