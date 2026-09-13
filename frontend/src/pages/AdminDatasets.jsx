import { useEffect, useState } from "react";
import {
  FaDatabase,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function AdminDatasets() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const role = user?.role;

  const isResearcher = role === "Healthcare Researcher";
  const isSystemAdmin = role === "System Administrator";


  // =====================================================
  // FETCH DATASETS
  // =====================================================

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await api.get(
          "/api/admin/datasets"
        );

        setDatasets(
          response.data?.datasets || []
        );
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Unable to load dataset information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);


  // =====================================================
  // PRIMARY PROJECT DATASET
  // =====================================================

  const primaryDataset = {
    name: "Diabetes 130-US Hospitals Dataset",

    description:
      "Diabetes patient records collected from 130 US hospitals and used for hospital readmission prediction.",

    source:
      "UCI Machine Learning Repository",

    records: "101,766",

    features: "50",

    target: "readmitted",

    status: "Active",
  };


  // =====================================================
  // PAGE TEXT BASED ON ROLE
  // =====================================================

  const pageTitle = isResearcher
    ? "Research Dataset"
    : "Datasets";

  const pageDescription = isResearcher
    ? "Access dataset information and research data resources used by the HealthForecast AI platform."
    : "Dataset information and data resources used by the HealthForecast AI platform.";

  const primarySectionTitle = isResearcher
    ? "Primary Research Dataset"
    : "Primary AI Dataset";

  const primarySectionDescription = isResearcher
    ? "Dataset available for healthcare research and population-level analysis."
    : "Dataset used for the hospital readmission prediction model.";


  return (
    <DashboardLayout>

      <div className="p-6">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <FaDatabase className="text-slate-700 text-3xl" />

            <h1 className="text-3xl font-bold text-slate-800">
              {pageTitle}
            </h1>

          </div>

          <p className="text-gray-500 mt-2">
            {pageDescription}
          </p>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <p className="text-gray-500">
            Loading dataset information...
          </p>

        ) : (

          <>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">


              {/* TOTAL DATASETS */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500">
                      Total Datasets
                    </p>

                    <h2 className="text-3xl font-bold text-slate-800 mt-2">
                      {1 + datasets.length}
                    </h2>

                  </div>

                  <FaDatabase className="text-blue-500 text-3xl" />

                </div>

              </div>


              {/* ACTIVE DATASET */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500">
                      Active Dataset
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-3">
                      {primaryDataset.status}
                    </h2>

                  </div>

                  <FaCheckCircle className="text-green-500 text-3xl" />

                </div>

              </div>


              {/* PRIMARY DATASET */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500">
                      Primary Dataset
                    </p>

                    <h2 className="text-lg font-bold text-slate-800 mt-3">
                      Diabetes 130-US Hospitals
                    </h2>

                  </div>

                  <FaInfoCircle className="text-purple-500 text-3xl" />

                </div>

              </div>

            </div>


            {/* =================================================
                PRIMARY DATASET
            ================================================= */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                <div>

                  <h2 className="text-xl font-semibold text-slate-800">
                    {primarySectionTitle}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    {primarySectionDescription}
                  </p>

                </div>


                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">

                  <FaCheckCircle />

                  <span className="font-medium">
                    Active
                  </span>

                </div>

              </div>


              {/* =================================================
                  DATASET HEADER
              ================================================= */}

              <div className="border rounded-xl p-6">

                <div className="flex items-start gap-4">

                  <div className="bg-blue-100 text-blue-600 rounded-xl p-4">

                    <FaDatabase className="text-2xl" />

                  </div>


                  <div>

                    <h3 className="text-xl font-semibold text-slate-800">
                      {primaryDataset.name}
                    </h3>

                    <p className="text-gray-500 mt-2">
                      {primaryDataset.description}
                    </p>

                  </div>

                </div>


                {/* =================================================
                    DATASET DETAILS
                ================================================= */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">


                  {/* SOURCE */}

                  <div className="bg-slate-50 rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Source
                    </p>

                    <p className="font-semibold text-slate-700 mt-1">
                      {primaryDataset.source}
                    </p>

                  </div>


                  {/* RECORDS */}

                  <div className="bg-slate-50 rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Records
                    </p>

                    <p className="font-semibold text-slate-700 mt-1">
                      {primaryDataset.records}
                    </p>

                  </div>


                  {/* FEATURES */}

                  <div className="bg-slate-50 rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Features
                    </p>

                    <p className="font-semibold text-slate-700 mt-1">
                      {primaryDataset.features}
                    </p>

                  </div>


                  {/* TARGET */}

                  <div className="bg-slate-50 rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Target
                    </p>

                    <p className="font-semibold text-slate-700 mt-1">
                      {primaryDataset.target}
                    </p>

                  </div>


                  {/* STATUS */}

                  <div className="bg-slate-50 rounded-lg p-4">

                    <p className="text-sm text-gray-500">
                      Status
                    </p>

                    <p className="font-semibold text-green-600 mt-1">
                      {primaryDataset.status}
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                RESEARCHER INFORMATION
            ================================================= */}

            {isResearcher && (

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">

                <div className="flex items-start gap-4">

                  <div className="bg-blue-100 text-blue-600 rounded-lg p-3">

                    <FaInfoCircle />

                  </div>

                  <div>

                    <h2 className="text-lg font-semibold text-slate-800">
                      Research Data Access
                    </h2>

                    <p className="text-gray-600 mt-2">
                      This dataset is provided for healthcare research,
                      population health analysis, readmission analysis,
                      and clinical outcome studies.
                    </p>

                    <p className="text-gray-600 mt-2">
                      Research access is limited to appropriate
                      anonymized and aggregated information. Patient
                      personally identifiable information should not be
                      accessed or modified through the research role.
                    </p>

                  </div>

                </div>

              </div>

            )}


            {/* =================================================
                REGISTERED DATASETS
            ================================================= */}

            {datasets.length > 0 && (

              <div className="bg-white rounded-xl shadow p-6 mt-8">

                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                  Registered Dataset Resources
                </h2>


                <div className="space-y-4">

                  {datasets.map((dataset) => (

                    <div
                      key={dataset.id}
                      className="border rounded-xl p-5 hover:bg-slate-50 transition"
                    >

                      <div className="flex items-start gap-4">


                        <div className="bg-slate-100 text-slate-600 rounded-lg p-3">

                          <FaDatabase />

                        </div>


                        <div className="flex-1">

                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

                            <h3 className="font-semibold text-slate-800">
                              {dataset.name}
                            </h3>

                            <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg w-fit">
                              Available
                            </span>

                          </div>


                          <p className="text-sm text-gray-500 mt-2">

                            {dataset.description ||
                              "No description available."}

                          </p>


                          <div className="flex flex-wrap gap-6 mt-3 text-sm text-gray-500">

                            <span>

                              <strong>
                                Source:
                              </strong>{" "}

                              {dataset.source ||
                                "Not specified"}

                            </span>


                            {dataset.created_at && (

                              <span>

                                <strong>
                                  Added:
                                </strong>{" "}

                                {new Date(
                                  dataset.created_at
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}

                              </span>

                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            )}

          </>

        )}

      </div>

    </DashboardLayout>
  );
}

export default AdminDatasets;