import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import StatCard from "../components/admin/StatCard";
import ManageMatches from "../components/admin/ManageMatches";
import ManageCaptains from "../components/admin/ManageCaptains";
import ManageDepartmentPlayers from "../components/admin/ManageDepartmentPlayers";
import ManageTeams from "../components/admin/ManageTeams";
import ManageGallery from "../components/admin/ManageGallery";
import ManageSchedules from "../components/admin/ManageSchedules";
import ManageRules from "../components/admin/ManageRules";
import CaptainApprovals from "../components/admin/CaptainApprovals";
import AdminAnnouncements from "../components/admin/AdminAnnouncements";
import AdminProfile from "../components/admin/AdminProfile";
import AddMatchModal from "../components/admin/AddMatchModal";
import UpdateScoreModal from "../components/admin/UpdateScoreModal";
import AddAnnouncementModal from "../components/admin/AddAnnouncementModal";
import AddScheduleModal from "../components/admin/AddScheduleModal";
import AddRuleModal from "../components/admin/AddRuleModal";
import { useAdmin } from "../context/AdminContext";
import { API_ENDPOINTS } from "../config/api";
import axios from "axios";

interface Match {
  _id: string;
  teamA: string;
  teamB: string;
  status: string;
  scoreA?: number;
  scoreB?: number;
}

