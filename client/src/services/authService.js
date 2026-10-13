
const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
}/auth`;

async function requestApi(endpoint, data) {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Authentication failed.");
  }

  return result;
}

export async function registerUser(userData) {
  return requestApi("register", userData);
}

export async function loginUser(credentials) {
  return requestApi("login", credentials);
}
