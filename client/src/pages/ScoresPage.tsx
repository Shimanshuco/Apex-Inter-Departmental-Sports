import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import FeaturedLiveMatch from "../components/scores/FeaturedLiveMatch";
import MatchCard from "../components/scores/MatchCard";
import RecentResults from "../components/scores/RecentResults";
import { API_ENDPOINTS } from "../config/api";

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

export default function ScoresPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.MATCHES_LIST);
        const data = await response.json();
        setMatches(data.matches || []);
      } catch (err: any) {
        setError(err.message || "Failed to load matches");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar />

      <main>
        {/* Page Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b border-slate-600/50">
          <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Scores & Results
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/80 mt-1">
              Track all matches and scores in real-time
            </p>
          </div>
        </div>

        {/* Live Match Section */}
        <div className="bg-slate-100/50 py-2">
          <div className="mx-auto max-w-6xl px-3 sm:px-4">
            <div className="flex items-center gap-2 py-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">Live Match</h2>
            </div>
          </div>
        </div>

        {/* Big featured live match */}
        <FeaturedLiveMatch />

        {/* Match Results Section */}
        <section className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-10">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Match Results</h2>
          </div>

          {loading && (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600"></div>
              <p className="text-slate-500 text-sm sm:text-base mt-3">Loading matches...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8 sm:py-12 bg-red-50 rounded-xl border border-red-100">
              <p className="text-red-600 text-sm sm:text-base">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
              {/* Left (match cards) */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-5">
                {matches.filter(m => m.status === "completed" || m.status === "finished" || m.status === "live").length > 0 ? (
                  matches
                    .filter(m => m.status === "completed" || m.status === "finished" || m.status === "live")
                    .map((match) => (
                    <MatchCard
                      key={match._id}
                      type={match.status === "live" ? "live" : "finished"}
                      title={match.sport}
                      teamA={match.teamA || "TBD"}
                      teamB={match.teamB || "TBD"}
                      score={match.scoreA?.toString() || "0"}
                      scoreB={match.scoreB?.toString() || "0"}
                      status={match.status === "live" ? "LIVE" : "FINAL"}
                      venue={match.venue}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 sm:py-14 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-600 text-base sm:text-lg font-medium">No matches available</p>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">Scores will appear once matches are played</p>
                  </div>
                )}
              </div>

              {/* Right Side */}
              <div className="space-y-4 sm:space-y-6">
                <RecentResults />
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
