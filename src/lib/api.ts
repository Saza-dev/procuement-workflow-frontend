import axios from "axios";

// Map this to your Express server port
const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001/api";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export interface CreateRequestData {
  title: string;
  justification: string;
  requesterId: number;
}
export interface AddItemData {
  description: string;
  quantity: number;
  targetDate: string;
  estPrice: number;
  isHighPriority: boolean;
}

export interface loginUser {
  email: string;
  password: string;
}

export const WorkflowAPI = {
  // login
  login: (data: loginUser) => apiClient.post("/auth/login", data),

  me: () => apiClient.get("/auth/me"),

  // --- Phase 1: Initiation ---
  createBasket: (data: CreateRequestData) => apiClient.post("/requests", data),
  addItem: (requestId: number, data: AddItemData) =>
    apiClient.post(`/requests/${requestId}/items`, data),
  submitRequest: (requestId: number) =>
    apiClient.post(`/requests/${requestId}/submit`),

  // --- Phase 2: Sourcing ---
  // Update this line in api.ts
  getIncomingRequests: (status: string = "SUBMITTED") =>
    apiClient.get(`/requests?status=${status}`),
  updateSourcing: (
    reqId: number,
    itemId: number,
    data: { actualPrice: number },
  ) => apiClient.patch(`/requests/${reqId}/items/${itemId}/sourcing`, data),
  dispatchToApprovers: (reqId: number, actorId: number) =>
    apiClient.post(`/requests/${reqId}/dispatch`, { actorId }),

  // --- Phase 3: Approvals ---
  getPendingApprovals: (role: string, approverId: number) =>
    apiClient.get(`/approvals?role=${role}&approverId=${approverId}`),
  getGhostDiff: (reqId: number) => apiClient.get(`/requests/${reqId}/diff`),
  processApproval: (
    reqId: number,
    data: {
      approverId: number;
      role: string;
      decision: "APPROVE" | "REJECT";
      comment?: string;
    },
  ) => apiClient.post(`/requests/${reqId}/approve`, data),

  // Add this under Phase 3 / Revision
  resubmitRequest: (reqId: number, actorId: number) =>
    apiClient.post(`/requests/${reqId}/resubmit`, { actorId }),

  // --- Audit ---
  getHistory: (reqId: number) => apiClient.get(`/requests/${reqId}/history`),

  // --- Phase 4: Execution ---
  getApprovedRequests: () => apiClient.get("/requests?status=APPROVED"),
  finalizePurchase: (
    reqId: number,
    data: FormData,
  ) => apiClient.post(`/requests/${reqId}/purchase`, data),

  // --- Phase 5: Inventory ---
  getArrivingInventory: () =>
    apiClient.get("/requests/inventory?status=PURCHASED"),
  receiveAsset: (
    reqId: number,
    itemId: number,
    data: { assetId: string; condition: "GOOD" | "DAMAGED" },
  ) => apiClient.post(`/requests/${reqId}/items/${itemId}/receive`, data),
  handoverToDepartment: (reqId: number, actorId: number) =>
    apiClient.post(`/requests/${reqId}/handover`, { actorId }),

  // --- Phase 6: Final Handshake ---
  getHandedOverRequests: () => apiClient.get("/requests?status=HANDED_OVER"),
  confirmReceipt: (reqId: number, actorId: number) =>
    apiClient.post(`/requests/${reqId}/confirm-receipt`, { actorId }),
};
