import { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

const roles = [
  "Doctor",
  "Hospital Administrator",
  "Healthcare Researcher",
];

const departments = [
  "Cardiology",
  "Neurology",
  "General Medicine",
  "Orthopedics",
  "Pediatrics",
  "Oncology",
];

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Doctor",
    department: "",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/admin/users");

      setUsers(response.data?.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Doctor",
      department: "",
    });

    setEditingUser(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => {
      const updated = {
        ...previous,
        [name]: value,
      };

      if (name === "role" && value !== "Doctor") {
        updated.department = "";
      }

      return updated;
    });
  };

  const handleAddUser = () => {
    setEditingUser(null);

    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Doctor",
      department: "",
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      setError("Password is required.");
      return;
    }

    if (
      formData.role === "Doctor" &&
      !formData.department
    ) {
      setError(
        "Department is required for Doctor accounts."
      );
      return;
    }

    try {
      setSaving(true);

      if (editingUser) {
        const updateData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          department:
            formData.role === "Doctor"
              ? formData.department
              : null,
        };

        if (formData.password.trim()) {
          updateData.password =
            formData.password;
        }

        const response = await api.patch(
          `/api/admin/users/${editingUser.id}`,
          updateData
        );

        setMessage(
          response.data?.message ||
            "User updated successfully."
        );
      } else {
        const createData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
          department:
            formData.role === "Doctor"
              ? formData.department
              : null,
        };

        const response = await api.post(
          "/api/admin/users",
          createData
        );

        setMessage(
          response.data?.message ||
            "User created successfully."
        );
      }

      resetForm();

      await fetchUsers();
    } catch (err) {
      console.error("User save failed:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to save user."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    if (user.id === "system-admin") {
      return;
    }

    setEditingUser(user);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role:
        user.role === "System Administrator"
          ? "Doctor"
          : user.role || "Doctor",
      department: user.department || "",
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  const handleDelete = async (user) => {
    if (user.id === "system-admin") {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name} (${user.email})?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(user.id);
      setError("");
      setMessage("");

      const response = await api.delete(
        `/api/admin/users/${user.id}`
      );

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) =>
            currentUser.id !== user.id
        )
      );

      setMessage(
        response.data?.message ||
          "User deleted successfully."
      );

      await fetchUsers();
    } catch (err) {
      console.error("User deletion failed:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete user."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleCount = (role) => {
    return users.filter(
      (user) => user.role === role
    ).length;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <FaUsers className="text-blue-600 text-3xl" />

              <h1 className="text-3xl font-bold text-slate-800">
                Users & Roles
              </h1>
            </div>

            <p className="text-gray-500 mt-2">
              Manage platform users, roles and department assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddUser}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium"
          >
            <FaUserPlus />
            Add User
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Total Users
            </p>

            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              {users.length}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Doctors
            </p>

            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              {getRoleCount("Doctor")}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Hospital Administrators
            </p>

            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              {getRoleCount(
                "Hospital Administrator"
              )}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500">
              Healthcare Researchers
            </p>

            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              {getRoleCount(
                "Healthcare Researcher"
              )}
            </h2>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800">
                {editingUser
                  ? "Edit User"
                  : "Create User"}
              </h2>

              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="text-gray-500 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={saving}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={saving}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingUser}
                  disabled={saving}
                  placeholder={
                    editingUser
                      ? "Leave blank to keep current password"
                      : ""
                  }
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  disabled={saving}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {formData.role === "Doctor" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>

                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    disabled={saving}
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      Select Department
                    </option>

                    {departments.map(
                      (department) => (
                        <option
                          key={department}
                          value={department}
                        >
                          {department}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-slate-800">
              Current Users
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {users.length} user
              {users.length !== 1 ? "s" : ""} registered
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-6 py-4 font-semibold text-slate-700">
                      Name
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-700">
                      Email
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-700">
                      Role
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-700">
                      Department
                    </th>

                    <th className="px-6 py-4 font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {user.name}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {user.department ||
                          "Department Not Assigned"}
                      </td>

                      <td className="px-6 py-4">
                        {user.id === "system-admin" ? (
                          <span className="text-sm text-gray-400">
                            Protected
                          </span>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(user)
                              }
                              disabled={
                                deletingId ===
                                user.id
                              }
                              className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 px-3 py-2 rounded-lg"
                            >
                              <FaEdit />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(user)
                              }
                              disabled={
                                deletingId ===
                                user.id
                              }
                              className="flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 px-3 py-2 rounded-lg"
                            >
                              <FaTrash />
                              {deletingId === user.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminUsers;