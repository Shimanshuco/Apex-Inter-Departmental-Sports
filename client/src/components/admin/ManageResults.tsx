import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { Trophy, Medal, Award, Save, Trash2, Edit3, Plus, X } from "lucide-react";

interface ResultData {
  _id: string;
  champion: {
    department: string;
  };
  runnerUp: {
    department: string;
  };
  thirdPlace: {
    department: string;
  };
  year: number;
  isActive: boolean;
}

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

const ManageResults = () => {
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    champion: "",
    runnerUp: "",
    thirdPlace: "",
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(API_ENDPOINTS.RESULT_GET, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success && response.data.data) {
        setResult(response.data.data);
        setFormData({
          champion: response.data.data.champion.department,
          runnerUp: response.data.data.runnerUp.department,
          thirdPlace: response.data.data.thirdPlace.department,
          year: response.data.data.year,
        });
      }
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError("Failed to load results");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.champion || !formData.runnerUp || !formData.thirdPlace) {
      setError("Please select all three positions");
      return;
    }

    if (formData.champion === formData.runnerUp || 
        formData.champion === formData.thirdPlace || 
        formData.runnerUp === formData.thirdPlace) {
      setError("Each position must have a different department");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("adminToken");
      const payload = {
        champion: { department: formData.champion },
        runnerUp: { department: formData.runnerUp },
        thirdPlace: { department: formData.thirdPlace },
        year: formData.year,
      };

      const endpoint = result ? API_ENDPOINTS.RESULT_UPDATE : API_ENDPOINTS.RESULT_CREATE;
      const method = result ? "put" : "post";

      await axios[method](endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(result ? "Results updated successfully!" : "Results created successfully!");
      setIsEditing(false);
      setShowForm(false);
      fetchResult();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save results");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the results?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(API_ENDPOINTS.RESULT_DELETE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Results deleted successfully!");
      setResult(null);
      setFormData({
        champion: "",
        runnerUp: "",
        thirdPlace: "",
        year: new Date().getFullYear(),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete results");
    }
  };

  const startEditing = () => {
    if (result) {
      setFormData({
        champion: result.champion.department,
        runnerUp: result.runnerUp.department,
        thirdPlace: result.thirdPlace.department,
        year: result.year,
      });
    }
    setIsEditing(true);
    setShowForm(true);
  };

  const startCreating = () => {
    setFormData({
      champion: "",
      runnerUp: "",
      thirdPlace: "",
      year: new Date().getFullYear(),
    });
    setIsEditing(false);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-600">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Trophy className="w-7 h-7 text-yellow-500" />
          Manage Championship Results
        </h2>
        {!showForm && !result && (
          <button
            onClick={startCreating}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Results
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {/* Current Results Display */}
      {result && !showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Current Results - {result.year}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={startEditing}
                className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Champion */}
            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl p-5 border-2 border-yellow-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black text-yellow-700">1st</div>
                  <div className="text-xs text-yellow-600 uppercase font-semibold">Champion</div>
                </div>
              </div>
              <p className="text-lg font-bold text-amber-800">{result.champion.department}</p>
            </div>

            {/* Runner Up */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-5 border-2 border-gray-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
                  <Medal className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-700">2nd</div>
                  <div className="text-xs text-gray-600 uppercase font-semibold">Runner Up</div>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-800">{result.runnerUp.department}</p>
            </div>

            {/* Third Place */}
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-5 border-2 border-orange-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-black text-orange-700">3rd</div>
                  <div className="text-xs text-orange-600 uppercase font-semibold">Third Place</div>
                </div>
              </div>
              <p className="text-lg font-bold text-orange-800">{result.thirdPlace.department}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-700">
              {isEditing ? "Edit Results" : "Add New Results"}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                min="2020"
                max="2030"
              />
            </div>

            {/* Champion Selection */}
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <label className="flex items-center gap-2 text-sm font-medium text-yellow-800 mb-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                1st Place - Champion
              </label>
              <select
                value={formData.champion}
                onChange={(e) => setFormData({ ...formData, champion: e.target.value })}
                className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
              >
                <option value="">Select Champion Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Runner Up Selection */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Medal className="w-5 h-5 text-gray-500" />
                2nd Place - Runner Up
              </label>
              <select
                value={formData.runnerUp}
                onChange={(e) => setFormData({ ...formData, runnerUp: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white"
              >
                <option value="">Select Runner Up Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Third Place Selection */}
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <label className="flex items-center gap-2 text-sm font-medium text-orange-800 mb-2">
                <Award className="w-5 h-5 text-orange-500" />
                3rd Place - Third Place
              </label>
              <select
                value={formData.thirdPlace}
                onChange={(e) => setFormData({ ...formData, thirdPlace: e.target.value })}
                className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="">Select Third Place Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? "Saving..." : (isEditing ? "Update Results" : "Save Results")}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      {!result && !showForm && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Yet</h3>
          <p className="text-gray-500 mb-6">Add the championship results once the tournament is complete.</p>
          <button
            onClick={startCreating}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Championship Results
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageResults;
