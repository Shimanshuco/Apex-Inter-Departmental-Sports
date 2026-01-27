import { NavLink } from "react-router-dom";

const navItems = [
  { icon: "📊", label: "Dashboard", path: "/admin" },
  { icon: "👥", label: "Manage Players", path: "/admin/players" },
  { icon: "📅", label: "Manage Schedule", path: "/admin/schedule" },
  { icon: "✏️", label: "Update Scores", path: "/admin/scores" },
  { icon: "📢", label: "Announcements", path: "/admin/announcements" },
  { icon: "🖼️", label: "Gallery Upload", path: "/admin/gallery" },
  { icon: "⚙️", label: "Settings", path: "/admin/settings" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen fixed left-0 top-0 pt-20">
      <nav className="space-y-1 px-4 py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-700 text-white"
                  : "text-blue-100 hover:bg-blue-800"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
