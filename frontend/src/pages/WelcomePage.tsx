import { InteractiveGridPattern } from "@/components/InteractiveGridPattern";
import iskolarLogo from "@/assets/images/IskolarLogo.png";

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

      <div className="z-10 flex flex-col items-center">
        <img
          src={iskolarLogo}
          alt="Iskolar logo"
          width="300"
          className="-mb-5 -mt-25"
        />
        <h2 className="text-5xl font-bold font-poppins">Welcome to ISKOLAR!</h2>
        <p className="text-lg font-inter mt-1">
          Let's get started by choosing an option from the sidebar.
        </p>
      </div>
    </div>
  );
}
