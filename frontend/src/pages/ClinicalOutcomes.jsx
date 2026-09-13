import { useEffect, useState } from "react";
import {
  FaHeartbeat,
  FaChartBar,
  FaCheckCircle,
  FaUsers,
} from "react-icons/fa";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function ClinicalOutcomes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadClinicalOutcomes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/api/research/clinical-outcomes"
        );

        setData(response.data);
      } catch (err) {
        console.error(
          "Clinical outcomes error:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load clinical outcomes."
        );
      } finally {
        setLoading(false);
      }
    };

    loadClinicalOutcomes();
  }, []);

  const outcomes = data?.outcomes || {};
  const percentages =
    data?.outcome_percentages || {};

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">

        {/* HEADER */}

        <div>

          <div className="flex items-center gap-3">

            <div className="bg-red-100 p-3 rounded-xl">
              <FaHeartbeat
                className="text-red-600"
                size={25}
              />
            </div>

            <div>

              <h1 className="text-3xl font-bold text-slate-800">
                Clinical Outcomes
              </h1>

              <p className="text-gray-500 mt-1">
                Aggregated clinical outcome analysis
                for healthcare research.
              </p>

            </div>

          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-5">

            <p className="font-semibold">
              Unable to load clinical outcomes
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
              Loading clinical outcomes...
            </p>

          </div>

        ) : (

          <>

            {/* TOTAL PATIENTS */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex justify-between items-center">

                  <div>

                    <p className="text-sm text-gray-500">
                      Total Records
                    </p>

                    <p className="text-3xl font-bold text-slate-800 mt-2">
                      {data?.total_patients ?? 0}
                    </p>

                  </div>

                  <FaUsers
                    className="text-blue-500"
                    size={30}
                  />

                </div>

              </div>


              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex justify-between items-center">

                  <div>

                    <p className="text-sm text-gray-500">
                      Outcome Categories
                    </p>

                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {Object.keys(outcomes).length}
                    </p>

                  </div>

                  <FaChartBar
                    className="text-purple-500"
                    size={30}
                  />

                </div>

              </div>


              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex justify-between items-center">

                  <div>

                    <p className="text-sm text-gray-500">
                      Recovered
                    </p>

                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {outcomes.Recovered ?? 0}
                    </p>

                  </div>

                  <FaCheckCircle
                    className="text-green-500"
                    size={30}
                  />

                </div>

              </div>

            </div>


            {/* OUTCOME DISTRIBUTION */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex items-center gap-3 mb-6">

                <FaHeartbeat
                  className="text-red-500"
                  size={22}
                />

                <div>

                  <h2 className="text-xl font-semibold text-slate-800">
                    Clinical Outcome Distribution
                  </h2>

                  <p className="text-sm text-gray-500">
                    Distribution of clinical outcomes
                    across the research population.
                  </p>

                </div>

              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                {Object.entries(outcomes).map(
                  ([outcome, count]) => (

                    <div
                      key={outcome}
                      className="border rounded-xl p-5"
                    >

                      <p className="text-sm text-gray-500">
                        {outcome}
                      </p>

                      <p className="text-3xl font-bold text-slate-800 mt-2">
                        {count}
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        {percentages[outcome] ?? 0}%
                      </p>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* OUTCOME ANALYSIS */}

            <div className="bg-white rounded-xl shadow p-6">

              <h2 className="text-xl font-semibold text-slate-800 mb-5">
                Outcome Analysis
              </h2>

              <div className="space-y-4">

                {Object.entries(outcomes).map(
                  ([outcome, count]) => {

                    const percentage =
                      percentages[outcome] ?? 0;

                    return (
                      <div key={outcome}>

                        <div className="flex justify-between mb-2">

                          <span className="font-medium text-slate-700">
                            {outcome}
                          </span>

                          <span className="text-sm text-gray-500">
                            {count} records ({percentage}%)
                          </span>

                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3">

                          <div
                            className="bg-blue-500 h-3 rounded-full"
                            style={{
                              width: `${Math.min(
                                percentage,
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>


            {/* PRIVACY NOTICE */}

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">

              <h2 className="text-lg font-semibold text-purple-900 mb-2">
                Research Data Privacy
              </h2>

              <p className="text-sm text-purple-800 leading-6">
                Clinical outcome information is displayed
                only in aggregated form for healthcare
                research. Personally identifiable patient
                information is not exposed.
              </p>

            </div>

          </>

        )}

      </div>
    </DashboardLayout>
  );
}

export default ClinicalOutcomes;