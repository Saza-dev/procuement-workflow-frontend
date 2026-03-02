"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { WorkflowAPI } from "@/lib/api";

interface Approval {
  id: number;
  role: string;
  status: string;
  comment: string | null;
}

interface SourcingItem {
  id: number;
  description: string;
  quantity: number;
  actualPrice?: number;
}

interface SourcingRequest {
  id: number;
  title: string;
  version: number;
  items: SourcingItem[];
  approvals?: Approval[];
}

export default function RevisionsSourcing() {
  const [requests, setRequests] = useState<SourcingRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<SourcingRequest | null>(null);
  const [edits, setEdits] = useState<{
    [key: number]: { actualPrice: number };
  }>({});
  const [splitItems, setSplitItems] = useState<number[]>([]);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await WorkflowAPI.getIncomingRequests(
        "REJECTED_REVISION_REQUIRED",
      );
      setRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch revision requests", error);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleEditChange = (itemId: number, value: number) => {
    setEdits((prev) => ({ ...prev, [itemId]: { actualPrice: value } }));
  };

  const saveSourcing = async (itemId: number) => {
    if (!selectedReq) return;
    const data = edits[itemId];
    if (!data?.actualPrice) return alert("Please enter a valid price.");
    try {
      await WorkflowAPI.updateSourcing(selectedReq.id, itemId, data);
      alert("Item pricing updated!");
      fetchRequests();
    } catch {
      alert("Failed to update sourcing");
    }
  };

  const handleSplit = async () => {
    if (!selectedReq || splitItems.length === 0) return;
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/requests/${selectedReq.id}/split`,
        { itemIds: splitItems },
        { withCredentials: true },
      );
      alert("Items split into a new request!");
      setSplitItems([]);
      setSelectedReq(null);
      fetchRequests();
    } catch {
      alert("Failed to execute split.");
    }
  };

  const handleResubmit = async () => {
    if (!selectedReq) return;
    try {
      await WorkflowAPI.resubmitRequest(selectedReq.id, 2);
      alert(
        `Successfully Resubmitted! Incrementing to Version ${selectedReq.version + 1}`,
      );
      setSelectedReq(null);
      fetchRequests();
    } catch {
      alert("Failed to resubmit request.");
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
      <div className="pb-5 border-b border-slate-100 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
              }}
            >
              !
            </div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "#0f172a" }}
            >
              Needs Revision
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5 ml-9">
            Fix pricing or split problematic items from rejected requests.
          </p>
        </div>
        {requests.length > 0 && (
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#ef4444" }}
            />
            {requests.length} action required
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Panel: Queue */}
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
              Action Required
            </h2>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
              }}
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
                  onClick={() => {
                    setSelectedReq(req);
                    setSplitItems([]);
                  }}
                  className="p-3.5 rounded-xl cursor-pointer transition-all duration-150"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, #eef2ff, #f5f3ff)"
                      : "#fff8f8",
                    border: isSelected
                      ? "1px solid #c7d2fe"
                      : "1px solid #fecaca",
                    boxShadow: isSelected
                      ? "0 1px 8px rgba(99,102,241,0.1)"
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background =
                        "#fff1f1";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "#fca5a5";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background =
                        "#fff8f8";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "#fecaca";
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: isSelected ? "#4f46e5" : "#b91c1c" }}
                    >
                      #{req.id} — {req.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: isSelected ? "#6366f1" : "#ef4444",
                        }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: isSelected ? "#4f46e5" : "#dc2626" }}
                      >
                        Revision Required
                      </span>
                    </div>
                    <span
                      className="text-xs font-medium px-1.5 py-0.5 rounded"
                      style={{
                        background: isSelected ? "#e0e7ff" : "#fee2e2",
                        color: isSelected ? "#4f46e5" : "#dc2626",
                      }}
                    >
                      v{req.version}
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
                <div className="text-2xl mb-2">✅</div>
                <p className="text-sm font-medium text-slate-500">All clear!</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  No revisions pending
                </p>
              </div>
            )}
          </ul>
        </div>

        {/* Right Panel: Workspace */}
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
            <div className="p-6">
              {/* Workspace Header */}
              <div
                className="flex flex-wrap gap-3 justify-between items-start mb-6 pb-5"
                style={{ borderBottom: "1px solid #f1f5f9" }}
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: "#fee2e2", color: "#dc2626" }}
                    >
                      #{selectedReq.id}
                    </span>
                    <h2 className="text-lg font-bold text-slate-800">
                      Revision Workspace
                    </h2>
                  </div>
                  <p className="text-sm text-slate-400">
                    Adjust pricing below or split items out to save the basket.
                  </p>
                </div>
                <button
                  onClick={handleResubmit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 2px 12px rgba(99,102,241,0.3)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.boxShadow =
                      "0 4px 20px rgba(99,102,241,0.45)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.boxShadow =
                      "0 2px 12px rgba(99,102,241,0.3)")
                  }
                >
                  Resubmit (v{selectedReq.version + 1}) →
                </button>
              </div>

              {/* Rejection Comment */}
              {(() => {
                const rejection = selectedReq.approvals?.find(
                  (a) => a.status === "REJECTED",
                );
                if (!rejection) return null;
                return (
                  <div
                    className="flex items-start gap-3 rounded-xl px-4 py-4 mb-5"
                    style={{
                      background: "#fff8f8",
                      border: "1px solid #fecaca",
                    }}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                      style={{ background: "#fee2e2" }}
                    >
                      <svg
                        className="w-4 h-4"
                        style={{ color: "#dc2626" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "#dc2626" }}
                        >
                          Rejected by {rejection.role}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {rejection.comment || "No comment provided."}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Split Banner */}
              {splitItems.length > 0 && (
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3 mb-5"
                  style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✂️</span>
                    <span className="text-sm font-semibold text-amber-800">
                      {splitItems.length} item
                      {splitItems.length !== 1 ? "s" : ""} selected for split
                    </span>
                  </div>
                  <button
                    onClick={handleSplit}
                    className="text-xs font-semibold px-4 py-2 rounded-lg text-white transition-all"
                    style={{ background: "#f59e0b" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "#d97706")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "#f59e0b")
                    }
                  >
                    Execute Split
                  </button>
                </div>
              )}

              {/* Items Table */}
              <div
                className="rounded-xl overflow-hidden"
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
                      <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-14">
                        Split
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Item Details
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-44">
                        Update Price
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReq.items?.map((item, idx) => {
                      const isSplit = splitItems.includes(item.id);
                      const isUpdated = !!edits[item.id]?.actualPrice;
                      return (
                        <tr
                          key={item.id}
                          style={{
                            background: isSplit
                              ? "#fffbeb"
                              : idx % 2 === 0
                                ? "#ffffff"
                                : "#fafafa",
                            borderBottom: "1px solid #f1f5f9",
                            transition: "background 0.15s",
                          }}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded cursor-pointer accent-indigo-500"
                              checked={isSplit}
                              onChange={(e) => {
                                e.target.checked
                                  ? setSplitItems([...splitItems, item.id])
                                  : setSplitItems(
                                      splitItems.filter((id) => id !== item.id),
                                    );
                              }}
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold flex-shrink-0"
                                style={{
                                  background: "#eef2ff",
                                  color: "#4f46e5",
                                }}
                              >
                                {item.quantity}x
                              </span>
                              <span className="text-sm font-medium text-slate-700">
                                {item.description}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                $
                              </span>
                              <input
                                type="number"
                                className="w-full pl-7 pr-3 py-2 rounded-lg text-sm text-slate-700 transition-all focus:outline-none"
                                placeholder="0.00"
                                style={{
                                  border: "1px solid #e2e8f0",
                                  background: "#f8fafc",
                                }}
                                value={
                                  edits[item.id]?.actualPrice ||
                                  item.actualPrice ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleEditChange(
                                    item.id,
                                    Number(e.target.value),
                                  )
                                }
                                onFocus={(e) => {
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.border = "1px solid #a5b4fc";
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.boxShadow =
                                    "0 0 0 3px rgba(165,180,252,0.2)";
                                }}
                                onBlur={(e) => {
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.border = "1px solid #e2e8f0";
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.boxShadow = "none";
                                }}
                              />
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => saveSourcing(item.id)}
                              className="w-full text-xs font-semibold px-3 py-2 rounded-lg transition-all"
                              style={{
                                background: isUpdated ? "#fef9c3" : "#eef2ff",
                                color: isUpdated ? "#854d0e" : "#4f46e5",
                                border: isUpdated
                                  ? "1px solid #fde68a"
                                  : "1px solid #e0e7ff",
                              }}
                              onMouseEnter={(e) => {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.background = isUpdated
                                  ? "#fef08a"
                                  : "#e0e7ff";
                              }}
                              onMouseLeave={(e) => {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.background = isUpdated
                                  ? "#fef9c3"
                                  : "#eef2ff";
                              }}
                            >
                              {isUpdated ? "✎ Update" : "Update"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-24 text-center px-6">
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                style={{ background: "#f1f5f9" }}
              >
                🔧
              </div>
              <p className="text-base font-semibold text-slate-700">
                No Request Selected
              </p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                Select a request from the queue to apply revisions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
