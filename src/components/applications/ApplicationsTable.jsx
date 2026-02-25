import StatusBadge from "./StatusBadge";

const ApplicationsTable = ({ applications }) => {
  if (!applications) return null;

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Date Applied</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  <td className="fw-semibold">
                    {app?.job?.title || "N/A"}
                  </td>
                  <td>{app?.job?.company || "N/A"}</td>
                  <td>{app?.job?.location || "N/A"}</td>
                  <td>
                    {app?.createdAt
                      ? new Date(app.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <StatusBadge status={app?.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsTable;