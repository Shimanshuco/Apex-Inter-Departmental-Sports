import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import ScoresFilterBar from "../components/scores/ScoresFilterBar";
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
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main>
        {/* Filter row */}
        <ScoresFilterBar />

        {/* Big featured live match */}
        <FeaturedLiveMatch />

        {/* Below Section */}
        <section className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-10">
          {loading && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-slate-600 text-sm sm:text-base">Loading matches...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-red-600 text-sm sm:text-base">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
              {/* Left (match cards) */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
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
                  <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow">
                    <p className="text-slate-500 text-base sm:text-lg">No completed or live matches</p>
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
