import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { Trophy, Medal, Award, Crown, Star, Sparkles } from "lucide-react";

interface ResultData {
  _id: string;
  champion: {
    department: string;
  };
  runnerUp: {
    department: string;
  };
  thirdPlace: {
    department: string;
  };
  year: number;
  isActive: boolean;
}

const ResultsPage = () => {
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.RESULT_GET);
      if (response.data.success && response.data.data) {
        setResult(response.data.data);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError("Failed to load results");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading results...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 opacity-50" />
          <h1 className="text-4xl font-bold text-white mb-4">Championship Results</h1>
          <p className="text-gray-300 text-lg">
            Results will be announced after the tournament ends.
          </p>
          <p className="text-gray-400 mt-2">Stay tuned for the final standings!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 pt-20 pb-16 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-500">
              Championship Results
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-gray-300 text-xl">Apex Sports Fiesta {result.year}</p>
        </div>

        {/* Podium Section */}
        <div className="flex flex-col items-center">
          {/* Top 3 Cards - Desktop Layout */}
          <div className="hidden md:flex items-end justify-center gap-6 mb-8 w-full max-w-5xl">
            
            {/* 2nd Place - Runner Up (Left) */}
            <div className="flex-1 max-w-xs transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 rounded-t-3xl p-6 text-center shadow-2xl border-4 border-gray-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-400/20 to-transparent"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
                    <Medal className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-6xl font-black text-gray-700 mb-2">2</div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Runner Up</div>
                  <div className="bg-white/80 backdrop-blur rounded-xl py-4 px-3">
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">
                      {result.runnerUp.department}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="h-32 bg-gradient-to-b from-gray-400 to-gray-500 rounded-b-lg shadow-xl"></div>
            </div>

            {/* 1st Place - Champion (Center) */}
            <div className="flex-1 max-w-sm transform hover:scale-105 transition-all duration-300 -mt-8">
              <div className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-t-3xl p-8 text-center shadow-2xl border-4 border-yellow-400 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/20 to-transparent"></div>
                {/* Crown */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <Crown className="w-12 h-12 text-yellow-700 drop-shadow-lg" />
                </div>
                <div className="relative z-10 mt-4">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-yellow-300">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                  <div className="text-7xl font-black text-yellow-800 mb-2">1</div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-yellow-700 fill-yellow-700" />
                    <span className="text-sm font-bold text-yellow-800 uppercase tracking-wider">Champions</span>
                    <Star className="w-5 h-5 text-yellow-700 fill-yellow-700" />
                  </div>
                  <div className="bg-white/90 backdrop-blur rounded-xl py-5 px-4">
                    <h3 className="text-2xl font-extrabold text-amber-700 leading-tight">
                      {result.champion.department}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="h-44 bg-gradient-to-b from-amber-500 to-amber-700 rounded-b-lg shadow-xl"></div>
            </div>

            {/* 3rd Place (Right) */}
            <div className="flex-1 max-w-xs transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-orange-300 via-orange-400 to-amber-600 rounded-t-3xl p-6 text-center shadow-2xl border-4 border-orange-400 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 to-transparent"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-6xl font-black text-orange-800 mb-2">3</div>
                  <div className="text-sm font-semibold text-orange-700 uppercase tracking-wider mb-3">Third Place</div>
                  <div className="bg-white/80 backdrop-blur rounded-xl py-4 px-3">
                    <h3 className="text-xl font-bold text-orange-800 leading-tight">
                      {result.thirdPlace.department}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="h-24 bg-gradient-to-b from-orange-500 to-orange-700 rounded-b-lg shadow-xl"></div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-6 w-full max-w-sm">
            {/* Champion */}
            <div className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-2xl p-6 text-center shadow-2xl border-4 border-yellow-400 relative overflow-hidden">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                <Crown className="w-10 h-10 text-yellow-700" />
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-black text-yellow-800">1</span>
                    <span className="text-sm font-bold text-yellow-700 uppercase">Champions</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-amber-800">{result.champion.department}</h3>
                </div>
              </div>
            </div>

            {/* Runner Up */}
            <div className="bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 rounded-2xl p-5 text-center shadow-xl border-4 border-gray-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
                  <Medal className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-gray-700">2</span>
                    <span className="text-sm font-bold text-gray-600 uppercase">Runner Up</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{result.runnerUp.department}</h3>
                </div>
              </div>
            </div>

            {/* Third Place */}
            <div className="bg-gradient-to-br from-orange-300 via-orange-400 to-amber-600 rounded-2xl p-5 text-center shadow-xl border-4 border-orange-400">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-orange-800">3</span>
                    <span className="text-sm font-bold text-orange-700 uppercase">Third Place</span>
                  </div>
                  <h3 className="text-lg font-bold text-orange-800">{result.thirdPlace.department}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Congratulations Banner */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/20">
            <p className="text-2xl font-bold text-white mb-2">
              🎊 Congratulations to all participants! 🎊
            </p>
            <p className="text-gray-300">
              Thank you for making Apex Sports Fiesta {result.year} a grand success!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
