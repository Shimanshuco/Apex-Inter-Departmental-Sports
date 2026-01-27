import { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import { useNotification } from "../../context/NotificationContext";
import { API_ENDPOINTS } from "../../config/api";
import axios from "axios";

interface Captain {
  _id: string;
  name: string;
  email: string;
  rNumber: string;
  uniqueId: string;
  phone: string;
  department: string;
  bloodGroup: string;
  status: string;
  createdAt: string;
}

interface DepartmentPlayer {
  _id: string;
  name: string;
  email: string;
  rNumber: string;
  uniqueId: string;
  phone: string;
  department: string;
  sport: string;
  captain: {
    _id: string;
    name: string;
    uniqueId: string;
    email: string;
    phone: string;
  };
  status: string;
  addedAt: string;
}

interface CaptainApprovalsProps {
  refreshKey?: number;
}

export default function CaptainApprovals({ refreshKey }: CaptainApprovalsProps) {
  const { token } = useAdmin();
  const { showNotification, showConfirm } = useNotification();
  const [pendingCaptains, setPendingCaptains] = useState<Captain[]>([]);
  const [pendingPlayers, setPendingPlayers] = useState<DepartmentPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"captains" | "players">("captains");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedSport, setSelectedSport] = useState("All");

  // Detail modal state
  const [viewingCaptain, setViewingCaptain] = useState<Captain | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<DepartmentPlayer | null>(null);

  // Bulk selection
  const [selectedCaptainIds, setSelectedCaptainIds] = useState<string[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  // Processing state
  const [processingIds, setProcessingIds] = useState<string[]>([]);

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

  const SPORTS_LIST = [
    "Football", "Cricket", "Basketball", "Volleyball", "Badminton",
    "Table Tennis", "Tennis", "Hockey", "Kabaddi", "Kho-Kho",
    "Athletics", "Swimming", "Chess", "Carrom", "Handball", "Throwball",
  ];

  useEffect(() => {
    fetchPendingItems();
  }, [token, refreshKey]);

  const fetchPendingItems = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [captainsRes, playersRes] = await Promise.all([
        axios.get(API_ENDPOINTS.ADMIN_CAPTAINS_LIST, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(API_ENDPOINTS.ADMIN_DEPT_PLAYERS_LIST, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const allCaptains = captainsRes.data.captains || [];
      const allPlayers = playersRes.data.players || [];

      setPendingCaptains(allCaptains.filter((c: Captain) => c.status === "pending"));
      setPendingPlayers(allPlayers.filter((p: DepartmentPlayer) => p.status === "pending"));
    } catch (error) {
      console.error("Failed to fetch pending items");
    } finally {
      setLoading(false);
    }
  };

  const handleCaptainAction = async (id: string, action: "approved" | "rejected") => {
    setProcessingIds((prev) => [...prev, id]);
    try {
      await axios.put(
        API_ENDPOINTS.ADMIN_CAPTAINS_STATUS(id),
        { status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingCaptains(pendingCaptains.filter((c) => c._id !== id));
      setSelectedCaptainIds(selectedCaptainIds.filter((cid) => cid !== id));
      showNotification(
        `Captain ${action === "approved" ? "approved" : "rejected"} successfully`,
        "success"
      );
      setViewingCaptain(null);
    } catch (error) {
      showNotification("Failed to update captain status", "error");
    } finally {
      setProcessingIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  const handlePlayerAction = async (id: string, action: "approved" | "rejected") => {
    setProcessingIds((prev) => [...prev, id]);
    try {
      await axios.put(
        API_ENDPOINTS.ADMIN_DEPT_PLAYERS_STATUS(id),
        { status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingPlayers(pendingPlayers.filter((p) => p._id !== id));
      setSelectedPlayerIds(selectedPlayerIds.filter((pid) => pid !== id));
      showNotification(
        `Player ${action === "approved" ? "approved" : "rejected"} successfully`,
        "success"
      );
      setViewingPlayer(null);
    } catch (error) {
      showNotification("Failed to update player status", "error");
    } finally {
      setProcessingIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  // Bulk actions
  const handleBulkCaptainAction = async (action: "approved" | "rejected") => {
    if (selectedCaptainIds.length === 0) return;
    const confirmed = await showConfirm(
      `Are you sure you want to ${action === "approved" ? "approve" : "reject"} ${selectedCaptainIds.length} captain(s)?`
    );
    if (!confirmed) return;

    setProcessingIds((prev) => [...prev, ...selectedCaptainIds]);
    let successCount = 0;
    for (const id of selectedCaptainIds) {
      try {
        await axios.put(
          API_ENDPOINTS.ADMIN_CAPTAINS_STATUS(id),
          { status: action },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        successCount++;
      } catch (error) {
        console.error(`Failed to ${action} captain ${id}`);
      }
    }
    setPendingCaptains(pendingCaptains.filter((c) => !selectedCaptainIds.includes(c._id)));
    setSelectedCaptainIds([]);
    setProcessingIds([]);
    showNotification(`${successCount} captain(s) ${action} successfully`, "success");
  };

  const handleBulkPlayerAction = async (action: "approved" | "rejected") => {
    if (selectedPlayerIds.length === 0) return;
    const confirmed = await showConfirm(
      `Are you sure you want to ${action === "approved" ? "approve" : "reject"} ${selectedPlayerIds.length} player(s)?`
    );
    if (!confirmed) return;

    setProcessingIds((prev) => [...prev, ...selectedPlayerIds]);
    let successCount = 0;
    for (const id of selectedPlayerIds) {
      try {
        await axios.put(
          API_ENDPOINTS.ADMIN_DEPT_PLAYERS_STATUS(id),
          { status: action },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        successCount++;
      } catch (error) {
        console.error(`Failed to ${action} player ${id}`);
      }
    }
    setPendingPlayers(pendingPlayers.filter((p) => !selectedPlayerIds.includes(p._id)));
    setSelectedPlayerIds([]);
    setProcessingIds([]);
    showNotification(`${successCount} player(s) ${action} successfully`, "success");
  };

  const toggleCaptainSelection = (id: string) => {
    setSelectedCaptainIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const togglePlayerSelection = (id: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const selectAllCaptains = () => {
    if (selectedCaptainIds.length === filteredCaptains.length) {
      setSelectedCaptainIds([]);
    } else {
      setSelectedCaptainIds(filteredCaptains.map((c) => c._id));
    }
  };

  const selectAllPlayers = () => {
    if (selectedPlayerIds.length === filteredPlayers.length) {
      setSelectedPlayerIds([]);
    } else {
      setSelectedPlayerIds(filteredPlayers.map((p) => p._id));
    }
  };

  // Filter captains
  const filteredCaptains = pendingCaptains.filter((captain) => {
    const deptMatch = selectedDepartment === "All" || captain.department === selectedDepartment;
    const searchMatch =
      searchQuery === "" ||
      captain.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      captain.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      captain.rNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      captain.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase());
    return deptMatch && searchMatch;
  });

  // Filter players
  const filteredPlayers = pendingPlayers.filter((player) => {
    const deptMatch = selectedDepartment === "All" || player.department === selectedDepartment;
    const sportMatch = selectedSport === "All" || player.sport === selectedSport;
    const searchMatch =
      searchQuery === "" ||
      player.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.rNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.captain?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return deptMatch && sportMatch && searchMatch;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Just now";
  };

  const pendingCaptainsCount = pendingCaptains.length;
  const pendingPlayersCount = pendingPlayers.length;

  // Verification Search States
  const [verifyType, setVerifyType] = useState<"captain" | "player">("captain");
  const [verifyRNumber, setVerifyRNumber] = useState("");
  const [verifyUniqueId, setVerifyUniqueId] = useState("");
  const [verifyResult, setVerifyResult] = useState<Captain | DepartmentPlayer | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [showVerifyResult, setShowVerifyResult] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"verified" | "mismatch" | null>(null);

  const handleVerifySearch = async () => {
    if (!verifyRNumber.trim() || !verifyUniqueId.trim()) {
      setVerifyError("Please enter both R-Number and Unique ID to verify");
      return;
    }
    setVerifyLoading(true);
    setVerifyError("");
    setVerifyResult(null);
    setShowVerifyResult(false);
    setVerifyStatus(null);

    try {
      if (verifyType === "captain") {
        const res = await axios.get(API_ENDPOINTS.ADMIN_CAPTAINS_LIST, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const captains = res.data.captains || [];
        
        // Find by R-Number
        const foundByRNumber = captains.find((c: Captain) => 
          c.rNumber?.toLowerCase() === verifyRNumber.trim().toLowerCase()
        );
        
        // Find by Unique ID
        const foundByUniqueId = captains.find((c: Captain) => 
          c.uniqueId?.toLowerCase() === verifyUniqueId.trim().toLowerCase()
        );

        if (foundByRNumber && foundByUniqueId && foundByRNumber._id === foundByUniqueId._id) {
          // Both match the same captain - VERIFIED
          setVerifyResult(foundByRNumber);
          setShowVerifyResult(true);
          setVerifyStatus("verified");
        } else if (foundByRNumber || foundByUniqueId) {
          // One or both found but they don't match - MISMATCH
          setVerifyError("⚠️ Verification Failed: R-Number and Captain ID do not match the same captain!");
          setVerifyStatus("mismatch");
        } else {
          // Neither found
          setVerifyError("No captain found with the provided R-Number and Captain ID combination");
        }
      } else {
        const res = await axios.get(API_ENDPOINTS.ADMIN_DEPT_PLAYERS_LIST, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const players = res.data.players || [];
        
        // Find by R-Number
        const foundByRNumber = players.find((p: DepartmentPlayer) => 
          p.rNumber?.toLowerCase() === verifyRNumber.trim().toLowerCase()
        );
        
        // Find by Unique ID
        const foundByUniqueId = players.find((p: DepartmentPlayer) => 
          p.uniqueId?.toLowerCase() === verifyUniqueId.trim().toLowerCase()
        );

        if (foundByRNumber && foundByUniqueId && foundByRNumber._id === foundByUniqueId._id) {
          // Both match the same player - VERIFIED
          setVerifyResult(foundByRNumber);
          setShowVerifyResult(true);
          setVerifyStatus("verified");
        } else if (foundByRNumber || foundByUniqueId) {
          // One or both found but they don't match - MISMATCH
          setVerifyError("⚠️ Verification Failed: R-Number and Player ID do not match the same player!");
          setVerifyStatus("mismatch");
        } else {
          // Neither found
          setVerifyError("No player found with the provided R-Number and Player ID combination");
        }
      }
    } catch (error) {
      setVerifyError("Failed to verify. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const clearVerifySearch = () => {
    setVerifyRNumber("");
    setVerifyUniqueId("");
    setVerifyResult(null);
    setVerifyError("");
    setShowVerifyResult(false);
    setVerifyStatus(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-300";
      case "inactive":
        return "bg-slate-100 text-slate-600 border-slate-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return "✅";
      case "pending":
        return "⏳";
      case "rejected":
        return "❌";
      case "inactive":
        return "🚫";
      default:
        return "❓";
    }
  };

  return (
    <div className="space-y-4">
      {/* Verification Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            Verification Center
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            Verify captain or player registration by R-Number or Unique ID
          </p>
        </div>

        <div className="p-6">
          {/* Verification Type Toggle */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex rounded-lg overflow-hidden border border-slate-200">
              <button
                onClick={() => {
                  setVerifyType("captain");
                  clearVerifySearch();
                }}
                className={`px-5 py-2.5 font-medium text-sm transition-all ${
                  verifyType === "captain"
                    ? "bg-slate-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Verify Captain
              </button>
              <button
                onClick={() => {
                  setVerifyType("player");
                  clearVerifySearch();
                }}
                className={`px-5 py-2.5 font-medium text-sm transition-all ${
                  verifyType === "player"
                    ? "bg-slate-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Verify Player
              </button>
            </div>
          </div>

          {/* Dual Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* R-Number Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                R-Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={verifyRNumber}
                onChange={(e) => setVerifyRNumber(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleVerifySearch()}
                placeholder={`Enter ${verifyType === "captain" ? "Captain's" : "Player's"} R-Number (e.g., R12345)`}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>

            {/* Unique ID Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {verifyType === "captain" ? "Captain ID" : "Player ID"} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={verifyUniqueId}
                onChange={(e) => setVerifyUniqueId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleVerifySearch()}
                placeholder={verifyType === "captain" ? "Enter Captain ID (e.g., CPT-1234)" : "Enter Player ID (e.g., PLY-1234)"}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleVerifySearch}
              disabled={verifyLoading || !verifyRNumber.trim() || !verifyUniqueId.trim()}
              className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {verifyLoading ? (
                <>Verifying...</>
              ) : (
                <>Verify Identity</>
              )}
            </button>
            {(verifyRNumber || verifyUniqueId || verifyResult || verifyError) && (
              <button
                onClick={clearVerifySearch}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Info Text */}
          <p className="text-slate-500 text-sm mt-3">
            Both R-Number and {verifyType === "captain" ? "Captain ID" : "Player ID"} must match the same record for successful verification
          </p>

          {/* Error Message */}
          {verifyError && (
            <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
              verifyStatus === "mismatch" 
                ? "bg-orange-50 border-2 border-orange-300" 
                : "bg-red-50 border border-red-200"
            }`}>
              <span className="text-2xl">{verifyStatus === "mismatch" ? "⚠️" : "❌"}</span>
              <div>
                <p className={`font-semibold ${verifyStatus === "mismatch" ? "text-orange-700" : "text-red-700"}`}>
                  {verifyError}
                </p>
                {verifyStatus === "mismatch" && (
                  <p className="text-orange-600 text-sm mt-1">
                    The R-Number and {verifyType === "captain" ? "Captain ID" : "Player ID"} belong to different records or one is invalid.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Verification Result */}
          {showVerifyResult && verifyResult && verifyStatus === "verified" && (
            <div className="mt-4">
              {verifyType === "captain" ? (
                <div className="border-2 border-amber-200 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 border-b border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {(verifyResult as Captain).name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{(verifyResult as Captain).name}</h3>
                          <p className="text-indigo-600 font-mono font-bold">{(verifyResult as Captain).uniqueId}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor((verifyResult as Captain).status)}`}>
                        {getStatusIcon((verifyResult as Captain).status)} {(verifyResult as Captain).status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">R-Number</p>
                      <p className="font-mono font-bold text-slate-900">{(verifyResult as Captain).rNumber}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">Department</p>
                      <p className="font-semibold text-slate-900">{(verifyResult as Captain).department}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">Blood Group</p>
                      <p className="font-bold text-red-600">{(verifyResult as Captain).bloodGroup}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">Email</p>
                      <p className="font-medium text-slate-900 truncate">{(verifyResult as Captain).email}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">Phone</p>
                      <p className="font-medium text-slate-900">{(verifyResult as Captain).phone}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">Registered On</p>
                      <p className="font-medium text-slate-900">{formatDate((verifyResult as Captain).createdAt)}</p>
                    </div>
                  </div>
                  <div className="bg-green-50 border-t border-green-200 px-5 py-3 text-center">
                    <span className="text-green-700 font-semibold">✅ Captain Verified Successfully</span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {(verifyResult as DepartmentPlayer).name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{(verifyResult as DepartmentPlayer).name}</h3>
                          <p className="text-indigo-600 font-mono font-bold">{(verifyResult as DepartmentPlayer).uniqueId}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                            {(verifyResult as DepartmentPlayer).sport}
                          </span>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor((verifyResult as DepartmentPlayer).status)}`}>
                        {getStatusIcon((verifyResult as DepartmentPlayer).status)} {(verifyResult as DepartmentPlayer).status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">R-Number</p>
                      <p className="font-mono font-bold text-slate-900">{(verifyResult as DepartmentPlayer).rNumber}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">Department</p>
                      <p className="font-semibold text-slate-900">{(verifyResult as DepartmentPlayer).department}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">Sport</p>
                      <p className="font-bold text-orange-600">{(verifyResult as DepartmentPlayer).sport}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">Email</p>
                      <p className="font-medium text-slate-900 truncate">{(verifyResult as DepartmentPlayer).email}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">Phone</p>
                      <p className="font-medium text-slate-900">{(verifyResult as DepartmentPlayer).phone}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-slate-400 text-xs mb-1">Added On</p>
                      <p className="font-medium text-slate-900">{formatDate((verifyResult as DepartmentPlayer).addedAt)}</p>
                    </div>
                  </div>
                  {/* Captain Info */}
                  <div className="px-5 pb-4">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <p className="text-amber-600 text-xs font-semibold mb-2">Added by Captain</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                          {(verifyResult as DepartmentPlayer).captain?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{(verifyResult as DepartmentPlayer).captain?.name}</p>
                          <p className="text-sm text-amber-600 font-mono">{(verifyResult as DepartmentPlayer).captain?.uniqueId}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 border-t border-green-200 px-5 py-3 text-center">
                    <span className="text-green-700 font-semibold">✅ Player Verified Successfully</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl p-4 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-200 text-sm font-medium">Pending Captains</p>
              <p className="text-3xl font-bold mt-1">{pendingCaptainsCount}</p>
            </div>
            <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl p-4 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-200 text-sm font-medium">Pending Players</p>
              <p className="text-3xl font-bold mt-1">{pendingPlayersCount}</p>
            </div>
            <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Total Pending</p>
              <p className="text-3xl font-bold mt-1">{pendingCaptainsCount + pendingPlayersCount}</p>
            </div>
            <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Departments</p>
              <p className="text-3xl font-bold mt-1">
                {new Set([...pendingCaptains.map((c) => c.department), ...pendingPlayers.map((p) => p.department)]).size}
              </p>
            </div>
            <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header with Tabs */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                Approval Center
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Review and approve captain & player registrations
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab("captains");
                  setSearchQuery("");
                  setSelectedDepartment("All");
                }}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === "captains"
                    ? "bg-slate-700 text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Captains
                {pendingCaptainsCount > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    activeTab === "captains" ? "bg-white/20" : "bg-red-500 text-white"
                  }`}>
                    {pendingCaptainsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab("players");
                  setSearchQuery("");
                  setSelectedDepartment("All");
                  setSelectedSport("All");
                }}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  activeTab === "players"
                    ? "bg-slate-700 text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Players
                {pendingPlayersCount > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    activeTab === "players" ? "bg-white/20" : "bg-red-500 text-white"
                  }`}>
                    {pendingPlayersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="border-b border-slate-200 px-4 sm:px-6 py-3 bg-slate-50 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder={activeTab === "captains" ? "Search captains..." : "Search players..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          {activeTab === "players" && (
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
            >
              <option value="All">All Sports</option>
              {SPORTS_LIST.map((sport) => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          )}
          <button
            onClick={fetchPendingItems}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            Refresh
          </button>
        </div>

        {/* Bulk Actions Bar */}
        {activeTab === "captains" && selectedCaptainIds.length > 0 && (
          <div className="border-b border-slate-200 px-4 sm:px-6 py-3 bg-slate-100 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-700">
              {selectedCaptainIds.length} captain(s) selected
            </span>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => handleBulkCaptainAction("approved")}
                disabled={processingIds.length > 0}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                Approve All
              </button>
              <button
                onClick={() => handleBulkCaptainAction("rejected")}
                disabled={processingIds.length > 0}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                Reject All
              </button>
              <button
                onClick={() => setSelectedCaptainIds([])}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {activeTab === "players" && selectedPlayerIds.length > 0 && (
          <div className="border-b border-slate-200 px-4 sm:px-6 py-3 bg-slate-100 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-700">
              {selectedPlayerIds.length} player(s) selected
            </span>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => handleBulkPlayerAction("approved")}
                disabled={processingIds.length > 0}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                Approve All
              </button>
              <button
                onClick={() => handleBulkPlayerAction("rejected")}
                disabled={processingIds.length > 0}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                Reject All
              </button>
              <button
                onClick={() => setSelectedPlayerIds([])}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-3 border-slate-300 border-t-slate-600 rounded-full mb-4"></div>
            <p className="text-slate-500">Loading pending approvals...</p>
          </div>
        )}

        {/* Captains List */}
        {activeTab === "captains" && !loading && (
          <div>
            {filteredCaptains.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-lg font-semibold text-slate-700">All caught up!</h3>
                <p className="text-slate-500 mt-1">No pending captain approvals</p>
              </div>
            ) : (
              <>
                {/* Select All Header */}
                <div className="px-4 sm:px-6 py-2 bg-slate-100 border-b flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedCaptainIds.length === filteredCaptains.length && filteredCaptains.length > 0}
                    onChange={selectAllCaptains}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-slate-600">
                    Select all ({filteredCaptains.length})
                  </span>
                </div>

                {/* Captain Cards */}
                <div className="divide-y">
                  {filteredCaptains.map((captain) => (
                    <div
                      key={captain._id}
                      className={`p-4 sm:p-5 hover:bg-slate-50 transition-colors ${
                        processingIds.includes(captain._id) ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedCaptainIds.includes(captain._id)}
                          onChange={() => toggleCaptainSelection(captain._id)}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />

                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                          {captain.name?.charAt(0).toUpperCase()}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 text-lg">{captain.name}</h3>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                              🎖️ Captain
                            </span>
                            <span className="text-xs text-slate-400">{getTimeAgo(captain.createdAt)}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 mt-3 text-sm">
                            <div>
                              <span className="text-slate-400 text-xs block">Captain ID</span>
                              <span className="font-mono font-bold text-indigo-600">{captain.uniqueId}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-xs block">R-Number</span>
                              <span className="font-mono text-slate-700">{captain.rNumber}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-xs block">Department</span>
                              <span className="text-slate-700 font-medium">{captain.department}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-xs block">Blood Group</span>
                              <span className="text-red-600 font-semibold">{captain.bloodGroup}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-xs block">Email</span>
                              <span className="text-slate-700 truncate block">{captain.email}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-xs block">Phone</span>
                              <span className="text-slate-700">{captain.phone}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-400 text-xs block">Registered</span>
                              <span className="text-slate-600">{formatDate(captain.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                          <button
                            onClick={() => setViewingCaptain(captain)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => handleCaptainAction(captain._id, "approved")}
                            disabled={processingIds.includes(captain._id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleCaptainAction(captain._id, "rejected")}
                            disabled={processingIds.includes(captain._id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Players List */}
        {activeTab === "players" && !loading && (
          <div>
            {filteredPlayers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-lg font-semibold text-slate-700">All caught up!</h3>
                <p className="text-slate-500 mt-1">No pending player approvals</p>
              </div>
            ) : (
              <>
                {/* Select All Header */}
                <div className="px-4 sm:px-6 py-2 bg-slate-100 border-b flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedPlayerIds.length === filteredPlayers.length && filteredPlayers.length > 0}
                    onChange={selectAllPlayers}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">
                    Select all ({filteredPlayers.length})
                  </span>
                </div>

                {/* Player Cards */}
                <div className="divide-y">
                  {filteredPlayers.map((player) => (
                    <div
                      key={player._id}
                      className={`p-4 sm:p-5 hover:bg-slate-50 transition-colors ${
                        processingIds.includes(player._id) ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedPlayerIds.includes(player._id)}
                          onChange={() => togglePlayerSelection(player._id)}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />

                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
                          {player.name?.charAt(0).toUpperCase()}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 text-lg">{player.name}</h3>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                              ⚽ Player
                            </span>
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                              {player.sport}
                            </span>
                            <span className="text-xs text-slate-400">{getTimeAgo(player.addedAt)}</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 mt-3 text-sm">
                            <div>
                              <span className="text-slate-400 text-xs block">Player ID</span>
                              <span className="font-mono font-bold text-indigo-600">{player.uniqueId}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-xs block">R-Number</span>
                              <span className="font-mono text-slate-700">{player.rNumber}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-xs block">Department</span>
                              <span className="text-slate-700 font-medium">{player.department}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-xs block">Sport</span>
                              <span className="text-orange-600 font-semibold">{player.sport}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-xs block">Email</span>
                              <span className="text-slate-700 truncate block">{player.email}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-xs block">Phone</span>
                              <span className="text-slate-700">{player.phone}</span>
                            </div>
                          </div>

                          {/* Captain Info */}
                          <div className="mt-3 p-2 bg-amber-50 rounded-lg inline-flex items-center gap-2">
                            <span className="text-amber-600 text-xs font-medium">Added by Captain:</span>
                            <span className="font-semibold text-amber-800 text-sm">{player.captain?.name}</span>
                            <span className="font-mono text-xs text-amber-600">({player.captain?.uniqueId})</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                          <button
                            onClick={() => setViewingPlayer(player)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => handlePlayerAction(player._id, "approved")}
                            disabled={processingIds.includes(player._id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handlePlayerAction(player._id, "rejected")}
                            disabled={processingIds.includes(player._id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Captain Detail Modal */}
      {viewingCaptain && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">Captain Verification</h2>
                  <p className="text-amber-100 text-sm mt-1">Review registration details</p>
                </div>
                <button
                  onClick={() => setViewingCaptain(null)}
                  className="text-white/80 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {viewingCaptain.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{viewingCaptain.name}</h3>
                  <p className="text-indigo-600 font-mono font-bold">{viewingCaptain.uniqueId}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-400 text-xs mb-1">R-Number</p>
                    <p className="font-mono font-semibold text-slate-900">{viewingCaptain.rNumber}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-400 text-xs mb-1">Blood Group</p>
                    <p className="font-semibold text-red-600">{viewingCaptain.bloodGroup}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Department</p>
                  <p className="font-semibold text-slate-900">{viewingCaptain.department}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Email Address</p>
                  <p className="font-medium text-slate-900">{viewingCaptain.email}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Phone Number</p>
                  <p className="font-medium text-slate-900">{viewingCaptain.phone}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Registration Date</p>
                  <p className="font-medium text-slate-900">{formatDate(viewingCaptain.createdAt)}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <span className="text-yellow-700 font-semibold">⏳ Awaiting Verification</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleCaptainAction(viewingCaptain._id, "rejected")}
                  disabled={processingIds.includes(viewingCaptain._id)}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  ✕ Reject Captain
                </button>
                <button
                  onClick={() => handleCaptainAction(viewingCaptain._id, "approved")}
                  disabled={processingIds.includes(viewingCaptain._id)}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  ✓ Approve Captain
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Detail Modal */}
      {viewingPlayer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">Player Verification</h2>
                  <p className="text-blue-100 text-sm mt-1">Review player details</p>
                </div>
                <button
                  onClick={() => setViewingPlayer(null)}
                  className="text-white/80 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {viewingPlayer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{viewingPlayer.name}</h3>
                  <p className="text-indigo-600 font-mono font-bold">{viewingPlayer.uniqueId}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                    {viewingPlayer.sport}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-400 text-xs mb-1">R-Number</p>
                    <p className="font-mono font-semibold text-slate-900">{viewingPlayer.rNumber}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-400 text-xs mb-1">Sport</p>
                    <p className="font-semibold text-orange-600">{viewingPlayer.sport}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Department</p>
                  <p className="font-semibold text-slate-900">{viewingPlayer.department}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Email Address</p>
                  <p className="font-medium text-slate-900">{viewingPlayer.email}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Phone Number</p>
                  <p className="font-medium text-slate-900">{viewingPlayer.phone}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Added On</p>
                  <p className="font-medium text-slate-900">{formatDate(viewingPlayer.addedAt)}</p>
                </div>

                {/* Captain Info */}
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <p className="text-amber-600 text-xs font-semibold mb-2">Added by Captain</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                      {viewingPlayer.captain?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{viewingPlayer.captain?.name}</p>
                      <p className="text-sm text-amber-600 font-mono">{viewingPlayer.captain?.uniqueId}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <span className="text-yellow-700 font-semibold">⏳ Awaiting Verification</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handlePlayerAction(viewingPlayer._id, "rejected")}
                  disabled={processingIds.includes(viewingPlayer._id)}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  ✕ Reject Player
                </button>
                <button
                  onClick={() => handlePlayerAction(viewingPlayer._id, "approved")}
                  disabled={processingIds.includes(viewingPlayer._id)}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  ✓ Approve Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
