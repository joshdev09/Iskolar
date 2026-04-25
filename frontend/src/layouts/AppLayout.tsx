import { useState, useEffect, useCallback } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { SidebarLink } from "@/components/ui/SidebarLink";
import iskolarLogo from "@/assets/images/IskolarLogo.png";

const NAV_LINKS = [
  {
    to: "/upload-notes",
    label: "Note Organizer",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
        />
      </svg>
    ),
  },
  {
    to: "/notes",
    label: "Notes",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-4.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
        />
      </svg>
    ),
  },
  {
    to: "/generate-quiz",
    label: "Quiz",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
  },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-2">
        <img src={iskolarLogo} alt="Iskolar logo" width="60" />
        <Link to="/home" onClick={onNavClick}>
          <h1 className="font-poppins font-bold text-2xl text-[#333333]">
            ISKOLAR
          </h1>
        </Link>
      </div>
      <nav className="border-t border-[#C7EABB]">
        {NAV_LINKS.map((link) => (
          <SidebarLink key={link.to} {...link} onNavClick={onNavClick} />
        ))}
      </nav>
      <footer className="mt-auto p-4">
        <p className="font-inter font-normal text-sm text-[#333333]">
          Made by @joshdev09
        </p>
      </footer>
    </div>
  );
}

export function AppLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { pathname } = useLocation();

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  return (
    <div className="flex flex-col h-screen">
      {/* TOP NAVBAR — always visible on all screen sizes */}
      <header className="flex items-center gap-3 px-4 py-3 bg-[#F7F8F0] shrink-0">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-1.5 rounded-md text-[#333333] hover:bg-[#C7EABB] transition-colors duration-200"
          aria-label="Open navigation menu"
          aria-expanded={isDrawerOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        <div className = "flex w-full justify-end">
          <button className = "p-2 w-25 bg-[#E8F5BD] cursor-pointer hover:bg-[#C7EABB] rounded-full font-normal text-sm">Signup</button>
        </div>
      </header>

      {/* BACKDROP */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-in-out ${
          isDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* SLIDE-IN DRAWER */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-70 bg-[#F7F8F0] shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation drawer"
      >
        <button
          onClick={closeDrawer}
          className="absolute top-3 right-3 p-1.5 rounded-md text-[#333333] hover:bg-[#C7EABB] transition-colors duration-200"
          aria-label="Close menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <SidebarContent onNavClick={closeDrawer} />
      </aside>

      {/* PAGE CONTENT */}
      <main className="flex-1 overflow-y-auto bg-white h-full">
        <Outlet />
      </main>
    </div>
  );
}