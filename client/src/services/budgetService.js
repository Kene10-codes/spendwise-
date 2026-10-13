
const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
}/budgets`;

async function requestApi(url, options = {}) {
  const token = localStorage.getItem("spendwise-token");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result;
}

// Convert MongoDB's _id to the id expected by the React UI.
function normalizeBudget(budget) {
  return {
    ...budget,
    id: budget._id || budget.id,
  };
}

// GET /api/budgets
export async function getBudgets() {
  const result = await requestApi(API_URL);
  return result.data.map(normalizeBudget);
}

// POST /api/budgets
export async function createBudget(budget) {
  const result = await requestApi(API_URL, {
    method: "POST",
    body: JSON.stringify({
      category: budget.category,
      limit: Number(budget.limit),
    }),
  });

  return normalizeBudget(result.data);
}

// DELETE /api/budgets/:id
export async function deleteBudget(id) {
  return requestApi(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
