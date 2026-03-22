import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const RecruiterDashboard = () => {
  const { user } = useContext(AuthContext);

  const [jobs, setJobs] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [toast, setToast] = useState(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    salary: "",
  });

  // ================= FETCH DATA =================
  const fetchJobs = async () => {
    try {
      const { data } = await API.get("/api/jobs");
      const myJobs = data.data.filter(
        (job) => job.createdBy._id === user._id
      );
      setJobs(myJobs);

      // Fetch applications for analytics
      let allApps = [];
      for (let job of myJobs) {
        const res = await API.get(`/api/applications/job/${job._id}`);
        allApps = [...allApps, ...res.data.data];
      }
      setAllApplications(allApps);

    } catch {
      showToast("Failed to fetch data", "danger");
    }
  };

  useEffect(() => {
    if (user) fetchJobs();
  }, [user]);

  // ================= TOAST =================
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ================= CREATE JOB =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateJob = async () => {
    try {
      await API.post("/api/jobs", {
        ...form,
        salary: Number(form.salary),
      });

      setShowCreateModal(false);
      setForm({
        title: "",
        description: "",
        company: "",
        location: "",
        salary: "",
      });

      showToast("Job created successfully!");
      fetchJobs();

    } catch {
      showToast("Failed to create job", "danger");
    }
  };

  // ================= FETCH APPLICANTS =================
  const fetchApplicants = async (jobId) => {
    try {
      const { data } = await API.get(`/api/applications/job/${jobId}`);
      setApplications(data.data);
      setSelectedJob(jobId);
      setShowApplicantsModal(true);
    } catch {
      showToast("Failed to fetch applicants", "danger");
    }
  };

  // ================= UPDATE STATUS =================
  const updateStatus = async (applicationId, status) => {
    try {
      await API.patch(`/api/applications/${applicationId}/status`, { status });
      showToast("Status updated!");
      fetchApplicants(selectedJob);
      fetchJobs();
    } catch {
      showToast("Failed to update status", "danger");
    }
  };

  // ================= ANALYTICS =================
  const totalJobs = jobs.length;
  const totalApplicants = allApplications.length;
  const shortlistedCount = allApplications.filter(
    (app) => app.status === "shortlisted"
  ).length;
  const rejectedCount = allApplications.filter(
    (app) => app.status === "rejected"
  ).length;
  const appliedCount =
    totalApplicants - shortlistedCount - rejectedCount;

  const barData = {
    labels: jobs.map((job) => job.title),
    datasets: [
      {
        label: "Applicants",
        data: jobs.map(
          (job) =>
            allApplications.filter(
              (app) => app.job === job._id
            ).length
        ),
        backgroundColor: "#111827",
        borderRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: ["Shortlisted", "Rejected", "Applied"],
    datasets: [
      {
        data: [shortlistedCount, rejectedCount, appliedCount],
        backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
      },
    ],
  };

  return (
    <div className="container-fluid py-4 px-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Recruiter Analytics</h2>
          <p className="text-muted mb-0">
            Track performance and hiring metrics
          </p>
        </div>

        <button
          className="btn btn-dark"
          onClick={() => setShowCreateModal(true)}
        >
          + Post New Job
        </button>
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

      {/* KPI ROW */}
      <div className="row mb-4">
        <StatCard title="Total Jobs" value={totalJobs} />
        <StatCard title="Total Applicants" value={totalApplicants} />
        <StatCard title="Shortlisted" value={shortlistedCount} color="success" />
        <StatCard title="Rejected" value={rejectedCount} color="danger" />
      </div>

      {/* CHARTS */}
      <div className="row mb-5">
        <div className="col-lg-8 mb-4">
          <div className="card p-4">
            <h6 className="fw-bold mb-3">Applicants Per Job</h6>
            <Bar data={barData} />
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card p-4">
            <h6 className="fw-bold mb-3">Application Status</h6>
            <Doughnut data={doughnutData} />
          </div>
        </div>
      </div>

      {/* JOB LIST */}
      <div className="card p-4">
        <h6 className="fw-bold mb-3">Your Jobs</h6>

        {jobs.map((job) => (
          <div
            key={job._id}
            className="d-flex justify-content-between align-items-center border-bottom py-3"
          >
            <div>
              <h6 className="fw-bold mb-1">{job.title}</h6>
              <p className="text-muted small mb-0">
                {job.company} • {job.location}
              </p>
            </div>

            <button
              className="btn btn-dark btn-sm"
              onClick={() => fetchApplicants(job._id)}
            >
              View Applicants
            </button>
          </div>
        ))}
      </div>

      {/* ================= CREATE JOB MODAL ================= */}
      {showCreateModal && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title fw-bold">Create New Job</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowCreateModal(false)}
                  />
                </div>

                <div className="modal-body">

                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      name="title"
                      className="form-control"
                      value={form.title}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Company</label>
                    <input
                      name="company"
                      className="form-control"
                      value={form.company}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input
                      name="location"
                      className="form-control"
                      value={form.location}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Salary</label>
                    <input
                      name="salary"
                      type="number"
                      className="form-control"
                      value={form.salary}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="4"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>

                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-dark"
                    onClick={handleCreateJob}
                  >
                    Create Job
                  </button>
                </div>

              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* ================= APPLICANTS MODAL ================= */}
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
                  {applications.map((app) => (
                    <div key={app._id} className="card mb-3 p-3">

                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="fw-bold mb-1">
                            {app.applicant?.name}
                          </h6>
                          <p className="text-muted small mb-0">
                            {app.applicant?.email}
                          </p>
                        </div>

                        <span className={`badge ${
                          app.status === "shortlisted"
                            ? "bg-success"
                            : app.status === "rejected"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      {app.applicant?.resume && (
                        <a
                          href={app.applicant.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="resume-link mt-2 d-inline-block"
                        >
                          View Resume
                        </a>
                      )}

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
                  ))}
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

const StatCard = ({ title, value, color }) => (
  <div className="col-md-3 mb-3">
    <div className="card text-center p-3">
      <h6 className="text-muted small text-uppercase">{title}</h6>
      <h3 className={`fw-bold ${color ? `text-${color}` : ""}`}>
        {value}
      </h3>
    </div>
  </div>
);

export default RecruiterDashboard;