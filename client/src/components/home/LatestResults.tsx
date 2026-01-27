import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import { API_ENDPOINTS } from "../../config/api";

interface Match {
  _id: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: string;
}

export default function LatestResults() {
  const [results, setResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.MATCHES_LIST);
        const data = await response.json();
        // Filter completed/finished matches
        const completedMatches = (data.matches || []).filter(
          (m: Match) => m.status === "completed" || m.status === "finished"
        ).slice(0, 3);
        setResults(completedMatches);
      } catch (error) {
        console.error("Failed to fetch results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 sm:px-5 py-3 sm:py-4">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Latest Results</h2>

        <a
          href="/scores"
          className="text-xs sm:text-sm font-semibold text-blue-700 hover:underline"
        >
          View All
        </a>
      </div>

      {/* Results List */}
      <div className="divide-y">
        {loading ? (
          <div className="px-3 sm:px-5 py-8 text-center text-slate-500">Loading results...</div>
        ) : results.length === 0 ? (
          <div className="px-3 sm:px-5 py-8 text-center text-slate-500">No completed matches yet</div>
        ) : (
          results.map((match) => (
            <div key={match._id} className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 gap-2">
              <div className="font-semibold text-slate-900 text-xs sm:text-base flex-1 truncate">{match.teamA || "TBD"}</div>

              <div className="font-black text-slate-800 text-sm sm:text-base px-2">
                {match.scoreA ?? 0} - {match.scoreB ?? 0}
              </div>

              <div className="font-semibold text-slate-900 text-xs sm:text-base flex-1 text-right truncate">{match.teamB || "TBD"}</div>

              <span className="rounded bg-red-600 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-bold text-white hidden sm:inline">
                FINAL
              </span>
            </div>
          ))
        )}
      </div>

    </Card>
  );
}
