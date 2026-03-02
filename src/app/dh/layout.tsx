import DashboardLayout, { NavItem } from "@/components/DashboardLayout";
import { FilePlus, CheckSquare } from "lucide-react";

const dhNavigation: NavItem[] = [
  {
    name: "New Request",
    href: "/dh/new-request",
    icon: <FilePlus className="h-5 w-5" />,
  },
  {
    name: "Confirm Requests",
    href: "/dh/confirm",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    name: "Request History",
    href: "/dh/history",
    icon: <CheckSquare className="h-5 w-5" />,
  },
];

export default function DHLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout navItems={dhNavigation} userRole="Department Head Portal">
      {children}
    </DashboardLayout>
  );
}
