"use client";

import { useState } from "react";
import { ApprovalItem, GhostDiffData } from "@/types/approvals";
import { toast } from "sonner";

interface ReviewPanelProps {
  selectedApp: ApprovalItem | null;
  diff: GhostDiffData | null;
  onDecision: (decision: "APPROVE" | "REJECT", comment: string) => void;
}

export default function ReviewPanel({
  selectedApp,
  diff,
  onDecision,
}: ReviewPanelProps) {
  const [comment, setComment] = useState("");

  const handleAction = (decision: "APPROVE" | "REJECT") => {
    if (decision === "REJECT" && !comment.trim()) {
      return toast.info("A comment is strictly required to reject a request.");
    }
    onDecision(decision, comment);
    setComment("");
  };

  if (!selectedApp) {
    return (
      <div
        className="w-full flex-1 rounded-2xl flex flex-col items-center justify-center py-24 text-center px-6"
        style={{
          background: "#ffffff",
          border: "1px solid #e8edf3",
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          minHeight: "420px",
          fontFamily: "'Geist', 'Plus Jakarta Sans', 'Segoe UI', sans-serif",
        }}
      >
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
          style={{ background: "#f1f5f9" }}
        >
          📋
        </div>
        <p className="text-base font-semibold text-slate-700">
          No Request Selected
        </p>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">
          Select an item from your queue to review.
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-full flex-1 rounded-2xl p-6 md:p-7"
      style={{
        background: "#ffffff",
        border: "1px solid #e8edf3",
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        minHeight: "420px",
        fontFamily: "'Geist', 'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Panel Header */}
      <div
        className="flex flex-wrap justify-between items-start gap-4 pb-5 mb-6"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-md"
              style={{ background: "#eef2ff", color: "#4f46e5" }}
            >
              #{selectedApp.requestId}
            </span>
            <h2 className="text-lg font-bold text-slate-800">Review Request</h2>
          </div>
          <p className="text-sm text-slate-400">
            Review line items and pricing changes before deciding.
          </p>
        </div>

        {/* Total Value */}
        <div
          className="flex flex-col items-end px-4 py-3 rounded-xl"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
            Total Requested
          </span>
          <span
            className="text-2xl font-bold"
            style={{
              color: "#1e293b",
              fontFamily: "'DM Mono', 'Courier New', monospace",
            }}
          >
            ${Number(selectedApp.request?.totalValue || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Items Table */}
      <div
        className="mb-5 rounded-xl overflow-hidden"
        style={{ border: "1px solid #e8edf3" }}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              style={{
                background: "#f8fafc",
                borderBottom: "1px solid #e8edf3",
              }}
            >
              <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Item Description
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right w-36">
                Actual Price
              </th>
            </tr>
          </thead>
          <tbody>
            {selectedApp.request?.items?.map((item, index) => (
              <tr
                key={item.id || index}
                style={{
                  background: index % 2 === 0 ? "#ffffff" : "#fafafa",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <td className="py-3.5 px-4 text-sm font-medium text-slate-700">
                  {item.description}
                </td>
                <td
                  className="py-3.5 px-4 text-sm text-right font-bold"
                  style={{
                    color: "#334155",
                    fontFamily: "'DM Mono', 'Courier New', monospace",
                  }}
                >
                  ${Number(item.actualPrice || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ghost Diff */}
      {diff?.diff?.items?.length ? (
        <div
          className="rounded-xl p-4 mb-5"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Ghost Diff
            </h3>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-md"
              style={{
                background: "#eef2ff",
                color: "#4f46e5",
                border: "1px solid #c7d2fe",
              }}
            >
              Changes from v{diff.currentVersion - 1}
            </span>
          </div>

          <div className="space-y-2">
            {diff.diff.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center px-4 py-3 rounded-xl"
                style={{ background: "#ffffff", border: "1px solid #e8edf3" }}
              >
                <span className="text-sm font-medium text-slate-700">
                  {item.description}
                </span>
                <div
                  className="flex items-center gap-3 text-sm font-bold"
                  style={{ fontFamily: "'DM Mono', 'Courier New', monospace" }}
                >
                  <span
                    className="line-through px-2 py-0.5 rounded"
                    style={{ color: "#ef4444", background: "#fef2f2" }}
                  >
                    ${item.actualPrice.old}
                  </span>
                  <span style={{ color: "#cbd5e1" }}>→</span>
                  <span
                    className="px-2 py-0.5 rounded"
                    style={{ color: "#16a34a", background: "#f0fdf4" }}
                  >
                    ${item.actualPrice.new}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl mb-5 text-sm font-medium"
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#64748b",
          }}
        >
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0"
            style={{ background: "#eef2ff" }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: "#6366f1" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          This is the first version of this request. No previous pricing diffs
          exist.
        </div>
      )}

      {/* Action Bar */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#f8fafc", border: "1px solid #e8edf3" }}
      >
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Manager Comments
        </label>
        <textarea
          placeholder="Add a comment (strictly required for rejections)..."
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 resize-none transition-all focus:outline-none mb-4"
          style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onFocus={(e) => {
            (e.currentTarget as HTMLElement).style.border = "1px solid #a5b4fc";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 0 3px rgba(165,180,252,0.2)";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLElement).style.border = "1px solid #e2e8f0";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleAction("APPROVE")}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150"
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              boxShadow: "0 2px 12px rgba(34,197,94,0.25)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 20px rgba(34,197,94,0.4)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.boxShadow =
                "0 2px 12px rgba(34,197,94,0.25)")
            }
          >
            ✓ Approve Request
          </button>
          <button
            onClick={() => handleAction("REJECT")}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              boxShadow: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#fee2e2";
              (e.currentTarget as HTMLElement).style.borderColor = "#fca5a5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#fef2f2";
              (e.currentTarget as HTMLElement).style.borderColor = "#fecaca";
            }}
          >
            ✕ Reject & Return to PE
          </button>
        </div>
      </div>
    </div>
  );
}
