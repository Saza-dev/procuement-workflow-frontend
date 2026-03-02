"use client";

import { useState, useEffect, useCallback } from "react";
import { WorkflowAPI } from "@/lib/api";
import { ApprovalItem, GhostDiffData, UserRole } from "@/types/approvals";
import ApprovalQueue from "@/components/approvals/ApprovalQueue";
import ReviewPanel from "@/components/approvals/ReviewPanel";
import { toast } from "sonner";

export default function ApprovalsDashboard() {
  const [activeRole, setActiveRole] = useState<UserRole>({
    role: "FM",
    id: 3,
    title: "Finance Manager",
  });

  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApprovalItem | null>(null);
  const [diff, setDiff] = useState<GhostDiffData | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await WorkflowAPI.getPendingApprovals(
        activeRole.role,
        activeRole.id,
      );
      setApprovals(res.data);
    } catch (error) {
      console.error("Failed to fetch approvals", error);
    }
  }, [activeRole.role, activeRole.id]);

  useEffect(() => {
    fetchApprovals();
    setSelectedApp(null);
    setDiff(null);
  }, [fetchApprovals]);

  const handleSelectApp = async (app: ApprovalItem) => {
    setSelectedApp(app);
    try {
      const res = await WorkflowAPI.getGhostDiff(app.requestId);
      setDiff(res.data);
    } catch (error) {
      setDiff(null);
    }
  };

  const handleDecision = async (
    decision: "APPROVE" | "REJECT",
    comment: string,
  ) => {
    if (!selectedApp) return;
    try {
      await WorkflowAPI.processApproval(selectedApp.requestId, {
        approverId: activeRole.id,
        role: activeRole.role,
        decision,
        comment,
      });
      toast.success(`Request ${decision}D successfully!`);
      setSelectedApp(null);
      fetchApprovals();
    } catch (error) {
      toast.error("Failed to process approval");
      console.error(error);
    }
  };

  const roles = [
    { role: "FM", id: 3, title: "Finance Manager" },
    { role: "OM", id: 4, title: "Operations Manager" },
    { role: "CEO", id: 5, title: "Chief Executive Officer" },
  ];

  return (
    <div
      className="max-w-6xl mx-auto space-y-6"
      style={{
        fontFamily: "'Geist', 'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* Page Header */}
      <div className="pb-5 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              {activeRole.role.charAt(0)}
            </div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "#0f172a" }}
            >
              {activeRole.title} Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5 ml-9">
            Review, approve, or reject pending requests.
          </p>
        </div>

        {/* DEV ONLY: Role Switcher */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl self-start md:self-auto"
          style={{
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
          }}
        >
          {roles.map((r) => {
            const isActive = activeRole.role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => setActiveRole(r as UserRole)}
                className="relative px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "transparent",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  boxShadow: isActive
                    ? "0 1px 8px rgba(99,102,241,0.3)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.color = "#475569";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                }}
              >
                {r.role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pending count badge */}
      {approvals.length > 0 && (
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: "#fef9c3",
              color: "#854d0e",
              border: "1px solid #fde68a",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#f59e0b" }}
            />
            {approvals.length} pending approval
            {approvals.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Approval Queue */}
        <ApprovalQueue
          approvals={approvals}
          selectedAppId={selectedApp?.id}
          onSelect={handleSelectApp}
        />

        {/* Review Panel */}
        <ReviewPanel
          selectedApp={selectedApp}
          diff={diff}
          onDecision={handleDecision}
        />
      </div>
    </div>
  );
}
