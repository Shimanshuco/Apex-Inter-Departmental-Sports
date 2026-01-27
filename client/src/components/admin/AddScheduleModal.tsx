import { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import { useNotification } from "../../context/NotificationContext";
import { API_ENDPOINTS } from "../../config/api";
import axios from "axios";

interface Schedule {
  _id: string;
  sno: number;
  date: string;
  time: string;
  activity: string;
  sport: string;
  gender: string;
  matchDetail: string;
}

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleAdded: () => void;
  editSchedule?: Schedule | null;
}

const SPORTS = [
  "General",
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

const GENDERS = ["Male", "Female", "Male and Female Both"];

export default function AddScheduleModal({ 
  isOpen, 
  onClose, 
  onScheduleAdded,
  editSchedule 
}: AddScheduleModalProps) {
  const { token } = useAdmin();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sno: "",
    date: "",
    time: "",
    activity: "",
    sport: "General",
    gender: "",
    matchDetail: "",
  });

  useEffect(() => {
    if (editSchedule) {
      setFormData({
        sno: editSchedule.sno.toString(),
        date: editSchedule.date.split("T")[0],
        time: editSchedule.time,
        activity: editSchedule.activity,
        sport: editSchedule.sport,
        gender: editSchedule.gender || "",
        matchDetail: editSchedule.matchDetail || "",
      });
    } else {
      setFormData({
        sno: "",
        date: "",
        time: "",
        activity: "",
        sport: "General",
        gender: "",
        matchDetail: "",
      });
    }
  }, [editSchedule, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const payload = {
        sno: parseInt(formData.sno),
        date: formData.date,
        time: formData.time,
        activity: formData.activity,
        sport: formData.sport,
        gender: formData.gender,
        matchDetail: formData.matchDetail,
      };

      if (editSchedule) {
        await axios.put(API_ENDPOINTS.SCHEDULES_UPDATE(editSchedule._id), payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showNotification("Schedule updated successfully", "success");
      } else {
        await axios.post(API_ENDPOINTS.SCHEDULES_CREATE, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showNotification("Schedule added successfully", "success");
      }

      onScheduleAdded();
      onClose();
      setFormData({
        sno: "",
        date: "",
        time: "",
        activity: "",
        sport: "General",
        gender: "",
        matchDetail: "",
      });
    } catch (error: any) {
      showNotification(error.response?.data?.error || "Failed to save schedule", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">
            {editSchedule ? "Edit Schedule" : "Add New Schedule"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              S.No *
            </label>
            <input
              type="number"
              value={formData.sno}
              onChange={(e) => setFormData({ ...formData, sno: e.target.value })}
              required
              min="1"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter serial number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Time *
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Activity *
            </label>
            <input
              type="text"
              value={formData.activity}
              onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter activity description"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Sport *
            </label>
            <select
              value={formData.sport}
              onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SPORTS.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>

          {/* Show Gender and Match Detail only for actual sports, not General */}
          {formData.sport !== "General" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  {GENDERS.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Match Detail
                </label>
                <input
                  type="text"
                  value={formData.matchDetail}
                  onChange={(e) => setFormData({ ...formData, matchDetail: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Quarter Final, Semi Final, Final"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : editSchedule ? "Update" : "Add Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
