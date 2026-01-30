import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

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

export default function CaptainRegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rNumber: "",
    phone: "",
    department: "",
    bloodGroup: "",
    gender: "",
    year: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ uniqueId: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!formData.phone || formData.phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.CAPTAIN_REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          rNumber: formData.rNumber,
          phone: formData.phone,
          department: formData.department,
          bloodGroup: formData.bloodGroup,
          gender: formData.gender,
          year: formData.year,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess({ uniqueId: data.captain.uniqueId });
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Registration Successful!
          </h2>
          <p className="text-slate-600 mb-6">
            Your captain account has been created. Please save your Unique ID:
          </p>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-500 mb-1">Your Captain ID</p>
            <p className="text-2xl font-mono font-bold text-indigo-600">
              {success.uniqueId}
            </p>
          </div>
          <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3 mb-6">
            ⚠️ Please wait for admin approval before logging in.
          </p>
          <Link
            to="/captain-login"
            className="inline-block w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👨‍✈️</div>
          <h1 className="text-2xl font-bold text-slate-800">Captain Registration</h1>
          <p className="text-slate-500 mt-2">Register as a Department Captain</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Captain Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                required
              />
            </div>

            {/* R-Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Captain's R-Number *
              </label>
              <input
                type="text"
                name="rNumber"
                value={formData.rNumber}
                onChange={handleChange}
                placeholder="e.g., R2021001"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Captain Email ID *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@college.edu"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Captain Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                required
              >
                <option value="">Select your department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Captain Contact Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                required
              />
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Captain Blood Group *
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                required
              >
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                required
              >
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Year *
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                required
              >
                <option value="">Select year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min 6 characters)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Registering...
                </span>
              ) : (
                "Register as Captain"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/captain-login"
                className="text-indigo-600 font-semibold hover:text-indigo-700"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
