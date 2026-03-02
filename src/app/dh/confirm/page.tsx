"use client";

import { useState, useEffect } from "react";
import { WorkflowAPI } from "@/lib/api";

interface AssetItem {
  id: number;
  description: string;
  quantity: number;
  assetId: string;
  condition: string;
}

interface HandedOverRequest {
  id: number;
  title: string;
  items: AssetItem[];
}

export default function ConfirmReceiptDashboard() {
  const [requests, setRequests] = useState<HandedOverRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<HandedOverRequest | null>(
    null,
  );

  const fetchHandedOverRequests = async () => {
    try {
      const res = await WorkflowAPI.getHandedOverRequests();
      setRequests(res.data);
    } catch (error: unknown) {
      console.error("Failed to fetch handed over requests", error);
    }
  };

  useEffect(() => {
    fetchHandedOverRequests();
  }, []);

  const handleConfirm = async () => {
    if (!selectedReq) return;
    try {
      await WorkflowAPI.confirmReceipt(selectedReq.id, 1);
      alert("Receipt Confirmed! The workflow is officially DONE.");
      setSelectedReq(null);
      fetchHandedOverRequests();
    } catch (error: unknown) {
      console.error("Failed to confirm receipt", error);
      alert("Failed to confirm receipt");
    }
  };

  return (
    <div
      className="max-w-6xl mx-auto space-y-6"
      style={{
        fontFamily: "'Geist', 'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Page Header */}
      <div className="pb-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                }}
              >
                ✓
              </div>
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ color: "#0f172a" }}
              >
                Confirm Requests
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-0.5 ml-9">
              Review and acknowledge receipt of finalized items ready for
              pickup.
            </p>
          </div>
          {requests.length > 0 && (
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: "#eef2ff",
                color: "#4f46e5",
                border: "1px solid #c7d2fe",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#6366f1" }}
              />
              {requests.length} awaiting sign-off
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Panel */}
        <div
          className="w-full lg:w-72 flex-shrink-0 rounded-2xl p-4"
          style={{
            background: "#ffffff",
            border: "1px solid #e8edf3",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Ready for Pickup
            </h2>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#f1f5f9", color: "#64748b" }}
            >
              {requests.length}
            </span>
          </div>

          <ul className="space-y-2">
            {requests.map((req) => {
              const isSelected = selectedReq?.id === req.id;
              return (
                <li
                  key={req.id}
                  onClick={() => setSelectedReq(req)}
                  className="p-3.5 rounded-xl cursor-pointer transition-all duration-150"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, #eef2ff, #f5f3ff)"
                      : "#f8fafc",
                    border: isSelected
                      ? "1px solid #c7d2fe"
                      : "1px solid transparent",
                    boxShadow: isSelected
                      ? "0 1px 8px rgba(99,102,241,0.1)"
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background =
                        "#f1f5f9";
                      (e.currentTarget as HTMLElement).style.border =
                        "1px solid #e2e8f0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background =
                        "#f8fafc";
                      (e.currentTarget as HTMLElement).style.border =
                        "1px solid transparent";
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: isSelected ? "#4f46e5" : "#1e293b" }}
                    >
                      #{req.id} — {req.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: isSelected ? "#6366f1" : "#22c55e" }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: isSelected ? "#4f46e5" : "#16a34a" }}
                    >
                      Ready for you
                    </span>
                  </div>
                </li>
              );
            })}

            {requests.length === 0 && (
              <div
                className="flex flex-col items-center justify-center py-10 rounded-xl text-center"
                style={{ border: "1px dashed #e2e8f0" }}
              >
                <div className="text-2xl mb-2">🎉</div>
                <p className="text-sm font-medium text-slate-500">All clear!</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nothing awaiting pickup
                </p>
              </div>
            )}
          </ul>
        </div>

        {/* Right Panel */}
        <div
          className="w-full flex-1 rounded-2xl"
          style={{
            background: "#ffffff",
            border: "1px solid #e8edf3",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            minHeight: "420px",
          }}
        >
          {selectedReq ? (
            <div className="p-6 md:p-7">
              {/* Workspace Header */}
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
                      #{selectedReq.id}
                    </span>
                    <h2 className="text-lg font-bold text-slate-800">
                      Sign Off
                    </h2>
                  </div>
                  <p className="text-sm text-slate-400">
                    Verify the physical condition of assets below before
                    confirming.
                  </p>
                </div>
              </div>

              {/* Assets Table */}
              <div
                className="rounded-xl overflow-hidden mb-6"
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
                      <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-14 text-center">
                        Qty
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-36">
                        Asset ID
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">
                        Condition
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReq.items.map((item, idx) => (
                      <tr
                        key={item.id}
                        style={{
                          background: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <td className="py-3.5 px-4 text-sm font-medium text-slate-700">
                          {item.description}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold mx-auto"
                            style={{ background: "#eef2ff", color: "#4f46e5" }}
                          >
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-lg"
                            style={{
                              background: "#f1f5f9",
                              color: "#475569",
                              border: "1px solid #e2e8f0",
                              fontFamily: "'DM Mono', 'Courier New', monospace",
                            }}
                          >
                            {item.assetId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={
                              item.condition === "GOOD"
                                ? {
                                    background: "#f0fdf4",
                                    color: "#16a34a",
                                    border: "1px solid #bbf7d0",
                                  }
                                : {
                                    background: "#fef2f2",
                                    color: "#dc2626",
                                    border: "1px solid #fecaca",
                                  }
                            }
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                background:
                                  item.condition === "GOOD"
                                    ? "#22c55e"
                                    : "#ef4444",
                              }}
                            />
                            {item.condition}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Acknowledge Action Card */}
              <div
                className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl p-5"
                style={{ background: "#f8fafc", border: "1px solid #e8edf3" }}
              >
                <div>
                  <h3 className="font-semibold text-slate-800 mb-0.5">
                    Acknowledge Receipt
                  </h3>
                  <p className="text-sm text-slate-400">
                    By clicking confirm, you verify all items match the required
                    condition.
                  </p>
                </div>
                <button
                  onClick={handleConfirm}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 whitespace-nowrap"
                  style={{
                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                    boxShadow: "0 2px 12px rgba(34,197,94,0.3)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.boxShadow =
                      "0 4px 20px rgba(34,197,94,0.45)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.boxShadow =
                      "0 2px 12px rgba(34,197,94,0.3)")
                  }
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Confirm Receipt
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-24 text-center px-6">
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
                Select a request from the sidebar to view asset details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
