const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, options);
  let data = {};
  try { data = await response.json(); } catch { /* empty response */ }
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const signupUser = (userData) => request("/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(userData),
});

export const loginUser = (credentials) => request("/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(credentials),
});

export const createFoundItem = async (itemData) => {
  const formData = new FormData();
  ["name", "category", "description", "location", "foundDate"].forEach((key) => formData.append(key, itemData[key]));
  if (itemData.image) formData.append("image", itemData.image);
  return request("/found-items", { method: "POST", headers: authHeaders(), body: formData });
};

export const getFoundItems = () => request("/found-items", { headers: authHeaders() });

export const createClaimRequest = (itemId, reason) => request("/claims", {
  method: "POST",
  headers: { "Content-Type": "application/json", ...authHeaders() },
  body: JSON.stringify({ itemId, reason }),
});

export const getMyClaims = () => request("/claims/my", { headers: authHeaders() });
export const getPendingClaims = () => request("/claims/admin/pending", { headers: authHeaders() });
export const approveClaim = (claimId) => request(`/claims/admin/${claimId}/approve`, { method: "PATCH", headers: authHeaders() });
export const rejectClaim = (claimId) => request(`/claims/admin/${claimId}/reject`, { method: "PATCH", headers: authHeaders() });
