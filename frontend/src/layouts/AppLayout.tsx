import { Outlet, Link } from "react-router-dom";
import { SidebarLink } from "@/components/ui/SidebarLink";
import iskolarLogo from "@/assets/images/IskolarLogo.png";
import aiIcon from "@/assets/icons/artificial-intelligence.png";
import fileIcon from "@/assets/icons/file.png";
import quizIcon from "@/assets/icons/brain.png";

const NAV_LINKS = [
  { to: "/upload-notes", icon: aiIcon, label: "Note Organizer" },
  { to: "/notes", icon: fileIcon, label: "Notes" },
  { to: "/generate-quiz", icon: quizIcon, label: "Generate Quiz" },
];

export function AppLayout() {
  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="bg-[#F7F8F0] w-70 h-screen flex flex-col shrink-0">
        {/* Logo */}
        <div className="flex items-center p-2">
          <img src={iskolarLogo} alt="Iskolar logo" width="60" />
          <Link to="/home">
            <h1 className="font-poppins font-bold text-2xl text-[#333333]">ISKOLAR</h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="border-t border-[#C7EABB]">
          {NAV_LINKS.map((link) => (
            <SidebarLink key={link.to} {...link} />
          ))}
        </nav>

        {/* Footer */}
        <footer className="mt-auto p-4">
          <p className="font-inter font-normal text-sm text-[#333333]">
            Made by @joshdev09
          </p>
        </footer>
      </aside>

      {/* Page content */}
      <main className="flex-1 h-screen overflow-y-auto bg-white">
        <Outlet />
      </main>
    </div>
  );
}
