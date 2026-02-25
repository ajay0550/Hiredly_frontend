const EmptyState = () => {
  return (
    <div className="card shadow-sm border-0 text-center py-5">
      <div className="card-body">
        <h5 className="fw-bold mb-3">
          No Applications Yet
        </h5>
        <p className="text-muted mb-4">
          You haven't applied to any jobs. Start exploring
          opportunities now.
        </p>
        <a href="/jobs" className="btn btn-dark px-4">
          Browse Jobs
        </a>
      </div>
    </div>
  );
};

export default EmptyState;