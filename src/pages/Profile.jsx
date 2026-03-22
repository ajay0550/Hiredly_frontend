import { useState, useContext, useEffect } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  // 🔥 Resume States
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeMessage, setResumeMessage] = useState("");

  // Sync name
  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/api/users/profile-stats");
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const { data } = await API.put("/api/auth/update-profile", { name });
      updateUser(data.data);
      setEditMode(false);
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setPasswordLoading(true);
      setPasswordMessage("");

      const { data } = await API.put("/api/users/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswordMessage(data.message);
      setCurrentPassword("");
      setNewPassword("");

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage("");
      }, 1500);

    } catch (error) {
      setPasswordMessage(
        error.response?.data?.message || "Error changing password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // 🔥 Resume Upload
  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setResumeMessage("Please select a PDF file");
      return;
    }

    try {
      setResumeLoading(true);
      setResumeMessage("");

      const formData = new FormData();
      formData.append("resume", resumeFile);

      const { data } = await API.post(
        "/users/upload-resume",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setResumeMessage(data.message);

      // Update user context with resume URL
      updateUser({ ...user, resume: data.resume });

    } catch (error) {
      setResumeMessage(
        error.response?.data?.message || "Upload failed"
      );
    } finally {
      setResumeLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container-fluid py-4 px-4">
      <div className="row">

        {/* LEFT PROFILE CARD */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm border-0 text-center p-4">
            <div
              className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: "80px", height: "80px", fontSize: "28px" }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>

            <h5 className="fw-bold">{user.name}</h5>
            <p className="text-muted mb-1">{user.email}</p>
            <span className="badge bg-secondary mt-2">
              {user.role}
            </span>

            {editMode ? (
              <button
                className="btn btn-success mt-4 w-100"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            ) : (
              <button
                className="btn btn-dark mt-4 w-100"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="col-lg-8">

          {/* ACCOUNT INFO */}
          <div className="card shadow-sm border-0 p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Account Information</h5>
              <button
                className="btn btn-outline-dark btn-sm"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </button>
            </div>

            <div className="mb-3">
              <label className="form-label text-muted">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                disabled={!editMode}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-muted">Email</label>
              <input
                type="email"
                className="form-control"
                value={user.email}
                disabled
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-muted">Role</label>
              <input
                type="text"
                className="form-control"
                value={user.role}
                disabled
              />
            </div>
          </div>

          {/* 🔥 RESUME SECTION (Applicants Only) */}
          {user.role === "applicant" && (
            <div className="card shadow-sm border-0 p-4 mb-4">
              <h5 className="fw-bold mb-3">Resume</h5>

              {user.resume ? (
                <div className="mb-3">
                  <a
                    href={user.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-dark"
                  >
                    View Resume
                  </a>
                </div>
              ) : (
                <p className="text-muted">No resume uploaded yet</p>
              )}

              <div className="mb-3">
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
              </div>

              <button
                className="btn btn-dark"
                onClick={handleResumeUpload}
                disabled={resumeLoading}
              >
                {resumeLoading ? "Uploading..." : "Upload Resume"}
              </button>

              {resumeMessage && (
                <p className="mt-2 text-muted">{resumeMessage}</p>
              )}
            </div>
          )}

          {/* PROFILE STATS */}
          <div className="card shadow-sm border-0 p-4">
            <h5 className="fw-bold mb-4">Profile Statistics</h5>

            {statsLoading ? (
              <div className="placeholder-glow">
                <span className="placeholder col-6 mb-2"></span>
                <span className="placeholder col-4"></span>
              </div>
            ) : stats ? (
              <div className="row">
                {Object.entries(stats).map(([key, value]) => (
                  <div className="col-md-6 col-lg-3 mb-3" key={key}>
                    <div className="card border-0 bg-light text-center p-3">
                      <h6 className="text-muted text-uppercase small">
                        {key.replace(/([A-Z])/g, " $1")}
                      </h6>
                      <h4 className="fw-bold mb-0">{value}</h4>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No stats available</p>
            )}
          </div>

        </div>
      </div>

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title">Change Password</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowPasswordModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  {passwordMessage && (
                    <p className="text-muted">{passwordMessage}</p>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-dark"
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>

              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default Profile;