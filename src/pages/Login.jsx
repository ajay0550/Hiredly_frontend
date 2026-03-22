import { useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/api/auth/login", form);

      login(data);

      if (data.user.role === "recruiter") {
        navigate("/recruiter");
      } else {
        navigate("/jobs");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
  <div
    className="container d-flex justify-content-center align-items-center"
    style={{ minHeight: "80vh" }}
  >
    <div className="card shadow p-4" style={{ width: "400px" }}>
      <h3 className="text-center mb-4">Login to Hiredly</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />
        </div>

        <button type="submit" className="btn btn-dark w-100 mb-3">
          Login
        </button>
      </form>

      {/* 🔥 SIGNUP SECTION */}
      <div className="text-center">
        <p className="mb-1 text-muted small">
          Don't have an account?
        </p>

        <button
          className="btn btn-outline-dark w-100"
          onClick={() => navigate("/signup")}
        >
          Create Account
        </button>
      </div>
    </div>
  </div>
);
};

export default Login;