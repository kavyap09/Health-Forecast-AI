import { useEffect, useState } from "react";
import {
  FaFlask,
  FaDatabase,
  FaChartBar,
  FaHeartbeat,
  FaHospitalUser,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUserMd,
  FaProcedures,
} from "react-icons/fa";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function ResearchDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResearchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/api/research/analytics"
        );

        setAnalytics(response.data);
      } catch (err) {
        console.error(
          "Research analytics error:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load research analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResearchAnalytics();
  }, []);

  const ageDistribution =
    analytics?.age_distribution || {};

  const riskDistribution =
    analytics?.risk_distribution || {};

  const statusDistribution =
    analytics?.status_distribution || {};

  const diseaseDistribution =
    analytics?.disease_distribution || {};

  const totalRecords =
    analytics?.total_records ?? 0;

  const readmissionCount =
    analytics?.readmission_count ?? 0;

  const treatmentCount =
    analytics?.treatment_count ?? 0;

  const followUpCount =
    analytics?.follow_up_count ?? 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="bg-purple-100 p-3 rounded-xl">
              <FaFlask
                className="text-purple-600"
                size={26}
              />
            </div>

            <div>

              <h1 className="text-3xl font-bold text-slate-800">
                Research Dashboard
              </h1>

              <p className="text-gray-500 mt-2">
                Healthcare analytics, population health,
                clinical outcomes and treatment effectiveness
                research.
              </p>

            </div>

          </div>

        </div>


        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-5">
            <p className="font-semibold">
              Unable to load research analytics
            </p>

            <p className="text-sm mt-2">
              {error}
            </p>
          </div>
        )}


        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500">
              Loading research analytics...
            </p>
          </div>
        ) : (
          <>

            {/* =================================================
                OVERVIEW CARDS
            ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

              {/* TOTAL RECORDS */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Research Records
                    </p>

                    <h2 className="text-3xl font-bold text-slate-800 mt-2">
                      {totalRecords}
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                      Available for aggregated analysis
                    </p>

                  </div>

                  <FaDatabase
                    className="text-blue-500"
                    size={30}
                  />

                </div>

              </div>


              {/* READMISSIONS */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Readmissions
                    </p>

                    <h2 className="text-3xl font-bold text-orange-600 mt-2">
                      {readmissionCount}
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                      Readmission analytics
                    </p>

                  </div>

                  <FaHospitalUser
                    className="text-orange-500"
                    size={30}
                  />

                </div>

              </div>


              {/* TREATMENT */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Treatment Records
                    </p>

                    <h2 className="text-3xl font-bold text-purple-600 mt-2">
                      {treatmentCount}
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                      Treatment outcome analysis
                    </p>

                  </div>

                  <FaProcedures
                    className="text-purple-500"
                    size={30}
                  />

                </div>

              </div>


              {/* FOLLOW UPS */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Follow-ups
                    </p>

                    <h2 className="text-3xl font-bold text-green-600 mt-2">
                      {followUpCount}
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                      Outcome monitoring
                    </p>

                  </div>

                  <FaCheckCircle
                    className="text-green-500"
                    size={30}
                  />

                </div>

              </div>

            </div>


            {/* =================================================
                POPULATION HEALTH
            ================================================= */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* AGE DISTRIBUTION */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center gap-3 mb-5">

                  <FaChartBar
                    className="text-blue-500"
                    size={22}
                  />

                  <div>

                    <h2 className="text-xl font-semibold text-slate-800">
                      Population Health
                    </h2>

                    <p className="text-sm text-gray-500">
                      Age distribution of the research
                      population.
                    </p>

                  </div>

                </div>

                <div className="space-y-3">

                  {Object.entries(
                    ageDistribution
                  ).map(([group, count]) => (

                    <div
                      key={group}
                      className="flex items-center justify-between border-b pb-3"
                    >

                      <span className="text-gray-600">
                        {group}
                      </span>

                      <span className="font-semibold text-slate-800">
                        {count}
                      </span>

                    </div>

                  ))}

                </div>

              </div>


              {/* RISK DISTRIBUTION */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex items-center gap-3 mb-5">

                  <FaExclamationTriangle
                    className="text-red-500"
                    size={22}
                  />

                  <div>

                    <h2 className="text-xl font-semibold text-slate-800">
                      Risk Distribution
                    </h2>

                    <p className="text-sm text-gray-500">
                      Aggregated patient risk categories.
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-3 gap-4">

                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">

                    <p className="text-sm text-green-700">
                      Low
                    </p>

                    <p className="text-2xl font-bold text-green-700 mt-2">
                      {riskDistribution.LOW ?? 0}
                    </p>

                  </div>

                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-center">

                    <p className="text-sm text-yellow-700">
                      Medium
                    </p>

                    <p className="text-2xl font-bold text-yellow-700 mt-2">
                      {riskDistribution.MEDIUM ?? 0}
                    </p>

                  </div>

                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">

                    <p className="text-sm text-red-700">
                      High
                    </p>

                    <p className="text-2xl font-bold text-red-700 mt-2">
                      {riskDistribution.HIGH ?? 0}
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                CLINICAL OUTCOMES
            ================================================= */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex items-center gap-3 mb-5">

                <FaHeartbeat
                  className="text-red-500"
                  size={22}
                />

                <div>

                  <h2 className="text-xl font-semibold text-slate-800">
                    Clinical Outcomes
                  </h2>

                  <p className="text-sm text-gray-500">
                    Aggregated patient outcome distribution.
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                {Object.entries(
                  statusDistribution
                ).map(([status, count]) => (

                  <div
                    key={status}
                    className="border rounded-lg p-5"
                  >

                    <p className="text-sm text-gray-500">
                      {status}
                    </p>

                    <p className="text-2xl font-bold text-slate-800 mt-2">
                      {count}
                    </p>

                  </div>

                ))}

              </div>

            </div>


            {/* =================================================
                DISEASE / POPULATION ANALYSIS
            ================================================= */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex items-center gap-3 mb-5">

                <FaHospitalUser
                  className="text-purple-500"
                  size={22}
                />

                <div>

                  <h2 className="text-xl font-semibold text-slate-800">
                    Population Disease Distribution
                  </h2>

                  <p className="text-sm text-gray-500">
                    Aggregated disease distribution for
                    healthcare research.
                  </p>

                </div>

              </div>

              {Object.keys(
                diseaseDistribution
              ).length === 0 ? (

                <p className="text-gray-500">
                  No population disease data available.
                </p>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                  {Object.entries(
                    diseaseDistribution
                  ).map(([disease, count]) => (

                    <div
                      key={disease}
                      className="border rounded-lg p-5"
                    >

                      <p className="text-sm text-gray-500">
                        {disease}
                      </p>

                      <p className="text-2xl font-bold text-slate-800 mt-2">
                        {count}
                      </p>

                    </div>

                  ))}

                </div>

              )}

            </div>


            {/* =================================================
                RESEARCH ACCESS
            ================================================= */}

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">

              <div className="flex items-center gap-3 mb-3">

                <FaFlask
                  className="text-purple-600"
                  size={22}
                />

                <h2 className="text-xl font-semibold text-purple-900">
                  Research Access
                </h2>

              </div>

              <p className="text-purple-800 text-sm leading-6">
                Research analytics are provided using
                anonymized and aggregated healthcare data.
                Personally identifiable patient information
                is not exposed through the research dashboard.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

                <div className="bg-white rounded-lg p-4">

                  <FaDatabase
                    className="text-blue-500 mb-2"
                    size={20}
                  />

                  <p className="font-semibold text-slate-800">
                    Anonymized Datasets
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Research datasets without direct
                    patient identifiers.
                  </p>

                </div>


                <div className="bg-white rounded-lg p-4">

                  <FaChartBar
                    className="text-purple-500 mb-2"
                    size={20}
                  />

                  <p className="font-semibold text-slate-800">
                    Healthcare Analytics
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Population and outcome analysis.
                  </p>

                </div>


                <div className="bg-white rounded-lg p-4">

                  <FaUserMd
                    className="text-green-500 mb-2"
                    size={20}
                  />

                  <p className="font-semibold text-slate-800">
                    Restricted Clinical Access
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Patient records and clinical decisions
                    remain restricted.
                  </p>

                </div>

              </div>

            </div>

          </>
        )}

      </div>
    </DashboardLayout>
  );
}

export default ResearchDashboard;