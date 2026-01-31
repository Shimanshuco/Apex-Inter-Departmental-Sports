import { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import { useNotification } from "../../context/NotificationContext";
import { API_ENDPOINTS } from "../../config/api";
import axios from "axios";

interface DepartmentPlayer {
  _id: string;
  name: string;
  email: string;
  rNumber: string;
  uniqueId: string;
  phone: string;
  department: string;
  sport: string;
  gender: string;
  year: string;
  captain: {
    _id: string;
    name: string;
    uniqueId: string;
  };
  status: string;
  addedAt: string;
}

interface ManageDepartmentPlayersProps {
  refreshKey?: number;
}

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
  "Kho Kho",
  "Tug of War",
  "Athletics",
  "Swimming",
  "Chess",
  "Carrom",
  "Handball",
  "Throwball",
];

const GENDERS = ["Male", "Female", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "PG 1st Year", "PG 2nd Year", "PhD"];

export default function ManageDepartmentPlayers({
  refreshKey,
}: ManageDepartmentPlayersProps) {
  const { token } = useAdmin();
  const { showNotification, showConfirm } = useNotification();
  const [players, setPlayers] = useState<DepartmentPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedSport, setSelectedSport] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit modal state
  const [editingPlayer, setEditingPlayer] = useState<DepartmentPlayer | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    email: "",
    sport: "",
    status: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Add player modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [captainsList, setCaptainsList] = useState<{_id: string; name: string; uniqueId: string; department: string}[]>([]);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    rNumber: "",
    phone: "",
    department: "",
    sport: "",
    captainId: "",
    gender: "",
    year: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const DEPARTMENTS = [
    "Engineering",
    "Commerce & Management",
    "Computer & IT",
    "Law",
    "Basic Life & Applied Sciences",
    "Humanities and Arts",
    "Journalism & Mass Communication",
    "Physiotherapy",
    "Naturopathy & Yogic Sciences",
    "Fashion & Design",
    "Pharmaceutical Sciences",
    "Special Education",
    "Clinical Psychology",
    "Agriculture",
    "Library Science",
    "Nursing",
    "Education",
    "Paramedical",
    "Veterinary Science",
    "Research",
  ];

  useEffect(() => {
    fetchPlayers();
  }, [token, refreshKey]);

  const fetchPlayers = async () => {
    if (!token) return;
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN_DEPT_PLAYERS_LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayers(response.data.players || []);
    } catch (error) {
      console.error("Failed to fetch department players");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await axios.put(
        API_ENDPOINTS.ADMIN_DEPT_PLAYERS_STATUS(id),
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlayers(
        players.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
      );
      showNotification(`Player ${newStatus} successfully`, "success");
    } catch (error) {
      showNotification("Failed to update player status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm(
      "Are you sure you want to delete this player?"
    );
    if (confirmed) {
      try {
        await axios.delete(API_ENDPOINTS.ADMIN_DEPT_PLAYERS_DELETE(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlayers(players.filter((p) => p._id !== id));
        showNotification("Player deleted successfully", "success");
      } catch (error) {
        showNotification("Failed to delete player", "error");
      }
    }
  };

  const openEditModal = (player: DepartmentPlayer) => {
    setEditingPlayer(player);
    setEditFormData({
      name: player.name || "",
      phone: player.phone || "",
      email: player.email || "",
      sport: player.sport || "",
      status: player.status || "",
    });
    setEditError("");
  };

  const closeEditModal = () => {
    setEditingPlayer(null);
    setEditError("");
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    setEditLoading(true);
    setEditError("");

    try {
      await axios.put(
        API_ENDPOINTS.ADMIN_DEPT_PLAYERS_UPDATE(editingPlayer._id),
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchPlayers();
      closeEditModal();
      showNotification("Player updated successfully", "success");
    } catch (err: any) {
      setEditError(err.response?.data?.error || "Failed to update player");
    } finally {
      setEditLoading(false);
    }
  };

  // Add Player handlers
  const fetchCaptains = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN_CAPTAINS_LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const approvedCaptains = (response.data.captains || []).filter(
        (c: any) => c.status === "approved" || c.status === "active"
      );
      setCaptainsList(approvedCaptains);
    } catch (error) {
      console.error("Failed to fetch captains");
    }
  };

  const openAddModal = async () => {
    setShowAddModal(true);
    setAddFormData({
      name: "",
      email: "",
      rNumber: "",
      phone: "",
      department: "",
      sport: "",
      captainId: "",
      gender: "",
      year: "",
    });
    setAddError("");
    await fetchCaptains();
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddError("");
  };

  const handleAddChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-fill department when captain is selected
    if (name === "captainId" && value) {
      const selectedCaptain = captainsList.find((c) => c._id === value);
      if (selectedCaptain) {
        setAddFormData((prev) => ({ ...prev, captainId: value, department: selectedCaptain.department }));
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");

    try {
      await axios.post(
        API_ENDPOINTS.ADMIN_DEPT_PLAYERS_CREATE,
        addFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchPlayers();
      closeAddModal();
      showNotification("Player added successfully", "success");
    } catch (err: any) {
      setAddError(err.response?.data?.error || "Failed to add player");
    } finally {
      setAddLoading(false);
    }
  };

  const filteredPlayers = players.filter((player) => {
    const statusMatch =
      selectedStatus === "All" ||
      player.status?.toLowerCase() === selectedStatus.toLowerCase();
    const sportMatch =
      selectedSport === "All" || player.sport === selectedSport;
    const searchMatch =
      searchQuery === "" ||
      player.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.rNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.captain?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && sportMatch && searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "active":
        return "bg-green-600 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "rejected":
        return "bg-red-600 text-white";
      case "inactive":
        return "bg-gray-600 text-white";
      default:
        return "bg-slate-300";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="border-b px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
          Manage Department Players
        </h2>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-semibold text-sm shadow-lg transition-all flex items-center gap-2 justify-center"
        >
          ➕ Add Player
        </button>
      </div>

      {/* Filter Bar */}
      <div className="border-b px-3 sm:px-6 py-3 sm:py-4 bg-slate-50 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-4">
        <input
          type="text"
          placeholder="Search by name, email, captain..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 sm:px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:min-w-[200px] sm:w-auto"
        />
        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="px-3 sm:px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none w-full sm:w-auto"
        >
          <option value="All">All Sports</option>
          {SPORTS_LIST.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 sm:px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none w-full sm:w-auto"
        >
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Mobile Cards */}
      <div className="block sm:hidden">
        {filteredPlayers.map((player) => (
          <div key={player._id} className="border-b p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-slate-900">{player.name}</h3>
              <span
                className={`px-2 py-0.5 rounded text-white text-xs font-semibold ${getStatusColor(
                  player.status
                )}`}
              >
                {player.status.charAt(0).toUpperCase() + player.status.slice(1)}
              </span>
            </div>
            <div className="text-xs text-slate-600 space-y-1.5 mb-3 bg-slate-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 font-bold">🎫 Player ID:</span>
                <span className="font-mono font-semibold text-indigo-700">
                  {player.uniqueId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">📋 R-Number:</span>
                <span className="font-mono">{player.rNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">📧 Email:</span>
                <span>{player.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">📱 Phone:</span>
                <span>{player.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">🏢 Dept:</span>
                <span>{player.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500 font-semibold">⚽ Sport:</span>
                <span className="font-medium">{player.sport}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">👤 Captain:</span>
                <span>
                  {player.captain?.name} ({player.captain?.uniqueId})
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {player.status === "pending" && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(player._id, "approved")}
                    className="flex-1 text-green-600 hover:text-green-700 font-semibold px-2 py-1.5 bg-green-50 rounded text-xs"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(player._id, "rejected")}
                    className="flex-1 text-orange-600 hover:text-orange-700 font-semibold px-2 py-1.5 bg-orange-50 rounded text-xs"
                  >
                    ✕ Reject
                  </button>
                </>
              )}
              {(player.status === "approved" || player.status === "active") && (
                <button
                  onClick={() => handleUpdateStatus(player._id, "inactive")}
                  className="flex-1 text-gray-600 hover:text-gray-700 font-semibold px-2 py-1.5 bg-gray-50 rounded text-xs"
                >
                  ⏸️ Deactivate
                </button>
              )}
              {player.status === "inactive" && (
                <button
                  onClick={() => handleUpdateStatus(player._id, "active")}
                  className="flex-1 text-green-600 hover:text-green-700 font-semibold px-2 py-1.5 bg-green-50 rounded text-xs"
                >
                  ▶️ Activate
                </button>
              )}
              <button
                onClick={() => openEditModal(player)}
                className="flex-1 text-blue-600 hover:text-blue-700 font-semibold px-2 py-1.5 bg-blue-50 rounded text-xs"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(player._id)}
                className="text-red-600 hover:text-red-700 font-semibold px-3 py-1.5 bg-red-50 rounded text-xs"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-indigo-900 text-white">
            <tr>
              <th className="px-2 py-3 text-left text-xs font-semibold">Name / Email</th>
              <th className="px-2 py-3 text-left text-xs font-semibold">R-Number</th>
              <th className="px-2 py-3 text-left text-xs font-semibold">Player ID</th>
              <th className="px-2 py-3 text-left text-xs font-semibold">Phone</th>
              <th className="px-2 py-3 text-left text-xs font-semibold">Dept</th>
              <th className="px-2 py-3 text-left text-xs font-semibold">Sport</th>
              <th className="px-2 py-3 text-left text-xs font-semibold">Captain</th>
              <th className="px-2 py-3 text-left text-xs font-semibold">Status</th>
              <th className="px-2 py-3 text-left text-xs font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPlayers.map((player) => (
              <tr key={player._id} className="hover:bg-slate-50">
                <td className="px-2 py-3 text-xs text-slate-900">
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-xs text-slate-400">{player.email}</div>
                </td>
                <td className="px-2 py-3 text-xs text-slate-700 font-mono">
                  {player.rNumber}
                </td>
                <td className="px-2 py-3 text-xs text-indigo-600 font-mono font-bold">
                  {player.uniqueId}
                </td>
                <td className="px-2 py-3 text-xs text-slate-700">{player.phone}</td>
                <td className="px-2 py-3 text-xs text-slate-700">{player.department}</td>
                <td className="px-2 py-3 text-xs text-orange-600 font-semibold">
                  {player.sport}
                </td>
                <td className="px-2 py-3 text-xs text-slate-700">
                  <div className="font-medium">{player.captain?.name}</div>
                  <div className="text-slate-400 font-mono text-xs">
                    {player.captain?.uniqueId}
                  </div>
                </td>
                <td className="px-2 py-3 text-xs">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs font-semibold ${getStatusColor(
                      player.status
                    )}`}
                  >
                    {player.status.charAt(0).toUpperCase() + player.status.slice(1)}
                  </span>
                </td>
                <td className="px-2 py-3 text-xs">
                  <div className="flex items-center gap-1">
                    {player.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(player._id, "approved")}
                          className="text-green-600 hover:text-green-700 font-semibold text-xs"
                          title="Approve"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(player._id, "rejected")}
                          className="text-orange-600 hover:text-orange-700 font-semibold text-xs"
                          title="Reject"
                        >
                          ✕
                        </button>
                      </>
                    )}
                    {(player.status === "approved" || player.status === "active") && (
                      <button
                        onClick={() => handleUpdateStatus(player._id, "inactive")}
                        className="text-gray-600 hover:text-gray-700 font-semibold text-xs"
                        title="Deactivate"
                      >
                        ⏸️
                      </button>
                    )}
                    {player.status === "inactive" && (
                      <button
                        onClick={() => handleUpdateStatus(player._id, "active")}
                        className="text-green-600 hover:text-green-700 font-semibold text-xs"
                        title="Activate"
                      >
                        ▶️
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(player)}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-xs"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(player._id)}
                      className="text-red-600 hover:text-red-700 font-semibold text-xs"
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

      {filteredPlayers.length === 0 && !loading && (
        <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
          No players found
        </div>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  Edit Department Player
                </h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
                >
                  ×
                </button>
              </div>

              {editError && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                  {editError}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sport
                  </label>
                  <select
                    name="sport"
                    value={editFormData.sport}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SPORTS_LIST.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-500">
                  <p className="font-medium text-slate-700 mb-1">Player Info:</p>
                  <p>R-Number: {editingPlayer.rNumber}</p>
                  <p>Player ID: {editingPlayer.uniqueId}</p>
                  <p>Department: {editingPlayer.department}</p>
                  <p>
                    Added by: {editingPlayer.captain?.name} (
                    {editingPlayer.captain?.uniqueId})
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">➕ Add New Player</h2>
                <button
                  onClick={closeAddModal}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-blue-100 text-sm mt-1">Admin-created players are auto-approved</p>
            </div>

            <div className="p-6">
              {addError && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                  {addError}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to Captain * <span className="text-xs text-slate-500">(Captain must be approved)</span>
                  </label>
                  <select
                    name="captainId"
                    value={addFormData.captainId}
                    onChange={handleAddChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Captain</option>
                    {captainsList.map((captain) => (
                      <option key={captain._id} value={captain._id}>
                        {captain.name} ({captain.uniqueId}) - {captain.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Player Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={addFormData.name}
                      onChange={handleAddChange}
                      required
                      placeholder="Enter full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      R-Number *
                    </label>
                    <input
                      type="text"
                      name="rNumber"
                      value={addFormData.rNumber}
                      onChange={handleAddChange}
                      required
                      placeholder="e.g., R12345"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={addFormData.email}
                    onChange={handleAddChange}
                    required
                    placeholder="player@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={addFormData.phone}
                      onChange={handleAddChange}
                      required
                      placeholder="10-digit number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sport *
                    </label>
                    <select
                      name="sport"
                      value={addFormData.sport}
                      onChange={handleAddChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Sport</option>
                      {SPORTS_LIST.map((sport) => (
                        <option key={sport} value={sport}>{sport}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    value={addFormData.department}
                    onChange={handleAddChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Auto-filled based on selected captain</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={addFormData.gender}
                      onChange={handleAddChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      {GENDERS.map((gender) => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year *
                    </label>
                    <select
                      name="year"
                      value={addFormData.year}
                      onChange={handleAddChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Year</option>
                      {YEARS.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <p className="text-amber-700 font-medium">⚠️ Note:</p>
                  <p className="text-amber-600 text-xs mt-1">
                    A player can be registered in maximum 2 sports only.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 font-semibold"
                  >
                    {addLoading ? "Adding..." : "Add Player"}
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
