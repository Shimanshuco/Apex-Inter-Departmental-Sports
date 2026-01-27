import hero from "../../assets/hero.png";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* background image */}
      <div
        className="h-[420px] sm:h-[520px] w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${hero})`,
        }}
      >
        {/* overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        
        {/* Animated floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large glowing orbs */}
          <div className="absolute top-20 left-[10%] w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-32 right-[15%] w-48 h-48 bg-amber-500/15 rounded-full blur-3xl animate-float-medium"></div>
          <div className="absolute top-1/3 right-[30%] w-32 h-32 bg-orange-400/10 rounded-full blur-2xl animate-float-fast"></div>
          
          {/* Small sparkles */}
          <div className="absolute top-[20%] left-[20%] w-2 h-2 bg-yellow-300 rounded-full animate-sparkle"></div>
          <div className="absolute top-[30%] right-[25%] w-1.5 h-1.5 bg-white rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-[35%] left-[35%] w-2 h-2 bg-amber-300 rounded-full animate-sparkle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-[45%] right-[40%] w-1 h-1 bg-yellow-200 rounded-full animate-sparkle" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-[45%] left-[15%] w-1.5 h-1.5 bg-white rounded-full animate-sparkle" style={{ animationDelay: '0.8s' }}></div>
          <div className="absolute top-[60%] right-[20%] w-2 h-2 bg-amber-200 rounded-full animate-sparkle" style={{ animationDelay: '1.2s' }}></div>
        </div>
      </div>

      {/* content */}
      <div className="absolute inset-0">
        <div className="mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-4 text-center pt-4 sm:pt-0">
          {/* Apex University Badge */}
          <div className="animate-slide-down mb-2 sm:mb-0">
            <span className="inline-block px-3 sm:px-5 py-1 sm:py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-full text-white text-[10px] sm:text-sm font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase shadow-lg hover:bg-white/20 transition-all duration-500 cursor-default">
              ✨ Apex University Presents ✨
            </span>
          </div>

          {/* Main Title with Animation */}
          <div className="relative mt-2 sm:mt-4">
            {/* Glow effect behind text */}
            <div className="absolute inset-0 blur-[100px] bg-gradient-to-r from-yellow-400/40 via-amber-500/50 to-yellow-400/40 animate-glow-pulse"></div>
            
            <h1 className="relative">
              {/* SPORTS FIESTA - BIGGER than 2026 */}
              <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight animate-title-reveal">
                <span className="inline-block animate-letter-bounce" style={{ animationDelay: '0.1s' }}>S</span>
                <span className="inline-block animate-letter-bounce" style={{ animationDelay: '0.15s' }}>P</span>
                <span className="inline-block animate-letter-bounce" style={{ animationDelay: '0.2s' }}>O</span>
                <span className="inline-block animate-letter-bounce" style={{ animationDelay: '0.25s' }}>R</span>
                <span className="inline-block animate-letter-bounce" style={{ animationDelay: '0.3s' }}>T</span>
                <span className="inline-block animate-letter-bounce" style={{ animationDelay: '0.35s' }}>S</span>
                <span className="inline-block mx-1 sm:mx-3"></span>
                <span className="inline-block animate-letter-bounce" style={{ animationDelay: '0.45s' }}>F</span>
                <span className="inline-block animate-letter-bounce" style={{ animationDelay: '0.5s' }}>I</span>
                <span className="inline-block animate-letter-bounce" style={{ animationDelay: '0.55s' }}>E</span>
                <span className="inline-block animate-letter-bounce" style={{ animationDelay: '0.6s' }}>S</span>
                <span className="inline-block animate-letter-bounce" style={{ animationDelay: '0.65s' }}>T</span>
                <span className="inline-block animate-letter-bounce" style={{ animationDelay: '0.7s' }}>A</span>
              </span>
              
              {/* 2026 - SMALLER than SPORTS FIESTA */}
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mt-1 tracking-tighter animate-scale-in" style={{ animationDelay: '0.8s', textShadow: '0 0 60px rgba(251, 191, 36, 0.5), 0 0 100px rgba(251, 191, 36, 0.3)' }}>
                2026
              </span>
            </h1>
          </div>

          {/* Subtitle with typing effect look */}
          <div className="mt-2 sm:mt-4 overflow-hidden">
            <p className="text-[10px] sm:text-lg md:text-xl text-white font-semibold tracking-widest uppercase animate-slide-up" style={{ animationDelay: '1s' }}>
              Inter-Departmental Championship
            </p>
          </div>

          {/* Animated line separator */}
          <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3 animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <div className="w-6 sm:w-16 h-0.5 bg-gradient-to-r from-transparent to-yellow-400 animate-line-grow-left"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rotate-45 animate-pulse"></div>
            <div className="w-6 sm:w-16 h-0.5 bg-gradient-to-l from-transparent to-yellow-400 animate-line-grow-right"></div>
          </div>

          {/* Feature Tags with staggered animation - hidden on mobile */}
          <div className="mt-2 sm:mt-4 hidden sm:flex flex-wrap justify-center gap-2 sm:gap-3">
            {['🏆 Live Scores', '📅 Schedules', '👥 Teams', '🎯 Results'].map((tag, index) => (
              <span 
                key={tag}
                className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium border border-white/20 hover:bg-yellow-400/20 hover:border-yellow-400/50 hover:scale-110 transition-all duration-300 cursor-default animate-pop-in"
                style={{ animationDelay: `${1.3 + index * 0.1}s` }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-3 sm:mt-6 flex flex-row gap-2 sm:gap-4 w-auto px-2 sm:px-0 animate-slide-up" style={{ animationDelay: '1.7s' }}>
            <Button to="/schedule" variant="primary">
              View Schedule
            </Button>

            <Button to="/scores" variant="warning">
              Latest Results
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom decorative animated line */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-shimmer-line"></div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(20px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(-15px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes letter-bounce {
          0% { opacity: 0; transform: translateY(-50px) scale(0.5); }
          60% { transform: translateY(10px) scale(1.1); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0); }
          70% { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes line-grow-left {
          from { width: 0; opacity: 0; }
          to { width: 5rem; opacity: 1; }
        }
        @keyframes line-grow-right {
          from { width: 0; opacity: 0; }
          to { width: 5rem; opacity: 1; }
        }
        @keyframes shimmer-line {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
        .animate-slide-down { animation: slide-down 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; opacity: 0; }
        .animate-scale-in { animation: scale-in 0.6s ease-out forwards; opacity: 0; }
        .animate-letter-bounce { 
          animation: letter-bounce 0.6s ease-out forwards; 
          opacity: 0;
          background: linear-gradient(135deg, #fde047 0%, #f59e0b 50%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        .animate-pop-in { animation: pop-in 0.5s ease-out forwards; opacity: 0; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; opacity: 0; }
        .animate-shimmer-line { 
          background-size: 200% 100%;
          animation: shimmer-line 3s linear infinite;
        }
      `}</style>
    </section>
  );
}
