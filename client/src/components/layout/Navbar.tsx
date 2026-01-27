import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import Button from "../ui/Button";
import { useAdmin } from "../../context/AdminContext";
import { useCaptain } from "../../context/CaptainContext";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `hover:text-slate-900 ${
    isActive ? "text-slate-900 font-extrabold" : "text-slate-700"
  }`;

export default function Navbar() {
  const { isAuthenticated: isAdminAuth, logout: adminLogout, admin } = useAdmin();
  const { isAuthenticated: isCaptainAuth, logout: captainLogout, captain } = useCaptain();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow relative z-50">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 sm:gap-3">
            {/* Logo Badge */}
            <div className="h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-xl bg-white p-1.5 sm:p-2 shadow ring-1 ring-slate-200">
              <img
                src={logo}
                alt="College Sports Logo"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Text */}
            <div className="leading-tight">
              <div className="text-xs sm:text-sm font-semibold text-slate-500">
                Apex University
              </div>
              <div className="text-sm sm:text-lg font-bold tracking-wide text-slate-800">
                SPORTS FIESTA 2026 
              </div>
            </div>
          </NavLink>

          {/* Desktop Links */}
          <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
            <NavLink className={navClass} to="/">
              Home
            </NavLink>

            <NavLink className={navClass} to="/scores">
              Scores
            </NavLink>

            <NavLink className={navClass} to="/schedule">
              Schedule
            </NavLink>

            <NavLink className={navClass} to="/gallery">
              Gallery
            </NavLink>

            <NavLink className={navClass} to="/rules">
              Rules
            </NavLink>

            {isAdminAuth && (
              <NavLink className={navClass} to="/admin">
                Admin
              </NavLink>
            )}

            {isCaptainAuth && (
              <NavLink className={navClass} to="/captain-dashboard">
                My Dashboard
              </NavLink>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdminAuth ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">
                  {admin?.username || "Admin"}
                </span>
                <button
                  onClick={adminLogout}
                  className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : isCaptainAuth ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm font-semibold text-emerald-600">
                  {captain?.name}
                </span>
                <button
                  onClick={captainLogout}
                  className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                <Button
                  to="/captain-register"
                  fullWidth={false}
                  variant="secondary"
                  className="text-xs sm:text-sm px-3 sm:px-4 bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Captain Register
                </Button>

                <Button
                  to="/captain-login"
                  fullWidth={false}
                  variant="secondary"
                  className="text-xs sm:text-sm px-3 sm:px-4 bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Captain Login
                </Button>

                <Button
                  to="/admin-login"
                  fullWidth={false}
                  className="text-xs sm:text-sm px-3 sm:px-4 bg-slate-600 hover:bg-slate-700 text-white"
                >
                  Admin Login
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg z-50">
          <nav className="flex flex-col p-4 gap-2">
            <NavLink 
              className={({ isActive }) => `px-4 py-3 rounded-lg font-medium ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </NavLink>

            <NavLink 
              className={({ isActive }) => `px-4 py-3 rounded-lg font-medium ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
              to="/scores"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Scores
            </NavLink>

            <NavLink 
              className={({ isActive }) => `px-4 py-3 rounded-lg font-medium ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
              to="/schedule"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Schedule
            </NavLink>

            <NavLink 
              className={({ isActive }) => `px-4 py-3 rounded-lg font-medium ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
              to="/gallery"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Gallery
            </NavLink>

            <NavLink 
              className={({ isActive }) => `px-4 py-3 rounded-lg font-medium ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
              to="/rules"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Rules
            </NavLink>

            {isAdminAuth && (
              <NavLink 
                className={({ isActive }) => `px-4 py-3 rounded-lg font-medium ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Panel
              </NavLink>
            )}

            {isCaptainAuth && (
              <NavLink 
                className={({ isActive }) => `px-4 py-3 rounded-lg font-medium ${isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-50"}`}
                to="/captain-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Dashboard
              </NavLink>
            )}

            <div className="border-t my-2"></div>

            {isAdminAuth ? (
              <button
                onClick={() => {
                  adminLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="px-4 py-3 bg-red-500 text-white rounded-lg font-semibold text-center"
              >
                Logout ({admin?.username})
              </button>
            ) : isCaptainAuth ? (
              <button
                onClick={() => {
                  captainLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="px-4 py-3 bg-red-500 text-white rounded-lg font-semibold text-center"
              >
                Logout ({captain?.name})
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <NavLink
                  to="/captain-register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 bg-emerald-500 text-white rounded-lg font-semibold text-center"
                >
                  Captain Register
                </NavLink>
                <NavLink
                  to="/captain-login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 bg-emerald-500 text-white rounded-lg font-semibold text-center"
                >
                  Captain Login
                </NavLink>
                <NavLink
                  to="/admin-login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 bg-slate-500 text-white rounded-lg font-semibold text-center"
                >
                  Admin Login
                </NavLink>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
