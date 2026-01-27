import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../ui/Button";
import { API_ENDPOINTS } from "../../config/api";

interface Stats {
  matchesPlayed: number;
  liveMatches: number;
  upcomingMatches: number;
  totalMatches: number;
}

export default function StatsRow() {
  const [stats, setStats] = useState<Stats>({
    matchesPlayed: 0,
    liveMatches: 0,
    upcomingMatches: 0,
    totalMatches: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const matchesRes = await fetch(API_ENDPOINTS.MATCHES_LIST);
        const matchesData = await matchesRes.json();
        const matches = matchesData.matches || [];

        const now = new Date();
        
        // Count matches by status
        const matchesPlayed = matches.filter(
          (m: any) => m.status === "completed" || m.status === "finished"
        ).length;
        
        const liveMatches = matches.filter(
          (m: any) => m.status === "live"
        ).length;
        
        const upcomingMatches = matches.filter(
          (m: any) => m.status === "scheduled" && new Date(m.date) >= now
        ).length;

        setStats({
          matchesPlayed,
          liveMatches,
          upcomingMatches,
          totalMatches: matches.length,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    { label: "Total Matches", value: stats.totalMatches.toString().padStart(2, "0"), color: "bg-blue-800", link: "/scores", icon: "📊" },
    { label: "Matches Played", value: stats.matchesPlayed.toString().padStart(2, "0"), color: "bg-emerald-700", link: "/scores", icon: "🏆" },
    { label: "Live Matches", value: stats.liveMatches.toString().padStart(2, "0"), color: "bg-red-700", link: "/scores", icon: "🔴" },
    { label: "Upcoming Matches", value: stats.upcomingMatches.toString().padStart(2, "0"), color: "bg-yellow-600", link: "/schedule", icon: "📅" },
  ];

  return (
    <section className="-mt-10 relative z-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((s) => (
            <Card
              key={s.label}
              className={`${s.color} p-5 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold opacity-90">{s.label}</div>
                <span className="text-2xl">{s.icon}</span>
              </div>

              <div className="mt-1 text-3xl font-black">
                {loading ? (
                  <span className="inline-block w-12 h-8 bg-white/20 rounded animate-pulse"></span>
                ) : (
                  s.value
                )}
              </div>

              <div className="mt-4">
                <Button
                  to={s.link}
                  variant="primary"
                  fullWidth
                  className="bg-white/15 text-white hover:bg-white/20 shadow-none"
                >
                  View All
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
