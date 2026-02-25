import { useState, useContext, useEffect } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Sync local name state when user updates
  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const { data } = await API.put("/auth/update-profile", { name });

      updateUser(data.data);

      setEditMode(false);
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container-fluid py-4 px-4">
      <div className="row">

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

        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-4">
            <h5 className="fw-bold mb-4">Account Information</h5>

            <div className="mb-3">
              <label className="form-label text-muted">
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                value={name}
                disabled={!editMode}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-muted">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                value={user.email}
                disabled
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-muted">
                Role
              </label>
              <input
                type="text"
                className="form-control"
                value={user.role}
                disabled
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;