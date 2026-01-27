import { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import { API_ENDPOINTS } from "../../config/api";
import axios from "axios";

interface AdminProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  profileImage: string;
}

export default function AdminProfile() {
  const { admin, token, updateAdmin } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string>(admin?.profileImage || "");

  const [formData, setFormData] = useState<AdminProfileData>({
    firstName: admin?.firstName || "",
    lastName: admin?.lastName || "",
    phone: admin?.phone || "",
    bio: admin?.bio || "",
    profileImage: admin?.profileImage || "",
  });

  useEffect(() => {
    if (admin) {
      setFormData({
        firstName: admin.firstName || "",
        lastName: admin.lastName || "",
        phone: admin.phone || "",
        bio: admin.bio || "",
        profileImage: admin.profileImage || "",
      });
      setImagePreview(admin.profileImage || "");
    }
  }, [admin]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          profileImage: base64String,
        }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.put(
        API_ENDPOINTS.ADMIN_PROFILE_UPDATE,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("Profile updated successfully!");
      setIsEditing(false);
      if (admin) {
        updateAdmin({
          ...admin,
          ...formData,
        });
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(
        error.response?.data?.error || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800">My Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all font-medium text-sm shadow-sm"
          >
            Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.includes("success")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4 flex items-center justify-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-center text-sm">No Image</div>
              )}
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <span className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition inline-block">
                Change Photo
              </span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={admin?.email}
              disabled
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all disabled:bg-slate-300 font-medium"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 mb-4 flex items-center justify-center border-4 border-slate-200">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-400 text-center text-sm">No Image</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">
              Name
            </label>
            <p className="text-lg text-slate-800">
              {formData.firstName} {formData.lastName}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">
              Username
            </label>
            <p className="text-lg text-slate-800">{admin?.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">
              Email
            </label>
            <p className="text-lg text-slate-800">{admin?.email}</p>
          </div>

          {formData.phone && (
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Phone
              </label>
              <p className="text-lg text-slate-800">{formData.phone}</p>
            </div>
          )}

          {formData.bio && (
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Bio
              </label>
              <p className="text-lg text-slate-800">{formData.bio}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
