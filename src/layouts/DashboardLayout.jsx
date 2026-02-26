import { Link, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  return (
      <div
          className="app-shell"
          style={{ height: "100vh", overflow: "hidden" }}
      >

      {/* ---------------- SIDEBAR ---------------- */}
          <aside
              className="sidebar"
              style={{ height: "100vh" }}
          >

        {/* Logo Section */}
        
        <div className="logo">
          <h4 className="fw-bold">Hiredly</h4>
          <p className="text-muted small">Job Portal Platform</p>
        </div>

        {/* Navigation */}
        <nav className="nav-links">
          {user?.role === "applicant" && (
            <>
              <SidebarLink
                to="/jobs"
                label="Jobs"
                active={location.pathname === "/jobs"}
              />
              <SidebarLink
                to="/my-applications"
                label="My Applications"
                active={location.pathname === "/my-applications"}
              />
              <SidebarLink
                to="/profile"
                label="Profile"
                active={location.pathname === "/profile"}
              />
            </>
          )}

          {user?.role === "recruiter" && (
            <>
              <SidebarLink
                to="/recruiter"
                label="Dashboard"
                active={location.pathname === "/recruiter"}
              />
              <SidebarLink
                to="/profile"
                label="Profile"
                active={location.pathname === "/profile"}
              />
            </>
          )}
        </nav>

        {/* Footer Section */}
        <div className="sidebar-footer">

          <div className="user-info">
            <div className="avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="fw-medium small">{user?.name}</div>
              <div className="text-muted small">{user?.role}</div>
            </div>
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>

      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
          <main
              className="main-content"
              style={{ overflowY: "auto", flex: 1 }}
          >
        <Outlet />
      </main>

    </div>
  );
};



// Reusable Sidebar Link Component
const SidebarLink = ({ to, label, active }) => {
  return (
    <Link
      to={to}
      className={`sidebar-link ${active ? "active" : ""}`}
    >
      {label}
    </Link>
  );
};

export default DashboardLayout;