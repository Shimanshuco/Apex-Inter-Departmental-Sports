import { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import { useNotification } from "../../context/NotificationContext";
import { API_ENDPOINTS } from "../../config/api";
import axios from "axios";

interface Announcement {
  _id: string;
  title: string;
  description: string;
  date: string;
  priority: string;
}

interface AdminAnnouncementsProps {
  refreshKey?: number;
}

export default function AdminAnnouncements({ refreshKey }: AdminAnnouncementsProps) {
  const { token } = useAdmin();
  const { showNotification, showConfirm } = useNotification();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (token) {
      fetchAnnouncements();
    }
  }, [token, refreshKey]);

  const fetchAnnouncements = async () => {
    if (!token) return;
    try {
      const response = await axios.get(API_ENDPOINTS.ANNOUNCEMENTS_LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error("Failed to fetch announcements");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm("Are you sure you want to delete this announcement?");
    if (confirmed) {
      try {
        await axios.delete(API_ENDPOINTS.ANNOUNCEMENTS_DELETE(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnnouncements(announcements.filter((a) => a._id !== id));
        showNotification("Announcement deleted successfully", "success");
      } catch (error) {
        showNotification("Failed to delete announcement", "error");
      }
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "!!";
      case "high":
        return "!";
      case "normal":
      case "medium":
        return "-";
      case "low":
        return "";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "normal":
      case "medium":
        return "bg-blue-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 px-4 sm:px-6 py-4">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Announcements</h2>
      </div>

      <div className="divide-y divide-slate-100 max-h-80 sm:max-h-96 overflow-y-auto">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="px-4 sm:px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                        {announcement.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {announcement.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      <span
                        className={`inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-xs font-medium whitespace-nowrap ${getPriorityColor(
                          announcement.priority
                        )}`}
                      >
                        {announcement.priority?.charAt(0).toUpperCase() +
                          announcement.priority?.slice(1)}
                      </span>
                      <button
                        onClick={() => handleDelete(announcement._id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    {new Date(announcement.date).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 sm:px-6 py-8 text-center text-slate-500 text-sm">
            No announcements yet
          </div>
        )}
      </div>
    </div>
  );
}
