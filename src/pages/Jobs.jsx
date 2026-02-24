import { useEffect, useState } from "react";
import API from "../api/axios";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await API.get("/jobs");
        setJobs(data.data);
      } catch (error) {
        console.error("Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    try {
      await API.post(`/applications/${jobId}`);
      alert("Application submitted!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to apply");
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid mt-4">
      <div className="row">

        {/* ---------- LEFT SIDEBAR ---------- */}
        <div className="col-md-3">
          <div className="card p-3 shadow-sm mb-4">
            <h5>Filters</h5>
            <input
              className="form-control mt-2"
              placeholder="Search by title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <hr />
            <p className="text-muted">More filters coming soon...</p>
          </div>
        </div>

        {/* ---------- MAIN CONTENT ---------- */}
        <div className="col-md-9">
          <h3 className="mb-4">Available Jobs</h3>

          {loading && <p>Loading jobs...</p>}

          {filteredJobs.length === 0 && !loading && (
            <div className="alert alert-info">
              No jobs found.
            </div>
          )}

          {filteredJobs.map((job) => (
            <div
              key={job._id}
              className="card shadow-sm mb-3"
            >
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">{job.title}</h5>
                  <p className="mb-1 text-muted">
                    {job.company} • {job.location}
                  </p>
                  <p className="mb-0">
                    ₹ {job.salary}
                  </p>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => handleApply(job._id)}
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Jobs;