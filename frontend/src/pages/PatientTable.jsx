import { Link } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import api from "../services/api";
import { useState } from "react";

function PatientTable({
  patients,
  onPatientUpdated,
  onPatientDeleted,
}) {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const userRole = user?.role;

  // Doctor + System Administrator
  const canEdit =
    userRole === "Doctor" ||
    userRole === "System Administrator";

  // System Administrator only
  const canDelete =
    userRole === "System Administrator";

  // =========================================================
  // EDIT STATE
  // =========================================================

  const [editingPatient, setEditingPatient] =
    useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    gender: "",
    disease: "",
    risk: "Low",
    status: "Admitted",
  });

  const [saving, setSaving] = useState(false);

  // =========================================================
  // NOTIFICATION
  // =========================================================

  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  const showNotification = (type, message) => {
    setNotification({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setNotification({
        show: false,
        type: "",
        message: "",
      });
    }, 3000);
  };

  // =========================================================
  // DISPLAY PATIENT ID
  // =========================================================

  const getDisplayId = (patientId) => {
    if (!patientId) return "—";

    const id = String(patientId);

    return `PAT-${id.slice(-6).toUpperCase()}`;
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const handleEditClick = (patient) => {
    const patientId =
      patient.id ||
      patient._id ||
      patient.patient_id;

    setEditingPatient(patientId);

    setEditForm({
      name: patient.name || "",
      age: patient.age ?? "",
      gender: patient.gender || "",
      disease: patient.disease || "",
      risk: patient.risk || "Low",
      status: patient.status || "Admitted",
    });
  };

  // =========================================================
  // EDIT FORM CHANGE
  // =========================================================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // UPDATE PATIENT
  // =========================================================

  const handleUpdatePatient = async (e) => {
    e.preventDefault();

    if (!editingPatient) return;

    try {
      setSaving(true);

      const updatedPatient = {
        name: editForm.name.trim(),
        age: Number(editForm.age),
        gender: editForm.gender,
        disease: editForm.disease.trim(),
        risk: editForm.risk,
        status: editForm.status,
      };

      await api.patch(
        `/api/patients/${editingPatient}`,
        updatedPatient
      );

      setEditingPatient(null);

      showNotification(
        "success",
        "Patient updated successfully!"
      );

      if (onPatientUpdated) {
        await onPatientUpdated();
      }
    } catch (err) {
      console.error(
        "Error updating patient:",
        err
      );

      showNotification(
        "error",
        err.response?.data?.detail ||
          "Failed to update patient."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE PATIENT
  // =========================================================

  const handleDeletePatient = async (patientId) => {
    if (!patientId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/api/patients/${patientId}`
      );

      showNotification(
        "success",
        "Patient deleted successfully!"
      );

      if (onPatientDeleted) {
        await onPatientDeleted();
      }
    } catch (err) {
      console.error(
        "Error deleting patient:",
        err
      );

      showNotification(
        "error",
        err.response?.data?.detail ||
          "Failed to delete patient."
      );
    }
  };

  return (
    <>
      {/* =====================================================
          NOTIFICATION
      ====================================================== */}

      {notification.show && (
        <div
          className={`fixed top-5 right-5 z-[100] min-w-[320px] max-w-[420px] px-5 py-4 rounded-xl shadow-xl border ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "success" ? (
              <FaCheckCircle
                className="text-green-600"
                size={20}
              />
            ) : (
              <FaExclamationCircle
                className="text-red-600"
                size={20}
              />
            )}

            <span className="font-medium">
              {notification.message}
            </span>
          </div>
        </div>
      )}

      {/* =====================================================
          PATIENT TABLE
      ====================================================== */}

      <div className="w-full bg-white rounded-xl shadow-md overflow-x-auto">

        <table
          className="w-full border-collapse"
          style={{
            minWidth: "1150px",
            tableLayout: "fixed",
          }}
        >

          {/* COLUMN WIDTHS */}
          <colgroup>
            <col style={{ width: "14%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
          </colgroup>

          {/* HEADER */}
          <thead>
            <tr className="bg-blue-600 text-white">

              <th className="px-4 py-4 text-left font-bold">
                Patient ID
              </th>

              <th className="px-4 py-4 text-left font-bold">
                Name
              </th>

              <th className="px-4 py-4 text-center font-bold">
                Age
              </th>

              <th className="px-4 py-4 text-center font-bold">
                Gender
              </th>

              <th className="px-4 py-4 text-left font-bold">
                Disease
              </th>

              <th className="px-4 py-4 text-center font-bold">
                Risk
              </th>

              <th className="px-4 py-4 text-center font-bold">
                Status
              </th>

              <th className="px-4 py-4 text-center font-bold">
                Actions
              </th>

            </tr>
          </thead>

          {/* BODY */}
          <tbody>

            {patients.map((patient, index) => {

              const patientId =
                patient.id ||
                patient._id ||
                patient.patient_id;

              const displayId =
                getDisplayId(patientId);

              return (
                <tr
                  key={
                    patientId ||
                    `patient-${index}`
                  }
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >

                  {/* PATIENT ID */}
                  <td
                    className="px-4 py-4 align-middle text-gray-700 font-medium"
                    title={
                      patientId
                        ? `Full ID: ${patientId}`
                        : ""
                    }
                  >
                    {displayId}
                  </td>

                  {/* NAME */}
                  <td
                    className="px-4 py-4 align-middle text-gray-800 font-semibold truncate"
                    title={patient.name || ""}
                  >
                    {patient.name || "—"}
                  </td>

                  {/* AGE */}
                  <td className="px-4 py-4 align-middle text-center text-gray-700">
                    {patient.age ?? "—"}
                  </td>

                  {/* GENDER */}
                  <td className="px-4 py-4 align-middle text-center text-gray-700">
                    {patient.gender || "—"}
                  </td>

                  {/* DISEASE */}
                  <td
                    className="px-4 py-4 align-middle text-gray-700 truncate"
                    title={patient.disease || ""}
                  >
                    {patient.disease || "—"}
                  </td>

                  {/* RISK */}
                  <td className="px-4 py-4 align-middle text-center">

                    <span
                      className={`inline-flex justify-center items-center min-w-[78px] px-3 py-1 rounded-full text-sm font-semibold ${
                        String(patient.risk).toLowerCase() ===
                        "high"
                          ? "bg-red-100 text-red-600"
                          : String(patient.risk).toLowerCase() ===
                            "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {patient.risk || "—"}
                    </span>

                  </td>

                  {/* STATUS */}
                  <td
                    className="px-4 py-4 align-middle text-center text-gray-700 truncate"
                    title={patient.status || ""}
                  >
                    {patient.status || "—"}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-4 align-middle">

                    <div className="flex justify-center items-center gap-4">

                      {/* VIEW */}
                      {patientId && (
                        <Link
                          to={`/patients/${patientId}`}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="View Patient"
                        >
                          <FaEye size={17} />
                        </Link>
                      )}

                      {/* EDIT */}
                      {canEdit && patientId && (
                        <button
                          type="button"
                          className="text-green-600 hover:text-green-800 transition"
                          title="Edit Patient"
                          onClick={() =>
                            handleEditClick(patient)
                          }
                        >
                          <FaEdit size={17} />
                        </button>
                      )}

                      {/* DELETE */}
                      {canDelete && patientId && (
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800 transition"
                          title="Delete Patient"
                          onClick={() =>
                            handleDeletePatient(
                              patientId
                            )
                          }
                        >
                          <FaTrash size={17} />
                        </button>
                      )}

                    </div>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

      {/* =====================================================
          EDIT MODAL
      ====================================================== */}

      {editingPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}
            <div className="flex justify-between items-center p-6 border-b">

              <h2 className="text-2xl font-bold text-gray-800">
                Edit Patient
              </h2>

              <button
                type="button"
                onClick={() =>
                  setEditingPatient(null)
                }
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleUpdatePatient}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5"
            >

              {/* NAME */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Patient Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* AGE */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Age
                </label>

                <input
                  type="number"
                  name="age"
                  value={editForm.age}
                  onChange={handleEditChange}
                  min="0"
                  max="120"
                  required
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* GENDER */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Gender
                </label>

                <select
                  name="gender"
                  value={editForm.gender}
                  onChange={handleEditChange}
                  required
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* DISEASE */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Disease
                </label>

                <input
                  type="text"
                  name="disease"
                  value={editForm.disease}
                  onChange={handleEditChange}
                  required
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* RISK */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Risk
                </label>

                <select
                  name="risk"
                  value={editForm.risk}
                  onChange={handleEditChange}
                  required
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>
                </select>
              </div>

              {/* STATUS */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Status
                </label>

                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  required
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Admitted">
                    Admitted
                  </option>

                  <option value="Under Treatment">
                    Under Treatment
                  </option>

                  <option value="Discharged">
                    Discharged
                  </option>

                  <option value="Recovered">
                    Recovered
                  </option>

                  <option value="Follow-up">
                    Follow-up
                  </option>
                </select>
              </div>

              {/* BUTTONS */}
              <div className="md:col-span-2 flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={() =>
                    setEditingPatient(null)
                  }
                  className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-semibold"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </>
  );
}

export default PatientTable;