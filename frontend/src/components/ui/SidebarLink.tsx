import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

interface SidebarLinkProps {
  to: string;
  icon: ReactNode;
  label: string;
  /** Called after navigation — used by the mobile drawer to close itself */
  onNavClick?: () => void;
}

export function SidebarLink({ to, icon, label, onNavClick }: SidebarLinkProps) {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <div
      className={`border-[#C7EABB] w-70 border-b transition-colors duration-300 ${
        isActive ? "bg-[#C7EABB]" : "bg-[#E8F5BD] hover:bg-[#C7EABB]"
      }`}
    >
      <Link to={to} onClick={onNavClick}>
        <p className="font-inter font-normal text-[#333333] p-4 flex gap-3 items-center">
          {icon}
          {label}
        </p>
      </Link>
    </div>
  );
}