import { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
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
  department: string;
}

interface Team {
  _id: string;
  name: string;
  sport: string;
  gender: string;
  department: string;
  captain: {
    _id: string;
    name: string;
    email: string;
    department: string;
    uniqueId: string;
    phone: string;
  };
  players: Player[];
  maxPlayers: number;
  status: string;
  createdAt: string;
}

interface ManageTeamsProps {
  refreshKey?: number;
}

export default function ManageTeams({ refreshKey }: ManageTeamsProps) {
  const { token } = useAdmin();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  // View team modal state
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);

  // Edit team modal state
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editForm, setEditForm] = useState({ name: "", status: "", gender: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    fetchTeams();
  }, [token, refreshKey]);

  const fetchTeams = async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_TEAMS_LIST, {
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

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingTeam) return;
    setEditLoading(true);
    setEditError("");

    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_TEAMS_UPDATE(editingTeam._id), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
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
    if (!confirm("Are you sure you want to delete this team? This action cannot be undone.")) return;

    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_TEAMS_DELETE(teamId), {
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

  const handleStatusChange = async (teamId: string, status: string) => {
    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_TEAMS_STATUS(teamId), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchTeams();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setEditForm({ name: team.name, status: team.status, gender: team.gender || "Boys" });
    setEditError("");
  };

  // Get unique departments from teams
  const departments = [...new Set(teams.map((t) => t.department))].sort();

  // Filter teams
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      searchQuery === "" ||
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.captain?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === "All" || team.sport === selectedSport;
    const matchesDept = selectedDepartment === "All" || team.department === selectedDepartment;
    return matchesSearch && matchesSport && matchesDept;
  });

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
      <div className="px-4 sm:px-6 py-4 border-b">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">All Teams</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          View and manage all department teams
        </p>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 py-3 border-b bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search teams, captains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Sports</option>
            {SPORTS_LIST.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="px-4 sm:px-6 py-3 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Teams List */}
      <div className="p-4 sm:p-6">
        {filteredTeams.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-lg font-medium">No teams found</p>
            <p className="text-sm mt-1">
              {teams.length === 0
                ? "Captains haven't created any teams yet"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile View */}
            <div className="block lg:hidden space-y-4">
              {filteredTeams.map((team) => (
                <div key={team._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900">{team.name}</h3>
                      <p className="text-sm text-blue-600">
                        {team.sport} {team.gender && <span className={`ml-1 px-1.5 py-0.5 text-xs rounded ${team.gender === 'Boys' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{team.gender}</span>}
                      </p>
                    </div>
                    <select
                      value={team.status}
                      onChange={(e) => handleStatusChange(team._id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${
                        team.status === "active"
                          ? "bg-green-100 text-green-700"
                          : team.status === "inactive"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 mb-3">
                    <p>
                      <span className="text-gray-500">Department:</span> {team.department}
                    </p>
                    <p>
                      <span className="text-gray-500">Captain:</span> {team.captain?.name}
                    </p>
                    <p>
                      <span className="text-gray-500">Players:</span> {team.players.length}/{team.maxPlayers}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingTeam(team)}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => openEditModal(team)}
                      className="px-3 py-1.5 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team._id)}
                      className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <table className="hidden lg:table w-full">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Team</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Sport</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Department</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Captain</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Players</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTeams.map((team) => (
                  <tr key={team._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{team.name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600 font-medium">
                      {team.sport}
                    </td>
                    <td className="px-4 py-3">
                      {team.gender ? (
                        <span className={`px-2 py-1 text-xs rounded font-medium ${team.gender === 'Boys' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                          {team.gender}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded font-medium bg-gray-100 text-gray-500">Not Set</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{team.department}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{team.captain?.name}</p>
                      <p className="text-xs text-gray-500">{team.captain?.uniqueId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {team.players.length}/{team.maxPlayers}
                        </span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(team.players.length / team.maxPlayers) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={team.status}
                        onChange={(e) => handleStatusChange(team._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${
                          team.status === "active"
                            ? "bg-green-100 text-green-700"
                            : team.status === "inactive"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setViewingTeam(team)}
                          className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => openEditModal(team)}
                          className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team._id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
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

        {/* Stats Summary */}
        {teams.length > 0 && (
          <div className="mt-6 pt-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{teams.length}</p>
              <p className="text-xs text-gray-500">Total Teams</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {teams.filter((t) => t.status === "active").length}
              </p>
              <p className="text-xs text-gray-500">Active Teams</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {teams.reduce((sum, t) => sum + t.players.length, 0)}
              </p>
              <p className="text-xs text-gray-500">Total Players</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{departments.length}</p>
              <p className="text-xs text-gray-500">Departments</p>
            </div>
          </div>
        )}
      </div>

      {/* View Team Modal */}
      {viewingTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold">{viewingTeam.name}</h3>
              <p className="text-sm text-blue-600">
                {viewingTeam.sport} {viewingTeam.gender && <span className={`ml-1 px-1.5 py-0.5 text-xs rounded ${viewingTeam.gender === 'Boys' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{viewingTeam.gender}</span>} • {viewingTeam.department}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Team Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Category</p>
                    <p className="font-medium">{viewingTeam.gender || 'Not Set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className={`font-medium capitalize ${
                      viewingTeam.status === "active" ? "text-green-600" : "text-gray-600"
                    }`}>
                      {viewingTeam.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Players</p>
                    <p className="font-medium">
                      {viewingTeam.players.length} / {viewingTeam.maxPlayers}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium">
                      {new Date(viewingTeam.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Captain Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Captain</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium">{viewingTeam.captain?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ID</p>
                      <p className="font-medium">{viewingTeam.captain?.uniqueId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{viewingTeam.captain?.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium">{viewingTeam.captain?.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Players List */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Team Roster ({viewingTeam.players.length} players)
                  </h4>
                  {viewingTeam.players.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">No players in this team</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {viewingTeam.players.map((player, index) => (
                        <div
                          key={player._id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{player.name}</p>
                            <p className="text-xs text-gray-500">
                              {player.uniqueId} • {player.rNumber}
                            </p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="text-gray-500">{player.phone}</p>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full ${
                                player.status === "approved" || player.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {player.status}
                            </span>
                          </div>
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
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category (Gender)
                </label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                </select>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="text-gray-500">Sport: <span className="font-medium text-gray-700">{editingTeam.sport}</span></p>
                <p className="text-gray-500">Department: <span className="font-medium text-gray-700">{editingTeam.department}</span></p>
                <p className="text-gray-500">Captain: <span className="font-medium text-gray-700">{editingTeam.captain?.name}</span></p>
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
    </div>
  );
}
