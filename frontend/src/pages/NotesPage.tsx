import folderIcon from "@/assets/icons/folder-hidden-icon-md.png";

export function NotesPage() {
  return (
    <div className="relative flex flex-col h-screen">
      {/* Empty state */}
      <div className="flex flex-col items-center justify-center flex-1">
        <img src={folderIcon} alt="Empty folder" width="100" />
        <h1 className="text-3xl text-[#BFBFBF] font-semibold font-poppins mt-4">
          No Folder Available
        </h1>
        <p className="text-[#BFBFBF] font-inter mt-1">
          Please upload a folder.
        </p>
      </div>

      {/* FAB - upload button */}
      <div className="absolute bottom-8 right-8">
        <button
          aria-label="Upload folder"
          className="p-5 bg-[#ECF0F1] hover:bg-[#D2D7D3] rounded-full cursor-pointer hover:-translate-y-1 duration-300 ease-in-out shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
