"use client";

import { useState, useEffect, useCallback } from "react";
import { WorkflowAPI } from "@/lib/api";

interface ApprovedRequest {
  id: number;
  title: string;
  totalValue: number;
  createdAt: string;
}

export default function ExecutionDashboard() {
  const [requests, setRequests] = useState<ApprovedRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<ApprovedRequest | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [finalTotalCost, setFinalTotalCost] = useState<number | "">("");
  const [guardrailAlert, setGuardrailAlert] = useState<{
    triggered: boolean;
    message: string;
    variance?: number;
  } | null>(null);

  const fetchApprovedRequests = useCallback(async () => {
    try {
      const res = await WorkflowAPI.getApprovedRequests();
      setRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch approved requests", error);
    }
  }, []);

  useEffect(() => {
    fetchApprovedRequests();
  }, [fetchApprovedRequests]);

  const handlePurchase = async () => {
    if (!selectedReq || !invoiceNumber || !finalTotalCost) {
      return alert("Please fill in all fields!");
    }
    setGuardrailAlert(null);
    try {
      await WorkflowAPI.finalizePurchase(selectedReq.id, {
        invoiceNumber,
        finalTotalCost: Number(finalTotalCost),
        actorId: 2,
      });
      alert("Purchase finalized successfully! Moved to Inventory.");
      setSelectedReq(null);
      setInvoiceNumber("");
      setFinalTotalCost("");
      fetchApprovedRequests();
    } catch (error: any) {
      if (error.response?.status === 403) {
        setGuardrailAlert({
          triggered: true,
          message: error.response.data.message,
          variance: error.response.data.variance,
        });
        fetchApprovedRequests();
        setSelectedReq(null);
      } else {
        alert("An error occurred while finalizing the purchase.");
      }
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
            style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
          >
            ✓
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#0f172a" }}
          >
            Execute Purchases
          </h1>
        </div>
        <p className="text-sm text-slate-500 mt-0.5 ml-9">
          Finalize approved requests and record final invoice amounts.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Panel: Approved Queue */}
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
              Ready for Purchase
            </h2>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "#f0fdf4",
                color: "#16a34a",
                border: "1px solid #bbf7d0",
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
                  className="p-3.5 rounded-xl cursor-pointer transition-all duration-150"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, #f0fdf4, #dcfce7)"
                      : "#f8fafc",
                    border: isSelected
                      ? "1px solid #86efac"
                      : "1px solid transparent",
                    boxShadow: isSelected
                      ? "0 1px 8px rgba(34,197,94,0.1)"
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background =
                        "#f0fdf4";
                      (e.currentTarget as HTMLElement).style.border =
                        "1px solid #bbf7d0";
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
                  onClick={() => {
                    setSelectedReq(req);
                    setGuardrailAlert(null);
                    setInvoiceNumber("");
                    setFinalTotalCost("");
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: isSelected ? "#15803d" : "#1e293b" }}
                    >
                      #{req.id} — {req.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Approved</span>
                    <span
                      className="text-xs font-bold"
                      style={{
                        color: isSelected ? "#15803d" : "#334155",
                        fontFamily: "'DM Mono', 'Courier New', monospace",
                      }}
                    >
                      ${Number(req.totalValue || 0).toFixed(2)}
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
                <div className="text-2xl mb-2">🛒</div>
                <p className="text-sm font-medium text-slate-500">All clear!</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  No purchases pending
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
          {/* Guardrail Alert */}
          {guardrailAlert?.triggered && !selectedReq && (
            <div className="p-6">
              <div
                className="flex items-start gap-4 rounded-2xl p-5"
                style={{ background: "#fff8f8", border: "1px solid #fecaca" }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                  style={{ background: "#fee2e2" }}
                >
                  <svg
                    className="h-5 w-5"
                    style={{ color: "#dc2626" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "#dc2626" }}
                    >
                      Guardrail Exception Triggered
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                    {guardrailAlert.message}
                  </p>
                  {guardrailAlert.variance && (
                    <p
                      className="text-sm font-bold mb-3"
                      style={{
                        color: "#dc2626",
                        fontFamily: "'DM Mono', 'Courier New', monospace",
                      }}
                    >
                      Variance: {guardrailAlert.variance.toFixed(2)}% over
                      budget
                    </p>
                  )}
                  <div
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg w-fit"
                    style={{ background: "#fee2e2", color: "#b91c1c" }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "#ef4444" }}
                    />
                    Automatically routed to Finance for re-approval
                  </div>
                </div>
              </div>
            </div>
          )}

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
                      style={{ background: "#f0fdf4", color: "#16a34a" }}
                    >
                      #{selectedReq.id}
                    </span>
                    <h2 className="text-lg font-bold text-slate-800">
                      Finalize Order
                    </h2>
                  </div>
                  <p className="text-sm text-slate-400">
                    Record the final invoice details. Variances over 10% require
                    Finance re-approval.
                  </p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-7">
                <div
                  className="p-4 rounded-xl"
                  style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                >
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Approved Amount
                  </p>
                  <p
                    className="text-3xl font-bold"
                    style={{
                      color: "#15803d",
                      fontFamily: "'DM Mono', 'Courier New', monospace",
                    }}
                  >
                    ${Number(selectedReq.totalValue || 0).toFixed(2)}
                  </p>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                >
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Created Date
                  </p>
                  <p className="text-xl font-semibold text-slate-700 mt-1">
                    {new Date(selectedReq.createdAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Final Invoice / Receipt Number{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-8871"
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 transition-all focus:outline-none"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    onFocus={(e) => {
                      (e.currentTarget as HTMLElement).style.border =
                        "1px solid #a5b4fc";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 0 0 3px rgba(165,180,252,0.2)";
                    }}
                    onBlur={(e) => {
                      (e.currentTarget as HTMLElement).style.border =
                        "1px solid #e2e8f0";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Final Total Cost ($){" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full pl-7 pr-4 py-2.5 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 transition-all focus:outline-none"
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        fontFamily: "'DM Mono', 'Courier New', monospace",
                      }}
                      value={finalTotalCost}
                      onChange={(e) =>
                        setFinalTotalCost(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      onFocus={(e) => {
                        (e.currentTarget as HTMLElement).style.border =
                          "1px solid #a5b4fc";
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          "0 0 0 3px rgba(165,180,252,0.2)";
                      }}
                      onBlur={(e) => {
                        (e.currentTarget as HTMLElement).style.border =
                          "1px solid #e2e8f0";
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          "none";
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handlePurchase}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 flex items-center justify-center gap-2"
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
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Record Purchase & Move to Inventory
                  </button>
                </div>
              </div>
            </div>
          ) : (
            !guardrailAlert?.triggered && (
              <div className="flex flex-col items-center justify-center h-full py-24 text-center px-6">
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: "#f1f5f9" }}
                >
                  🛒
                </div>
                <p className="text-base font-semibold text-slate-700">
                  No Request Selected
                </p>
                <p className="text-sm text-slate-400 mt-1 max-w-xs">
                  Select an approved request from the queue to record the final
                  invoice.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
