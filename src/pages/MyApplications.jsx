import { useEffect, useState } from "react";
import API from "../api/axios";
import ApplicationsTable from "../components/applications/ApplicationsTable";
import EmptyState from "../components/applications/EmptyState";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data } = await API.get("/applications/my-applications");
        setApplications(data.data);
      } catch (error) {
        console.error("Failed to fetch applications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // 🔄 Professional Loading UI (Bootstrap placeholder)
  if (loading) {
    return (
      <div className="container-fluid py-4 px-4">
        <div className="card shadow-sm border-0 p-4">
          <div className="placeholder-glow">
            <span className="placeholder col-6 mb-3"></span>
            <span className="placeholder col-8 mb-2"></span>
            <span className="placeholder col-4"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">My Applications</h3>
          <p className="text-muted mb-0">
            Track the status of your job applications
          </p>
        </div>
      </div>

      {/* Content Section */}
      {applications.length === 0 ? (
        <EmptyState />
      ) : (
        <ApplicationsTable applications={applications} />
      )}
    </div>
  );
};

export default MyApplications;