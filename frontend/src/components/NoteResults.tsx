import type { OrganizedNotes } from "@/types";

interface NoteResultsProps {
  data: OrganizedNotes;
  isCopied: boolean;
  onCopy: () => void;
}

export function NoteResults({ data, isCopied, onCopy }: NoteResultsProps) {
  return (
    <div className="max-w-3xl w-full bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 text-left">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Organized Output</h3>
        <button
          onClick={onCopy}
          title="Copy Output"
          className={`text-sm px-2 py-2 rounded-lg transition-colors font-medium flex items-center cursor-pointer ${
            isCopied
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 hover:bg-gray-200 text-[#333333]"
          }`}
        >
          {isCopied ? (
            "✓ Copied!"
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
      </div>

      <section className="mb-8">
        <h4 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wider">Summary</h4>
        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
          {data.summary}
        </p>
      </section>

      <section className="mb-8">
        <h4 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wider">Key Points</h4>
        <ul className="list-disc pl-6 space-y-3 text-gray-700 marker:text-[#333333]">
          {data.keyPoints.map((point, i) => (
            <li key={i} className="leading-relaxed pl-1">{point}</li>
          ))}
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wider">Action Items</h4>
        {data.actionItems.length > 0 ? (
          <ul className="list-disc pl-6 space-y-3 text-gray-700 marker:text-[#333333]">
            {data.actionItems.map((item, i) => (
              <li key={i} className="leading-relaxed pl-1">{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic bg-gray-50 p-3 rounded-lg">
            No action items found in these notes.
          </p>
        )}
      </section>
    </div>
  );
}
