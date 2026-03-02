"use client";

import { useState } from "react";
import { WorkflowAPI } from "@/lib/api";

interface BasketItem {
  description: string;
  quantity: number;
  targetDate: string;
  estPrice: number;
  isHighPriority: boolean;
}

export default function SmartBasketDashboard() {
  const [requestId, setRequestId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [justification, setJustification] = useState("");
  const [items, setItems] = useState<BasketItem[]>([]);

  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [date, setDate] = useState("");
  const [urgent, setUrgent] = useState(false);

  const handleCreateBasket = async () => {
    try {
      const res = await WorkflowAPI.createBasket({
        title,
        justification,
        requesterId: 1,
      });
      setRequestId(res.data.id);
      alert(`Basket created! Request ID: ${res.data.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create basket");
    }
  };

  const handleAddItem = async () => {
    if (!requestId) return alert("Create a basket first!");
    try {
      const res = await WorkflowAPI.addItem(requestId, {
        description: desc,
        quantity: qty,
        targetDate: new Date(date).toISOString(),
        estPrice: price,
        isHighPriority: urgent,
      });
      setItems([...items, res.data.item]);
      setDesc("");
      setQty(1);
      setPrice(0);
      setDate("");
      setUrgent(false);
    } catch (error) {
      console.error(error);
      alert("Failed to add item");
    }
  };

  const handleSubmitFinal = async () => {
    if (!requestId) return;
    try {
      await WorkflowAPI.submitRequest(requestId);
      alert("Request Submitted Successfully! Locked for Phase 1.");
      setRequestId(null);
      setTitle("");
      setJustification("");
      setItems([]);
    } catch (error) {
      console.error(error);
      alert("Failed to submit request");
    }
  };

  const inputStyles =
    "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all";

  return (
    <div
      className="max-w-3xl mx-auto space-y-6"
      style={{
        fontFamily: "'Geist', 'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Page Header */}
      <div className="flex items-start justify-between pb-5 border-b border-slate-100">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#0f172a" }}
          >
            Smart Basket
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Initialize a new request and add items to your sourcing basket.
          </p>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-1">
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: !requestId ? "#eef2ff" : "#f0fdf4",
              color: !requestId ? "#4f46e5" : "#16a34a",
              border: !requestId ? "1px solid #c7d2fe" : "1px solid #bbf7d0",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: !requestId ? "#6366f1" : "#22c55e" }}
            />
            {!requestId ? "Step 1 of 2" : "Step 2 of 2"}
          </div>
        </div>
      </div>

      {/* STEP 1: Create Request Header */}
      {!requestId ? (
        <div
          className="rounded-2xl p-6"
          style={{
            background: "#ffffff",
            border: "1px solid #e8edf3",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              1
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Initialize Request
              </h2>
              <p className="text-xs text-slate-400">
                Provide a title and justification to get started
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Request Title
              </label>
              <input
                type="text"
                placeholder="e.g., Q3 Marketing Swag"
                className={inputStyles}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Business Justification
              </label>
              <textarea
                placeholder="Explain why these items are needed..."
                rows={3}
                className={`${inputStyles} resize-none`}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
              />
            </div>

            <div className="pt-1">
              <button
                onClick={handleCreateBasket}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150"
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
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 2v12M2 8h12" />
                </svg>
                Create Basket
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: Add Items Section */
        <div
          className="rounded-2xl p-6"
          style={{
            background: "#ffffff",
            border: "1px solid #e8edf3",
            boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          }}
        >
          {/* Step 2 Header */}
          <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                }}
              >
                2
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Add Line Items
                </h2>
                <p className="text-xs text-slate-400">
                  Fill in item details and add to basket
                </p>
              </div>
            </div>
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{
                background: "#eef2ff",
                color: "#4f46e5",
                border: "1px solid #c7d2fe",
              }}
            >
              Request #{requestId}
            </span>
          </div>

          {/* Item Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Item Description
              </label>
              <input
                type="text"
                placeholder="e.g., Branded tote bags"
                className={inputStyles}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Quantity
              </label>
              <input
                type="number"
                placeholder="1"
                min="1"
                className={inputStyles}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Target Date
              </label>
              <input
                type="date"
                className={inputStyles}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                style={{
                  background: urgent ? "#fefce8" : "#f8fafc",
                  border: urgent ? "1px solid #fde68a" : "1px solid #e2e8f0",
                }}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-indigo-500"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Flag as High Priority
                  </span>
                  <p className="text-xs text-slate-400">
                    Mark this item for expedited sourcing
                  </p>
                </div>
                {urgent && (
                  <span
                    className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "#fef08a", color: "#854d0e" }}
                  >
                    Urgent
                  </span>
                )}
              </label>
            </div>
          </div>

          <button
            onClick={handleAddItem}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              background: "#f1f5f9",
              color: "#4f46e5",
              border: "1px solid #e0e7ff",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#eef2ff";
              (e.currentTarget as HTMLElement).style.borderColor = "#c7d2fe";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
              (e.currentTarget as HTMLElement).style.borderColor = "#e0e7ff";
            }}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 2v12M2 8h12" />
            </svg>
            Add Item to Basket
          </button>

          {/* Items List */}
          {items.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Current Basket
                </h3>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "#f1f5f9", color: "#64748b" }}
                >
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              <ul className="space-y-2.5 mb-6">
                {items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-xl px-4 py-3 transition-all"
                    style={{
                      background: item.isHighPriority ? "#fffbeb" : "#f8fafc",
                      border: item.isHighPriority
                        ? "1px solid #fde68a"
                        : "1px solid #e2e8f0",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
                        style={{
                          background: item.isHighPriority
                            ? "#fef08a"
                            : "#e0e7ff",
                          color: item.isHighPriority ? "#854d0e" : "#4f46e5",
                        }}
                      >
                        {item.quantity}x
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {item.description}
                      </span>
                    </div>
                    {item.isHighPriority && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "#fef08a", color: "#854d0e" }}
                      >
                        High Priority
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSubmitFinal}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150"
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
                Submit Request to Sourcing →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
