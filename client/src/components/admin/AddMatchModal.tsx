import { useState, useEffect, useMemo } from "react";
import { useAdmin } from "../../context/AdminContext";
import { useNotification } from "../../context/NotificationContext";
import { API_ENDPOINTS } from "../../config/api";
import axios from "axios";

interface AddMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchAdded: () => void;
}

interface Team {
  _id: string;
  name: string;
  sport: string;
  department: string;
  captain?: {
    name: string;
  };
  status: string;
}

const SPORTS_OPTIONS = [
  "Football",
  "Volleyball",
  "Basketball",
  "Kabaddi",
  "Badminton",
  "Chess",
  "Kho Kho",
  "Table Tennis",
  "Tug of War",
  "Sack Race",
];

export default function AddMatchModal({
  isOpen,
  onClose,
  onMatchAdded,
}: AddMatchModalProps) {
  const { token } = useAdmin();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  const [formData, setFormData] = useState({
    teamA: "",
    teamB: "",
    sport: "",
    date: "",
    venue: "",
  });

  // Fetch all teams when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTeams();
    }
  }, [isOpen]);

  const fetchTeams = async () => {
    setTeamsLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN_TEAMS_LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Only include active teams
      const activeTeams = (response.data.teams || []).filter(
        (team: Team) => team.status === "active"
      );
      setTeams(activeTeams);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setTeams([]);
    } finally {
      setTeamsLoading(false);
    }
  };

  // Filter teams based on selected sport
  const filteredTeams = useMemo(() => {
    if (!formData.sport) return [];
    return teams.filter((team) => team.sport === formData.sport);
  }, [teams, formData.sport]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // If sport changes, reset team selections
      if (name === "sport") {
        return {
          ...prev,
          sport: value,
          teamA: "",
          teamB: "",
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(API_ENDPOINTS.MATCHES_CREATE, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setFormData({
        teamA: "",
        teamB: "",
        sport: "",
        date: "",
        venue: "",
      });

      showNotification("Match created successfully", "success");
      onMatchAdded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create match");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 w-96 h-screen bg-white shadow-2xl z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add New Match</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sport (Select First)
            </label>
            <select
              name="sport"
              value={formData.sport}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Sport</option>
              {SPORTS_OPTIONS.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team A
            </label>
            <select
              name="teamA"
              value={formData.teamA}
              onChange={handleChange}
              required
              disabled={!formData.sport || teamsLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {!formData.sport 
                  ? "Select sport first" 
                  : teamsLoading 
                  ? "Loading teams..." 
                  : filteredTeams.length === 0 
                  ? "No teams available for this sport" 
                  : "Select Team A"}
              </option>
              {filteredTeams
                .filter((team) => team._id !== formData.teamB)
                .map((team) => (
                  <option key={team._id} value={team.name}>
                    {team.name} ({team.department})
                  </option>
                ))}
            </select>
            {formData.sport && !teamsLoading && filteredTeams.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                No teams have been created for {formData.sport} yet.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team B
            </label>
            <select
              name="teamB"
              value={formData.teamB}
              onChange={handleChange}
              required
              disabled={!formData.sport || teamsLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {!formData.sport 
                  ? "Select sport first" 
                  : teamsLoading 
                  ? "Loading teams..." 
                  : filteredTeams.length < 2 
                  ? "Need at least 2 teams" 
                  : "Select Team B"}
              </option>
              {filteredTeams
                .filter((team) => team._id !== formData.teamA)
                .map((team) => (
                  <option key={team._id} value={team.name}>
                    {team.name} ({team.department})
                  </option>
                ))}
            </select>
            {formData.sport && !teamsLoading && filteredTeams.length < 2 && filteredTeams.length > 0 && (
              <p className="mt-1 text-xs text-amber-600">
                Need at least 2 teams to create a match.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="Stadium/Field name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? "Creating..." : "Add Match"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
