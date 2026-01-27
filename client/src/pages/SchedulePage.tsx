import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ScheduleDateFilter from "../components/schedule/ScheduleDateFilter";
import ScheduleMatchCard from "../components/schedule/ScheduleMatchCard";
import TodayMatches from "../components/schedule/TodayMatches";
import Announcements from "../components/schedule/Announcements";
import { API_ENDPOINTS } from "../config/api";
import axios from "axios";

interface Schedule {
  _id: string;
  sno: number;
  date: string;
  time: string;
  activity: string;
  sport: string;
  gender: string;
  matchDetail: string;
}

export default function SchedulePage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sports, setSports] = useState<string[]>([]);

  // Schedule states
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
    fetchSchedules();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [matches, selectedSport, selectedDate]);

  const fetchMatches = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.MATCHES_LIST);
      const matchesData = response.data.matches || [];
      setMatches(matchesData);
      
      // Extract unique sports
      const uniqueSports = [...new Set(matchesData.map((m: any) => m.sport).filter(Boolean))] as string[];
      setSports(uniqueSports);
    } catch (err) {
      console.error("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SCHEDULES_LIST);
      const schedulesData = response.data.schedules || [];
      setSchedules(schedulesData);
    } catch (err) {
      console.error("Failed to fetch schedules");
    } finally {
      setSchedulesLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = [...matches];
    
    // Filter by sport
    if (selectedSport !== "All") {
      filtered = filtered.filter((m) => m.sport === selectedSport);
    }
    
    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((m) => {
        const matchDate = new Date(m.date).toDateString();
        return matchDate === new Date(selectedDate).toDateString();
      });
    }
    
    // Sort by date
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setFilteredMatches(filtered);
  };

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Schedule helper functions
  const groupedByDate = schedules.reduce((acc, schedule) => {
    const dateKey = new Date(schedule.date).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const formatScheduleDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getSportIcon = (sport: string) => {
    const icons: Record<string, string> = {
      Football: "⚽",
      Volleyball: "🏐",
      Basketball: "🏀",
      Kabaddi: "🤼",
      Badminton: "🏸",
      Chess: "♟️",
      "Kho Kho": "🏃",
      "Table Tennis": "🏓",
      "Tug of War": "🪢",
      "Sack Race": "🏃",
      General: "📅",
    };
    return icons[sport] || "🎯";
  };

  const getSportColor = (sport: string) => {
    const colors: Record<string, string> = {
      Football: "bg-green-500",
      Volleyball: "bg-yellow-500",
      Basketball: "bg-orange-500",
      Kabaddi: "bg-red-500",
      Badminton: "bg-blue-500",
      Chess: "bg-gray-700",
      "Kho Kho": "bg-purple-500",
      "Table Tennis": "bg-cyan-500",
      "Tug of War": "bg-amber-600",
      "Sack Race": "bg-pink-500",
      General: "bg-slate-500",
    };
    return colors[sport] || "bg-blue-500";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Match Schedule
            </h1>
            <p className="text-slate-300 mt-1 text-sm sm:text-base">View upcoming matches and set reminders</p>
          </div>
        </div>

        {/* Date Filter */}
        <ScheduleDateFilter 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />

        {/* Main Content Grid */}
        <section className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
            {/* Left side - Matches */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Sport Tabs */}
              <div className="rounded-xl bg-white shadow-md overflow-hidden">
                <div className="flex items-center gap-2 border-b bg-slate-100 px-3 sm:px-4 py-2 sm:py-3 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setSelectedSport("All")}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors ${
                      selectedSport === "All"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    All Sports
                  </button>
                  {sports.map((sport) => (
                    <button
                      key={sport}
                      onClick={() => setSelectedSport(sport)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors ${
                        selectedSport === sport
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>

                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {loading ? (
                    <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">Loading matches...</div>
                  ) : filteredMatches.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-gray-500">
                      <p className="text-base sm:text-lg">No matches found</p>
                      <p className="text-xs sm:text-sm mt-1">Try adjusting your filters</p>
                    </div>
                  ) : (
                    filteredMatches.map((match) => (
                      <ScheduleMatchCard
                        key={match._id}
                        date={formatFullDate(match.date)}
                        sport={match.sport}
                        teamA={match.teamA || "Team A"}
                        teamB={match.teamB || "Team B"}
                        venue={match.venue}
                        time={new Date(match.date).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        status={match.status}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right side - Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              <TodayMatches />
              <Announcements />
            </div>
          </div>
        </section>

        {/* Event Schedule Section */}
        <section className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8 border-t">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              📅 Event Schedule
            </h2>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">All scheduled events and activities by sport</p>
          </div>

          {/* Schedule Content */}
          {schedulesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading schedules...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-700">No Schedules Found</h3>
              <p className="text-gray-500 mt-2">No schedules have been added yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((dateStr) => (
                <div key={dateStr} className="bg-white rounded-xl shadow-md overflow-hidden">
                  {/* Date Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {formatScheduleDate(dateStr)}
                    </h3>
                  </div>

                  {/* Schedule Items */}
                  <div className="divide-y">
                    {groupedByDate[dateStr]
                      .sort((a, b) => a.sno - b.sno)
                      .map((schedule) => (
                        <div
                          key={schedule._id}
                          className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-3"
                        >
                          {/* S.No Badge */}
                          <div className="flex items-center gap-3 sm:w-20">
                            <span className="w-8 h-8 flex items-center justify-center bg-slate-200 text-slate-700 font-bold rounded-full text-sm">
                              {schedule.sno}
                            </span>
                          </div>

                          {/* Time */}
                          <div className="sm:w-28">
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                              🕐 {formatTime(schedule.time)}
                            </span>
                          </div>

                          {/* Activity */}
                          <div className="flex-1">
                            <p className="text-slate-900 font-medium text-sm sm:text-base">
                              {schedule.activity}
                            </p>
                            {schedule.matchDetail && (
                              <p className="text-slate-500 text-xs mt-0.5">
                                {schedule.matchDetail}
                              </p>
                            )}
                          </div>

                          {/* Gender Badge - only show for sports, not General */}
                          {schedule.gender && (
                            <div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                schedule.gender === "Male" 
                                  ? "bg-blue-100 text-blue-700" 
                                  : schedule.gender === "Female" 
                                  ? "bg-pink-100 text-pink-700" 
                                  : "bg-purple-100 text-purple-700"
                              }`}>
                                {schedule.gender === "Male" ? "👨" : schedule.gender === "Female" ? "👩" : "👥"} {schedule.gender}
                              </span>
                            </div>
                          )}

                          {/* Sport Badge */}
                          <div>
                            <span
                              className={`px-3 py-1 ${getSportColor(
                                schedule.sport
                              )} text-white rounded-full text-xs sm:text-sm font-medium`}
                            >
                              {getSportIcon(schedule.sport)} {schedule.sport}
                            </span>
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
