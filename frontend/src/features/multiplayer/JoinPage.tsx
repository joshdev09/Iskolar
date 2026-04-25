import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AVATARS = ["🐯","🦊","🐸","🐼","🦁","🐨","🐙","🦋","🐬","🦄","🐵","🦅"];

export function JoinPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  async function handleJoin() {
    const trimmed = nickname.trim();
    if (!trimmed) return setError("Please enter a nickname.");
    if (trimmed.length > 20) return setError("Nickname must be 20 characters or less.");
    if (!sessionId) return setError("Invalid session link.");

    setIsJoining(true);
    setError("");

    try {
      // Verify the session exists and is joinable
      const res = await fetch(`/api/session/${sessionId}`);
      if (!res.ok) throw new Error("Session not found.");
      const data = await res.json();
      if (data.status === "finished") throw new Error("This quiz has already ended.");

      // Navigate to the player quiz view with state
      navigate(`/play/${sessionId}`, {
        state: { nickname: trimmed, avatar: selectedAvatar },
      });
    } catch (err: any) {
      setError(err.message || "Could not join. Please try again.");
      setIsJoining(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#333333] tracking-tight">
            ISKOLAR
          </h1>
          <p className="text-gray-400 text-sm mt-1">Join the quiz!</p>
        </div>

        {/* Avatar picker */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Choose Your Avatar
          </label>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((av) => (
              <button
                key={av}
                onClick={() => setSelectedAvatar(av)}
                className={`text-2xl p-2 rounded-xl transition-all cursor-pointer ${
                  selectedAvatar === av
                    ? "bg-[#E8F5BD] border-2 border-green-400 scale-110"
                    : "bg-gray-50 border-2 border-transparent hover:border-gray-200"
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Nickname input */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Nickname
          </label>
          <input
            type="text"
            placeholder="Enter your nickname..."
            value={nickname}
            maxLength={20}
            onChange={(e) => {
              setNickname(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#E8F5BD] outline-none text-sm font-medium transition-all"
          />
          {error && (
            <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
          )}
        </div>

        {/* Preview */}
        {nickname.trim() && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
            <span className="text-3xl">{selectedAvatar}</span>
            <div>
              <p className="font-bold text-[#333333]">{nickname.trim()}</p>
              <p className="text-xs text-gray-400">Your player card</p>
            </div>
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={isJoining || !nickname.trim()}
          className="w-full py-4 rounded-xl bg-[#E8F5BD] hover:bg-[#C7EABB] text-[#333333] font-bold uppercase tracking-widest text-sm transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {isJoining ? "Joining..." : "Join Quiz"}
        </button>
      </div>
    </div>
  );
}
