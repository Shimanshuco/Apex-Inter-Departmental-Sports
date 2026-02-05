import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { API_ENDPOINTS } from "../config/api";
import { Trophy, Medal, Award, Filter, Users } from "lucide-react";

interface Score {
  _id: string;
  sport: string;
  category: string;
  winner: {
    department: string;
    playerName?: string;
  };
  runnerUp: {
    department: string;
    playerName?: string;
  };
  secondRunnerUp?: {
    department?: string;
    playerName?: string;
  };
  year: number;
}

const SPORTS_ORDER = [
  "Football",
  "Volleyball",
  "Basketball",
  "Kabaddi",
  "Cricket",
  "Kho Kho",
  "Tug of War",
  "Badminton - Singles",
  "Badminton - Doubles",
  "Table Tennis - Singles",
  "Table Tennis - Doubles",
  "Chess",
  "Athletics - 100m",
  "Athletics - 200m",
];

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.SCORES_LIST);
        const data = await response.json();
        setScores(data.scores || []);
        setTimeout(() => setShowAnimation(true), 100);
      } catch (err: any) {
        setError(err.message || "Failed to load scores");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  const filteredScores = scores
    .filter((score) => selectedCategory === "All" || score.category === selectedCategory)
    .sort((a, b) => {
      const indexA = SPORTS_ORDER.indexOf(a.sport);
      const indexB = SPORTS_ORDER.indexOf(b.sport);
      return indexA - indexB;
    });

  const groupedScores = filteredScores.reduce((acc, score) => {
    const baseSport = score.sport.split(" - ")[0];
    if (!acc[baseSport]) {
      acc[baseSport] = [];
    }
    acc[baseSport].push(score);
    return acc;
  }, {} as Record<string, Score[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar />

      <main>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Sports Scores
            </h1>
            <p className="text-slate-300 mt-1 text-sm sm:text-base">Complete results of all sports events</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Filter className="w-4 h-4 text-slate-500" />
              {["All", "Boys", "Girls"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? cat === "Boys"
                        ? "bg-blue-500 text-white"
                        : cat === "Girls"
                        ? "bg-pink-500 text-white"
                        : "bg-slate-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat === "All" ? "All Categories" : cat}
                </button>
              ))}
              <div className="ml-auto text-xs sm:text-sm text-slate-500">
                {filteredScores.length} results
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <section className="mx-auto max-w-6xl px-4 py-8">
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent"></div>
              <p className="text-slate-500 text-lg mt-4">Loading scores...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-200">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          )}

          {!loading && !error && filteredScores.length === 0 && (
            <div className="text-center py-16">
              <Trophy className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-xl">No scores available yet</p>
              <p className="text-slate-400 mt-2">Results will be posted as events complete</p>
            </div>
          )}

          {!loading && !error && filteredScores.length > 0 && (
            <div className="space-y-8">
              {Object.entries(groupedScores).map(([sportGroup, sportScores], groupIndex) => (
                <div
                  key={sportGroup}
                  className={`transition-all duration-700 ${
                    showAnimation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${groupIndex * 100}ms` }}
                >
                  {/* Sport Group Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">{sportGroup}</h2>
                  </div>

                  {/* Score Cards Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {sportScores.map((score, index) => (
                      <div
                        key={score._id}
                        className={`bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-yellow-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/20 hover:-translate-y-1 shadow-sm`}
                      >
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">
                              {score.sport.includes(" - ") ? score.sport.split(" - ")[1] : score.sport}
                            </span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              score.category === "Boys"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                            }`}
                          >
                            <Users className="w-3 h-3 inline mr-1" />
                            {score.category}
                          </span>
                        </div>

                        {/* Podium Results */}
                        <div className="p-4 space-y-3">
                          {/* Winner */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-transparent rounded-xl p-3 border-l-4 border-yellow-500">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                              <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-yellow-600 font-medium uppercase tracking-wider">Winner</div>
                              <div className="font-bold text-slate-800">{score.winner.department}</div>
                              {score.winner.playerName && (
                                <div className="text-xs text-slate-500">{score.winner.playerName}</div>
                              )}
                            </div>
                            <div className="text-2xl font-black text-yellow-500">1st</div>
                          </div>

                          {/* Runner Up */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-slate-100 to-transparent rounded-xl p-3 border-l-4 border-slate-400">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center shadow-lg">
                              <Medal className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Runner Up</div>
                              <div className="font-bold text-slate-800">{score.runnerUp.department}</div>
                              {score.runnerUp.playerName && (
                                <div className="text-xs text-slate-500">{score.runnerUp.playerName}</div>
                              )}
                            </div>
                            <div className="text-2xl font-black text-slate-400">2nd</div>
                          </div>

                          {/* 2nd Runner Up */}
                          {score.secondRunnerUp?.department && (
                            <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-transparent rounded-xl p-3 border-l-4 border-orange-500">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-700 flex items-center justify-center shadow-lg">
                                <Award className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="text-xs text-orange-600 font-medium uppercase tracking-wider">2nd Runner Up</div>
                                <div className="font-bold text-slate-800">{score.secondRunnerUp.department}</div>
                                {score.secondRunnerUp.playerName && (
                                  <div className="text-xs text-slate-500">{score.secondRunnerUp.playerName}</div>
                                )}
                              </div>
                              <div className="text-2xl font-black text-orange-500">3rd</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
