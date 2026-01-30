
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCaptain } from "../context/CaptainContext";
import { useNotification } from "../context/NotificationContext";
import { API_ENDPOINTS } from "../config/api";
import CaptainTeamManager from "../components/captain/CaptainTeamManager";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const SPORTS_LIST = [
  "Football",
  "Volleyball",
  "Basketball",
  "Kabaddi",
  "Badminton",
  "Chess",
  "Kho Kho",
  "Table Tennis",
  "Tug of War",
  "Cricket",
  "Athletics",
];

const GENDERS = ["Male", "Female", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "PG 1st Year", "PG 2nd Year", "PhD"];

interface DepartmentPlayer {
  _id: string;
  name: string;
  rNumber: string;
  uniqueId: string;
  phone: string;
  email: string;
  sport: string;
  gender: string;
  year: string;
  status: string;
  department: string;
  createdAt: string;
}

export default function CaptainDashboardPage() {
  const { captain, logout, isLoading, token, login } = useCaptain();
  const { showNotification, showConfirm } = useNotification();
  const navigate = useNavigate();

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    bloodGroup: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Players state
  const [players, setPlayers] = useState<DepartmentPlayer[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);

  // Add player modal state
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [addPlayerForm, setAddPlayerForm] = useState({
    name: "",
    rNumber: "",
    phone: "",
    email: "",
    sport: "",
    gender: "",
    year: "",
  });
  const [addPlayerLoading, setAddPlayerLoading] = useState(false);
  const [addPlayerError, setAddPlayerError] = useState("");
  const [addPlayerSuccess, setAddPlayerSuccess] = useState("");

  // Edit player modal state
  const [editingPlayer, setEditingPlayer] = useState<DepartmentPlayer | null>(null);
  const [editPlayerForm, setEditPlayerForm] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [editPlayerLoading, setEditPlayerLoading] = useState(false);
  const [editPlayerError, setEditPlayerError] = useState("");

  // Refresh captain data from server on mount
  useEffect(() => {
    const refreshCaptainData = async () => {
      if (!token) return;

      try {
        const response = await fetch(API_ENDPOINTS.CAPTAIN_PROFILE, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.captain) {
            login(token, data.captain);
          }
        }
      } catch (error) {
        console.error("Failed to refresh captain data:", error);
      }
    };

    refreshCaptainData();
    fetchPlayers();
  }, [token]);

  const fetchPlayers = async () => {
    if (!token) return;
    setPlayersLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.CAPTAIN_PLAYERS_LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlayers(data.players || []);
      }
    } catch (error) {
      console.error("Failed to fetch players:", error);
    } finally {
      setPlayersLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const openEditModal = () => {
    if (captain) {
      setEditForm({
        name: captain.name || "",
        phone: captain.phone || "",
        bloodGroup: captain.bloodGroup || "",
      });
      setEditError("");
      setEditSuccess("");
      setIsEditing(true);
    }
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setEditError("");
    setEditSuccess("");
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");

    try {
      const response = await fetch(API_ENDPOINTS.CAPTAIN_UPDATE_PROFILE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      if (data.captain && token) {
        login(token, data.captain);
      }

      setEditSuccess("Profile updated successfully!");
      setTimeout(() => {
        closeEditModal();
      }, 1500);
    } catch (err: any) {
      setEditError(err.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  // Add Player Functions
  const openAddPlayerModal = () => {
    setAddPlayerForm({
      name: "",
      rNumber: "",
      phone: "",
      email: "",
      sport: "",
      gender: "",
      year: "",
    });
    setAddPlayerError("");
    setAddPlayerSuccess("");
    setShowAddPlayer(true);
  };

  const closeAddPlayerModal = () => {
    setShowAddPlayer(false);
    setAddPlayerError("");
    setAddPlayerSuccess("");
  };

  const handleAddPlayerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddPlayerForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddPlayerLoading(true);
    setAddPlayerError("");
    setAddPlayerSuccess("");

    try {
      const response = await fetch(API_ENDPOINTS.CAPTAIN_PLAYERS_ADD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addPlayerForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add player");
      }

      setAddPlayerSuccess(`Player added! ID: ${data.player.uniqueId}`);
      fetchPlayers();
      setTimeout(() => {
        closeAddPlayerModal();
      }, 2000);
    } catch (err: any) {
      setAddPlayerError(err.message || "Failed to add player");
    } finally {
      setAddPlayerLoading(false);
    }
  };

  // Edit Player Functions
  const openEditPlayerModal = (player: DepartmentPlayer) => {
    setEditingPlayer(player);
    setEditPlayerForm({
      name: player.name,
      phone: player.phone,
      email: player.email,
    });
    setEditPlayerError("");
  };

  const closeEditPlayerModal = () => {
    setEditingPlayer(null);
    setEditPlayerError("");
  };

  const handleEditPlayerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditPlayerForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    setEditPlayerLoading(true);
    setEditPlayerError("");

    try {
      const response = await fetch(API_ENDPOINTS.CAPTAIN_PLAYERS_UPDATE(editingPlayer._id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editPlayerForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update player");
      }

      fetchPlayers();
      closeEditPlayerModal();
    } catch (err: any) {
      setEditPlayerError(err.message || "Failed to update player");
    } finally {
      setEditPlayerLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    const confirmed = await showConfirm("Are you sure you want to delete this player?");
    if (!confirmed) return;

    try {
      const response = await fetch(API_ENDPOINTS.CAPTAIN_PLAYERS_DELETE(playerId), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete player");
      }

      showNotification("Player deleted successfully", "success");
      fetchPlayers();
    } catch (err: any) {
      showNotification(err.message || "Failed to delete player", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "active":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "inactive":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!captain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <p className="text-slate-600 mb-4">Please login to access your dashboard</p>
          <Link
            to="/captain-login"
            className="text-slate-700 font-medium hover:text-slate-900 underline"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Captain Dashboard</h1>
              <p className="text-sm text-white/70">Welcome, {captain.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/70 hover:text-white text-sm transition-colors">
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Account Status Alert (if pending) */}
        {captain.status !== "approved" && captain.status !== "active" && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-amber-800">Account Pending Approval</p>
              <p className="text-sm text-amber-700">Your account is awaiting admin approval. Some features may be restricted.</p>
            </div>
          </div>
        )}

        {/* Section 1: Captain Details */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Captain Profile</h2>
            <button
              onClick={openEditModal}
              className="px-3 py-1.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Captain ID */}
              <div className="p-4 text-center">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Captain ID</p>
                <p className="text-lg font-bold font-mono text-slate-700">{captain.uniqueId}</p>
              </div>
              {/* Department */}
              <div className="p-4 text-center">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Department</p>
                <p className="text-lg font-semibold text-slate-700">{captain.department}</p>
              </div>
              {/* Status */}
              <div className="p-4 text-center">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Status</p>
                <span className={`inline-block px-2.5 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(captain.status)}`}>
                  {captain.status}
                </span>
              </div>
              {/* Blood Group */}
              <div className="p-4 text-center">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Blood Group</p>
                <p className="text-lg font-semibold text-red-600">{captain.bloodGroup || "—"}</p>
              </div>
            </div>
            
            <div className="border-t border-slate-100 p-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-0.5">Full Name</p>
                  <p className="text-sm font-medium text-slate-800">{captain.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-0.5">Email</p>
                  <p className="text-sm text-slate-700">{captain.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-0.5">R-Number</p>
                  <p className="text-sm font-mono text-slate-700">{captain.rNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-0.5">Phone</p>
                  <p className="text-sm text-slate-700">{captain.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-0.5">Gender</p>
                  <p className="text-sm text-slate-700">{captain.gender || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-0.5">Year</p>
                  <p className="text-sm text-slate-700">{captain.year || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Department Players */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Department Players</h2>
              <p className="text-sm text-slate-500">Manage players from your department (max 2 sports per player)</p>
            </div>
            <button
              onClick={openAddPlayerModal}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Player
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
            {playersLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-600 mx-auto mb-3"></div>
                <p className="text-slate-500 text-sm">Loading players...</p>
              </div>
            ) : players.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-slate-600 font-medium">No players added yet</p>
                <p className="text-sm text-slate-500 mt-1">Click "Add Player" to add players from your department</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Player</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">R-Number</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Gender / Year</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Sport</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {players.map((player) => (
                      <tr key={player._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800 text-sm">{player.name}</div>
                          <div className="text-xs text-slate-500">{player.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-mono text-slate-600">{player.rNumber}</div>
                          <div className="text-xs font-mono text-slate-400">{player.uniqueId}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-600">{player.gender || "—"}</div>
                          <div className="text-xs text-slate-400">{player.year || "—"}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{player.phone}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{player.sport}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(player.status)}`}>
                            {player.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditPlayerModal(player)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeletePlayer(player._id)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Team Management */}
        {(captain.status === "approved" || captain.status === "active") && (
          <section className="mb-6">
            <CaptainTeamManager />
          </section>
        )}

        {/* Quick Links */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Links</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              to="/schedule"
              className="bg-white rounded-xl p-4 border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-slate-100 group-hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-800">Match Schedule</p>
                <p className="text-xs text-slate-500">View upcoming matches</p>
              </div>
            </Link>
            <Link
              to="/scores"
              className="bg-white rounded-xl p-4 border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-slate-100 group-hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-800">Match Scores</p>
                <p className="text-xs text-slate-500">Check match results</p>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">Edit Profile</h2>
                <button
                  onClick={closeEditModal}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-5">
              {editError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {editSuccess}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={editForm.bloodGroup}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-sm"
                  >
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-500">
                  <p className="font-medium text-slate-600 mb-1">Note:</p>
                  <p>Email, R-Number, Department, and Captain ID cannot be changed.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">Add New Player</h2>
                <button
                  onClick={closeAddPlayerModal}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-5">
              {addPlayerError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {addPlayerError}
                </div>
              )}

              {addPlayerSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 text-sm">
                  {addPlayerSuccess}
                </div>
              )}

              <form onSubmit={handleAddPlayerSubmit} className="space-y-4">
                {/* Row 1: Name and R-Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Player Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={addPlayerForm.name}
                      onChange={handleAddPlayerChange}
                      required
                      placeholder="Full name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">R-Number *</label>
                    <input
                      type="text"
                      name="rNumber"
                      value={addPlayerForm.rNumber}
                      onChange={handleAddPlayerChange}
                      required
                      placeholder="e.g., R2021001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Row 2: Phone and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={addPlayerForm.phone}
                      onChange={handleAddPlayerChange}
                      required
                      placeholder="Phone number"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={addPlayerForm.email}
                      onChange={handleAddPlayerChange}
                      required
                      placeholder="player@email.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Row 3: Gender and Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                    <select
                      name="gender"
                      value={addPlayerForm.gender}
                      onChange={handleAddPlayerChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
                    >
                      <option value="">Select Gender</option>
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Year *</label>
                    <select
                      name="year"
                      value={addPlayerForm.year}
                      onChange={handleAddPlayerChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
                    >
                      <option value="">Select Year</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4: Sport */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sport *</label>
                  <select
                    name="sport"
                    value={addPlayerForm.sport}
                    onChange={handleAddPlayerChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm"
                  >
                    <option value="">Select Sport</option>
                    {SPORTS_LIST.map((sport) => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700 border border-amber-200">
                  <p className="font-medium mb-1">Note:</p>
                  <p>A player can participate in maximum 2 sports. The same R-Number can be registered for different sports.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeAddPlayerModal}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addPlayerLoading}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addPlayerLoading ? "Adding..." : "Add Player"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-800">Edit Player</h2>
                <button
                  onClick={closeEditPlayerModal}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-5">
              {editPlayerError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {editPlayerError}
                </div>
              )}

              <form onSubmit={handleEditPlayerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Player Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editPlayerForm.name}
                    onChange={handleEditPlayerChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editPlayerForm.phone}
                    onChange={handleEditPlayerChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editPlayerForm.email}
                    onChange={handleEditPlayerChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-sm"
                  />
                </div>

                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 border border-slate-200">
                  <p className="font-medium text-slate-700 mb-1">Player Info:</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">R-Number:</span>
                      <p className="font-mono">{editingPlayer.rNumber}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Player ID:</span>
                      <p className="font-mono">{editingPlayer.uniqueId}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Sport:</span>
                      <p>{editingPlayer.sport}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditPlayerModal}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editPlayerLoading}
                    className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editPlayerLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
