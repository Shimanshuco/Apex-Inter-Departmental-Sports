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

  // Sport-specific colors for tags
  const getSportColor = (sport: string) => {
    const colors: Record<string, string> = {
      Football: "bg-emerald-600",
      Volleyball: "bg-amber-500",
      Basketball: "bg-orange-500",
      Kabaddi: "bg-red-500",
      Badminton: "bg-sky-500",
      Chess: "bg-slate-600",
      "Kho Kho": "bg-violet-500",
      "Table Tennis": "bg-cyan-500",
      "Tug of War": "bg-yellow-600",
      Cricket: "bg-lime-600",
      Athletics: "bg-rose-500",
    };
    return colors[sport] || "bg-slate-600";
  };

  return (
    <aside className="rounded-xl bg-white shadow-sm border border-slate-200/60 overflow-hidden">
      <div className="border-b border-slate-100 px-4 sm:px-5 py-3 sm:py-4 bg-slate-50/50">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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
          <div className="px-5 py-8 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500"></div>
            <p className="text-slate-400 text-sm mt-2">Loading...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">No completed matches</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {results.map((match) => {
              const teamAWins = match.scoreA > match.scoreB;
              const teamBWins = match.scoreB > match.scoreA;
              
              return (
                <div
                  key={match._id}
                  className="px-4 sm:px-5 py-3 sm:py-4 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Sport Tag */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`px-2 py-0.5 ${getSportColor(match.sport)} text-white text-xs font-medium rounded`}>
                      {match.sport}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded">
                      Completed
                    </span>
                  </div>

                  {/* Teams and Score */}
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    {/* Team A */}
                    <div className={`flex items-center gap-2 flex-1 min-w-0 ${teamAWins ? "" : "opacity-60"}`}>
                      <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg grid place-items-center font-bold text-xs sm:text-sm shrink-0 ${
                        teamAWins 
                          ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {(match.teamA || "T")[0]}
                      </div>
                      <div className="min-w-0">
                        <div className={`font-semibold text-xs sm:text-sm truncate ${teamAWins ? "text-emerald-700" : "text-slate-700"}`}>
                          {match.teamA || "TBD"}
                        </div>
                        {teamAWins && (
                          <span className="text-xs text-emerald-600">Winner</span>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-slate-100/80 rounded-lg shrink-0">
                      <span className={`text-sm sm:text-lg font-bold ${teamAWins ? "text-emerald-600" : "text-slate-600"}`}>
                        {match.scoreA ?? 0}
                      </span>
                      <span className="text-slate-300 font-bold text-sm">-</span>
                      <span className={`text-sm sm:text-lg font-bold ${teamBWins ? "text-emerald-600" : "text-slate-600"}`}>
                        {match.scoreB ?? 0}
                      </span>
                    </div>

                    {/* Team B */}
                    <div className={`flex items-center gap-2 flex-1 justify-end min-w-0 ${teamBWins ? "" : "opacity-60"}`}>
                      <div className="text-right min-w-0">
                        <div className={`font-semibold text-xs sm:text-sm truncate ${teamBWins ? "text-emerald-700" : "text-slate-700"}`}>
                          {match.teamB || "TBD"}
                        </div>
                        {teamBWins && (
                          <span className="text-xs text-emerald-600">Winner</span>
                        )}
                      </div>
                      <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg grid place-items-center font-bold text-xs sm:text-sm shrink-0 ${
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
