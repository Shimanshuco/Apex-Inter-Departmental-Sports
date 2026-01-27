import { useState, useEffect } from "react";
import { useCaptain } from "../../context/CaptainContext";
import { API_ENDPOINTS } from "../../config/api";

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
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      const response = await fetch(API_ENDPOINTS.CAPTAIN_TEAMS_DELETE(teamId), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchTeams();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete team");
      }
    } catch (err) {
      alert("Failed to delete team");
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
      } else {
        alert(data.error || "Failed to remove player");
      }
    } catch (err) {
      alert("Failed to remove player");
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
      <div className="bg-white rounded-xl shadow p-6">
        <div className="text-center py-8 text-gray-500">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">My Teams</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your department teams (1 team per sport, max 15 players each)
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={availableSports.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm"
        >
          + Create Team
        </button>
      </div>

      {error && (
        <div className="px-4 sm:px-6 py-3 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Teams List */}
      <div className="p-4 sm:p-6">
        {teams.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-lg font-medium">No teams yet</p>
            <p className="text-sm mt-1">Create your first team to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team._id}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{team.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{team.sport}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      team.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {team.status}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Players:</span>
                    <span className="font-semibold">
                      {team.players.length} / {team.maxPlayers}
                    </span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(team.players.length / team.maxPlayers) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setViewingTeam(team)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition"
                  >
                    👁️ View
                  </button>
                  <button
                    onClick={() => openManagePlayersModal(team)}
                    className="flex-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                  >
                    👥 Players
                  </button>
                  <button
                    onClick={() => openEditModal(team)}
                    className="px-3 py-1.5 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team._id)}
                    className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Create New Team</h3>

            {createError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                  placeholder="e.g., Engineering Warriors"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sport
                </label>
                <select
                  value={createForm.sport}
                  onChange={(e) => setCreateForm({ ...createForm, sport: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Sport</option>
                  {availableSports.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
                {availableSports.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
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
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !createForm.name || !createForm.sport}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {createLoading ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Edit Team</h3>

            {editError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sport
                </label>
                <input
                  type="text"
                  value={editingTeam.sport}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Sport cannot be changed</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTeam(null);
                    setEditError("");
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading || !editForm.name}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Players Modal */}
      {managingTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold">Manage Players - {managingTeam.name}</h3>
              <p className="text-sm text-gray-500">
                {managingTeam.sport} • {managingTeam.players.length}/{managingTeam.maxPlayers} players
              </p>
            </div>

            {manageError && (
              <div className="mx-6 mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {manageError}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Team Players */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Current Players ({managingTeam.players.length})
                  </h4>
                  {managingTeam.players.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">No players in this team</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {managingTeam.players.map((player) => (
                        <div
                          key={player._id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-sm">{player.name}</p>
                            <p className="text-xs text-gray-500">{player.uniqueId}</p>
                          </div>
                          <button
                            onClick={() => handleRemovePlayer(player._id)}
                            className="text-red-600 hover:text-red-700 text-sm"
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
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Available Players ({availablePlayers.length})
                  </h4>
                  {availablePlayers.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">
                      No more players available for this sport
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availablePlayers.map((player) => (
                        <label
                          key={player._id}
                          className={`flex items-center p-2 rounded-lg cursor-pointer transition ${
                            selectedPlayers.includes(player._id)
                              ? "bg-blue-50 border border-blue-300"
                              : "bg-gray-50 hover:bg-gray-100"
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
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium text-sm">{player.name}</p>
                            <p className="text-xs text-gray-500">{player.uniqueId}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {selectedPlayers.length > 0 && (
                    <button
                      onClick={handleAddPlayers}
                      disabled={manageLoading}
                      className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition text-sm"
                    >
                      {manageLoading
                        ? "Adding..."
                        : `Add ${selectedPlayers.length} Player${selectedPlayers.length > 1 ? "s" : ""}`}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t">
              <button
                onClick={() => {
                  setManagingTeam(null);
                  setSelectedPlayers([]);
                  setManageError("");
                }}
                className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Team Modal */}
      {viewingTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold">{viewingTeam.name}</h3>
              <p className="text-sm text-blue-600">{viewingTeam.sport}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Department</p>
                    <p className="font-medium">{viewingTeam.department}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-medium capitalize">{viewingTeam.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Players</p>
                    <p className="font-medium">{viewingTeam.players.length} / {viewingTeam.maxPlayers}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium">
                      {new Date(viewingTeam.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Team Roster</h4>
                  {viewingTeam.players.length === 0 ? (
                    <p className="text-sm text-gray-500">No players in this team</p>
                  ) : (
                    <div className="space-y-2">
                      {viewingTeam.players.map((player, index) => (
                        <div
                          key={player._id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{player.name}</p>
                            <p className="text-xs text-gray-500">
                              {player.uniqueId} • {player.rNumber}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              player.status === "approved" || player.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
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

            <div className="px-6 py-4 border-t">
              <button
                onClick={() => setViewingTeam(null)}
                className="w-full px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
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
