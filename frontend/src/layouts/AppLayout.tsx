import { Outlet, Link } from "react-router-dom";
import { SidebarLink } from "@/components/ui/SidebarLink";
import iskolarLogo from "@/assets/images/IskolarLogo.png";
import aiIcon from "@/assets/icons/artificial-intelligence.png";
import fileIcon from "@/assets/icons/file.png";
import quizIcon from "@/assets/icons/brain.png";

const NAV_LINKS = [
  { to: "/upload-notes", 
    label: "Note Organizer", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ),
  },

  { to: "/notes", 
    label: "Notes",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
      </svg>
    ), 
  },

  { to: "/generate-quiz", 
    label: "Quiz",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
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
