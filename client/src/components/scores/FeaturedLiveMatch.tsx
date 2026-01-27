import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "../../config/api";

interface Match {
  _id: string;
  teamA: string;
  teamB: string;
  sport: string;
  venue: string;
  scoreA: number;
  scoreB: number;
  status: string;
  date: string;
}

export default function FeaturedLiveMatch() {
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveMatch = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.MATCHES_LIST);
        const data = await response.json();
        // Find the first live match
        const live = (data.matches || []).find((m: Match) => m.status === "live");
        setLiveMatch(live || null);
      } catch (error) {
        console.error("Failed to fetch live match:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveMatch();
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="relative overflow-hidden rounded-xl shadow-lg">
          <div className="h-[280px] w-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 flex items-center justify-center">
            <p className="text-white/80">Loading live match...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!liveMatch) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="relative overflow-hidden rounded-xl shadow-lg">
          <div className="h-[200px] w-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 flex flex-col items-center justify-center">
            <p className="text-white/80 text-lg font-semibold">No Live Matches Right Now</p>
            <p className="text-white/60 text-sm mt-2">Check the schedule for upcoming matches</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        {/* background */}
        <div className="h-[280px] w-full bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900">
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* LIVE badge */}
        <div className="absolute right-5 top-5 rounded bg-red-600 px-3 py-1 text-xs font-bold text-white animate-pulse">
          LIVE
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
          <div className="text-sm font-bold text-white/80 uppercase">
            LIVE MATCH
          </div>
          <div className="mt-1 text-white/80 font-semibold">
            {liveMatch.sport}
          </div>

          <div className="mt-5 flex flex-col md:flex-row md:items-center md:gap-8">
            {/* Left Team */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded bg-white/15 grid place-items-center font-black text-white">
                {(liveMatch.teamA || "T")[0]}
              </div>
              <div className="text-white font-bold text-lg">
                {liveMatch.teamA || "TBD"}
              </div>
            </div>

            {/* Score */}
            <div className="mt-4 md:mt-0 flex items-center gap-3 text-white">
              <div className="text-4xl font-black">{liveMatch.scoreA ?? 0}</div>
              <div className="rounded bg-white/15 px-3 py-1 text-sm font-extrabold">
                VS
              </div>
              <div className="text-4xl font-black">{liveMatch.scoreB ?? 0}</div>
            </div>

            {/* Right Team */}
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="h-12 w-12 rounded bg-white/15 grid place-items-center font-black text-white">
                {(liveMatch.teamB || "T")[0]}
              </div>
              <div className="text-white font-bold text-lg">
                {liveMatch.teamB || "TBD"}
              </div>
            </div>
          </div>

          {/* meta */}
          <div className="mt-4 text-sm text-white/80">
            {liveMatch.venue}
          </div>
        </div>
      </div>
    </section>
  );
}
