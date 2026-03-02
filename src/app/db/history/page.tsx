"use client";

import { useState } from "react";
import { WorkflowAPI } from "@/lib/api";

interface SnapshotData {
  totalEstValue?: number;
  totalActualValue?: number;
  [key: string]: unknown;
}

interface TimelineEvent {
  type: string;
  action?: string;
  timestamp: string;
  version?: number;
  actor?: string;
  role?: string;
  details?: string;
  data?: SnapshotData;
}

export default function HistoryDashboard() {
  const [searchId, setSearchId] = useState("");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been attempted

  const fetchHistory = async () => {
    if (!searchId) return;
    setLoading(true);
    setError("");
    setTimeline([]);
    setHasSearched(true);

    try {
      const res = await WorkflowAPI.getHistory(Number(searchId));
      setTimeline(res.data.timeline || []);
    } catch (err: unknown) {
      console.error(err);
      setError("Request not found or no history available.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to color-code timeline events dynamically
  const getEventConfig = (type: string, action?: string) => {
    if (type === "VERSION_SNAPSHOT") {
      return {
        dotStyle: { background: "#94a3b8", boxShadow: "0 0 0 4px #f1f5f9" },
        badgeStyle: {
          background: "#f1f5f9",
          color: "#475569",
          border: "1px solid #e2e8f0",
        },
        cardStyle: { background: "#f8fafc", border: "1px solid #e2e8f0" },
        textColor: "#475569",
      };
    }
    switch (action) {
      case "SUBMITTED":
      case "RESUBMITTED":
        return {
          dotStyle: {
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 0 0 4px #eef2ff",
          },
          badgeStyle: {
            background: "#eef2ff",
            color: "#4f46e5",
            border: "1px solid #c7d2fe",
          },
          cardStyle: { background: "#fafbff", border: "1px solid #e0e7ff" },
          textColor: "#3730a3",
        };
      case "APPROVED":
      case "FULLY_APPROVED":
        return {
          dotStyle: {
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            boxShadow: "0 0 0 4px #f0fdf4",
          },
          badgeStyle: {
            background: "#f0fdf4",
            color: "#16a34a",
            border: "1px solid #bbf7d0",
          },
          cardStyle: { background: "#fafffe", border: "1px solid #d1fae5" },
          textColor: "#166534",
        };
      case "REJECTED":
        return {
          dotStyle: {
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            boxShadow: "0 0 0 4px #fef2f2",
          },
          badgeStyle: {
            background: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
          },
          cardStyle: { background: "#fffafa", border: "1px solid #fecaca" },
          textColor: "#991b1b",
        };
      case "GUARDRAIL_TRIGGERED":
        return {
          dotStyle: {
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            boxShadow: "0 0 0 4px #fff7ed",
          },
          badgeStyle: {
            background: "#fff7ed",
            color: "#c2410c",
            border: "1px solid #fed7aa",
          },
          cardStyle: { background: "#fffbf5", border: "1px solid #fed7aa" },
          textColor: "#9a3412",
        };
      case "SPLIT":
        return {
          dotStyle: {
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            boxShadow: "0 0 0 4px #fffbeb",
          },
          badgeStyle: {
            background: "#fffbeb",
            color: "#b45309",
            border: "1px solid #fde68a",
          },
          cardStyle: { background: "#fffdf0", border: "1px solid #fde68a" },
          textColor: "#92400e",
        };
      case "PURCHASED":
      case "HANDED_OVER":
      case "CONFIRMED_RECEIPT":
      case "DONE":
        return {
          dotStyle: {
            background: "linear-gradient(135deg, #14b8a6, #0d9488)",
            boxShadow: "0 0 0 4px #f0fdfa",
          },
          badgeStyle: {
            background: "#f0fdfa",
            color: "#0f766e",
            border: "1px solid #99f6e4",
          },
          cardStyle: { background: "#fafffe", border: "1px solid #99f6e4" },
          textColor: "#134e4a",
        };
      default:
        return {
          dotStyle: { background: "#94a3b8", boxShadow: "0 0 0 4px #f8fafc" },
          badgeStyle: {
            background: "#f8fafc",
            color: "#64748b",
            border: "1px solid #e2e8f0",
          },
          cardStyle: { background: "#ffffff", border: "1px solid #e8edf3" },
          textColor: "#475569",
        };
    }
  };

  return (
    <div
      className="max-w-3xl mx-auto space-y-6"
      style={{
        fontFamily: "'Geist', 'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Page Header */}
      <div className="pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            #
          </div>
          <h1 className="text-xl font-bold text-slate-800">Request History</h1>
        </div>
        <p className="text-sm text-slate-500 mt-0.5 ml-9">
          Complete lifecycle, versions, and approvals for this request.
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchHistory();
        }}
        className="flex gap-3 mb-6"
      >
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Enter Request ID (e.g., 12345)"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
        />
        <button
          type="submit"
          disabled={loading || !searchId.trim()}
          className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 rounded-2xl text-center">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-slate-200 border-t-indigo-600 mb-4"></div>
          <p className="text-sm font-medium text-slate-500">
            Fetching history...
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-4"
          style={{ background: "#fff8f8", border: "1px solid #fecaca" }}
        >
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
            style={{ background: "#fee2e2" }}
          >
            <svg
              className="h-4 w-4"
              style={{ color: "#dc2626" }}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700 mt-1">{error}</p>
        </div>
      )}

      {/* Empty state (Only show if a search has been done, it's not loading, there's no error, and timeline is empty) */}
      {!loading && !error && hasSearched && timeline.length === 0 && (
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
            No history found
          </p>
          <p className="text-sm text-slate-400 mt-1">
            No audit events exist for this request yet.
          </p>
        </div>
      )}

      {/* Timeline */}
      {!loading && timeline.length > 0 && (
        <div
          className="rounded-2xl p-6 md:p-8 relative mt-6"
          style={{
            background: "#ffffff",
            border: "1px solid #e8edf3",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          }}
        >
          {/* Vertical line */}
          <div
            className="absolute top-10 bottom-10 w-px"
            style={{
              left: "2.75rem",
              background:
                "linear-gradient(to bottom, #c7d2fe, #e2e8f0, transparent)",
            }}
          />

          <div className="space-y-7">
            {timeline.map((event, index) => {
              const dateObj = new Date(event.timestamp);
              const dateStr = dateObj.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const timeStr = dateObj.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              });
              const cfg = getEventConfig(event.type, event.action);

              return (
                <div key={index} className="relative pl-14 group">
                  {/* Dot */}
                  <div
                    className="absolute left-6 top-4 h-3.5 w-3.5 rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-125"
                    style={{ ...cfg.dotStyle, transform: "translateX(-50%)" }}
                  />

                  {/* Card */}
                  <div
                    className="rounded-2xl p-4 transition-all duration-150"
                    style={{
                      ...cfg.cardStyle,
                      boxShadow: "0 1px 6px rgba(0,0,0,0.03)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 4px 16px rgba(0,0,0,0.07)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 1px 6px rgba(0,0,0,0.03)";
                    }}
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div
                        className="flex items-center gap-1.5 text-xs"
                        style={{
                          color: "#94a3b8",
                          fontFamily: "'DM Mono', 'Courier New', monospace",
                        }}
                      >
                        <span
                          className="font-semibold"
                          style={{ color: "#475569" }}
                        >
                          {dateStr}
                        </span>
                        <span>·</span>
                        <span>{timeStr}</span>
                      </div>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={cfg.badgeStyle}
                      >
                        {event.type === "VERSION_SNAPSHOT"
                          ? "System Snapshot"
                          : event.action?.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Version Snapshot content */}
                    {event.type === "VERSION_SNAPSHOT" ? (
                      <div>
                        <p
                          className="text-sm font-semibold flex items-center gap-2 mb-2.5"
                          style={{ color: cfg.textColor }}
                        >
                          <svg
                            className="w-4 h-4 opacity-60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                            />
                          </svg>
                          Version {event.version} Locked
                        </p>
                        <div
                          className="flex flex-col sm:flex-row gap-4 px-4 py-3 rounded-xl text-xs"
                          style={{
                            background: "rgba(255,255,255,0.7)",
                            border: "1px solid #e2e8f0",
                            fontFamily: "'DM Mono', 'Courier New', monospace",
                          }}
                        >
                          <div>
                            <span className="block text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">
                              Total Est.
                            </span>
                            <span className="font-bold text-slate-700">
                              $
                              {Number(event.data?.totalEstValue || 0).toFixed(
                                2,
                              )}
                            </span>
                          </div>
                          <div className="hidden sm:block w-px bg-slate-200" />
                          <div>
                            <span className="block text-slate-400 uppercase tracking-wider text-[10px] mb-0.5">
                              Total Actual
                            </span>
                            <span className="font-bold text-slate-700">
                              $
                              {Number(
                                event.data?.totalActualValue || 0,
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Action event content */
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: cfg.textColor }}
                          >
                            {event.actor}
                          </span>
                          {event.role && (
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: "rgba(255,255,255,0.6)",
                                color: cfg.textColor,
                                border: `1px solid currentColor`,
                                opacity: 0.8,
                              }}
                            >
                              {event.role}
                            </span>
                          )}
                        </div>
                        {event.details && (
                          <p
                            className="text-sm rounded-xl px-3 py-2.5 mt-1"
                            style={{
                              background: "rgba(255,255,255,0.55)",
                              border: "1px solid rgba(0,0,0,0.05)",
                              color: cfg.textColor,
                              opacity: 0.9,
                            }}
                          >
                            {event.details}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
