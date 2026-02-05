import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { Trophy, Medal, Award, Crown, Star, Sparkles, PartyPopper, Flame } from "lucide-react";

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
  const [showContent, setShowContent] = useState(false);
  const [showPodium, setShowPodium] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchResult();
  }, []);

  useEffect(() => {
    if (result) {
      // Staggered animations
      setTimeout(() => setShowContent(true), 200);
      setTimeout(() => setShowPodium(true), 600);
      setTimeout(() => setShowConfetti(true), 1000);
    }
  }, [result]);

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
        <div className="text-center">
          <div className="relative">
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto animate-bounce" />
            <div className="absolute inset-0 w-20 h-20 mx-auto animate-ping">
              <Trophy className="w-20 h-20 text-yellow-400/30" />
            </div>
          </div>
          <p className="text-white text-xl mt-6 animate-pulse">Loading Championship Results...</p>
          <div className="flex justify-center gap-1 mt-4">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 pt-24 pb-16 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="animate-bounce">
            <Trophy className="w-28 h-28 text-yellow-400/40 mx-auto mb-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Championship Results
          </h1>
          <p className="text-gray-300 text-lg">
            Results will be announced after the tournament ends.
          </p>
          <p className="text-gray-400 mt-2">Stay tuned for the final standings!</p>
          
          <div className="mt-12 flex justify-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-xl flex items-center justify-center animate-pulse">
              <Star className="w-8 h-8 text-yellow-400/60" />
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400/20 to-gray-600/20 rounded-xl flex items-center justify-center animate-pulse" style={{ animationDelay: "0.3s" }}>
              <Medal className="w-8 h-8 text-gray-400/60" />
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-xl flex items-center justify-center animate-pulse" style={{ animationDelay: "0.6s" }}>
              <Award className="w-8 h-8 text-orange-400/60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 pt-20 pb-16 overflow-hidden relative">
      {/* Animated Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-20px",
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ["#fbbf24", "#f472b6", "#60a5fa", "#34d399", "#a78bfa", "#fb923c"][
                    Math.floor(Math.random() * 6)
                  ],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        
        {/* Floating sparkles */}
        {[...Array(12)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute text-yellow-400/30 animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${12 + Math.random() * 16}px`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <PartyPopper className="w-8 h-8 text-pink-400 animate-wiggle" />
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-500 animate-shimmer bg-[length:200%_100%]">
              Championship Results
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            <PartyPopper className="w-8 h-8 text-pink-400 animate-wiggle" style={{ animationDelay: "0.5s" }} />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-5 h-5 text-orange-400 animate-flicker" />
            <p className="text-gray-300 text-xl">Apex Sports Fiesta {result.year}</p>
            <Flame className="w-5 h-5 text-orange-400 animate-flicker" style={{ animationDelay: "0.2s" }} />
          </div>
        </div>

        {/* Podium Section */}
        <div className="flex flex-col items-center">
          {/* Top 3 Cards - Desktop Layout */}
          <div className="hidden md:flex items-end justify-center gap-6 mb-8 w-full max-w-5xl">
            
            {/* 2nd Place - Runner Up (Left) */}
            <div className={`flex-1 max-w-xs transition-all duration-1000 ${showPodium ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`} style={{ transitionDelay: "0.4s" }}>
              <div className="transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 group">
                <div className="bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 rounded-t-3xl p-6 text-center shadow-2xl border-4 border-gray-300 relative overflow-hidden group-hover:shadow-gray-400/50 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-400/20 to-transparent"></div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
                      <Medal className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-6xl font-black text-gray-700 mb-2 animate-bounce-subtle">2</div>
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Runner Up</div>
                    <div className="bg-white/80 backdrop-blur rounded-xl py-4 px-3 transform group-hover:scale-105 transition-transform duration-300">
                      <h3 className="text-xl font-bold text-gray-800 leading-tight">
                        {result.runnerUp.department}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="h-32 bg-gradient-to-b from-gray-400 to-gray-500 rounded-b-lg shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-shine"></div>
                </div>
              </div>
            </div>

            {/* 1st Place - Champion (Center) */}
            <div className={`flex-1 max-w-sm -mt-8 transition-all duration-1000 ${showPodium ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-20 scale-90"}`} style={{ transitionDelay: "0.2s" }}>
              <div className="transform hover:scale-105 hover:-translate-y-3 transition-all duration-500 group">
                <div className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-t-3xl p-8 text-center shadow-2xl border-4 border-yellow-400 relative overflow-hidden group-hover:shadow-yellow-500/50 group-hover:shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/20 to-transparent"></div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Crown */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 animate-bounce-slow">
                    <Crown className="w-14 h-14 text-yellow-700 drop-shadow-lg" />
                  </div>
                  
                  <div className="relative z-10 mt-6">
                    <div className="w-28 h-28 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-yellow-300 animate-glow">
                      <Trophy className="w-14 h-14 text-white animate-pulse-slow" />
                    </div>
                    <div className="text-7xl font-black text-yellow-800 mb-2 animate-bounce-subtle">1</div>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Star className="w-5 h-5 text-yellow-700 fill-yellow-700 animate-spin-slow" />
                      <span className="text-sm font-bold text-yellow-800 uppercase tracking-wider">Champions</span>
                      <Star className="w-5 h-5 text-yellow-700 fill-yellow-700 animate-spin-slow" style={{ animationDirection: "reverse" }} />
                    </div>
                    <div className="bg-white/90 backdrop-blur rounded-xl py-5 px-4 transform group-hover:scale-105 transition-transform duration-300">
                      <h3 className="text-2xl font-extrabold text-amber-700 leading-tight">
                        {result.champion.department}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="h-48 bg-gradient-to-b from-amber-500 to-amber-700 rounded-b-lg shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shine"></div>
                  {/* Trophy pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="flex flex-wrap justify-center gap-4 p-4">
                      {[...Array(6)].map((_, i) => (
                        <Trophy key={i} className="w-8 h-8" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3rd Place (Right) */}
            <div className={`flex-1 max-w-xs transition-all duration-1000 ${showPodium ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`} style={{ transitionDelay: "0.6s" }}>
              <div className="transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 group">
                <div className="bg-gradient-to-br from-orange-300 via-orange-400 to-amber-600 rounded-t-3xl p-6 text-center shadow-2xl border-4 border-orange-400 relative overflow-hidden group-hover:shadow-orange-500/50 group-hover:shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 to-transparent"></div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-6xl font-black text-orange-800 mb-2 animate-bounce-subtle">3</div>
                    <div className="text-sm font-semibold text-orange-700 uppercase tracking-wider mb-3">Third Place</div>
                    <div className="bg-white/80 backdrop-blur rounded-xl py-4 px-3 transform group-hover:scale-105 transition-transform duration-300">
                      <h3 className="text-xl font-bold text-orange-800 leading-tight">
                        {result.thirdPlace.department}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="h-24 bg-gradient-to-b from-orange-500 to-orange-700 rounded-b-lg shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-shine"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout - Podium Style */}
          <div className="md:hidden flex flex-col items-center w-full px-2">
            {/* Podium arrangement - 2nd, 1st, 3rd in a row */}
            <div className="flex items-end justify-center gap-2 w-full max-w-md">
              
              {/* 2nd Place - Runner Up (Left) */}
              <div className={`flex-1 max-w-[30%] transition-all duration-1000 ${showPodium ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`} style={{ transitionDelay: "0.4s" }}>
                <div className="transform active:scale-95 transition-all duration-300">
                  <div className="bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 rounded-t-2xl p-3 text-center shadow-2xl border-2 border-gray-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-400/20 to-transparent"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
                        <Medal className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-4xl font-black text-gray-700 mb-1 animate-bounce-subtle">2</div>
                      <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">Runner Up</div>
                      <div className="bg-white/80 backdrop-blur rounded-lg py-2 px-1">
                        <h3 className="text-xs font-bold text-gray-800 leading-tight break-words">
                          {result.runnerUp.department}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="h-16 bg-gradient-to-b from-gray-400 to-gray-500 rounded-b-lg shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-shine"></div>
                  </div>
                </div>
              </div>

              {/* 1st Place - Champion (Center) */}
              <div className={`flex-1 max-w-[40%] -mt-4 transition-all duration-1000 ${showPodium ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-20 scale-90"}`} style={{ transitionDelay: "0.2s" }}>
                <div className="transform active:scale-95 transition-all duration-300">
                  <div className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-t-2xl p-4 text-center shadow-2xl border-2 border-yellow-400 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/20 to-transparent"></div>
                    
                    {/* Crown */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 animate-bounce-slow">
                      <Crown className="w-8 h-8 text-yellow-700 drop-shadow-lg" />
                    </div>
                    
                    <div className="relative z-10 mt-4">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-yellow-300 animate-glow">
                        <Trophy className="w-8 h-8 text-white animate-pulse-slow" />
                      </div>
                      <div className="text-5xl font-black text-yellow-800 mb-1 animate-bounce-subtle">1</div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Star className="w-3 h-3 text-yellow-700 fill-yellow-700 animate-spin-slow" />
                        <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider">Champions</span>
                        <Star className="w-3 h-3 text-yellow-700 fill-yellow-700 animate-spin-slow" style={{ animationDirection: "reverse" }} />
                      </div>
                      <div className="bg-white/90 backdrop-blur rounded-lg py-2 px-2">
                        <h3 className="text-sm font-extrabold text-amber-700 leading-tight break-words">
                          {result.champion.department}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="h-24 bg-gradient-to-b from-amber-500 to-amber-700 rounded-b-lg shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-shine"></div>
                    {/* Trophy pattern */}
                    <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                      <Trophy className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3rd Place (Right) */}
              <div className={`flex-1 max-w-[30%] transition-all duration-1000 ${showPodium ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`} style={{ transitionDelay: "0.6s" }}>
                <div className="transform active:scale-95 transition-all duration-300">
                  <div className="bg-gradient-to-br from-orange-300 via-orange-400 to-amber-600 rounded-t-2xl p-3 text-center shadow-2xl border-2 border-orange-400 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 to-transparent"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-orange-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-4xl font-black text-orange-800 mb-1 animate-bounce-subtle">3</div>
                      <div className="text-[10px] font-semibold text-orange-700 uppercase tracking-wider mb-2">Third Place</div>
                      <div className="bg-white/80 backdrop-blur rounded-lg py-2 px-1">
                        <h3 className="text-xs font-bold text-orange-800 leading-tight break-words">
                          {result.thirdPlace.department}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="h-12 bg-gradient-to-b from-orange-500 to-orange-700 rounded-b-lg shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-shine"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Congratulations Banner */}
        <div className={`mt-16 text-center transition-all duration-1000 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`} style={{ transitionDelay: "1s" }}>
          <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20 shadow-xl transform hover:scale-105 transition-all duration-500 hover:bg-white/15">
            <div className="flex items-center justify-center gap-3 mb-3">
              <PartyPopper className="w-8 h-8 text-pink-400 animate-wiggle" />
              <p className="text-2xl md:text-3xl font-bold text-white">
                Congratulations to all participants!
              </p>
              <PartyPopper className="w-8 h-8 text-pink-400 animate-wiggle" style={{ animationDelay: "0.3s" }} />
            </div>
            <p className="text-gray-300 text-lg">
              Thank you for making Apex Sports Fiesta {result.year} a grand success!
            </p>
            
            {/* Animated stars */}
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-twinkle"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        
        @keyframes flicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.8); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 3s linear infinite; }
        .animate-confetti { animation: confetti 5s linear forwards; }
        .animate-wiggle { animation: wiggle 0.5s ease-in-out infinite; }
        .animate-flicker { animation: flicker 1s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-shine { animation: shine 3s ease-in-out infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ResultsPage;
