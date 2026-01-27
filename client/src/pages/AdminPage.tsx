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
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      {/* Main Content - No sidebar, full width */}
      <div className="pt-16 sm:pt-20">
        {/* Admin Header with User Profile */}
        <div className="bg-white border-b px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900">
            ADMIN DASHBOARD
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-slate-900 text-sm sm:text-base">
                {admin?.firstName || admin?.username}
              </div>
              <div className="text-xs text-slate-500">Admin</div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold overflow-hidden">
              {admin?.profileImage ? (
                <img
                  src={admin.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm sm:text-base">
                  {admin?.firstName?.charAt(0) || admin?.username?.charAt(0) || "A"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Scrollable on mobile */}
        <div className="bg-white border-b px-4 sm:px-8 py-2 sm:py-3 overflow-x-auto">
          <div className="flex gap-2 sm:gap-4 min-w-max">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition text-xs sm:text-sm whitespace-nowrap ${
                currentView === "dashboard"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setCurrentView("matches")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition text-xs sm:text-sm whitespace-nowrap ${
                currentView === "matches"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              ⚽ Matches
            </button>
            <button
              onClick={() => setCurrentView("captains")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition text-xs sm:text-sm whitespace-nowrap ${
                currentView === "captains"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              🎖️ Captains
            </button>
            <button
              onClick={() => setCurrentView("deptplayers")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition text-xs sm:text-sm whitespace-nowrap ${
                currentView === "deptplayers"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              👤 Dept Players
            </button>
            <button
              onClick={() => setCurrentView("teams")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition text-xs sm:text-sm whitespace-nowrap ${
                currentView === "teams"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              🏆 Teams
            </button>
            <button
              onClick={() => setCurrentView("approvals")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition text-xs sm:text-sm whitespace-nowrap ${
                currentView === "approvals"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              }`}
            >
              ✅ Approvals
            </button>
            <button
              onClick={() => setCurrentView("announcements")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition text-xs sm:text-sm whitespace-nowrap ${
                currentView === "announcements"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              📢 Announcements
            </button>
            <button
              onClick={() => setCurrentView("gallery")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition text-xs sm:text-sm whitespace-nowrap ${
                currentView === "gallery"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              📸 Gallery
            </button>
            <button
              onClick={() => setCurrentView("schedules")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition text-xs sm:text-sm whitespace-nowrap ${
                currentView === "schedules"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              📅 Schedules
            </button>
            <button
              onClick={() => setCurrentView("rules")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition text-xs sm:text-sm whitespace-nowrap ${
                currentView === "rules"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              📖 Rules
            </button>
            <button
              onClick={() => setCurrentView("profile")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition text-xs sm:text-sm whitespace-nowrap ${
                currentView === "profile"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              👤 Profile
            </button>
          </div>
        </div>

        {currentView === "dashboard" && (
          <>
            {/* Stats Section */}
            <div className="px-4 sm:px-8 py-4 sm:py-8">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                <StatCard
                  icon="👥"
                  count={stats.players.toString()}
                  label="Captains + Players"
                  color="bg-red-800"
                />
                <StatCard
                  icon="📅"
                  count={stats.matches.toString()}
                  label="Total Matches"
                  color="bg-green-800"
                />
                <StatCard
                  icon="⏱️"
                  count={stats.pendingScores.toString()}
                  label="Pending Score Updates"
                  color="bg-amber-600"
                />
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="px-8 py-4">
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <button
                  onClick={() => setShowAddMatch(true)}
                  className="px-3 sm:px-6 py-2 sm:py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 flex items-center gap-1 sm:gap-2 transition text-xs sm:text-base"
                >
                  ➕ <span className="hidden sm:inline">Add</span> Match
                </button>
                <button
                  onClick={() => setCurrentView("captains")}
                  className="px-3 sm:px-6 py-2 sm:py-3 bg-orange-700 text-white rounded-lg font-semibold hover:bg-orange-800 flex items-center gap-1 sm:gap-2 transition text-xs sm:text-base"
                >
                  🎖️ <span className="hidden sm:inline">View</span> Captains
                </button>
                <button
                  onClick={() => setShowAddAnnouncement(true)}
                  className="px-3 sm:px-6 py-2 sm:py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 flex items-center gap-1 sm:gap-2 transition text-xs sm:text-base"
                >
                  📢 <span className="hidden sm:inline">Post</span> Announce
                </button>
                <button
                  onClick={() => {
                    setEditSchedule(null);
                    setShowAddSchedule(true);
                  }}
                  className="px-3 sm:px-6 py-2 sm:py-3 bg-cyan-700 text-white rounded-lg font-semibold hover:bg-cyan-800 flex items-center gap-1 sm:gap-2 transition text-xs sm:text-base"
                >
                  📅 <span className="hidden sm:inline">Add</span> Schedule
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
          <div className="px-4 sm:px-8 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Manage Matches</h2>
              <button
                onClick={() => setShowAddMatch(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition text-sm sm:text-base w-full sm:w-auto"
              >
                ➕ Add Match
              </button>
            </div>
            <ManageMatches refreshKey={refreshKey} onUpdateScore={openUpdateScore} />
          </div>
        )}

        {currentView === "captains" && (
          <div className="px-4 sm:px-8 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Manage Captains</h2>
            </div>
            <ManageCaptains refreshKey={refreshKey} />
          </div>
        )}

        {currentView === "deptplayers" && (
          <div className="px-4 sm:px-8 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Manage Department Players</h2>
            </div>
            <ManageDepartmentPlayers refreshKey={refreshKey} />
          </div>
        )}

        {currentView === "teams" && (
          <div className="px-4 sm:px-8 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Manage Teams</h2>
            </div>
            <ManageTeams refreshKey={refreshKey} />
          </div>
        )}

        {currentView === "approvals" && (
          <div className="px-4 sm:px-8 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Captain & Player Approvals</h2>
            </div>
            <CaptainApprovals refreshKey={refreshKey} />
          </div>
        )}

        {currentView === "announcements" && (
          <div className="px-4 sm:px-8 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Announcements</h2>
              <button
                onClick={() => setShowAddAnnouncement(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition text-sm sm:text-base w-full sm:w-auto"
              >
                📢 Post Announcement
              </button>
            </div>
            <AdminAnnouncements refreshKey={refreshKey} />
          </div>
        )}

        {currentView === "gallery" && (
          <div className="px-4 sm:px-8 py-4 sm:py-8">
            <ManageGallery refreshKey={refreshKey} />
          </div>
        )}

        {currentView === "schedules" && (
          <div className="px-4 sm:px-8 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Manage Schedules</h2>
              <button
                onClick={() => {
                  setEditSchedule(null);
                  setShowAddSchedule(true);
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition text-sm sm:text-base w-full sm:w-auto"
              >
                📅 Add Schedule
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
          <div className="px-4 sm:px-8 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Manage Rules</h2>
              <button
                onClick={() => {
                  setEditRule(null);
                  setShowAddRule(true);
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition text-sm sm:text-base w-full sm:w-auto"
              >
                📖 Add Rule
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
          <div className="px-4 sm:px-8 py-4 sm:py-8">
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
