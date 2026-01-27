import { useEffect, useState, useRef } from "react";
import { API_ENDPOINTS } from "../../config/api";

interface Match {
  _id: string;
  teamA: string;
  teamB: string;
  sport: string;
  venue: string;
  date: string;
  status: string;
}

export default function TodayMatches() {
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.MATCHES_LIST);
        const data = await response.json();
        
        // Filter today's matches
        const today = new Date().toDateString();
        const filtered = (data.matches || []).filter((m: Match) => {
          const matchDate = new Date(m.date).toDateString();
          return matchDate === today;
        });
        setTodayMatches(filtered);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  // Auto-scroll effect - vertical
  useEffect(() => {
    if (todayMatches.length <= 3 || isPaused || !scrollRef.current) return;

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
  }, [todayMatches.length, isPaused]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <aside className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <div className="border-b px-4 sm:px-6 py-3 sm:py-4 bg-blue-600">
        <h2 className="text-base sm:text-lg font-extrabold text-white">Today's Matches</h2>
      </div>

      <div 
        ref={scrollRef}
        className="max-h-64 sm:max-h-80 overflow-y-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        style={{ scrollBehavior: 'auto' }}
      >
        {loading ? (
          <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-slate-500 text-sm">Loading...</div>
        ) : todayMatches.length === 0 ? (
          <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-slate-500 text-sm">No matches scheduled for today</div>
        ) : (
          <div className="divide-y">
            {todayMatches.map((match) => {
              const isLive = match.status === "live";
              
              return (
                <div key={match._id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-slate-50 transition-colors">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-1.5 sm:px-2 py-0.5 bg-slate-800 text-white text-xs font-semibold rounded">
                      {match.sport}
                    </span>
                    {isLive ? (
                      <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                        LIVE
                      </span>
                    ) : (
                      <span className="px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        {formatTime(match.date)}
                      </span>
                    )}
                  </div>

                  {/* Teams */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                      <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                        {(match.teamA || "T")[0]}
                      </div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {match.teamA || "TBD"}
                      </div>
                    </div>
                    
                    <div className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-100 rounded text-xs font-bold text-slate-500 flex-shrink-0">
                      VS
                    </div>
                    
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end min-w-0">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {match.teamB || "TBD"}
                      </div>
                      <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                        {(match.teamB || "T")[0]}
                      </div>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-xs text-slate-500">
                    <span>📍</span>
                    <span className="truncate">{match.venue}</span>
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
