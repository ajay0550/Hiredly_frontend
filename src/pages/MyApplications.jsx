import { useEffect, useState } from "react";
import API from "../api/axios";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await API.get("/applications/my-applications");
        setApplications(data.data);
      } catch (error) {
        error;
        console.error("Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-dark" role="status" />
        <p className="mt-3">Loading applications...</p>
      </div>
    );

  return (
    <div>
      <h2 className="mb-4">My Applications</h2>

      {applications.length === 0 && (
        <div className="alert alert-info">
          You haven’t applied to any jobs yet.
        </div>
      )}

      <div className="row">
        {applications.map((app) => (
          <div key={app._id} className="col-md-6 col-lg-4 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{app.job.title}</h5>

                <p className="card-text mb-2">
                  <strong>Company:</strong> {app.job.company}
                </p>

                <p className="card-text mb-2">
                  <strong>Location:</strong> {app.job.location}
                </p>

                <p className="mt-auto">
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      app.status === "shortlisted"
                        ? "badge bg-success"
                        : app.status === "rejected"
                        ? "badge bg-danger"
                        : "badge bg-warning text-dark"
                    }
                  >
                    {app.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyApplications;