import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

interface TeamMember {
  name: string;
  role: string;
  description: string;
  icon: string;
  gradient: string;
  shadowColor: string;
  github?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Yogesh Rao",
    role: "Head of Department",
    description: "Our HOD who believed in us and gave us this amazing opportunity.",
    icon: "👨‍💼",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    shadowColor: "shadow-amber-500/40",
  },
  {
    name: "Ravi Joshi",
    role: "Project Guidance",
    description: "Guided us through every step. Always there when we needed help.",
    icon: "🎯",
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    shadowColor: "shadow-blue-500/40",
  },
  {
    name: "Himanshu Kumar Singh",
    role: "Lead Developer",
    description: "Built the entire platform from scratch. Loves turning ideas into working code.",
    icon: "💻",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    shadowColor: "shadow-emerald-500/40",
    github: "https://github.com/Shimanshuco",
  },
  {
    name: "Kapil",
    role: "System Architect",
    description: "Designed the database and backend structure. Makes sure everything runs smoothly.",
    icon: "⚙️",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    shadowColor: "shadow-purple-500/40",
    github: "https://github.com/kapily29",
  },
  {
    name: "Rajnish",
    role: "Content Strategist",
    description: "Helped with all the content and made sure information is always up to date.",
    icon: "📝",
    gradient: "from-rose-500 via-red-500 to-orange-500",
    shadowColor: "shadow-rose-500/40",
  },
];

