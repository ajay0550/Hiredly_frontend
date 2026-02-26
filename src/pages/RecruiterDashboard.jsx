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

  const [toast, setToast] = useState(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);

  // ---------------- FETCH JOBS ----------------
  const fetchJobs = async () => {
    try {
      const { data } = await API.get("/jobs");

      const myJobs = data.data.filter(
        (job) => job.createdBy._id === user._id
      );

      setJobs(myJobs);
    } catch {
      showToast("Failed to fetch jobs", "danger");
    }
  };

  useEffect(() => {
    if (user) fetchJobs();
  }, [user]);

  // ---------------- TOAST ----------------
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---------------- FETCH APPLICANTS ----------------
  const fetchApplicants = async (jobId) => {
    try {
      const { data } = await API.get(`/applications/job/${jobId}`);
      setApplications(data.data);
      setSelectedJob(jobId);
      setShowApplicantsModal(true);
    } catch {
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
    } catch {
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
    <div className="container-fluid py-4 px-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Recruiter Dashboard</h2>
      </div>

      {/* TOAST */}
      {toast && (
        <div
          className={`alert alert-${toast.type} position-fixed top-0 end-0 m-3 shadow`}
          style={{ zIndex: 9999 }}
        >
          {toast.message}
        </div>
      )}

      {/* STATS */}
      <div className="row mb-4">
        <StatCard title="Total Jobs" value={totalJobs} />
        <StatCard title="Total Applicants" value={totalApplicants} />
        <StatCard title="Shortlisted" value={shortlistedCount} color="success" />
        <StatCard title="Rejected" value={rejectedCount} color="danger" />
      </div>

      {/* SEARCH */}
      <div className="card shadow-sm border-0 p-3 mb-4">
        <input
          className="form-control"
          placeholder="Search jobs by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* JOB LIST */}
      <div className="row">
        {currentJobs.map((job) => (
          <div key={job._id} className="col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body d-flex flex-column">
                <h5 className="fw-bold">{job.title}</h5>
                <p className="text-muted small mb-3">
                  {job.company} • {job.location}
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

      {/* PAGINATION */}
      <div className="d-flex justify-content-center mt-3">
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

      {/* ---------------- APPLICANTS MODAL ---------------- */}
      {showApplicantsModal && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Applicants</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowApplicantsModal(false)}
                  />
                </div>

                <div className="modal-body">

                  {applications.length === 0 ? (
                    <p className="text-muted">No applicants yet.</p>
                  ) : (
                    applications.map((app) => (
                      <div
                        key={app._id}
                        className="card mb-3 border-0 shadow-sm"
                      >
                        <div className="card-body">

                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="fw-bold mb-1">
                                {app.applicant?.name}
                              </h6>
                              <p className="text-muted small mb-1">
                                {app.applicant?.email}
                              </p>
                            </div>

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
                          </div>

                          {/* RESUME */}
                          {app.applicant?.resume ? (
                            <a
                              href={app.applicant.resume}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="d-inline-flex align-items-center gap-2 text-decoration-none mt-3 resume-link"
                            >
                              <span className="fw-medium">View Resume</span>
                            </a>
                          ) : (
                            <span className="text-muted small d-block mt-3">
                              No resume uploaded
                            </span>
                          )}

                          {/* ACTION BUTTONS */}
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
                    ))
                  )}

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

// ---------------- STAT CARD ----------------
const StatCard = ({ title, value, color }) => (
  <div className="col-md-3 mb-3">
    <div className="card shadow-sm border-0 text-center p-3">
      <h6 className="text-muted small text-uppercase">{title}</h6>
      <h4 className={`fw-bold ${color ? `text-${color}` : ""}`}>
        {value}
      </h4>
    </div>
  </div>
);

export default RecruiterDashboard;