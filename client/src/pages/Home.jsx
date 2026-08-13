import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  createFoundItem,
  getFoundItems,
  createClaimRequest,
} from "../services/api";

const categories = [
  "All",
  "Electronics",
  "Documents",
  "Accessories",
  "Bags",
  "Keys",
  "Clothing",
  "Other",
];

const Home = () => {
  const { user, logout } = useAuth();

  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [claimItem, setClaimItem] = useState(null);
  const [claimReason, setClaimReason] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    location: "",
    foundDate: "",
    image: null,
  });

  // =========================
  // FETCH ITEMS
  // =========================

  const loadItems = async () => {
    try {
      setLoading(true);

      const data = await getFoundItems();

      setItems(data.items || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // =========================
  // FORM HANDLERS
  // =========================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setFormLoading(true);

    try {
      await createFoundItem(form);

      setSuccess("Found item reported successfully!");

      setForm({
        name: "",
        category: "",
        description: "",
        location: "",
        foundDate: "",
        image: null,
      });

      setShowForm(false);

      await loadItems();
    } catch (error) {
      setError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // =========================
  // CLAIM HANDLERS
  // =========================

  const handleClaimSubmit = async (e) => {
    e.preventDefault();

    if (!claimItem || !claimReason.trim()) return;

    setError("");
    setSuccess("");
    setClaimLoading(true);

    try {
      await createClaimRequest(claimItem._id, claimReason);

      setSuccess("Claim request submitted successfully!");
      setClaimItem(null);
      setClaimReason("");
    } catch (error) {
      setError(error.message);
    } finally {
      setClaimLoading(false);
    }
  };

  // =========================
  // FILTER ITEMS
  // =========================

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        item.category === category;

      const matchesDate =
        !date ||
        new Date(item.foundDate)
          .toISOString()
          .split("T")[0] === date;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDate
      );
    });
  }, [items, search, category, date]);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* NAVBAR */}

      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 30px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <h2>Lost & Found</h2>

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
          padding: "0 20px",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1>Found Items</h1>
            <p>
              Find items reported by students and staff.
            </p>
          </div>

          <button onClick={() => setShowForm(!showForm)}>
            {showForm
              ? "Close Form"
              : "Report Found Item"}
          </button>
        </div>

        {/* MESSAGES */}

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{ color: "green" }}>
            {success}
          </p>
        )}

        {/* REPORT FORM */}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              marginTop: "20px",
              borderRadius: "10px",
            }}
          >
            <h2>Report Found Item</h2>

            <input
              name="name"
              placeholder="Item Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <br />
            <br />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Category
              </option>

              {categories
                .filter((c) => c !== "All")
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>

            <br />
            <br />

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              required
            />

            <br />
            <br />

            <input
              name="location"
              placeholder="Found Location"
              value={form.location}
              onChange={handleChange}
              required
            />

            <br />
            <br />

            <input
              name="foundDate"
              type="date"
              value={form.foundDate}
              onChange={handleChange}
              required
            />

            <br />
            <br />

            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({
                  ...form,
                  image: e.target.files[0],
                })
              }
            />

            <br />
            <br />

            <button
              type="submit"
              disabled={formLoading}
            >
              {formLoading
                ? "Submitting..."
                : "Submit Found Item"}
            </button>
          </form>
        )}

        {/* SEARCH */}

        <div
          style={{
            marginTop: "30px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <input
            placeholder="Search by item name..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />
        </div>

        {/* ITEMS */}

        <section style={{ marginTop: "30px" }}>
          {loading ? (
            <p>Loading items...</p>
          ) : filteredItems.length === 0 ? (
            <p>No found items match your search.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "20px",
              }}
            >
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "20px",
                  }}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "12px",
                      }}
                    />
                  )}
                  <h3>{item.name}</h3>

                  <p>
                    <strong>Category:</strong>{" "}
                    {item.category}
                  </p>

                  <p>
                    <strong>Description:</strong>{" "}
                    {item.description}
                  </p>

                  <p>
                    <strong>Location:</strong>{" "}
                    {item.location}
                  </p>

                  <p>
                    <strong>Found Date:</strong>{" "}
                    {new Date(
                      item.foundDate
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {item.status}
                  </p>

                  <small>
                    Reported by{" "}
                    {item.reportedBy?.name}
                  </small>

                  {item.status === "available" &&
                    item.reportedBy?._id !== user?.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setError("");
                          setSuccess("");
                          setClaimItem(item);
                          setClaimReason("");
                        }}
                        style={{
                          marginTop: "15px",
                          width: "100%",
                        }}
                      >
                        Claim This Item
                      </button>
                    )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CLAIM MODAL */}
        {claimItem && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 1000,
            }}
          >
            <form
              onSubmit={handleClaimSubmit}
              style={{
                width: "100%",
                maxWidth: "500px",
                background: "#1a1a1f",
                border: "1px solid #444",
                borderRadius: "12px",
                padding: "24px",
                boxSizing: "border-box",
              }}
            >
              <h2>Claim Item</h2>

              <p>
                You are claiming: <strong>{claimItem.name}</strong>
              </p>
              <p>
                Explain why you believe this item belongs to you.
              </p>

              <textarea
                value={claimReason}
                onChange={(e) => setClaimReason(e.target.value)}
                placeholder="Example: This is my black wallet. It has my college ID and initials inside."
                rows="5"
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                <button
                  type="submit"
                  disabled={claimLoading}
                >
                  {claimLoading ? "Submitting..." : "Submit Claim"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setClaimItem(null);
                    setClaimReason("");
                  }}
                  disabled={claimLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;