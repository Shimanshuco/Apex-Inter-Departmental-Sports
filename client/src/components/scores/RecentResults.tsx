import { useEffect, useState, useRef } from "react";
import { API_ENDPOINTS } from "../../config/api";

interface Match {
  _id: string;
  teamA: string;
  teamB: string;
  sport: string;
  scoreA: number;
  scoreB: number;
  status: string;
}

export default function RecentResults() {
  const [results, setResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.MATCHES_LIST);
        const data = await response.json();
        // Filter completed matches - show all
        const completedMatches = (data.matches || []).filter(
          (m: Match) => m.status === "completed" || m.status === "finished"
        );
        setResults(completedMatches);
      } catch (error) {
        console.error("Failed to fetch results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Auto-scroll effect - vertical
  useEffect(() => {
    if (results.length <= 3 || isPaused || !scrollRef.current) return;

    const container = scrollRef.current;
    let scrollDirection = 1; // 1 = down, -1 = up

    const interval = setInterval(() => {
      if (!container) return;
      
      const maxScroll = container.scrollHeight - container.clientHeight;
      
      // Scroll down
      container.scrollTop += scrollDirection * 1;
      
      // Reverse direction at boundaries
      if (container.scrollTop >= maxScroll) {
        scrollDirection = -1;
      } else if (container.scrollTop <= 0) {
        scrollDirection = 1;
      }
    }, 30);

    return () => clearInterval(interval);
  }, [results.length, isPaused]);

  return (
    <aside className="rounded-lg bg-white shadow overflow-hidden">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-extrabold text-slate-900">
          Recent Results
        </h2>
      </div>

      <div 
        ref={scrollRef}
        className="max-h-80 overflow-y-auto scrollbar-thin"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ scrollBehavior: 'auto' }}
      >
        {loading ? (
          <div className="px-5 py-8 text-center text-slate-500">Loading...</div>
        ) : results.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-500">No completed matches</div>
        ) : (
          <div className="divide-y">
            {results.map((match) => {
              const teamAWins = match.scoreA > match.scoreB;
              const teamBWins = match.scoreB > match.scoreA;
              
              return (
                <div
                  key={match._id}
                  className="px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Sport Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-slate-800 text-white text-xs font-semibold rounded">
                      {match.sport}
                    </span>
                    <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">
                      FINAL
                    </span>
                  </div>

                  {/* Teams and Score */}
                  <div className="flex items-center justify-between gap-3">
                    {/* Team A */}
                    <div className={`flex items-center gap-2 flex-1 ${teamAWins ? "" : "opacity-60"}`}>
                      <div className={`h-8 w-8 rounded-full grid place-items-center font-bold text-sm ${
                        teamAWins 
                          ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {(match.teamA || "T")[0]}
                      </div>
                      <div>
                        <div className={`font-bold text-sm ${teamAWins ? "text-emerald-700" : "text-slate-700"}`}>
                          {match.teamA || "TBD"}
                        </div>
                        {teamAWins && (
                          <span className="text-xs text-emerald-600">🏆 Winner</span>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-lg">
                      <span className={`text-lg font-black ${teamAWins ? "text-emerald-600" : "text-slate-700"}`}>
                        {match.scoreA ?? 0}
                      </span>
                      <span className="text-slate-400 font-bold">-</span>
                      <span className={`text-lg font-black ${teamBWins ? "text-emerald-600" : "text-slate-700"}`}>
                        {match.scoreB ?? 0}
                      </span>
                    </div>

                    {/* Team B */}
                    <div className={`flex items-center gap-2 flex-1 justify-end ${teamBWins ? "" : "opacity-60"}`}>
                      <div className="text-right">
                        <div className={`font-bold text-sm ${teamBWins ? "text-emerald-700" : "text-slate-700"}`}>
                          {match.teamB || "TBD"}
                        </div>
                        {teamBWins && (
                          <span className="text-xs text-emerald-600">🏆 Winner</span>
                        )}
                      </div>
                      <div className={`h-8 w-8 rounded-full grid place-items-center font-bold text-sm ${
                        teamBWins 
                          ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {(match.teamB || "T")[0]}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
