import { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import { useNotification } from "../../context/NotificationContext";
import { API_ENDPOINTS } from "../../config/api";
import axios from "axios";
import { Trophy, Medal, Award, Plus, Edit2, Trash2, X, Save } from "lucide-react";

interface Score {
  _id: string;
  sport: string;
  category: string;
  winner: {
    department: string;
    playerName?: string;
  };
  runnerUp: {
    department: string;
    playerName?: string;
  };
  secondRunnerUp?: {
    department?: string;
    playerName?: string;
  };
  year: number;
}

const SPORTS = [
  "Football",
  "Volleyball",
  "Basketball",
  "Kabaddi",
  "Badminton - Singles",
  "Badminton - Doubles",
  "Chess",
  "Kho Kho",
  "Table Tennis - Singles",
  "Table Tennis - Doubles",
  "Tug of War",
  "Cricket",
  "Athletics - 100m",
  "Athletics - 200m",
];

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

const CATEGORIES = ["Boys", "Girls"];

interface ManageScoresProps {
  refreshKey?: number;
}

export default function ManageScores({ refreshKey }: ManageScoresProps) {
  const { token } = useAdmin();
  const { showNotification, showConfirm } = useNotification();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSport, setSelectedSport] = useState("All");

  const [formData, setFormData] = useState({
    sport: "",
    category: "Boys",
    winner: { department: "", playerName: "" },
    runnerUp: { department: "", playerName: "" },
    secondRunnerUp: { department: "", playerName: "" },
    year: 2026,
  });

  useEffect(() => {
    fetchScores();
  }, [token, refreshKey]);

  const fetchScores = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SCORES_LIST);
      setScores(response.data.scores || []);
    } catch (error) {
      console.error("Failed to fetch scores");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sport: "",
      category: "Boys",
      winner: { department: "", playerName: "" },
      runnerUp: { department: "", playerName: "" },
      secondRunnerUp: { department: "", playerName: "" },
      year: 2026,
    });
    setEditingScore(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingScore) {
        await axios.put(
          API_ENDPOINTS.SCORES_UPDATE(editingScore._id),
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification("Score updated successfully", "success");
      } else {
        await axios.post(API_ENDPOINTS.SCORES_CREATE, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showNotification("Score added successfully", "success");
      }
      fetchScores();
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || "Failed to save score",
        "error"
      );
    }
  };

  const handleEdit = (score: Score) => {
    setFormData({
      sport: score.sport,
      category: score.category,
      winner: {
        department: score.winner.department,
        playerName: score.winner.playerName || "",
      },
      runnerUp: {
        department: score.runnerUp.department,
        playerName: score.runnerUp.playerName || "",
      },
      secondRunnerUp: {
        department: score.secondRunnerUp?.department || "",
        playerName: score.secondRunnerUp?.playerName || "",
      },
      year: score.year,
    });
    setEditingScore(score);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm("Are you sure you want to delete this score?");
    if (confirmed) {
      try {
        await axios.delete(API_ENDPOINTS.SCORES_DELETE(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setScores(scores.filter((s) => s._id !== id));
        showNotification("Score deleted successfully", "success");
      } catch (error) {
        showNotification("Failed to delete score", "error");
      }
    }
  };

  const filteredScores = scores.filter((score) => {
    const categoryMatch = selectedCategory === "All" || score.category === selectedCategory;
    const sportMatch = selectedSport === "All" || score.sport === selectedSport;
    return categoryMatch && sportMatch;
  });

  const uniqueSports = ["All", ...new Set(scores.map((s) => s.sport))];

  const isIndividualSport = (sport: string) => {
    return [
      "Badminton - Singles",
      "Chess",
      "Table Tennis - Singles",
      "Athletics - 100m",
      "Athletics - 200m",
    ].includes(sport);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Manage Sports Scores
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 flex items-center gap-2 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Score
        </button>
      </div>

      {/* Filters */}
      <div className="border-b border-slate-200 px-4 sm:px-6 py-3 bg-slate-50 flex flex-wrap gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
        >
          {uniqueSports.map((sport) => (
            <option key={sport} value={sport}>{sport}</option>
          ))}
        </select>
      </div>

      {/* Scores List */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full mx-auto"></div>
            <p className="text-slate-500 mt-3">Loading scores...</p>
          </div>
        ) : filteredScores.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No scores found</p>
            <p className="text-slate-400 text-sm mt-1">Add scores for completed sports events</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredScores.map((score) => (
              <div
                key={score._id}
                className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-slate-800 text-lg">{score.sport}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        score.category === "Boys" 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-pink-100 text-pink-700"
                      }`}>
                        {score.category}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                      {/* Winner */}
                      <div className="flex items-center gap-2 bg-yellow-50 rounded-lg px-3 py-2 border border-yellow-200">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <div>
                          <div className="text-xs text-yellow-600 font-medium">Winner</div>
                          <div className="font-semibold text-slate-800 text-sm">{score.winner.department}</div>
                          {score.winner.playerName && (
                            <div className="text-xs text-slate-500">{score.winner.playerName}</div>
                          )}
                        </div>
                      </div>

                      {/* Runner Up */}
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                        <Medal className="w-4 h-4 text-gray-600" />
                        <div>
                          <div className="text-xs text-gray-600 font-medium">Runner Up</div>
                          <div className="font-semibold text-slate-800 text-sm">{score.runnerUp.department}</div>
                          {score.runnerUp.playerName && (
                            <div className="text-xs text-slate-500">{score.runnerUp.playerName}</div>
                          )}
                        </div>
                      </div>

                      {/* 2nd Runner Up */}
                      {score.secondRunnerUp?.department && (
                        <div className="flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-2 border border-orange-200">
                          <Award className="w-4 h-4 text-orange-600" />
                          <div>
                            <div className="text-xs text-orange-600 font-medium">2nd Runner Up</div>
                            <div className="font-semibold text-slate-800 text-sm">{score.secondRunnerUp.department}</div>
                            {score.secondRunnerUp.playerName && (
                              <div className="text-xs text-slate-500">{score.secondRunnerUp.playerName}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(score)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(score._id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingScore ? "Edit Score" : "Add New Score"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Sport */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sport *</label>
                <select
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400"
                  required
                >
                  <option value="">Select Sport</option>
                  {SPORTS.map((sport) => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Winner */}
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Winner (1st Place)</span>
                </div>
                <select
                  value={formData.winner.department}
                  onChange={(e) => setFormData({
                    ...formData,
                    winner: { ...formData.winner, department: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg mb-2"
                  required
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {isIndividualSport(formData.sport) && (
                  <input
                    type="text"
                    placeholder="Player Name (optional)"
                    value={formData.winner.playerName}
                    onChange={(e) => setFormData({
                      ...formData,
                      winner: { ...formData.winner, playerName: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-yellow-300 rounded-lg"
                  />
                )}
              </div>

              {/* Runner Up */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Medal className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-800">Runner Up (2nd Place)</span>
                </div>
                <select
                  value={formData.runnerUp.department}
                  onChange={(e) => setFormData({
                    ...formData,
                    runnerUp: { ...formData.runnerUp, department: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                  required
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {isIndividualSport(formData.sport) && (
                  <input
                    type="text"
                    placeholder="Player Name (optional)"
                    value={formData.runnerUp.playerName}
                    onChange={(e) => setFormData({
                      ...formData,
                      runnerUp: { ...formData.runnerUp, playerName: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                )}
              </div>

              {/* 2nd Runner Up */}
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-800">2nd Runner Up (3rd Place) - Optional</span>
                </div>
                <select
                  value={formData.secondRunnerUp.department}
                  onChange={(e) => setFormData({
                    ...formData,
                    secondRunnerUp: { ...formData.secondRunnerUp, department: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg mb-2"
                >
                  <option value="">Select Department (Optional)</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {isIndividualSport(formData.sport) && (
                  <input
                    type="text"
                    placeholder="Player Name (optional)"
                    value={formData.secondRunnerUp.playerName}
                    onChange={(e) => setFormData({
                      ...formData,
                      secondRunnerUp: { ...formData.secondRunnerUp, playerName: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg"
                  />
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 flex items-center justify-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                {editingScore ? "Update Score" : "Add Score"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
