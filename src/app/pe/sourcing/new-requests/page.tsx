"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { WorkflowAPI } from "@/lib/api";
import { toast } from "sonner";

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
}

export default function NewRequestsSourcing() {
  const [requests, setRequests] = useState<SourcingRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<SourcingRequest | null>(null);
  const [edits, setEdits] = useState<{
    [key: number]: { actualPrice: number };
  }>({});
  const [splitItems, setSplitItems] = useState<number[]>([]);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await WorkflowAPI.getIncomingRequests("SUBMITTED");
      setRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch new requests", error);
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
    if (!data?.actualPrice) return toast.error("Please enter a valid price.");
    try {
      await WorkflowAPI.updateSourcing(selectedReq.id, itemId, data);
      toast.success("Item sourcing updated!");
      fetchRequests();
    } catch {
      toast.error("Failed to update sourcing");
    }
  };

  const handleSplit = async () => {
    if (!selectedReq || splitItems.length === 0) return;
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/requests/${selectedReq.id}/split`,
        {
          itemIds: splitItems,
        },
      );
      toast.success("Items split into a new request!");
      setSplitItems([]);
      setSelectedReq(null);
      fetchRequests();
    } catch {
      toast.error("Failed to execute split.");
    }
  };

  const handleDispatch = async () => {
    if (!selectedReq) return;
    try {
      await WorkflowAPI.dispatchToApprovers(selectedReq.id, 2);
      toast.success("Successfully Dispatched to Approvers!");
      setSelectedReq(null);
      fetchRequests();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          "Failed to dispatch. Did you source all items?",
      );
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
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "#0f172a" }}
            >
              New Baskets
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review and source incoming requests before dispatching to
              approvers.
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
              {requests.length} pending
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Panel: Request Queue */}
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
              Queue
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
                  onClick={() => {
                    setSelectedReq(req);
                    setSplitItems([]);
                  }}
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
                  <div
                    className="text-sm font-semibold"
                    style={{ color: isSelected ? "#4f46e5" : "#1e293b" }}
                  >
                    #{req.id} — {req.title}
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span
                      className="text-xs font-medium px-1.5 py-0.5 rounded"
                      style={{
                        background: isSelected ? "#e0e7ff" : "#f1f5f9",
                        color: isSelected ? "#4f46e5" : "#94a3b8",
                      }}
                    >
                      v{req.version}
                    </span>
                    <span className="text-xs text-slate-400">
                      {req.items?.length || 0} items
                    </span>
                  </div>
                </li>
              );
            })}

            {requests.length === 0 && (
              <div
                className="text-center py-10 rounded-xl"
                style={{ border: "1px dashed #e2e8f0" }}
              >
                <div className="text-2xl mb-2">📭</div>
                <p className="text-sm font-medium text-slate-500">
                  No new requests
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Check back later
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
                      style={{ background: "#eef2ff", color: "#4f46e5" }}
                    >
                      #{selectedReq.id}
                    </span>
                    <h2 className="text-lg font-bold text-slate-800">
                      {selectedReq.title}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-400">
                    Source items or split them into a new basket.
                  </p>
                </div>
                <button
                  onClick={handleDispatch}
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
                  Dispatch to Approvers →
                </button>
              </div>

              {/* Split Banner */}
              {splitItems.length > 0 && (
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3 mb-5"
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                  }}
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
                    className="text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                    style={{ background: "#f59e0b", color: "#fff" }}
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
                        Actual Price
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-24">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReq.items?.map((item, idx) => {
                      const isSplit = splitItems.includes(item.id);
                      const isSaved = !!item.actualPrice;
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
                                background: isSaved ? "#f0fdf4" : "#eef2ff",
                                color: isSaved ? "#16a34a" : "#4f46e5",
                                border: isSaved
                                  ? "1px solid #bbf7d0"
                                  : "1px solid #e0e7ff",
                              }}
                              onMouseEnter={(e) => {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.background = isSaved
                                  ? "#dcfce7"
                                  : "#e0e7ff";
                              }}
                              onMouseLeave={(e) => {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.background = isSaved
                                  ? "#f0fdf4"
                                  : "#eef2ff";
                              }}
                            >
                              {isSaved ? "✓ Saved" : "Save"}
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
                📋
              </div>
              <p className="text-base font-semibold text-slate-700">
                No Request Selected
              </p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                Pick a request from the queue on the left to begin sourcing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
