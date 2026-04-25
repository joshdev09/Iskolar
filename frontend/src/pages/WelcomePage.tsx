import { InteractiveGridPattern } from "@/components/InteractiveGridPattern";
import iskolarLogo from "@/assets/images/IskolarLogo.png";
import { Link } from "react-router-dom";

//button pills
const QUICK_LINKS = [
  {
    to: "/upload-notes",
    label: "Note Organizer",
    bg: "bg-[#E8F5BD]",
    hover: "hover:bg-[#C7EABB]",
    text: "text-[#3B6D11]",
    border: "border-[#C7EABB]",
  },
  {
    to: "/notes",
    label: "Notes",
    bg: "bg-[#E6F1FB]",
    hover: "hover:bg-[#B5D4F4]",
    text: "text-[#0C447C]",
    border: "border-[#B5D4F4]",
  },
  {
    to: "/generate-quiz",
    label: "Quiz",
    bg: "bg-[#FAEEDA]",
    hover: "hover:bg-[#FAC775]",
    text: "text-[#633806]",
    border: "border-[#FAC775]",
  },
];

export function WelcomePage() {
  return (
    <div className="relative flex flex-col h-screen justify-center items-center text-[#333333] overflow-hidden">
      <InteractiveGridPattern
        className="mask-[radial-gradient(600px_circle_at_center,white,transparent)]"
        width={60}
        height={60}
        squares={[25, 25]}
        squaresClassName="hover:fill-[#99FF00]/80"
      />

      <div className="z-10 flex flex-col mt-25 items-center">
        <img
          src={iskolarLogo}
          alt="Iskolar logo"
          width="300"
          className="-mb-5 -mt-90"
        />
        <h2 className="text-5xl font-bold font-poppins">Welcome to ISKOLAR!</h2>
        <p className="text-lg font-inter mt-1">
          Let's get started by choosing from this options.
        </p>

        {/* Quick-link pill buttons */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {QUICK_LINKS.map(({ to, label, bg, hover, text, border }) => (
            <Link
              key={to}
              to={to}
              className={`
                flex items-center gap-2 px-5 py-2.5
                rounded-full border font-inter font-medium text-sm
                transition-all duration-200 active:scale-95
                ${bg} ${hover} ${text} ${border}
              `}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}