
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCaptain } from "../context/CaptainContext";
import { API_ENDPOINTS } from "../config/api";
import CaptainTeamManager from "../components/captain/CaptainTeamManager";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const SPORTS_LIST = [
  "Football",
  "Cricket",
  "Basketball",
  "Volleyball",
  "Badminton",
  "Table Tennis",
  "Tennis",
  "Hockey",
  "Kabaddi",
  "Kho-Kho",
  "Athletics",
  "Swimming",
  "Chess",
  "Carrom",
  "Handball",
  "Throwball",
];

interface DepartmentPlayer {
  _id: string;
  name: string;
  rNumber: string;
  uniqueId: string;
  phone: string;
  email: string;
  sport: string;
  status: string;
  department: string;
  createdAt: string;
}

export default function CaptainDashboardPage() {
  const { captain, logout, isLoading, token, login } = useCaptain();
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
    if (!confirm("Are you sure you want to delete this player?")) return;

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

      fetchPlayers();
    } catch (err: any) {
      alert(err.message || "Failed to delete player");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "active":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!captain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Please login to access your dashboard</p>
          <Link
            to="/captain-login"
            className="text-indigo-600 font-semibold hover:text-indigo-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👨‍✈️</span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Captain Dashboard</h1>
              <p className="text-sm text-slate-500">Welcome, {captain.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-500 hover:text-slate-700 text-sm">
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Hello, Captain {captain.name}! 👋</h2>
          <p className="text-indigo-100">
            {captain.status === "approved" || captain.status === "active"
              ? `Manage your ${captain.department} department players and teams here.`
              : "Your account is pending approval. Please wait for admin confirmation."}
          </p>
        </div>

        {/* Team Management Section */}
        {(captain.status === "approved" || captain.status === "active") && (
          <div className="mb-8">
            <CaptainTeamManager />
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Captain ID Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Captain ID</h3>
                <p className="text-xs text-slate-500">Your unique identifier</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-2xl font-mono font-bold text-indigo-600 text-center">
                {captain.uniqueId}
              </p>
            </div>
          </div>

          {/* Department Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Department</h3>
                <p className="text-xs text-slate-500">Your department</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-lg font-bold text-purple-600 text-center">
                {captain.department}
              </p>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${captain.status === "approved" || captain.status === "active"
                    ? "bg-green-100"
                    : "bg-amber-100"
                  }`}
              >
                {captain.status === "approved" || captain.status === "active" ? (
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Account Status</h3>
                <p className="text-xs text-slate-500">Current status</p>
              </div>
            </div>
            <div
              className={`rounded-xl p-4 ${captain.status === "approved" || captain.status === "active"
                  ? "bg-green-50"
                  : "bg-amber-50"
                }`}
            >
              <p
                className={`text-lg font-bold text-center capitalize ${captain.status === "approved" || captain.status === "active"
                    ? "text-green-600"
                    : "text-amber-600"
                  }`}
              >
                {captain.status}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Captain Profile</h3>
            <button
              onClick={openEditModal}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Profile
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Full Name</p>
              <p className="font-medium text-slate-800">{captain.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Email</p>
              <p className="font-medium text-slate-800">{captain.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">R-Number</p>
              <p className="font-medium text-slate-800">{captain.rNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Phone</p>
              <p className="font-medium text-slate-800">{captain.phone}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Blood Group</p>
              <p className="font-medium text-slate-800">{captain.bloodGroup}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Department</p>
              <p className="font-medium text-slate-800">{captain.department}</p>
            </div>
          </div>
        </div>

        {/* Department Players Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Department Players</h3>
              <p className="text-sm text-slate-500">
                Manage players from your department (max 2 sports per player)
              </p>
            </div>
            <button
              onClick={openAddPlayerModal}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Player
            </button>
          </div>

          {playersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-slate-500">Loading players...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-slate-600">No players added yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Click "Add Player" to add players from your department
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                      R-Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                      Player ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                      Sport
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {players.map((player) => (
                    <tr key={player._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{player.name}</div>
                        <div className="text-xs text-slate-500">{player.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-600">
                        {player.rNumber}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono font-bold text-indigo-600">
                        {player.uniqueId}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{player.phone}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {player.sport}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            player.status
                          )}`}
                        >
                          {player.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditPlayerModal(player)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player._id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            🗑️
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
        
        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Link
            to="/schedule"
            className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-lg transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              📅
            </div>
            <div>
              <p className="font-medium text-slate-800">Match Schedule</p>
              <p className="text-xs text-slate-500">View upcoming matches</p>
            </div>
          </Link>
          <Link
            to="/scores"
            className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-lg transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              🏆
            </div>
            <div>
              <p className="font-medium text-slate-800">Scores</p>
              <p className="text-xs text-slate-500">Check match results</p>
            </div>
          </Link>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Edit Profile</h2>
                <button
                  onClick={closeEditModal}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {editError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {editSuccess}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={editForm.bloodGroup}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-500">
                  <p className="font-medium text-slate-700 mb-1">Note:</p>
                  <p>Email, R-Number, Department, and Captain ID cannot be changed.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Add New Player</h2>
                <button
                  onClick={closeAddPlayerModal}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {addPlayerError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {addPlayerError}
                </div>
              )}

              {addPlayerSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                  {addPlayerSuccess}
                </div>
              )}

              <form onSubmit={handleAddPlayerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Player Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={addPlayerForm.name}
                    onChange={handleAddPlayerChange}
                    required
                    placeholder="Enter player's full name"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Player R-Number *
                  </label>
                  <input
                    type="text"
                    name="rNumber"
                    value={addPlayerForm.rNumber}
                    onChange={handleAddPlayerChange}
                    required
                    placeholder="e.g., R2021001"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={addPlayerForm.phone}
                    onChange={handleAddPlayerChange}
                    required
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Player Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={addPlayerForm.email}
                    onChange={handleAddPlayerChange}
                    required
                    placeholder="player@email.com"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sport *
                  </label>
                  <select
                    name="sport"
                    value={addPlayerForm.sport}
                    onChange={handleAddPlayerChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Sport</option>
                    {SPORTS_LIST.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
                  <p className="font-medium mb-1">⚠️ Note:</p>
                  <p>
                    A player can participate in maximum 2 sports. The same R-Number can be
                    registered for different sports.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeAddPlayerModal}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addPlayerLoading}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Edit Player</h2>
                <button
                  onClick={closeEditPlayerModal}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {editPlayerError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {editPlayerError}
                </div>
              )}

              <form onSubmit={handleEditPlayerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Player Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editPlayerForm.name}
                    onChange={handleEditPlayerChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editPlayerForm.phone}
                    onChange={handleEditPlayerChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editPlayerForm.email}
                    onChange={handleEditPlayerChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-500">
                  <p className="font-medium text-slate-700 mb-1">Player Info:</p>
                  <p>R-Number: {editingPlayer.rNumber}</p>
                  <p>Player ID: {editingPlayer.uniqueId}</p>
                  <p>Sport: {editingPlayer.sport}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditPlayerModal}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editPlayerLoading}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
