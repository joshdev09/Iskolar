import type { Player } from "@/types/multiplayer";

interface WaitingRoomProps {
  players: Player[];
  nickname: string;
  avatar: string;
  isConnected: boolean;
}

export function WaitingRoom({ players, nickname, avatar, isConnected }: WaitingRoomProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        {/* Status */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{avatar}</div>
          <h2 className="text-xl font-extrabold text-[#333333]">{nickname}</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
              }`}
            />
            <span className="text-xs text-gray-400 font-medium">
              {isConnected ? "Connected" : "Reconnecting..."}
            </span>
          </div>
        </div>

        {/* Waiting indicator */}
        <div className="bg-[#E8F5BD] rounded-2xl p-5 text-center mb-6 border border-green-200">
          <p className="text-sm font-bold text-[#333333] uppercase tracking-widest">
            ⏳ Waiting for host to start...
          </p>
        </div>

        {/* Players list */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Players in room
            </p>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
              {players.length}
            </span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {players.map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  p.nickname === nickname
                    ? "bg-[#E8F5BD] border-green-200"
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                <span className="text-xl">{p.avatar}</span>
                <span className="font-bold text-[#333333] text-sm">{p.nickname}</span>
                {p.nickname === nickname && (
                  <span className="ml-auto text-[10px] font-bold text-green-600 uppercase tracking-wider">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
