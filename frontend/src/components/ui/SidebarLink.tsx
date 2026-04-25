import { Link, useLocation } from "react-router-dom";

interface SidebarLinkProps {
  to: string;
  icon: string;
  label: string;
}

export function SidebarLink({ to, icon, label }: SidebarLinkProps) {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <div
      className={`border-[#C7EABB] w-70 border-b transition-colors duration-300 ${
        isActive ? "bg-[#C7EABB]" : "bg-[#E8F5BD] hover:bg-[#C7EABB]"
      }`}
    >
      <Link to={to}>
        <p className="font-inter font-normal text-[#333333] p-4 flex gap-3 items-center">
          <img src={icon} alt="" width="25" aria-hidden="true" />
          {label}
        </p>
      </Link>
    </div>
  );
}