export default function AdminPage() {
  const { admin, token } = useAdmin();
  const [stats, setStats] = useState({
    players: 0,
    matches: 0,
    pendingScores: 0,
  });

  const [currentView, setCurrentView] = useState("dashboard");
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [showUpdateScore, setShowUpdateScore] = useState(false);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [editSchedule, setEditSchedule] = useState<any>(null);
  const [editRule, setEditRule] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // For UpdateScoreModal
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedMatchDetails, setSelectedMatchDetails] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetchStats();
    fetchMatches();
  }, [token]);

  const fetchStats = async () => {
    if (!token) return;
    try {
      const [captainsRes, playersRes, matchesRes] = await Promise.all([
        axios.get(API_ENDPOINTS.ADMIN_CAPTAINS_LIST, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(API_ENDPOINTS.ADMIN_DEPT_PLAYERS_LIST, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(API_ENDPOINTS.MATCHES_LIST, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const captainsCount = captainsRes.data.captains?.length || 0;
      const playersCount = playersRes.data.players?.length || 0;

      setStats({
        players: captainsCount + playersCount,
        matches: matchesRes.data.matches?.length || 0,
        pendingScores: matchesRes.data.matches?.filter(
          (m: any) => m.status === "scheduled"
        ).length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats");
    }
  };

  const fetchMatches = async () => {
    if (!token) return;
    try {
      const response = await axios.get(API_ENDPOINTS.MATCHES_LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error("Failed to fetch matches");
    }
  };

  const handleMatchAdded = () => {
    setRefreshKey((prev) => prev + 1);
    fetchStats();
    fetchMatches();
  };

  const handleAnnouncementAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const openUpdateScore = (match: Match) => {
    setSelectedMatchId(match._id);
    setSelectedMatchDetails({
      team1Name: match.teamA || "Team A",
      team2Name: match.teamB || "Team B",
      scoreA: match.scoreA,
      scoreB: match.scoreB,
      status: match.status,
    });
    setShowUpdateScore(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar />

      {/* Main Content - No sidebar, full width */}
      <div>
        {/* Admin Header with User Profile */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between shadow-lg">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Admin Dashboard
            </h1>
            <p className="text-slate-300 text-sm mt-1 hidden sm:block">Manage your sports portal</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-white text-sm sm:text-base">
                {admin?.firstName || admin?.username}
              </div>
              <div className="text-xs text-slate-300">Administrator</div>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white font-bold overflow-hidden shadow-lg">
              {admin?.profileImage ? (
                <img
                  src={admin.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm sm:text-lg">
                  {admin?.firstName?.charAt(0) || admin?.username?.charAt(0) || "A"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Scrollable on mobile */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 sm:py-4 overflow-x-auto shadow-sm">
          <div className="flex gap-2 sm:gap-3 min-w-max">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                currentView === "dashboard"
                  ? "bg-slate-700 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView("matches")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                currentView === "matches"
                  ? "bg-slate-700 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Matches
            </button>
            <button
              onClick={() => setCurrentView("captains")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                currentView === "captains"
                  ? "bg-slate-700 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Captains
            </button>
            <button
              onClick={() => setCurrentView("deptplayers")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                currentView === "deptplayers"
                  ? "bg-slate-700 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Dept Players
            </button>
            <button
              onClick={() => setCurrentView("teams")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                currentView === "teams"
                  ? "bg-slate-700 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Teams
            </button>
            <button
              onClick={() => setCurrentView("approvals")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                currentView === "approvals"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              Approvals
            </button>
            <button
              onClick={() => setCurrentView("announcements")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                currentView === "announcements"
                  ? "bg-slate-700 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Announcements
            </button>
            <button
              onClick={() => setCurrentView("gallery")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                currentView === "gallery"
                  ? "bg-slate-700 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setCurrentView("schedules")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                currentView === "schedules"
                  ? "bg-slate-700 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Schedules
            </button>
            <button
              onClick={() => setCurrentView("rules")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                currentView === "rules"
                  ? "bg-slate-700 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Rules
            </button>
            <button
              onClick={() => setCurrentView("profile")}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${
                currentView === "profile"
                  ? "bg-slate-700 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Profile
            </button>
          </div>
        </div>

        {currentView === "dashboard" && (
          <>
            {/* Stats Section */}
            <div className="px-4 sm:px-8 py-6 sm:py-8">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <StatCard
                  icon="users"
                  count={stats.players.toString()}
                  label="Captains + Players"
                  color="bg-gradient-to-br from-slate-500 to-slate-600"
                />
                <StatCard
                  icon="calendar"
                  count={stats.matches.toString()}
                  label="Total Matches"
                  color="bg-gradient-to-br from-slate-600 to-slate-700"
                />
                <StatCard
                  icon="clock"
                  count={stats.pendingScores.toString()}
                  label="Pending Score Updates"
                  color="bg-gradient-to-br from-amber-500 to-amber-600"
                />
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="px-4 sm:px-8 py-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={() => setShowAddMatch(true)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 flex items-center gap-2 transition-all shadow-sm hover:shadow text-xs sm:text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span>Add Match</span>
                </button>
                <button
                  onClick={() => setCurrentView("captains")}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-500 text-white rounded-lg font-medium hover:bg-slate-600 flex items-center gap-2 transition-all shadow-sm hover:shadow text-xs sm:text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <span>View Captains</span>
                </button>
                <button
                  onClick={() => setShowAddAnnouncement(true)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 flex items-center gap-2 transition-all shadow-sm hover:shadow text-xs sm:text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                  <span>Post Announcement</span>
                </button>
                <button
                  onClick={() => {
                    setEditSchedule(null);
                    setShowAddSchedule(true);
                  }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 flex items-center gap-2 transition-all shadow-sm hover:shadow text-xs sm:text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span>Add Schedule</span>
                </button>
              </div>
            </div>

            {/* Quick Overview Grid */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                <ManageMatches refreshKey={refreshKey} onUpdateScore={openUpdateScore} />
                <AdminAnnouncements refreshKey={refreshKey} />
              </div>
            </div>
          </>
        )}

        {currentView === "matches" && (
          <div className="px-4 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Manage Matches</h2>
              <button
                onClick={() => setShowAddMatch(true)}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-all shadow-sm text-sm w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Match
              </button>
            </div>
            <ManageMatches refreshKey={refreshKey} onUpdateScore={openUpdateScore} />
          </div>
        )}

        {currentView === "captains" && (
          <div className="px-4 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Manage Captains</h2>
            </div>
            <ManageCaptains refreshKey={refreshKey} />
          </div>
        )}

        {currentView === "deptplayers" && (
          <div className="px-4 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Manage Department Players</h2>
            </div>
            <ManageDepartmentPlayers refreshKey={refreshKey} />
          </div>
        )}

        {currentView === "teams" && (
          <div className="px-4 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Manage Teams</h2>
            </div>
            <ManageTeams refreshKey={refreshKey} />
          </div>
        )}

        {currentView === "approvals" && (
          <div className="px-4 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Captain & Player Approvals</h2>
            </div>
            <CaptainApprovals refreshKey={refreshKey} />
          </div>
        )}

        {currentView === "announcements" && (
          <div className="px-4 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Announcements</h2>
              <button
                onClick={() => setShowAddAnnouncement(true)}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-all shadow-sm text-sm w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                Post Announcement
              </button>
            </div>
            <AdminAnnouncements refreshKey={refreshKey} />
          </div>
        )}

        {currentView === "gallery" && (
          <div className="px-4 sm:px-8 py-6 sm:py-8">
            <ManageGallery refreshKey={refreshKey} />
          </div>
        )}

        {currentView === "schedules" && (
          <div className="px-4 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Manage Schedules</h2>
              <button
                onClick={() => {
                  setEditSchedule(null);
                  setShowAddSchedule(true);
                }}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-all shadow-sm text-sm w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Add Schedule
              </button>
            </div>
            <ManageSchedules 
              refreshKey={refreshKey} 
              onEditSchedule={(schedule) => {
                setEditSchedule(schedule);
                setShowAddSchedule(true);
              }}
            />
          </div>
        )}

        {currentView === "rules" && (
          <div className="px-4 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Manage Rules</h2>
              <button
                onClick={() => {
                  setEditRule(null);
                  setShowAddRule(true);
                }}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-all shadow-sm text-sm w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Add Rule
              </button>
            </div>
            <ManageRules 
              refreshKey={refreshKey} 
              onEditRule={(rule) => {
                setEditRule(rule);
                setShowAddRule(true);
              }}
            />
          </div>
        )}

        {currentView === "profile" && (
          <div className="px-4 sm:px-8 py-6 sm:py-8">
            <AdminProfile />
          </div>
        )}
      </div>

      {/* Modals */}
      <AddMatchModal
        isOpen={showAddMatch}
        onClose={() => setShowAddMatch(false)}
        onMatchAdded={handleMatchAdded}
      />
      <UpdateScoreModal
        isOpen={showUpdateScore}
        onClose={() => {
          setShowUpdateScore(false);
          setSelectedMatchId(null);
          setSelectedMatchDetails(null);
        }}
        matchId={selectedMatchId}
        matchDetails={selectedMatchDetails}
        onScoreUpdated={handleMatchAdded}
      />
      <AddAnnouncementModal
        isOpen={showAddAnnouncement}
        onClose={() => setShowAddAnnouncement(false)}
        onAnnouncementAdded={handleAnnouncementAdded}
      />
      {/* <AddTeamModal
        isOpen={showAddTeam}
        onClose={() => setShowAddTeam(false)}
        onTeamAdded={handleMatchAdded}
      /> */}
      <AddScheduleModal
        isOpen={showAddSchedule}
        onClose={() => {
          setShowAddSchedule(false);
          setEditSchedule(null);
        }}
        onScheduleAdded={handleMatchAdded}
        editSchedule={editSchedule}
      />
      <AddRuleModal
        isOpen={showAddRule}
        onClose={() => {
          setShowAddRule(false);
          setEditRule(null);
        }}
        onRuleAdded={handleMatchAdded}
        editRule={editRule}
      />

      <Footer />
    </div>
  );
}
