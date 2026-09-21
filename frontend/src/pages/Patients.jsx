import { useEffect, useState } from "react";
import api from "../services/api";
import PatientTable from "../components/PatientTable";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    disease: "",
    risk: "Low",
    status: "Admitted",
  });

  // GET PATIENTS
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/patients");

      const data = response.data || [];

      setPatients(data);
      setFilteredPatients(data);
    } catch (err) {
      console.error("Error fetching patients:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load patients."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // SEARCH
  useEffect(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter((patient) => {
      return (
        String(patient.name || "")
          .toLowerCase()
          .includes(value) ||
        String(patient.disease || "")
          .toLowerCase()
          .includes(value) ||
        String(patient.gender || "")
          .toLowerCase()
          .includes(value) ||
        String(patient.status || "")
          .toLowerCase()
          .includes(value) ||
        String(patient.risk || "")
          .toLowerCase()
          .includes(value)
      );
    });

    setFilteredPatients(filtered);
  }, [search, patients]);

  // FORM INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ADD PATIENT
  const handleAddPatient = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const newPatient = {
        name: formData.name.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        disease: formData.disease.trim(),
        risk: formData.risk,
        status: formData.status,
      };

      console.log("Sending patient data:", newPatient);

      await api.post("/api/patients", newPatient);

      // Reset form
      setFormData({
        name: "",
        age: "",
        gender: "",
        disease: "",
        risk: "Low",
        status: "Admitted",
      });

      setShowForm(false);

      // Reload table
      await fetchPatients();

    } catch (err) {
      console.error("Error adding patient:", err);

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        err.response?.data?.detail ||
          "Failed to add patient."
      );
    }
  };

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Patients
          </h1>

          <p className="text-gray-500 mt-1">
            Manage and view patient records
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold transition"
        >
          {showForm ? "Close Form" : "+ Add Patient"}
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ADD PATIENT FORM */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">

          <h2 className="text-xl font-bold text-gray-800 mb-5">
            Add New Patient
          </h2>

          <form
            onSubmit={handleAddPatient}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >

            {/* NAME */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Patient Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter patient name"
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
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
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
                value={formData.gender}
                onChange={handleChange}
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
                value={formData.disease}
                onChange={handleChange}
                placeholder="Enter disease"
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
                value={formData.risk}
                onChange={handleChange}
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
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Admitted">
                  Admitted
                </option>

                <option value="Discharged">
                  Discharged
                </option>

                <option value="Under Treatment">
                  Under Treatment
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
            <div className="md:col-span-2 flex justify-end gap-3 pt-3">

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
              >
                Add Patient
              </button>

            </div>

          </form>

        </div>
      )}

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, disease, gender, risk or status..."
          className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

      {/* PATIENT COUNT */}
      <div className="mb-4 text-gray-600">
        Showing{" "}
        <span className="font-semibold text-gray-800">
          {filteredPatients.length}
        </span>{" "}
        patient
        {filteredPatients.length !== 1 ? "s" : ""}
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
          Loading patients...
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
          No patients found.
        </div>
      ) : (
        <PatientTable patients={filteredPatients} />
      )}

    </div>
  );
}

export default Patients;