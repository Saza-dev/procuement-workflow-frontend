import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import { FilePlus, CheckSquare } from "lucide-react";

const dhNavigation: NavItem[] = [
  {
    name: "Awaiting Approvals",
    href: "/db/approvals",
    icon: <FilePlus className="h-5 w-5" />,
  },
  {
    name: "History",
    href: "/db/history",
    icon: <CheckSquare className="h-5 w-5" />,
  },
];

export default function DHLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={dhNavigation} userRole="Portal">
      {children}
    </DashboardLayout>
  );
}
