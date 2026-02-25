const StatusBadge = ({ status }) => {
  const base =
    "badge px-3 py-2 rounded-pill fw-semibold";

  if (status === "shortlisted")
    return <span className={`${base} bg-success`}>Shortlisted</span>;

  if (status === "rejected")
    return <span className={`${base} bg-danger`}>Rejected</span>;

  return (
    <span className={`${base} bg-warning text-dark`}>
      Pending
    </span>
  );
};

export default StatusBadge;