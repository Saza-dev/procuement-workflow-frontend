import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import { FilePlus } from "lucide-react";

const peNavigation: NavItem[] = [
  {
    name: "Inventory",
    href: "/hr/inventory",
    icon: <FilePlus className="h-5 w-5" />,
  },
];

export default function PELayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      navItems={peNavigation}
      userRole="HR Portal"
    >
      {children}
    </DashboardLayout>
  );
}
