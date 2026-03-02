
export interface RequestItem {
  id: number;
  description: string;
  quantity: number;
  actualPrice?: number;
}

export interface RequestDetails {
  totalValue: number;
  items: RequestItem[]; 
}

export interface ApprovalItem {
  id: number;
  requestId: number;
  version: number;
  isSlaBreached: boolean;
  request: RequestDetails;
}

export interface DiffItem {
  description: string;
  actualPrice: { old: number; new: number };
}

export interface GhostDiffData {
  currentVersion: number;
  diff: { items: DiffItem[] };
}

export interface UserRole {
  role: "FM" | "OM" | "CEO";
  id: number;
  title: string;
}
