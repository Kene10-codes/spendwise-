
const API_URL =
  `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/transactions`;


  
async function requestApi(url, options = {}) {
  const token = localStorage.getItem("spendwise-token");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result;
}


// MongoDB uses _id; our existing React components use id.
function normalizeTransaction(transaction) {
  return {
    ...transaction,
    id: transaction._id || transaction.id,
  };
}

export async function getTransactions() {
  const result = await requestApi(API_URL);
  return result.data.map(normalizeTransaction);
}

export async function createTransaction(transaction) {
  const result = await requestApi(API_URL, {
    method: "POST",
    body: JSON.stringify(transaction),
  });

  return normalizeTransaction(result.data);
}

export async function updateTransaction(id, updates) {
  const result = await requestApi(`${API_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

  return normalizeTransaction(result.data);
}

export async function deleteTransaction(id) {
  return requestApi(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