export default function AboutPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      <Navbar />

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-5deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes particle-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        @keyframes border-flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 7s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        .animate-slide-down { animation: slide-down 0.8s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.6s ease-out forwards; }
        .animate-rotate-slow { animation: rotate-slow 20s linear infinite; }
        .animate-shimmer { 
          background: linear-gradient(90deg, #fbbf24 0%, #ffffff 50%, #fbbf24 100%);
          background-size: 200% auto;
          animation: text-shimmer 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .animate-border-flow {
          background: linear-gradient(90deg, #fbbf24, #f59e0b, #ef4444, #f59e0b, #fbbf24);
          background-size: 200% 100%;
          animation: border-flow 3s linear infinite;
        }
      `}</style>

      {/* Hero Section - The Creators */}
      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient Base */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
          
          {/* Floating Orbs */}
          <div className="absolute top-20 left-[10%] w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] animate-glow-pulse"></div>
          <div className="absolute bottom-20 right-[10%] w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
          
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/60 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `particle-float ${8 + Math.random() * 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Pre-title Badge */}
          <div 
            className={`inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-8 ${isLoaded ? 'animate-slide-down' : 'opacity-0'}`}
          >
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-white/80 text-sm font-medium tracking-widest uppercase">Computer Science Engineering</span>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
          </div>

          {/* Main Title */}
          <h1 
            className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 ${isLoaded ? 'animate-scale-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}
          >
            <span className="block text-white/90">THE</span>
            <span className="block animate-shimmer">CREATORS</span>
          </h1>

          {/* Subtitle */}
          <p 
            className={`text-slate-400 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.4s' }}
          >
            Brilliant minds behind the <span className="text-amber-400 font-semibold">Sports Fiesta 2026</span> platform
          </p>

          {/* Animated Scroll Indicator */}
          <div 
            className={`flex flex-col items-center gap-2 ${isLoaded ? 'animate-slide-up' : 'opacity-0'}`}
            style={{ animationDelay: '0.6s' }}
          >
            <span className="text-slate-500 text-sm tracking-wider">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center p-2">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>

        {/* Decorative Rotating Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] pointer-events-none">
          <div className="absolute inset-0 border border-white/5 rounded-full animate-rotate-slow"></div>
          <div className="absolute inset-8 border border-dashed border-white/5 rounded-full animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }}></div>
        </div>
      </div>

      {/* Team Section */}
      <div className="relative py-24 sm:py-32">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full border border-amber-500/20 mb-6">
              <span className="text-2xl">✨</span>
              <span className="text-amber-400 text-sm font-semibold tracking-wider uppercase">The Visionaries</span>
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
              Minds That <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Shaped</span> Innovation
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Meet the extraordinary individuals who transformed vision into reality
            </p>
          </div>

          {/* Team Grid - Featured Layout */}
          <div className="space-y-8">
            {/* First Row - HOD (Featured) */}
            <div className="flex justify-center">
              <div 
                className={`relative w-full max-w-2xl group cursor-pointer transition-all duration-700 ${hoveredCard === 0 ? 'z-20' : 'z-10'}`}
                onMouseEnter={() => setHoveredCard(0)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${teamMembers[0].gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500`}></div>
                
                {/* Card */}
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-white/10 group-hover:border-amber-500/30 transition-all duration-500 overflow-hidden">
                  {/* Animated Border */}
                  <div className="absolute top-0 left-0 right-0 h-1 animate-border-flow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Background Pattern on Hover */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.1),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                    {/* Icon */}
                    <div className={`relative flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-br ${teamMembers[0].gradient} rounded-2xl flex items-center justify-center text-5xl sm:text-6xl ${teamMembers[0].shadowColor} shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      {teamMembers[0].icon}
                      {/* Pulse Ring */}
                      <div className="absolute inset-0 rounded-2xl border-2 border-amber-400/50 animate-ping opacity-0 group-hover:opacity-100"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="text-center sm:text-left flex-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full mb-3">
                        <span className="text-amber-400 text-xs font-bold tracking-wider uppercase">👑 Department Head</span>
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2 group-hover:text-amber-100 transition-colors">
                        {teamMembers[0].name}
                      </h3>
                      <p className={`text-lg font-semibold bg-gradient-to-r ${teamMembers[0].gradient} bg-clip-text text-transparent mb-3`}>
                        {teamMembers[0].role}
                      </p>
                      <p className="text-slate-400 leading-relaxed max-w-md">
                        {teamMembers[0].description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - Guidance */}
            <div className="flex justify-center">
              <div 
                className={`relative w-full max-w-xl group cursor-pointer transition-all duration-700 ${hoveredCard === 1 ? 'z-20' : 'z-10'}`}
                onMouseEnter={() => setHoveredCard(1)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`absolute -inset-1 bg-gradient-to-r ${teamMembers[1].gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-all duration-500`}></div>
                
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 group-hover:border-blue-500/30 transition-all duration-500">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${teamMembers[1].gradient} rounded-2xl flex items-center justify-center text-4xl ${teamMembers[1].shadowColor} shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}>
                      {teamMembers[1].icon}
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-100 transition-colors">
                        {teamMembers[1].name}
                      </h3>
                      <p className={`text-sm font-semibold bg-gradient-to-r ${teamMembers[1].gradient} bg-clip-text text-transparent mb-2`}>
                        {teamMembers[1].role}
                      </p>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {teamMembers[1].description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Third Row - Developer, Architect, Content */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {teamMembers.slice(2).map((member, index) => (
                <div 
                  key={index + 2}
                  className={`relative group cursor-pointer transition-all duration-700 ${hoveredCard === index + 2 ? 'z-20' : 'z-10'}`}
                  onMouseEnter={() => setHoveredCard(index + 2)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Glow */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${member.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500`}></div>
                  
                  {/* Card */}
                  <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500 h-full">
                    {/* Top Line */}
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${member.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center`}></div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${member.gradient} rounded-xl flex items-center justify-center text-3xl mb-4 ${member.shadowColor} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      {member.icon}
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform duration-300">
                      {member.name}
                    </h3>
                    <p className={`text-xs font-semibold bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent mb-3`}>
                      {member.role}
                    </p>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {member.description}
                    </p>
                    
                    {/* GitHub Link */}
                    {member.github && (
                      <a 
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-xs text-slate-300 hover:text-white transition-colors border border-white/10"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                      </a>
                    )}
                    
                    {/* Corner Decoration */}
                    <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-180">
                      <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Department Pride Section */}
      <div className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.15),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(16,185,129,0.15),transparent_50%)]"></div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            <div className="relative p-10 sm:p-16">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                {/* Left Content */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 rounded-full border border-amber-500/20 mb-6">
                    <span className="text-xl">🎓</span>
                    <span className="text-amber-300 text-sm font-bold tracking-wider">APEX UNIVERSITY</span>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
                    Computer Science
                    <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      Engineering
                    </span>
                  </h2>
                  
                  <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg">
                    Where innovation meets excellence. Our department is committed to shaping future tech leaders through cutting-edge education and research.
                  </p>
                  
                  {/* Values */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                    {[
                      { icon: "💡", text: "Innovation", color: "text-amber-400" },
                      { icon: "🎯", text: "Excellence", color: "text-emerald-400" },
                      { icon: "🤝", text: "Teamwork", color: "text-blue-400" },
                    ].map((value, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors duration-300">
                        <span>{value.icon}</span>
                        <span className={`text-sm font-semibold ${value.color}`}>{value.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Right - 3D Icon */}
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-emerald-400/30 rounded-3xl blur-3xl animate-glow-pulse"></div>
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/40 animate-float">
                    <span className="text-8xl sm:text-9xl">🎓</span>
                  </div>
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center text-2xl shadow-lg animate-float-reverse">
                    💻
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-xl shadow-lg animate-float">
                    ⚡
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thank You / Footer Section */}
      <div className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-slate-950"></div>
        
        <div className="relative z-10 text-center px-4">
          {/* Animated Heart */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl blur-2xl opacity-50 animate-glow-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-rose-500/40 animate-float">
              🙏
            </div>
          </div>
          
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Thank You for <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">Visiting!</span>
          </h3>
          <p className="text-slate-400 max-w-lg mx-auto text-lg mb-8">
            We poured our hearts into building this platform. Your support means everything to us!
          </p>
          
          {/* Made with Love Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
            <span className="text-slate-400">Made with</span>
            <span className="text-rose-500 animate-pulse">❤️</span>
            <span className="text-slate-400">by</span>
            <span className="font-bold text-white">CSE Department</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
