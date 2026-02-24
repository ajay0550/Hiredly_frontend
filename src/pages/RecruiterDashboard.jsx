import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const RecruiterDashboard = () => {
  const { user } = useContext(AuthContext);

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  const [darkMode, setDarkMode] = useState(false);

  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    salary: "",
  });

  // ---------------- FETCH JOBS ----------------
  const fetchJobs = async () => {
    try {
      const { data } = await API.get("/jobs");

      const myJobs = data.data.filter(
        (job) => job.createdBy._id === user._id
      );

      setJobs(myJobs);
    } catch (error) {
      showToast("Failed to fetch jobs", "danger");
    }
  };

  useEffect(() => {
    if (user) fetchJobs();
  }, [user]);

  // ---------------- TOAST SYSTEM ----------------
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---------------- FORM HANDLING ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();

    try {
      await API.post("/jobs", {
        ...form,
        salary: Number(form.salary),
      });

      showToast("Job created successfully!");

      setForm({
        title: "",
        description: "",
        company: "",
        location: "",
        salary: "",
      });

      fetchJobs();
    } catch (error) {
      showToast("Failed to create job", "danger");
    }
  };

  // ---------------- FETCH APPLICANTS ----------------
  const fetchApplicants = async (jobId) => {
    try {
      const { data } = await API.get(`/applications/job/${jobId}`);
      setApplications(data.data);
      setSelectedJob(jobId);
    } catch (error) {
      showToast("Failed to fetch applicants", "danger");
    }
  };

  // ---------------- UPDATE STATUS ----------------
  const updateStatus = async (applicationId, status) => {
    try {
      await API.patch(`/applications/${applicationId}/status`, {
        status,
      });

      showToast("Status updated!");
      fetchApplicants(selectedJob);
    } catch (error) {
      showToast("Failed to update status", "danger");
    }
  };

  // ---------------- FILTER + PAGINATION ----------------
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * jobsPerPage;
  const indexOfFirst = indexOfLast - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // ---------------- STATS ----------------
  const totalJobs = jobs.length;
  const totalApplicants = applications.length;
  const shortlistedCount = applications.filter(
    (app) => app.status === "shortlisted"
  ).length;
  const rejectedCount = applications.filter(
    (app) => app.status === "rejected"
  ).length;

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100 p-4" : ""}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Recruiter Dashboard</h2>
        <button
          className="btn btn-outline-secondary"
          onClick={() => setDarkMode(!darkMode)}
        >
          Toggle Dark Mode
        </button>
      </div>

      {/* ---------------- TOAST ---------------- */}
      {toast && (
        <div
          className={`alert alert-${toast.type} position-fixed top-0 end-0 m-3`}
          style={{ zIndex: 9999 }}
        >
          {toast.message}
        </div>
      )}

      {/* ---------------- STATS CARDS ---------------- */}
      <div className="row mb-4">
        <StatCard title="Total Jobs" value={totalJobs} />
        <StatCard title="Total Applicants" value={totalApplicants} />
        <StatCard title="Shortlisted" value={shortlistedCount} color="success" />
        <StatCard title="Rejected" value={rejectedCount} color="danger" />
      </div>

      {/* ---------------- SEARCH ---------------- */}
      <input
        className="form-control mb-4"
        placeholder="Search jobs by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ---------------- JOB LIST ---------------- */}
      <div className="row">
        {currentJobs.map((job) => (
          <div key={job._id} className="col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h5>{job.title}</h5>
                <p>
                  {job.company} <br />
                  {job.location}
                </p>
                <button
                  className="btn btn-dark mt-auto"
                  onClick={() => fetchApplicants(job._id)}
                >
                  View Applicants
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- PAGINATION ---------------- */}
      <div className="d-flex justify-content-center">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={`btn btn-sm mx-1 ${
              currentPage === index + 1 ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* ---------------- APPLICANTS ---------------- */}
      {selectedJob && (
        <>
          <h4 className="mt-5 mb-3">Applicants</h4>
          <div className="row">
            {applications.map((app) => (
              <div key={app._id} className="col-md-6 col-lg-4 mb-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6>{app.applicant.name}</h6>
                    <p>{app.applicant.email}</p>
                    <span
                      className={`badge ${
                        app.status === "shortlisted"
                          ? "bg-success"
                          : app.status === "rejected"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {app.status}
                    </span>
                    <div className="mt-3">
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() =>
                          updateStatus(app._id, "shortlisted")
                        }
                      >
                        Shortlist
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          updateStatus(app._id, "rejected")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Small reusable stat card
const StatCard = ({ title, value, color }) => (
  <div className="col-md-3">
    <div className="card shadow-sm text-center p-3">
      <h6>{title}</h6>
      <h4 className={color ? `text-${color}` : ""}>{value}</h4>
    </div>
  </div>
);

export default RecruiterDashboard;