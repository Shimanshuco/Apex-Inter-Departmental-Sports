import { useState, useEffect } from "react";
import { useCaptain } from "../../context/CaptainContext";
import { useNotification } from "../../context/NotificationContext";
import { API_ENDPOINTS } from "../../config/api";

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

interface Player {
  _id: string;
  name: string;
  rNumber: string;
  uniqueId: string;
  phone: string;
  email: string;
  sport: string;
  status: string;
}

interface Team {
  _id: string;
  name: string;
  sport: string;
  department: string;
  captain: {
    _id: string;
    name: string;
    email: string;
    department: string;
    uniqueId: string;
  };
  players: Player[];
  maxPlayers: number;
  status: string;
  createdAt: string;
}

export default function CaptainTeamManager() {
  const { token } = useCaptain();
  const { showNotification, showConfirm } = useNotification();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create team modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", sport: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit team modal state
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editForm, setEditForm] = useState({ name: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Manage players modal state
  const [managingTeam, setManagingTeam] = useState<Team | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageError, setManageError] = useState("");

  // View team modal state
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);

  useEffect(() => {
    fetchTeams();
  }, [token]);

  const fetchTeams = async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.CAPTAIN_TEAMS_LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to fetch teams");
      }
    } catch (err) {
      setError("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlayers = async (sport: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.CAPTAIN_TEAMS_AVAILABLE_PLAYERS}?sport=${encodeURIComponent(sport)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailablePlayers(data.players || []);
      }
    } catch (err) {
      console.error("Failed to fetch available players");
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreateLoading(true);
    setCreateError("");

    try {
      const response = await fetch(API_ENDPOINTS.CAPTAIN_TEAMS_CREATE, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setCreateForm({ name: "", sport: "" });
        fetchTeams();
      } else {
        setCreateError(data.error || "Failed to create team");
      }
    } catch (err) {
      setCreateError("Failed to create team");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingTeam) return;
    setEditLoading(true);
    setEditError("");

    try {
      const response = await fetch(API_ENDPOINTS.CAPTAIN_TEAMS_UPDATE(editingTeam._id), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editForm.name }),
      });

      const data = await response.json();

      if (response.ok) {
        setEditingTeam(null);
        fetchTeams();
      } else {
        setEditError(data.error || "Failed to update team");
      }
    } catch (err) {
      setEditError("Failed to update team");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!token) return;
    const confirmed = await showConfirm("Are you sure you want to delete this team?");
    if (!confirmed) return;

    try {
      const response = await fetch(API_ENDPOINTS.CAPTAIN_TEAMS_DELETE(teamId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showNotification("Team deleted successfully", "success");
        fetchTeams();
      } else {
        const data = await response.json();
        showNotification(data.error || "Failed to delete team", "error");
      }
    } catch (err) {
      showNotification("Failed to delete team", "error");
    }
  };

  const handleAddPlayers = async () => {
    if (!token || !managingTeam || selectedPlayers.length === 0) return;
    setManageLoading(true);
    setManageError("");

    try {
      const response = await fetch(API_ENDPOINTS.CAPTAIN_TEAMS_ADD_PLAYERS(managingTeam._id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerIds: selectedPlayers }),
      });

      const data = await response.json();

      if (response.ok) {
        setManagingTeam(data.team);
        setSelectedPlayers([]);
        fetchAvailablePlayers(managingTeam.sport);
        fetchTeams();
      } else {
        setManageError(data.error || "Failed to add players");
      }
    } catch (err) {
      setManageError("Failed to add players");
    } finally {
      setManageLoading(false);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!token || !managingTeam) return;

    try {
      const response = await fetch(
        API_ENDPOINTS.CAPTAIN_TEAMS_REMOVE_PLAYER(managingTeam._id, playerId),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setManagingTeam(data.team);
        fetchAvailablePlayers(managingTeam.sport);
        fetchTeams();
        showNotification("Player removed from team", "success");
      } else {
        showNotification(data.error || "Failed to remove player", "error");
      }
    } catch (err) {
      showNotification("Failed to remove player", "error");
    }
  };

  const openManagePlayersModal = (team: Team) => {
    setManagingTeam(team);
    setSelectedPlayers([]);
    setManageError("");
    fetchAvailablePlayers(team.sport);
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setEditForm({ name: team.name });
    setEditError("");
  };

  // Get sports that don't have a team yet
  const availableSports = SPORTS_LIST.filter(
    (sport) => !teams.some((team) => team.sport === sport)
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-600 mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Team Management</h2>
          <p className="text-sm text-slate-500">
            Manage your department teams (1 team per sport, max 15 players each)
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={availableSports.length === 0}
          className="px-3 py-1.5 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Team
        </button>
      </div>

      {error && (
        <div className="px-4 sm:px-5 py-3 bg-red-50 border-b border-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Teams List */}
      <div className="p-4 sm:p-5">
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No teams yet</p>
            <p className="text-sm text-slate-500 mt-1">Create your first team to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team._id}
                className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">{team.name}</h3>
                    <p className="text-sm text-slate-500 font-medium">{team.sport}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      team.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {team.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                    <span>Players</span>
                    <span className="font-medium">
                      {team.players.length} / {team.maxPlayers}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-500 rounded-full transition-all"
                      style={{ width: `${(team.players.length / team.maxPlayers) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewingTeam(team)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => openManagePlayersModal(team)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                  >
                    Players
                  </button>
                  <button
                    onClick={() => openEditModal(team)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team._id)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Create New Team</h3>
            </div>
            <div className="p-5">

            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                  placeholder="e.g., Engineering Warriors"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sport
                </label>
                <select
                  value={createForm.sport}
                  onChange={(e) => setCreateForm({ ...createForm, sport: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-sm"
                >
                  <option value="">Select Sport</option>
                  {availableSports.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
                {availableSports.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    You already have teams for all sports!
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({ name: "", sport: "" });
                    setCreateError("");
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !createForm.name || !createForm.sport}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                >
                  {createLoading ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Edit Team</h3>
            </div>
            <div className="p-5">
              {editError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {editError}
                </div>
              )}

              <form onSubmit={handleUpdateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sport
                  </label>
                  <input
                    type="text"
                    value={editingTeam.sport}
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">Sport cannot be changed</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTeam(null);
                      setEditError("");
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading || !editForm.name}
                    className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manage Players Modal */}
      {managingTeam && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Manage Players - {managingTeam.name}</h3>
              <p className="text-sm text-slate-500">
                {managingTeam.sport} • {managingTeam.players.length}/{managingTeam.maxPlayers} players
              </p>
            </div>

            {manageError && (
              <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {manageError}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Current Team Players */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3 text-sm">
                    Current Players ({managingTeam.players.length})
                  </h4>
                  {managingTeam.players.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4">No players in this team</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {managingTeam.players.map((player) => (
                        <div
                          key={player._id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100"
                        >
                          <div>
                            <p className="font-medium text-sm text-slate-800">{player.name}</p>
                            <p className="text-xs text-slate-500">{player.uniqueId}</p>
                          </div>
                          <button
                            onClick={() => handleRemovePlayer(player._id)}
                            className="text-red-600 hover:text-red-700 text-xs font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Players */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3 text-sm">
                    Available Players ({availablePlayers.length})
                  </h4>
                  {availablePlayers.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4">
                      No more players available for this sport
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availablePlayers.map((player) => (
                        <label
                          key={player._id}
                          className={`flex items-center p-2.5 rounded-lg cursor-pointer transition border ${
                            selectedPlayers.includes(player._id)
                              ? "bg-blue-50 border-blue-300"
                              : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPlayers.includes(player._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (managingTeam.players.length + selectedPlayers.length < managingTeam.maxPlayers) {
                                  setSelectedPlayers([...selectedPlayers, player._id]);
                                }
                              } else {
                                setSelectedPlayers(selectedPlayers.filter((id) => id !== player._id));
                              }
                            }}
                            disabled={
                              !selectedPlayers.includes(player._id) &&
                              managingTeam.players.length + selectedPlayers.length >= managingTeam.maxPlayers
                            }
                            className="mr-3 rounded"
                          />
                          <div>
                            <p className="font-medium text-sm text-slate-800">{player.name}</p>
                            <p className="text-xs text-slate-500">{player.uniqueId}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {selectedPlayers.length > 0 && (
                    <button
                      onClick={handleAddPlayers}
                      disabled={manageLoading}
                      className="mt-4 w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-300 transition-colors text-sm font-medium"
                    >
                      {manageLoading
                        ? "Adding..."
                        : `Add ${selectedPlayers.length} Player${selectedPlayers.length > 1 ? "s" : ""}`}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setManagingTeam(null);
                  setSelectedPlayers([]);
                  setManageError("");
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Team Modal */}
      {viewingTeam && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">{viewingTeam.name}</h3>
              <p className="text-sm text-slate-500">{viewingTeam.sport}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs font-medium mb-0.5">Department</p>
                    <p className="font-medium text-slate-800">{viewingTeam.department}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-medium mb-0.5">Status</p>
                    <p className="font-medium text-slate-800 capitalize">{viewingTeam.status}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-medium mb-0.5">Players</p>
                    <p className="font-medium text-slate-800">{viewingTeam.players.length} / {viewingTeam.maxPlayers}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-medium mb-0.5">Created</p>
                    <p className="font-medium text-slate-800">
                      {new Date(viewingTeam.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-700 mb-3 text-sm">Team Roster</h4>
                  {viewingTeam.players.length === 0 ? (
                    <p className="text-sm text-slate-500">No players in this team</p>
                  ) : (
                    <div className="space-y-2">
                      {viewingTeam.players.map((player, index) => (
                        <div
                          key={player._id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                        >
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-slate-800">{player.name}</p>
                            <p className="text-xs text-slate-500">
                              {player.uniqueId} • {player.rNumber}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                              player.status === "approved" || player.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {player.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100">
              <button
                onClick={() => setViewingTeam(null)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
