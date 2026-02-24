import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Hiredly
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">

            {/* Applicant Links */}
            {user?.role === "applicant" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/jobs">
                    Jobs
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/my-applications">
                    My Applications
                  </Link>
                </li>
              </>
            )}

            {/* Recruiter Links */}
            {user?.role === "recruiter" && (
              <li className="nav-item">
                <Link className="nav-link" to="/recruiter">
                  Dashboard
                </Link>
              </li>
            )}

            {/* Logged In User Info */}
            {user && (
              <>
                <li className="nav-item">
                  <span className="nav-link text-muted">
                    {user.name}
                  </span>
                </li>

                <li className="nav-item">
                  <button
                    className="btn btn-sm btn-outline-danger ms-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;