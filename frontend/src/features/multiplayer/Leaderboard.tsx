import type { LeaderboardEntry } from "@/types/multiplayer";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  showAll?: boolean;
}

const RANK_STYLES: Record<number, string> = {
  1: "bg-yellow-50 border-yellow-200",
  2: "bg-gray-50 border-gray-200",
  3: "bg-orange-50 border-orange-200",
};

const RANK_MEDALS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function Leaderboard({ entries, title = "Leaderboard", showAll = false }: LeaderboardProps) {
  const displayed = showAll ? entries : entries.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-extrabold text-[#333333] uppercase tracking-widest mb-4">
        {title}
      </h3>

      {displayed.length === 0 ? (
        <div className="text-center py-6 text-gray-300">
          <p className="text-sm">No scores yet</p>
        </div>
      ) : (
        <ol className="space-y-2">
          {displayed.map((entry, i) => {
            const rank = i + 1;
            const rowStyle = RANK_STYLES[rank] ?? "bg-gray-50 border-gray-100";
            const medal = RANK_MEDALS[rank];

            return (
              <li
                key={entry.nickname}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${rowStyle}`}
              >
                <span className="w-8 text-center font-black text-gray-400 text-sm">
                  {medal ?? rank}
                </span>
                <span className="text-xl">{entry.avatar}</span>
                <span className="flex-1 font-bold text-[#333333] truncate text-sm">
                  {entry.nickname}
                </span>
                <span className="font-black text-green-600 text-sm tabular-nums">
                  {entry.score.toLocaleString()}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {!showAll && entries.length > 5 && (
        <p className="text-center text-xs text-gray-400 mt-3 font-medium">
          +{entries.length - 5} more players
        </p>
      )}
    </div>
  );
}
