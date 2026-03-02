import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import { FilePlus, CheckSquare } from "lucide-react";

const peNavigation: NavItem[] = [
  {
    name: "New Request",
    href: "/pe/sourcing/new-requests",
    icon: <FilePlus className="h-5 w-5" />,
  },
  {
    name: "Revisions",
    href: "/pe/sourcing/revisions",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    name: "Purchases",
    href: "/pe/execution",
    icon: <CheckSquare className="h-5 w-5" />,
  },
];

export default function PELayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      navItems={peNavigation}
      userRole="Procurement Executive Portal"
    >
      {children}
    </DashboardLayout>
  );
}
