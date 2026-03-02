"use client";

import { ApprovalItem } from "@/types/approvals";

interface ApprovalQueueProps {
  approvals: ApprovalItem[];
  selectedAppId?: number;
  onSelect: (app: ApprovalItem) => void;
}

export default function ApprovalQueue({
  approvals,
  selectedAppId,
  onSelect,
}: ApprovalQueueProps) {
  return (
    <div
      className="w-full lg:w-72 flex-shrink-0 rounded-2xl p-4"
      style={{
        background: "#ffffff",
        border: "1px solid #e8edf3",
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        fontFamily: "'Geist', 'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Awaiting My Approval
        </h2>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "#f1f5f9", color: "#64748b" }}
        >
          {approvals.length}
        </span>
      </div>

      <ul className="space-y-2">
        {approvals.map((app) => {
          const isSelected = selectedAppId === app.id;
          const isBreached = app.isSlaBreached;

          return (
            <li
              key={app.id}
              onClick={() => onSelect(app)}
              className="p-3.5 rounded-xl cursor-pointer transition-all duration-150"
              style={{
                background: isSelected
                  ? "linear-gradient(135deg, #eef2ff, #f5f3ff)"
                  : isBreached
                    ? "#fff8f8"
                    : "#f8fafc",
                border: isSelected
                  ? "1px solid #c7d2fe"
                  : isBreached
                    ? "1px solid #fecaca"
                    : "1px solid transparent",
                boxShadow: isSelected
                  ? "0 1px 8px rgba(99,102,241,0.1)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.background = isBreached
                    ? "#fff1f1"
                    : "#f1f5f9";
                  (e.currentTarget as HTMLElement).style.border = isBreached
                    ? "1px solid #fca5a5"
                    : "1px solid #e2e8f0";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.background = isBreached
                    ? "#fff8f8"
                    : "#f8fafc";
                  (e.currentTarget as HTMLElement).style.border = isBreached
                    ? "1px solid #fecaca"
                    : "1px solid transparent";
                }
              }}
            >
              {/* Title row */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: isSelected
                      ? "#4f46e5"
                      : isBreached
                        ? "#b91c1c"
                        : "#1e293b",
                  }}
                >
                  Request #{app.requestId}
                </span>
                <span
                  className="text-xs font-medium px-1.5 py-0.5 rounded"
                  style={{
                    background: isSelected ? "#e0e7ff" : "#f1f5f9",
                    color: isSelected ? "#4f46e5" : "#94a3b8",
                  }}
                >
                  v{app.version}
                </span>
              </div>

              {/* Value row */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Value</span>
                <span
                  className="text-xs font-bold"
                  style={{
                    color: isSelected ? "#4f46e5" : "#334155",
                    fontFamily: "'DM Mono', 'Courier New', monospace",
                  }}
                >
                  ${Number(app.request?.totalValue || 0).toFixed(2)}
                </span>
              </div>

              {/* SLA Breached badge */}
              {isBreached && (
                <div
                  className="flex items-center gap-1.5 mt-2.5 px-2 py-1 rounded-lg w-fit text-xs font-semibold"
                  style={{ background: "#fee2e2", color: "#dc2626" }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "#ef4444" }}
                  />
                  SLA Breached · 48h
                </div>
              )}
            </li>
          );
        })}

        {approvals.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-10 rounded-xl text-center"
            style={{ border: "1px dashed #e2e8f0" }}
          >
            <div className="text-2xl mb-2">✅</div>
            <p className="text-sm font-medium text-slate-600">All caught up!</p>
            <p className="text-xs text-slate-400 mt-0.5">
              No pending approvals
            </p>
          </div>
        )}
      </ul>
    </div>
  );
}
