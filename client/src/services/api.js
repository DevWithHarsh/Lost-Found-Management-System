const API_URL = "http://localhost:5000/api";

export const signupUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Signup failed");
  }

  return data;
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

// =========================
// FOUND ITEMS
// =========================

export const createFoundItem = async (itemData) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("name", itemData.name);
  formData.append("category", itemData.category);
  formData.append("description", itemData.description);
  formData.append("location", itemData.location);
  formData.append("foundDate", itemData.foundDate);

  if (itemData.image) {
    formData.append("image", itemData.image);
  }

  const response = await fetch(`${API_URL}/found-items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to report item"
    );
  }

  return data;
};

export const getFoundItems = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/found-items`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch items");
  }

  return data;
};