import { useEffect, useState, useRef } from "react";
import Card from "../../components/ui/Card";
import CardSection from "../../components/ui/CardSection";
import { API_ENDPOINTS } from "../../config/api";
import { useNotification } from "../../context/NotificationContext";

interface Match {
  _id: string;
  teamA: string;
  teamB: string;
  sport: string;
  venue: string;
  date: string;
  status: string;
}

interface ReminderData {
  matchId: string;
  teamA: string;
  teamB: string;
  matchTime: number;
  notified: boolean;
}

interface RemindersState {
  [key: string]: ReminderData;
}

export default function UpcomingMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<RemindersState>({});
  const { showNotification } = useNotification();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load reminders from localStorage on mount
  useEffect(() => {
    const savedReminders = localStorage.getItem("matchRemindersData");
    if (savedReminders) {
      try {
        const parsed = JSON.parse(savedReminders);
        setReminders(parsed);
      } catch (e) {
        console.error("Failed to parse reminders:", e);
      }
    }
  }, []);

  // Check for upcoming reminders every 30 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      let updated = false;
      const newReminders = { ...reminders };
      
      Object.entries(newReminders).forEach(([matchId, reminder]) => {
        if (reminder.notified) return;
        
        const timeUntilMatch = reminder.matchTime - now;
        
        // Notify if match is within 30 minutes and hasn't been notified
        if (timeUntilMatch <= 30 * 60 * 1000 && timeUntilMatch > 0) {
          showNotification(
            `Reminder: ${reminder.teamA} vs ${reminder.teamB} starts in ${Math.round(timeUntilMatch / 60000)} minutes!`,
            "warning"
          );
          
          // Try browser notification too
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Match Starting Soon!", {
              body: `${reminder.teamA} vs ${reminder.teamB} starts in ${Math.round(timeUntilMatch / 60000)} minutes!`,
            });
          }
          
          newReminders[matchId].notified = true;
          updated = true;
        }
        
        // Remove expired reminders (match already started)
        if (timeUntilMatch < 0) {
          delete newReminders[matchId];
          updated = true;
        }
      });
      
      if (updated) {
        localStorage.setItem("matchRemindersData", JSON.stringify(newReminders));
        setReminders(newReminders);
      }
    };

    // Check immediately and then every 30 seconds
    checkReminders();
    intervalRef.current = setInterval(checkReminders, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reminders, showNotification]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.MATCHES_LIST);
        const data = await response.json();
        // Filter upcoming matches (status is "upcoming" or "scheduled")
        const upcomingMatches = (data.matches || []).filter(
          (m: Match) => m.status === "upcoming" || m.status === "scheduled"
        ).slice(0, 4);
        setMatches(upcomingMatches);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const handleSetReminder = async (match: Match) => {
    // Check if already set
    if (reminders[match._id]) {
      // Remove reminder
      const newReminders = { ...reminders };
      delete newReminders[match._id];
      setReminders(newReminders);
      localStorage.setItem("matchRemindersData", JSON.stringify(newReminders));
      showNotification("Reminder removed", "info");
      return;
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }

    // Add reminder
    const reminderData: ReminderData = {
      matchId: match._id,
      teamA: match.teamA || "Team A",
      teamB: match.teamB || "Team B",
      matchTime: new Date(match.date).getTime(),
      notified: false,
    };

    const newReminders = { ...reminders, [match._id]: reminderData };
    setReminders(newReminders);
    localStorage.setItem("matchRemindersData", JSON.stringify(newReminders));

    showNotification(
      `Reminder set! You'll be notified before ${match.teamA} vs ${match.teamB}`,
      "success"
    );
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Upcoming Matches
        </h2>

        <a
          className="text-xs sm:text-sm font-semibold text-blue-700 hover:underline"
          href="/schedule"
        >
          View All
        </a>
      </div>

      {/* Body */}
      <CardSection className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-2">
        {loading ? (
          <div className="col-span-2 text-center py-8 text-slate-500">
            Loading matches...
          </div>
        ) : matches.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-slate-500">
            No upcoming matches scheduled
          </div>
        ) : (
          matches.map((match) => (
            <Card key={match._id} className="border p-3 sm:p-4 shadow-none">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 text-sm sm:text-base">
                  {match.teamA || "TBD"}
                </div>
                <div className="text-xs sm:text-sm text-slate-500">{formatTime(match.date)}</div>
              </div>

              <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600">
                vs <span className="font-semibold text-slate-800">{match.teamB || "TBD"}</span>
              </div>

              <div className="mt-1 sm:mt-2 text-xs text-slate-500">
                {match.venue} • {formatDate(match.date)}
              </div>

              <div className="mt-3 sm:mt-4">
                <button
                  onClick={() => handleSetReminder(match)}
                  className={`w-full rounded-md px-4 py-2 text-xs sm:text-sm font-bold text-center transition-colors ${
                    reminders[match._id]
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {reminders[match._id] ? "✓ Reminder Set" : "🔔 Set Reminder"}
                </button>
              </div>
            </Card>
          ))
        )}
      </CardSection>
    </Card>
  );
}
