import { useEffect, useState } from "react";
import {
  FaHospital,
  FaChartLine,
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function ReadmissionTrends() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReadmissionTrends = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/api/research/readmission-trends"
        );

        setData(response.data);
      } catch (err) {
        console.error(
          "Readmission trends error:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load readmission trends."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReadmissionTrends();
  }, []);

  const totalPatients =
    data?.total_patients ?? 0;

  const readmitted =
    data?.readmitted ?? 0;

  const notReadmitted =
    data?.not_readmitted ?? 0;

  const readmissionRate =
    data?.readmission_rate ?? 0;

  const distribution =
    data?.distribution || {};

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">

        {/* HEADER */}

        <div>

          <div className="flex items-center gap-3">

            <div className="bg-orange-100 p-3 rounded-xl">
              <FaChartLine
                className="text-orange-600"
                size={25}
              />
            </div>

            <div>

              <h1 className="text-3xl font-bold text-slate-800">
                Readmission Trends
              </h1>

              <p className="text-gray-500 mt-1">
                Aggregated readmission statistics for
                healthcare research and analysis.
              </p>

            </div>

          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-5">

            <p className="font-semibold">
              Unable to load readmission trends
            </p>

            <p className="text-sm mt-2">
              {error}
            </p>

          </div>
        )}


        {/* LOADING */}

        {loading ? (

          <div className="bg-white rounded-xl shadow p-8 text-center">

            <p className="text-gray-500">
              Loading readmission trends...
            </p>

          </div>

        ) : (

          <>

            {/* SUMMARY CARDS */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

              {/* TOTAL */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex justify-between items-center">

                  <div>

                    <p className="text-sm text-gray-500">
                      Total Patients
                    </p>

                    <p className="text-3xl font-bold text-slate-800 mt-2">
                      {totalPatients}
                    </p>

                  </div>

                  <FaUsers
                    className="text-blue-500"
                    size={30}
                  />

                </div>

              </div>


              {/* READMITTED */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex justify-between items-center">

                  <div>

                    <p className="text-sm text-gray-500">
                      Readmitted
                    </p>

                    <p className="text-3xl font-bold text-orange-600 mt-2">
                      {readmitted}
                    </p>

                  </div>

                  <FaExclamationTriangle
                    className="text-orange-500"
                    size={30}
                  />

                </div>

              </div>


              {/* NOT READMITTED */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex justify-between items-center">

                  <div>

                    <p className="text-sm text-gray-500">
                      Not Readmitted
                    </p>

                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {notReadmitted}
                    </p>

                  </div>

                  <FaCheckCircle
                    className="text-green-500"
                    size={30}
                  />

                </div>

              </div>


              {/* RATE */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex justify-between items-center">

                  <div>

                    <p className="text-sm text-gray-500">
                      Readmission Rate
                    </p>

                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {readmissionRate}%
                    </p>

                  </div>

                  <FaChartLine
                    className="text-purple-500"
                    size={30}
                  />

                </div>

              </div>

            </div>


            {/* READMISSION ANALYSIS */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex items-center gap-3 mb-5">

                <FaHospital
                  className="text-orange-500"
                  size={22}
                />

                <div>

                  <h2 className="text-xl font-semibold text-slate-800">
                    Readmission Analysis
                  </h2>

                  <p className="text-sm text-gray-500">
                    Aggregated readmission outcomes across
                    the available research population.
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">

                  <p className="text-sm text-orange-700">
                    Readmitted Patients
                  </p>

                  <p className="text-3xl font-bold text-orange-700 mt-2">
                    {readmitted}
                  </p>

                  <p className="text-sm text-orange-600 mt-2">
                    {readmissionRate}% of available
                    patient records
                  </p>

                </div>


                <div className="bg-green-50 border border-green-100 rounded-xl p-6">

                  <p className="text-sm text-green-700">
                    Patients Not Readmitted
                  </p>

                  <p className="text-3xl font-bold text-green-700 mt-2">
                    {notReadmitted}
                  </p>

                  <p className="text-sm text-green-600 mt-2">
                    Records without a detected
                    readmission
                  </p>

                </div>

              </div>

            </div>


            {/* DISTRIBUTION */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex items-center gap-3 mb-5">

                <FaChartLine
                  className="text-blue-500"
                  size={22}
                />

                <div>

                  <h2 className="text-xl font-semibold text-slate-800">
                    Readmission Distribution
                  </h2>

                  <p className="text-sm text-gray-500">
                    Aggregated readmission categories in
                    the research dataset.
                  </p>

                </div>

              </div>

              {Object.keys(distribution).length === 0 ? (

                <p className="text-gray-500">
                  No readmission distribution data
                  available.
                </p>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                  {Object.entries(
                    distribution
                  ).map(([category, count]) => (

                    <div
                      key={category}
                      className="border rounded-xl p-5"
                    >

                      <p className="text-sm text-gray-500">
                        {category}
                      </p>

                      <p className="text-3xl font-bold text-slate-800 mt-2">
                        {count}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Records
                      </p>

                    </div>

                  ))}

                </div>

              )}

            </div>


            {/* RESEARCH NOTICE */}

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">

              <h2 className="text-lg font-semibold text-purple-900 mb-2">
                Research Data Privacy
              </h2>

              <p className="text-sm text-purple-800 leading-6">
                Readmission information is presented only
                as aggregated statistics. Individual patient
                identities and personally identifiable
                information are not displayed.
              </p>

            </div>

          </>

        )}

      </div>
    </DashboardLayout>
  );
}

export default ReadmissionTrends;