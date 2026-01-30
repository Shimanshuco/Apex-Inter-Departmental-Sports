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
  gender: string;
  year: string;
  status: string;
  createdAt: string;
}

interface ManageCaptainsProps {
  refreshKey?: number;
}

export default function ManageCaptains({ refreshKey }: ManageCaptainsProps) {
  const { token } = useAdmin();
  const { showNotification, showConfirm } = useNotification();
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit modal state
  const [editingCaptain, setEditingCaptain] = useState<Captain | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    bloodGroup: "",
    status: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Add captain modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    rNumber: "",
    phone: "",
    department: "",
    bloodGroup: "",
    gender: "",
    year: "",
    password: "",
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

  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const GENDERS = ["Male", "Female", "Other"];
  const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "PG 1st Year", "PG 2nd Year", "PhD"];

  useEffect(() => {
    fetchCaptains();
  }, [token, refreshKey]);

  const fetchCaptains = async () => {
    if (!token) return;
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN_CAPTAINS_LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCaptains(response.data.captains || []);
    } catch (error) {
      console.error("Failed to fetch captains");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await axios.put(
        API_ENDPOINTS.ADMIN_CAPTAINS_STATUS(id),
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCaptains(
        captains.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
      );
      showNotification(`Captain ${newStatus} successfully`, "success");
    } catch (error) {
      showNotification("Failed to update captain status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm(
      "Are you sure you want to delete this captain? This will also delete all players added by this captain."
    );
    if (confirmed) {
      try {
        await axios.delete(API_ENDPOINTS.ADMIN_CAPTAINS_DELETE(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCaptains(captains.filter((c) => c._id !== id));
        showNotification("Captain deleted successfully", "success");
      } catch (error) {
        showNotification("Failed to delete captain", "error");
      }
    }
  };

  const openEditModal = (captain: Captain) => {
    setEditingCaptain(captain);
    setEditFormData({
      name: captain.name || "",
      phone: captain.phone || "",
      bloodGroup: captain.bloodGroup || "",
      status: captain.status || "",
    });
    setEditError("");
  };

  const closeEditModal = () => {
    setEditingCaptain(null);
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
    if (!editingCaptain) return;

    setEditLoading(true);
    setEditError("");

    try {
      await axios.put(
        API_ENDPOINTS.ADMIN_CAPTAINS_UPDATE(editingCaptain._id),
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchCaptains();
      closeEditModal();
      showNotification("Captain updated successfully", "success");
    } catch (err: any) {
      setEditError(err.response?.data?.error || "Failed to update captain");
    } finally {
      setEditLoading(false);
    }
  };

  // Add Captain handlers
  const openAddModal = () => {
    setShowAddModal(true);
    setAddFormData({
      name: "",
      email: "",
      rNumber: "",
      phone: "",
      department: "",
      bloodGroup: "",
      gender: "",
      year: "",
      password: "",
    });
    setAddError("");
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
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");

    try {
      await axios.post(
        API_ENDPOINTS.ADMIN_CAPTAINS_CREATE,
        addFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchCaptains();
      closeAddModal();
      showNotification("Captain added successfully", "success");
    } catch (err: any) {
      setAddError(err.response?.data?.error || "Failed to add captain");
    } finally {
      setAddLoading(false);
    }
  };

  const filteredCaptains = captains.filter((captain) => {
    const statusMatch =
      selectedStatus === "All" ||
      captain.status?.toLowerCase() === selectedStatus.toLowerCase();
    const searchMatch =
      searchQuery === "" ||
      captain.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      captain.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      captain.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      captain.rNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
          Manage Captains
        </h2>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium text-sm shadow-sm transition-all flex items-center gap-2 justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Captain
        </button>
      </div>

      {/* Filter Bar */}
      <div className="border-b border-slate-200 px-3 sm:px-6 py-4 bg-slate-50 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-4">
        <input
          type="text"
          placeholder="Search by name, email, department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 w-full sm:min-w-[200px] sm:w-auto bg-white"
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none w-full sm:w-auto bg-white"
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
        {filteredCaptains.map((captain) => (
          <div key={captain._id} className="border-b p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-slate-900">{captain.name}</h3>
              <span
                className={`px-2 py-0.5 rounded text-white text-xs font-semibold ${getStatusColor(
                  captain.status
                )}`}
              >
                {captain.status.charAt(0).toUpperCase() + captain.status.slice(1)}
              </span>
            </div>
            <div className="text-xs text-slate-600 space-y-1.5 mb-3 bg-slate-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">Captain ID:</span>
                <span className="font-mono font-semibold text-slate-700">
                  {captain.uniqueId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">R-Number:</span>
                <span className="font-mono">{captain.rNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Email:</span>
                <span>{captain.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Phone:</span>
                <span>{captain.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Dept:</span>
                <span>{captain.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Blood:</span>
                <span>{captain.bloodGroup}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {captain.status === "pending" && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(captain._id, "approved")}
                    className="flex-1 text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded text-xs transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(captain._id, "rejected")}
                    className="flex-1 text-orange-600 hover:text-orange-700 font-medium px-2 py-1.5 bg-orange-50 hover:bg-orange-100 rounded text-xs transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              {(captain.status === "approved" || captain.status === "active") && (
                <button
                  onClick={() => handleUpdateStatus(captain._id, "inactive")}
                  className="flex-1 text-slate-600 hover:text-slate-700 font-medium px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-xs transition-colors"
                >
                  Deactivate
                </button>
              )}
              {captain.status === "inactive" && (
                <button
                  onClick={() => handleUpdateStatus(captain._id, "active")}
                  className="flex-1 text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded text-xs transition-colors"
                >
                  Activate
                </button>
              )}
              <button
                onClick={() => openEditModal(captain)}
                className="flex-1 text-slate-600 hover:text-slate-700 font-medium px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-xs transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(captain._id)}
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
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700">Name / Email</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700">R-Number</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700">Captain ID</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700">Phone</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700">Department</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700">Blood</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCaptains.map((captain) => (
              <tr key={captain._id} className="hover:bg-slate-50">
                <td className="px-3 py-3 text-xs text-slate-900">
                  <div className="font-semibold">{captain.name}</div>
                  <div className="text-xs text-slate-400">{captain.email}</div>
                </td>
                <td className="px-3 py-3 text-xs text-slate-700 font-mono">
                  {captain.rNumber}
                </td>
                <td className="px-3 py-3 text-xs text-slate-700 font-mono font-semibold">
                  {captain.uniqueId}
                </td>
                <td className="px-3 py-3 text-xs text-slate-700">{captain.phone}</td>
                <td className="px-3 py-3 text-xs text-slate-700">{captain.department}</td>
                <td className="px-3 py-3 text-xs text-slate-700">{captain.bloodGroup}</td>
                <td className="px-3 py-3 text-xs">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs font-semibold ${getStatusColor(
                      captain.status
                    )}`}
                  >
                    {captain.status.charAt(0).toUpperCase() + captain.status.slice(1)}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs">
                  <div className="flex items-center gap-1">
                    {captain.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(captain._id, "approved")}
                          className="text-emerald-600 hover:text-emerald-700 font-medium text-xs px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                          title="Approve"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(captain._id, "rejected")}
                          className="text-orange-600 hover:text-orange-700 font-medium text-xs px-2 py-1 bg-orange-50 hover:bg-orange-100 rounded transition-colors"
                          title="Reject"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {(captain.status === "approved" || captain.status === "active") && (
                      <button
                        onClick={() => handleUpdateStatus(captain._id, "inactive")}
                        className="text-slate-600 hover:text-slate-700 font-medium text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        title="Deactivate"
                      >
                        Deactivate
                      </button>
                    )}
                    {captain.status === "inactive" && (
                      <button
                        onClick={() => handleUpdateStatus(captain._id, "active")}
                        className="text-emerald-600 hover:text-emerald-700 font-medium text-xs px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                        title="Activate"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(captain)}
                      className="text-slate-600 hover:text-slate-700 font-medium text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(captain._id)}
                      className="text-red-600 hover:text-red-700 font-medium text-xs px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition-colors"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCaptains.length === 0 && !loading && (
        <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm">
          No captains found
        </div>
      )}

      {/* Edit Captain Modal */}
      {editingCaptain && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Captain</h2>
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
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={editFormData.bloodGroup}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Blood Group</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
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
                  <p className="font-medium text-slate-700 mb-1">Captain Info:</p>
                  <p>Email: {editingCaptain.email}</p>
                  <p>R-Number: {editingCaptain.rNumber}</p>
                  <p>Department: {editingCaptain.department}</p>
                  <p>Captain ID: {editingCaptain.uniqueId}</p>
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

      {/* Add Captain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">➕ Add New Captain</h2>
                <button
                  onClick={closeAddModal}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-amber-100 text-sm mt-1">Admin-created captains are auto-approved</p>
            </div>

            <div className="p-6">
              {addError && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                  {addError}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={addFormData.name}
                      onChange={handleAddChange}
                      required
                      placeholder="Enter full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    placeholder="captain@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group *
                    </label>
                    <select
                      name="bloodGroup"
                      value={addFormData.bloodGroup}
                      onChange={handleAddChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select Blood Group</option>
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select Gender</option>
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>{g}</option>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select Year</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={addFormData.department}
                    onChange={handleAddChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={addFormData.password}
                    onChange={handleAddChange}
                    required
                    placeholder="Set login password for captain"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Captain will use this password to login</p>
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
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 font-semibold"
                  >
                    {addLoading ? "Adding..." : "Add Captain"}
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
