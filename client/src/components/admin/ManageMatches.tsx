import { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import { useNotification } from "../../context/NotificationContext";
import { API_ENDPOINTS } from "../../config/api";
import axios from "axios";

interface Match {
  _id: string;
  date: string;
  venue: string;
  sport: string;
  teamA: any;
  teamB: any;
  scoreA?: number;
  scoreB?: number;
  status: string;
}

interface ManageMatchesProps {
  onUpdateScore?: (match: Match) => void;
  refreshKey?: number;
}

export default function ManageMatches({ onUpdateScore, refreshKey }: ManageMatchesProps) {
  const { token } = useAdmin();
  const { showNotification, showConfirm } = useNotification();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMatches();
  }, [token, refreshKey]);

  const fetchMatches = async () => {
    if (!token) return;
    try {
      const response = await axios.get(API_ENDPOINTS.MATCHES_LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm("Are you sure you want to delete this match?");
    if (confirmed) {
      try {
        await axios.delete(API_ENDPOINTS.MATCHES_DELETE(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches(matches.filter((m) => m._id !== id));
        showNotification("Match deleted successfully", "success");
      } catch (error) {
        showNotification("Failed to delete match", "error");
      }
    }
  };

  const filteredMatches = matches.filter((match) => {
    const sportMatch = selectedSport === "All" || match.sport === selectedSport;
    const statusMatch = selectedStatus === "All" || match.status === selectedStatus;
    const searchMatch = searchQuery === "" || 
      match.teamA?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.teamB?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.venue?.toLowerCase().includes(searchQuery.toLowerCase());
    return sportMatch && statusMatch && searchMatch;
  });

  const sports = ["All", ...new Set(matches.map((m) => m.sport).filter(Boolean))];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 px-4 sm:px-6 py-4">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Manage Matches</h2>
      </div>

      {/* Filter Bar */}
      <div className="border-b border-slate-200 px-3 sm:px-6 py-4 bg-slate-50 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-4">
        <input
          type="text"
          placeholder="Search teams or venue..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent w-full sm:min-w-[200px] sm:w-auto bg-white"
        />
        <div className="flex gap-2">
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none bg-white"
          >
            {sports.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
            </option>
          ))}
        </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none bg-white"
          >
            <option value="All">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Mobile Cards / Desktop Table */}
      {/* Mobile View */}
      <div className="block sm:hidden">
        {filteredMatches.map((match) => (
          <div key={match._id} className="border-b p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-slate-500">{match.sport}</span>
              <span
                className={`px-2 py-0.5 rounded text-white text-xs font-semibold ${
                  match.status === "scheduled"
                    ? "bg-blue-600"
                    : match.status === "live"
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              >
                {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
              </span>
            </div>
            <div className="font-semibold text-slate-900 text-sm mb-1">
              {match.teamA} vs {match.teamB}
            </div>
            <div className="text-xs text-slate-500 mb-2">
              {new Date(match.date).toLocaleDateString()} • {match.venue}
            </div>
            {match.status === "completed" && (
              <div className="text-sm font-bold text-slate-800 mb-2">
                Score: {match.scoreA} - {match.scoreB}
              </div>
            )}
            <div className="flex gap-2">
              <button 
                onClick={() => onUpdateScore?.(match)}
                className="flex-1 text-slate-600 hover:text-slate-700 font-medium px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-xs transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(match._id)}
                className="text-red-600 hover:text-red-700 font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded text-xs transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Date</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Sport</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Match</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Score</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Status</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredMatches.map((match) => (
              <tr key={match._id} className="hover:bg-slate-50">
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900 font-medium">
                  {new Date(match.date).toLocaleDateString()}
                  <div className="text-xs text-slate-500">
                    {new Date(match.date).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-700">{match.sport}</td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-900 font-medium">
                  <div>
                    {match.teamA} vs {match.teamB}
                  </div>
                  <div className="text-xs text-slate-500">{match.venue}</div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-700 font-semibold">
                  {match.status === "completed" ? (
                    `${match.scoreA} - ${match.scoreB}`
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                      match.status === "scheduled"
                        ? "bg-blue-600"
                        : match.status === "live"
                        ? "bg-red-600"
                        : "bg-green-600"
                    }`}
                  >
                    {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm flex items-center gap-2">
                  <button 
                    onClick={() => onUpdateScore?.(match)}
                    className="text-slate-600 hover:text-slate-700 font-medium px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-xs transition-colors"
                    title="Update Score"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(match._id)}
                    className="text-red-600 hover:text-red-700 font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded text-xs transition-colors"
                    title="Delete Match"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMatches.length === 0 && !loading && (
        <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
          No matches found
        </div>
      )}
    </div>
  );
}
