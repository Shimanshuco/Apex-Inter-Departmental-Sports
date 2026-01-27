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
      Cricket: "🏏",
      Athletics: "🏃‍♂️",
      General: "📅",
    };
    return icons[sport] || "🎯";
  };

  const getSportColor = (sport: string) => {
    const colors: Record<string, string> = {
      Football: "bg-emerald-100 text-emerald-700",
      Volleyball: "bg-amber-100 text-amber-700",
      Basketball: "bg-orange-100 text-orange-700",
      Kabaddi: "bg-red-100 text-red-700",
      Badminton: "bg-sky-100 text-sky-700",
      Chess: "bg-slate-200 text-slate-700",
      "Kho Kho": "bg-violet-100 text-violet-700",
      "Table Tennis": "bg-cyan-100 text-cyan-700",
      "Tug of War": "bg-yellow-100 text-yellow-700",
      Cricket: "bg-lime-100 text-lime-700",
      Athletics: "bg-rose-100 text-rose-700",
      General: "bg-slate-100 text-slate-600",
    };
    return colors[sport] || "bg-blue-100 text-blue-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar />

      <main>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
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
              <div className="rounded-xl bg-white shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-3 sm:px-4 py-2 sm:py-3 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setSelectedSport("All")}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                      selectedSport === "All"
                        ? "bg-slate-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    All Sports
                  </button>
                  {sports.map((sport) => (
                    <button
                      key={sport}
                      onClick={() => setSelectedSport(sport)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                        selectedSport === sport
                          ? "bg-slate-600 text-white"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
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
        <section className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8 border-t border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="text-2xl">📅</span> Event Schedule
            </h2>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">All scheduled events and activities by sport</p>
          </div>

          {/* Schedule Content */}
          {schedulesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-slate-500 mx-auto"></div>
              <p className="mt-4 text-slate-500">Loading schedules...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200/60">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-slate-700">No Schedules Found</h3>
              <p className="text-slate-500 mt-2 text-sm">No schedules have been added yet.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {sortedDates.map((dateStr) => (
                <div key={dateStr} className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                  {/* Date Header */}
                  <div className="bg-gradient-to-r from-slate-600 to-slate-500 px-4 sm:px-6 py-3 sm:py-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      {formatScheduleDate(dateStr)}
                    </h3>
                  </div>

                  {/* Schedule Table Header */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <div className="col-span-1 text-center">S.No</div>
                    <div className="col-span-2">Time</div>
                    <div className="col-span-5">Activity</div>
                    <div className="col-span-2 text-center">Gender</div>
                    <div className="col-span-2 text-center">Sport</div>
                  </div>

                  {/* Schedule Items */}
                  <div className="divide-y divide-slate-100">
                    {groupedByDate[dateStr]
                      .sort((a, b) => a.sno - b.sno)
                      .map((schedule) => (
                        <div
                          key={schedule._id}
                          className="px-4 sm:px-6 py-3 sm:py-3.5 hover:bg-slate-50/50 transition-colors"
                        >
                          {/* Mobile View */}
                          <div className="sm:hidden space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="w-7 h-7 flex items-center justify-center bg-slate-100 text-slate-600 font-semibold rounded-full text-xs">
                                {schedule.sno}
                              </span>
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                {formatTime(schedule.time)}
                              </span>
                            </div>
                            <p className="text-slate-800 font-medium text-sm">{schedule.activity}</p>
                            {schedule.matchDetail && (
                              <p className="text-slate-500 text-xs">{schedule.matchDetail}</p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              {schedule.gender && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  schedule.gender === "Male" 
                                    ? "bg-blue-50 text-blue-600" 
                                    : schedule.gender === "Female" 
                                    ? "bg-pink-50 text-pink-600" 
                                    : "bg-purple-50 text-purple-600"
                                }`}>
                                  {schedule.gender}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSportColor(schedule.sport)}`}>
                                {schedule.sport}
                              </span>
                            </div>
                          </div>

                          {/* Desktop View */}
                          <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center">
                            {/* S.No */}
                            <div className="col-span-1 text-center">
                              <span className="w-7 h-7 inline-flex items-center justify-center bg-slate-100 text-slate-600 font-semibold rounded-full text-xs">
                                {schedule.sno}
                              </span>
                            </div>

                            {/* Time */}
                            <div className="col-span-2">
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                {formatTime(schedule.time)}
                              </span>
                            </div>

                            {/* Activity */}
                            <div className="col-span-5">
                              <p className="text-slate-800 font-medium text-sm">
                                {schedule.activity}
                              </p>
                              {schedule.matchDetail && (
                                <p className="text-slate-400 text-xs mt-0.5">
                                  {schedule.matchDetail}
                                </p>
                              )}
                            </div>

                            {/* Gender */}
                            <div className="col-span-2 text-center">
                              {schedule.gender && (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                                  schedule.gender === "Male" 
                                    ? "bg-blue-50 text-blue-600" 
                                    : schedule.gender === "Female" 
                                    ? "bg-pink-50 text-pink-600" 
                                    : "bg-purple-50 text-purple-600"
                                }`}>
                                  {schedule.gender}
                                </span>
                              )}
                            </div>

                            {/* Sport */}
                            <div className="col-span-2 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${getSportColor(schedule.sport)}`}>
                                {getSportIcon(schedule.sport)} {schedule.sport}
                              </span>
                            </div>
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
