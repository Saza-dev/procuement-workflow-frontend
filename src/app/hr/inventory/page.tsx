"use client";

import { useState, useEffect, useCallback } from "react";
import { WorkflowAPI } from "@/lib/api";

interface InventoryItem {
  id: number;
  description: string;
  quantity: number;
  assetId?: string;
  condition?: "GOOD" | "DAMAGED";
}

interface InventoryRequest {
  id: number;
  title: string;
  invoiceNumber: string;
  items: InventoryItem[];
}

export default function InventoryDashboard() {
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<InventoryRequest | null>(null);
  const [tags, setTags] = useState<{
    [key: number]: { assetId: string; condition: "GOOD" | "DAMAGED" | "" };
  }>({});

  const fetchInventory = useCallback(async () => {
    try {
      const res = await WorkflowAPI.getArrivingInventory();
      setRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleTagChange = (itemId: number, field: string, value: string) => {
    setTags((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const saveTag = async (itemId: number) => {
    if (!selectedReq) return;
    const data = tags[itemId];
    if (!data?.assetId || !data?.condition) {
      return alert("Both Asset ID and Condition are required to tag an item.");
    }
    try {
      await WorkflowAPI.receiveAsset(selectedReq.id, itemId, {
        assetId: data.assetId,
        condition: data.condition as "GOOD" | "DAMAGED",
      });
      const updatedList = await WorkflowAPI.getArrivingInventory();
      setRequests(updatedList.data);
      setSelectedReq(
        updatedList.data.find(
          (r: InventoryRequest) => r.id === selectedReq.id,
        ) || null,
      );
    } catch (error) {
      console.error(error);
      alert("Failed to tag asset");
    }
  };

  const handleHandover = async () => {
    if (!selectedReq) return;
    try {
      await WorkflowAPI.handoverToDepartment(selectedReq.id, 6);
      alert("All items handed over to the Department Head!");
      setSelectedReq(null);
      fetchInventory();
    } catch (error: any) {
      alert(
        error.response?.data?.error ||
          "Failed to handover. Please ensure ALL items are tagged.",
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
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            #
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#0f172a" }}
          >
            Inventory Tagging
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-0.5 ml-9">
          Receive arriving shipments, assign Asset IDs, and record physical
          condition.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Panel: Receiving Dock */}
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
              Receiving Dock
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
              const totalItems = req.items.length;
              const taggedItems = req.items.filter((i) => i.assetId).length;
              const isFullyTagged =
                totalItems > 0 && totalItems === taggedItems;
              const progress =
                totalItems > 0 ? (taggedItems / totalItems) * 100 : 0;

              return (
                <li
                  key={req.id}
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
                  onClick={() => setSelectedReq(req)}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span
                      className="text-sm font-semibold truncate"
                      style={{ color: isSelected ? "#4f46e5" : "#1e293b" }}
                    >
                      {req.title}
                    </span>
                    {isFullyTagged && (
                      <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ background: "#f0fdf4", color: "#16a34a" }}
                      >
                        ✓ Done
                      </span>
                    )}
                  </div>
                  <span
                    className="text-xs font-medium mb-2.5 block"
                    style={{
                      color: isSelected ? "#6366f1" : "#94a3b8",
                      fontFamily: "'DM Mono', 'Courier New', monospace",
                    }}
                  >
                    {req.invoiceNumber}
                  </span>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: "#e2e8f0" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          background: isFullyTagged
                            ? "linear-gradient(90deg, #22c55e, #16a34a)"
                            : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold flex-shrink-0"
                      style={{ color: isFullyTagged ? "#16a34a" : "#94a3b8" }}
                    >
                      {taggedItems}/{totalItems}
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
                <div className="text-2xl mb-2">📦</div>
                <p className="text-sm font-medium text-slate-500">
                  Dock is clear
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  No shipments arriving
                </p>
              </div>
            )}
          </ul>
        </div>

        {/* Right Panel: Asset Tagging Workspace */}
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
                className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-5 mb-6"
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
                      Tag Assets
                    </h2>
                  </div>
                  <p
                    className="text-sm font-medium ml-0.5"
                    style={{
                      color: "#6366f1",
                      fontFamily: "'DM Mono', 'Courier New', monospace",
                    }}
                  >
                    {selectedReq.invoiceNumber}
                  </p>
                </div>
                <button
                  onClick={handleHandover}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 whitespace-nowrap"
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
                  Final Handover
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>

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
                      <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Item Details
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-14 text-center">
                        Qty
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-36">
                        Asset ID
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-36">
                        Condition
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-28 text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReq.items.map((item, idx) => {
                      const isTagged = !!item.assetId && !!item.condition;
                      return (
                        <tr
                          key={item.id}
                          style={{
                            background: isTagged
                              ? "#f0fdf4"
                              : idx % 2 === 0
                                ? "#ffffff"
                                : "#fafafa",
                            borderBottom: "1px solid #f1f5f9",
                            transition: "background 0.15s",
                          }}
                        >
                          <td className="py-3.5 px-4 text-sm font-medium text-slate-700">
                            {item.description}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold mx-auto"
                              style={{
                                background: "#eef2ff",
                                color: "#4f46e5",
                              }}
                            >
                              {item.quantity}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-lg text-xs transition-all focus:outline-none disabled:cursor-not-allowed"
                              style={{
                                border: "1px solid #e2e8f0",
                                background: isTagged ? "#dcfce7" : "#f8fafc",
                                color: isTagged ? "#15803d" : "#334155",
                                fontFamily:
                                  "'DM Mono', 'Courier New', monospace",
                              }}
                              placeholder="e.g. LAP-001"
                              value={
                                tags[item.id]?.assetId || item.assetId || ""
                              }
                              onChange={(e) =>
                                handleTagChange(
                                  item.id,
                                  "assetId",
                                  e.target.value,
                                )
                              }
                              disabled={!!item.assetId}
                              onFocus={(e) => {
                                if (!item.assetId) {
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.border = "1px solid #a5b4fc";
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.boxShadow =
                                    "0 0 0 3px rgba(165,180,252,0.2)";
                                }
                              }}
                              onBlur={(e) => {
                                (e.currentTarget as HTMLElement).style.border =
                                  "1px solid #e2e8f0";
                                (
                                  e.currentTarget as HTMLElement
                                ).style.boxShadow = "none";
                              }}
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              className="w-full px-3 py-2 rounded-lg text-xs transition-all focus:outline-none disabled:cursor-not-allowed"
                              style={{
                                border: "1px solid #e2e8f0",
                                background: isTagged
                                  ? item.condition === "DAMAGED"
                                    ? "#fff8f8"
                                    : "#dcfce7"
                                  : "#f8fafc",
                                color: isTagged
                                  ? item.condition === "DAMAGED"
                                    ? "#dc2626"
                                    : "#15803d"
                                  : "#64748b",
                              }}
                              value={
                                tags[item.id]?.condition || item.condition || ""
                              }
                              onChange={(e) =>
                                handleTagChange(
                                  item.id,
                                  "condition",
                                  e.target.value,
                                )
                              }
                              disabled={!!item.condition}
                              onFocus={(e) => {
                                if (!item.condition) {
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.border = "1px solid #a5b4fc";
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.boxShadow =
                                    "0 0 0 3px rgba(165,180,252,0.2)";
                                }
                              }}
                              onBlur={(e) => {
                                (e.currentTarget as HTMLElement).style.border =
                                  "1px solid #e2e8f0";
                                (
                                  e.currentTarget as HTMLElement
                                ).style.boxShadow = "none";
                              }}
                            >
                              <option value="">Select…</option>
                              <option value="GOOD">Good</option>
                              <option value="DAMAGED">Damaged</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isTagged ? (
                              <span
                                className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs font-semibold"
                                style={{
                                  background: "#f0fdf4",
                                  color: "#16a34a",
                                  border: "1px solid #bbf7d0",
                                }}
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Tagged
                              </span>
                            ) : (
                              <button
                                onClick={() => saveTag(item.id)}
                                className="w-full text-xs font-semibold px-3 py-2 rounded-lg transition-all"
                                style={{
                                  background: "#eef2ff",
                                  color: "#4f46e5",
                                  border: "1px solid #e0e7ff",
                                }}
                                onMouseEnter={(e) => {
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.background = "#e0e7ff";
                                }}
                                onMouseLeave={(e) => {
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.background = "#eef2ff";
                                }}
                              >
                                Save Tag
                              </button>
                            )}
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
                📦
              </div>
              <p className="text-base font-semibold text-slate-700">
                No Shipment Selected
              </p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                Select an arriving shipment from the dock to begin tagging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
