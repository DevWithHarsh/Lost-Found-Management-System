import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  approveClaim,
  getPendingClaims,
  rejectClaim,
} from "../services/api";

const Admin = () => {
  const { user, logout } = useAuth();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadClaims = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPendingClaims();
      setClaims(data.claims || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const handleApprove = async (claimId) => {
    const confirmed = window.confirm(
      "Approve this claim? The item will be marked as claimed and other pending claims for the same item will be rejected."
    );

    if (!confirmed) return;

    try {
      setProcessingId(claimId);
      setError("");
      setSuccess("");

      const data = await approveClaim(claimId);
      setSuccess(data.message || "Claim approved successfully");
      await loadClaims();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (claimId) => {
    const confirmed = window.confirm("Reject this claim request?");

    if (!confirmed) return;

    try {
      setProcessingId(claimId);
      setError("");
      setSuccess("");

      const data = await rejectClaim(claimId);
      setSuccess(data.message || "Claim rejected successfully");
      await loadClaims();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 30px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <h2 style={{ margin: 0 }}>Lost &amp; Found — Admin</h2>

        <div>
          <span style={{ marginRight: "20px" }}>
            Welcome, {user?.name}
          </span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <main
        style={{
          maxWidth: "1100px",
          margin: "30px auto",
          padding: "0 20px 50px",
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ marginBottom: "8px" }}>Admin Dashboard</h1>
            <p>Review and verify pending claim requests.</p>
          </div>

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "14px 20px",
              minWidth: "130px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "30px", fontWeight: "700" }}>
              {claims.length}
            </div>
            <div>Pending Claims</div>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px 16px",
              border: "1px solid #d33",
              borderRadius: "8px",
              color: "#d33",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px 16px",
              border: "1px solid #299447",
              borderRadius: "8px",
              color: "#299447",
            }}
          >
            {success}
          </div>
        )}

        <section style={{ marginTop: "30px" }}>
          <h2>Pending Claim Requests</h2>

          {loading ? (
            <p style={{ marginTop: "20px" }}>Loading claims...</p>
          ) : claims.length === 0 ? (
            <div
              style={{
                marginTop: "20px",
                padding: "35px 20px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <h3>No pending claims 🎉</h3>
              <p>All claim requests have been processed.</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              {claims.map((claim) => {
                const item = claim.foundItem;
                const claimant = claim.claimant;
                const isProcessing = processingId === claim._id;

                return (
                  <article
                    key={claim._id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "12px",
                      overflow: "hidden",
                      padding: "16px",
                    }}
                  >
                    {item?.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "190px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginBottom: "15px",
                        }}
                      />
                    )}

                    <h3 style={{ marginTop: 0 }}>{item?.name || "Unknown item"}</h3>

                    <p><strong>Category:</strong> {item?.category || "-"}</p>
                    <p><strong>Location:</strong> {item?.location || "-"}</p>
                    <p>
                      <strong>Found Date:</strong>{" "}
                      {item?.foundDate
                        ? new Date(item.foundDate).toLocaleDateString()
                        : "-"}
                    </p>

                    <hr style={{ margin: "15px 0", border: 0, borderTop: "1px solid #ddd" }} />

                    <h4 style={{ marginBottom: "8px" }}>Claimant</h4>
                    <p><strong>Name:</strong> {claimant?.name || "-"}</p>
                    <p><strong>Email:</strong> {claimant?.email || "-"}</p>
                    <p><strong>Phone:</strong> {claimant?.phone || "-"}</p>

                    <h4 style={{ marginBottom: "8px", marginTop: "16px" }}>
                      Claim Reason / Proof
                    </h4>
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        background: "rgba(128, 128, 128, 0.12)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {claim.reason}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "18px",
                      }}
                    >
                      <button
                        onClick={() => handleApprove(claim._id)}
                        disabled={isProcessing}
                        style={{ flex: 1 }}
                      >
                        {isProcessing ? "Processing..." : "Approve"}
                      </button>

                      <button
                        onClick={() => handleReject(claim._id)}
                        disabled={isProcessing}
                        style={{ flex: 1 }}
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Admin;
