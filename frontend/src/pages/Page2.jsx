import { useCallback, useEffect, useState } from "react";
import "./Page2.css";
import { useAuthContext } from "@asgardeo/auth-react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "https://lab10-backend-2xqp.onrender.com";

const initialForm = {
  name: "",
  breed: "",
  age: "",
};

export default function Page2() {
  const { state, getAccessToken } = useAuthContext();
  const [accessToken, setAccessToken] = useState(null);

  const [puppies, setPuppies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  // Load access token from Asgardeo after sign-in.
  useEffect(() => {
    if (!state?.isAuthenticated) {
      setAccessToken(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!cancelled && token) {
          setAccessToken(token);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load access token. Please sign in again.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state?.isAuthenticated, getAccessToken]);

  const getAuthHeaders = useCallback(() => {
    if (!accessToken) return {};
    return { Authorization: `Bearer ${accessToken}` };
  }, [accessToken]);

  // Define API request with auth headers
  const apiRequest = useCallback(
    async (url, options = {}) => {
      const headers = {
        ...getAuthHeaders(),
        ...options.headers,
      };
      return fetch(url, { ...options, headers });
    },
    [getAuthHeaders]
  );

  const fetchPuppies = useCallback(async () => {
    const authHeaders = getAuthHeaders();
    if (Object.keys(authHeaders).length === 0) {
      setLoading(false);
      setError("Sign in to load your puppy records.");
      setPuppies([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await apiRequest(`${API_URL}/`);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const msg =
          body?.detail
            ? `${body.error}: ${body.detail}`
            : body?.error || `Failed to fetch puppies (${response.status})`;
        throw new Error(msg);
      }
      const data = await response.json();
      setPuppies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch puppies");
    } finally {
      setLoading(false);
    }
  }, [apiRequest, getAuthHeaders]);

  useEffect(() => {
    fetchPuppies();
  }, [fetchPuppies]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.breed.trim() || !String(formData.age).trim()) {
      setError("Name, breed, and age are required.");
      return;
    }

    const payload = {
      ...formData,
      age: Number(formData.age),
    };

    if (Number.isNaN(payload.age) || payload.age < 0) {
      setError("Age must be a valid non-negative number.");
      return;
    }

    try {
      setError("");
      const response = await apiRequest(
        editingId ? `${API_URL}/${editingId}` : `${API_URL}/`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${editingId ? "update" : "create"} puppy`);
      }

      await fetchPuppies();
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to save puppy");
    }
  };

  const handleEdit = (puppy) => {
    setEditingId(puppy.id);
    setFormData({
      name: puppy.name ?? "",
      breed: puppy.breed ?? "",
      age: puppy.age ?? "",
    });
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this puppy record?")) return;
    try {
      setError("");
      const response = await apiRequest(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to delete puppy");
      }
      await fetchPuppies();
    } catch (err) {
      setError(err.message || "Failed to delete puppy");
    }
  };

  return (
    <section className="page2-container">
      <h2>Puppies Management</h2>
      {accessToken && (
        <div className="jwt-card">
          <strong>JWT attached to requests</strong>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="panel">
        <h3>{editingId ? "Edit Puppy" : "Add Puppy"}</h3>
        <div className="form-grid">
          <input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <input
            name="breed"
            placeholder="Breed"
            value={formData.breed}
            onChange={handleInputChange}
          />
          <input
            name="age"
            placeholder="Age"
            type="number"
            min="0"
            value={formData.age}
            onChange={handleInputChange}
          />
        </div>
        <div className="button-row">
          <button onClick={handleSubmit}>{editingId ? "Update" : "Create"}</button>
          {editingId && (
            <button className="button-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="panel">
        <h3>Records {!loading && `(${puppies.length})`}</h3>
        {loading ? (
          <p>Loading...</p>
        ) : puppies.length === 0 ? (
          <p>No puppies found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Breed</th>
                  <th>Age</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {puppies.map((puppy) => (
                  <tr key={puppy.id}>
                    <td>{puppy.id}</td>
                    <td>{puppy.name}</td>
                    <td>{puppy.breed}</td>
                    <td>{puppy.age}</td>
                    <td className="actions-cell">
                      <button className="button-secondary" onClick={() => handleEdit(puppy)}>
                        Edit
                      </button>
                      <button className="button-danger" onClick={() => handleDelete(puppy.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}