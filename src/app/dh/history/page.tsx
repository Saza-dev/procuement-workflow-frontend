"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";

interface RequestHeader {
  id: number;
  title: string;
  justification: string | null;
  attachmentUrl: string | null;
  status: string;
  version: number;
  isUrgent: boolean;
  totalValue: string | null;
  invoiceNumber: string | null;
  requesterId: number;
  parentRequestId: number | null;
  createdAt: string;
  updatedAt: string;
}

const getStatusStyle = (status: string): React.CSSProperties => {
  switch (status) {
    case "SUBMITTED":
    case "PENDING_APPROVALS":
    case "FINANCE_RECHECK_REQUIRED":
      return {
        background: "#eef2ff",
        color: "#4f46e5",
        border: "1px solid #c7d2fe",
      };
    case "APPROVED":
    case "PURCHASED":
    case "HANDED_OVER":
    case "DONE":
      return {
        background: "#f0fdf4",
        color: "#16a34a",
        border: "1px solid #bbf7d0",
      };
    case "REJECTED_REVISION_REQUIRED":
      return {
        background: "#fef2f2",
        color: "#dc2626",
        border: "1px solid #fecaca",
      };
    case "DRAFT":
      return {
        background: "#f8fafc",
        color: "#64748b",
        border: "1px solid #e2e8f0",
      };
    default:
      return {
        background: "#f8fafc",
        color: "#64748b",
        border: "1px solid #e2e8f0",
      };
  }
};

const getTimelineDotStyle = (status: string): React.CSSProperties => {
  switch (status) {
    case "APPROVED":
    case "PURCHASED":
    case "HANDED_OVER":
    case "DONE":
      return {
        background: "linear-gradient(135deg, #22c55e, #16a34a)",
        boxShadow: "0 0 0 4px #f0fdf4",
      };
    case "REJECTED_REVISION_REQUIRED":
      return {
        background: "linear-gradient(135deg, #ef4444, #dc2626)",
        boxShadow: "0 0 0 4px #fef2f2",
      };
    case "DRAFT":
      return { background: "#94a3b8", boxShadow: "0 0 0 4px #f1f5f9" };
    default:
      return {
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        boxShadow: "0 0 0 4px #eef2ff",
      };
  }
};

export default function UserHistoryPage() {
  const [requests, setRequests] = useState<RequestHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/requests/history`,
          { withCredentials: true },
        );
        const sortedRequests = res.data.sort(
          (a: RequestHeader, b: RequestHeader) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        setRequests(sortedRequests);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div
          className="h-8 w-8 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#6366f1", borderRightColor: "#8b5cf6" }}
        />
      </div>
    );
  }

  return (
    <div
      className="max-w-3xl mx-auto space-y-6"
      style={{
        fontFamily: "'Geist', 'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Page Header */}
      <div className="pb-5 border-b border-slate-100 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              ⏱
            </div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "#0f172a" }}
            >
              My Requests
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5 ml-9">
            Track the current status and history of your submitted requests.
          </p>
        </div>
        {requests.length > 0 && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: "#f1f5f9", color: "#64748b" }}
          >
            {requests.length} total
          </span>
        )}
      </div>

      {requests.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-2xl text-center"
          style={{
            background: "#ffffff",
            border: "1px solid #e8edf3",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          }}
        >
          <div className="text-3xl mb-3">📭</div>
          <p className="text-base font-semibold text-slate-700">
            No requests yet
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Your submitted requests will appear here.
          </p>
        </div>
      ) : (
        <div className="relative ml-4 pb-8">
          {/* Timeline line */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px"
            style={{
              background:
                "linear-gradient(to bottom, #c7d2fe, #e2e8f0, transparent)",
            }}
          />

          <div className="space-y-5">
            {requests.map((req) => (
              <div key={req.id} className="relative pl-8">
                {/* Timeline dot */}
                <div
                  className="absolute -left-[7px] top-5 h-3.5 w-3.5 rounded-full flex-shrink-0"
                  style={getTimelineDotStyle(req.status)}
                />

                {/* Card */}
                <div
                  className="rounded-2xl p-5 cursor-pointer transition-all duration-150 group"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e8edf3",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.border =
                      "1px solid #c7d2fe";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 4px 20px rgba(99,102,241,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.border =
                      "1px solid #e8edf3";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 2px 12px rgba(0,0,0,0.04)";
                  }}
                  onClick={() => router.push(`/dh/history/${req.id}`)}
                >
                  {/* Top row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={getStatusStyle(req.status)}
                    >
                      {req.status.replace(/_/g, " ")}
                    </span>
                    {req.isUrgent && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: "#fef2f2",
                          color: "#dc2626",
                          border: "1px solid #fecaca",
                        }}
                      >
                        Urgent
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">
                      Updated{" "}
                      {format(new Date(req.updatedAt), "MMM dd, yyyy · h:mm a")}
                    </span>
                  </div>

                  {/* Title row */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                    <h3
                      className="text-base font-semibold transition-colors duration-150"
                      style={{ color: "#1e293b" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "#4f46e5")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "#1e293b")
                      }
                    >
                      Request #{req.id}: {req.title}
                      <span
                        className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{ background: "#f1f5f9", color: "#94a3b8" }}
                      >
                        v{req.version}
                      </span>
                    </h3>

                    <div className="flex-shrink-0 text-left sm:text-right">
                      <p className="text-xs text-slate-400 mb-0.5 uppercase tracking-wider font-semibold">
                        Value
                      </p>
                      <p
                        className="text-sm font-bold"
                        style={{
                          color: "#1e293b",
                          fontFamily: "'DM Mono', 'Courier New', monospace",
                        }}
                      >
                        ${Number(req.totalValue || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Justification */}
                  {req.justification && (
                    <div
                      className="rounded-xl px-4 py-3 text-sm"
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e8edf3",
                        color: "#64748b",
                      }}
                    >
                      <span
                        className="block text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: "#94a3b8" }}
                      >
                        Justification
                      </span>
                      {req.justification}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
