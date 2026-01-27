type Props = {
  type: "live" | "finished";
  title: string;
  teamA: string;
  teamB: string;
  score: string;
  scoreB: string;
  status: "LIVE" | "FINAL";
  compact?: boolean;
  venue?: string;
  date?: string;
};

// Sport-specific gradient backgrounds
const getSportGradient = (sport: string) => {
  const gradients: Record<string, string> = {
    Football: "from-emerald-600 to-emerald-700",
    Volleyball: "from-amber-500 to-amber-600",
    Basketball: "from-orange-500 to-orange-600",
    Kabaddi: "from-red-500 to-red-600",
    Badminton: "from-sky-500 to-sky-600",
    Chess: "from-slate-600 to-slate-700",
    "Kho Kho": "from-violet-500 to-violet-600",
    "Table Tennis": "from-cyan-500 to-cyan-600",
    "Tug of War": "from-yellow-600 to-yellow-700",
    Cricket: "from-lime-600 to-lime-700",
    Athletics: "from-rose-500 to-rose-600",
  };
  return gradients[sport] || "from-slate-700 to-slate-800";
};

// Sport-specific subtle pattern (SVG as background)
const getSportPattern = (sport: string) => {
  // Minimal dot pattern with sport-specific opacity
  return "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)";
};

export default function MatchCard({
  type,
  title,
  teamA,
  teamB,
  score,
  scoreB,
  status,
  compact,
  venue,
  date,
}: Props) {
  const scoreANum = parseInt(score) || 0;
  const scoreBNum = parseInt(scoreB) || 0;
  const teamAWins = scoreANum > scoreBNum;
  const teamBWins = scoreBNum > scoreANum;
  const isDraw = scoreANum === scoreBNum;

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden border border-slate-200/60 hover:shadow-md transition-all duration-200">
      {/* header with sport-specific background */}
      {!compact && (
        <div 
          className={`relative flex items-center justify-between bg-gradient-to-r ${getSportGradient(title)} px-3 sm:px-5 py-2.5 sm:py-3`}
          style={{ backgroundSize: "16px 16px", backgroundImage: getSportPattern(title) }}
        >
          <div className="flex items-center gap-2 sm:gap-2.5">
            <h3 className="font-semibold text-white text-sm sm:text-base tracking-wide">{title}</h3>
          </div>
          {status === "LIVE" && (
            <span className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-2.5 sm:px-3 py-1 text-xs font-bold text-white">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white animate-pulse"></span>
              LIVE
            </span>
          )}
          {status === "FINAL" && (
            <span className="rounded-full bg-white/20 backdrop-blur-sm px-2.5 sm:px-3 py-1 text-xs font-medium text-white">
              Completed
            </span>
          )}
        </div>
      )}

      {/* body */}
      <div className={`${compact ? "p-3 sm:p-4" : "p-4 sm:p-6"}`}>
        <div className="flex items-center justify-between">
          {/* Team A */}
          <div className={`flex items-center gap-2 sm:gap-3 flex-1 min-w-0 ${teamAWins ? "opacity-100" : type === "finished" && !isDraw ? "opacity-60" : ""}`}>
            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full grid place-items-center font-black text-sm sm:text-lg flex-shrink-0 ${
              teamAWins 
                ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white ring-2 ring-emerald-300" 
                : "bg-slate-100 text-slate-600"
            }`}>
              {teamA[0]}
            </div>
            <div className="min-w-0">
              <div className={`font-bold text-sm sm:text-base truncate ${teamAWins ? "text-emerald-700" : "text-slate-800"}`}>
                {teamA}
              </div>
              {teamAWins && type === "finished" && (
                <span className="text-xs font-semibold text-emerald-600 hidden sm:inline">🏆 Winner</span>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 sm:gap-2 mx-2 sm:mx-4">
            <div className={`text-xl sm:text-3xl font-black ${teamAWins ? "text-emerald-600" : "text-slate-700"}`}>
              {score}
            </div>
            <div className="rounded-full bg-slate-800 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-white">
              VS
            </div>
            <div className={`text-xl sm:text-3xl font-black ${teamBWins ? "text-emerald-600" : "text-slate-700"}`}>
              {scoreB}
            </div>
          </div>

          {/* Team B */}
          <div className={`flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0 ${teamBWins ? "opacity-100" : type === "finished" && !isDraw ? "opacity-60" : ""}`}>
            <div className="text-right min-w-0">
              <div className={`font-bold text-sm sm:text-base truncate ${teamBWins ? "text-emerald-700" : "text-slate-800"}`}>
                {teamB}
              </div>
              {teamBWins && type === "finished" && (
                <span className="text-xs font-semibold text-emerald-600 hidden sm:inline">🏆 Winner</span>
              )}
            </div>
            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full grid place-items-center font-black text-sm sm:text-lg flex-shrink-0 ${
              teamBWins 
                ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white ring-2 ring-emerald-300" 
                : "bg-slate-100 text-slate-600"
            }`}>
              {teamB[0]}
            </div>
          </div>
        </div>
      </div>

      {/* footer */}
      {!compact && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <span className="flex items-center gap-1.5 truncate">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{venue || "Venue TBD"}</span>
            </span>
            {type === "live" ? (
              <span className="flex items-center gap-1 text-red-500 font-medium whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Live Now
              </span>
            ) : (
              <span className="text-slate-400 hidden sm:inline">Match Completed</span>
            )}
          </div>
          {isDraw && type === "finished" && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
              Draw
            </span>
          )}
        </div>
      )}
    </div>
  );
}
