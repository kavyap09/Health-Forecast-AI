import { useEffect, useState } from "react";
import {
  FaUsers,
  FaChartBar,
  FaHeartbeat,
  FaFlask,
} from "react-icons/fa";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function PopulationHealth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPopulationHealth = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/api/research/population-health"
        );

        setData(response.data);
      } catch (err) {
        console.error(
          "Population health error:",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load population health statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPopulationHealth();
  }, []);

  const ageDistribution =
    data?.age_distribution || {};

  const diseaseDistribution =
    data?.disease_distribution || {};

  const riskDistribution =
    data?.risk_distribution || {};

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div>

          <div className="flex items-center gap-3">

            <div className="bg-blue-100 p-3 rounded-xl">
              <FaUsers
                className="text-blue-600"
                size={25}
              />
            </div>

            <div>

              <h1 className="text-3xl font-bold text-slate-800">
                Population Health
              </h1>

              <p className="text-gray-500 mt-1">
                Population-level healthcare statistics
                for research and analysis.
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-5">

            <p className="font-semibold">
              Unable to load population health
            </p>

            <p className="text-sm mt-2">
              {error}
            </p>

          </div>
        )}


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="bg-white rounded-xl shadow p-8 text-center">

            <p className="text-gray-500">
              Loading population health statistics...
            </p>

          </div>

        ) : (

          <>

            {/* =================================================
                TOTAL POPULATION
            ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex justify-between items-center">

                  <div>

                    <p className="text-sm text-gray-500">
                      Total Population
                    </p>

                    <p className="text-3xl font-bold text-slate-800 mt-2">
                      {data?.total_population ?? 0}
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
                      Age Groups
                    </p>

                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {Object.keys(
                        ageDistribution
                      ).length}
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
                      Risk Categories
                    </p>

                    <p className="text-3xl font-bold text-red-600 mt-2">
                      {Object.keys(
                        riskDistribution
                      ).length}
                    </p>

                  </div>

                  <FaHeartbeat
                    className="text-red-500"
                    size={30}
                  />

                </div>

              </div>

            </div>


            {/* =================================================
                AGE DISTRIBUTION
            ================================================= */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex items-center gap-3 mb-5">

                <FaChartBar
                  className="text-blue-500"
                  size={22}
                />

                <div>

                  <h2 className="text-xl font-semibold text-slate-800">
                    Age Distribution
                  </h2>

                  <p className="text-sm text-gray-500">
                    Distribution of the research population
                    by age group.
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                {Object.entries(
                  ageDistribution
                ).map(([group, count]) => (

                  <div
                    key={group}
                    className="border rounded-xl p-5"
                  >

                    <p className="text-sm text-gray-500">
                      {group}
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

            </div>


            {/* =================================================
                RISK DISTRIBUTION
            ================================================= */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex items-center gap-3 mb-5">

                <FaHeartbeat
                  className="text-red-500"
                  size={22}
                />

                <div>

                  <h2 className="text-xl font-semibold text-slate-800">
                    Risk Distribution
                  </h2>

                  <p className="text-sm text-gray-500">
                    Aggregated risk categories across the
                    population.
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <div className="bg-green-50 border border-green-100 rounded-xl p-6">

                  <p className="text-sm text-green-700">
                    Low Risk
                  </p>

                  <p className="text-3xl font-bold text-green-700 mt-2">
                    {riskDistribution.LOW ?? 0}
                  </p>

                </div>


                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">

                  <p className="text-sm text-yellow-700">
                    Medium Risk
                  </p>

                  <p className="text-3xl font-bold text-yellow-700 mt-2">
                    {riskDistribution.MEDIUM ?? 0}
                  </p>

                </div>


                <div className="bg-red-50 border border-red-100 rounded-xl p-6">

                  <p className="text-sm text-red-700">
                    High Risk
                  </p>

                  <p className="text-3xl font-bold text-red-700 mt-2">
                    {riskDistribution.HIGH ?? 0}
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                DISEASE DISTRIBUTION
            ================================================= */}

            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex items-center gap-3 mb-5">

                <FaFlask
                  className="text-purple-500"
                  size={22}
                />

                <div>

                  <h2 className="text-xl font-semibold text-slate-800">
                    Disease Distribution
                  </h2>

                  <p className="text-sm text-gray-500">
                    Aggregated disease distribution within
                    the research population.
                  </p>

                </div>

              </div>

              {Object.keys(
                diseaseDistribution
              ).length === 0 ? (

                <p className="text-gray-500">
                  No disease distribution data available.
                </p>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                  {Object.entries(
                    diseaseDistribution
                  ).map(([disease, count]) => (

                    <div
                      key={disease}
                      className="border rounded-xl p-5"
                    >

                      <p className="text-sm text-gray-500">
                        {disease}
                      </p>

                      <p className="text-2xl font-bold text-slate-800 mt-2">
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


            {/* =================================================
                RESEARCH PRIVACY NOTICE
            ================================================= */}

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">

              <div className="flex items-center gap-3 mb-3">

                <FaFlask
                  className="text-purple-600"
                  size={22}
                />

                <h2 className="text-lg font-semibold text-purple-900">
                  Research Data Privacy
                </h2>

              </div>

              <p className="text-sm text-purple-800 leading-6">
                Population health statistics are presented
                in aggregated form for healthcare research.
                Personally identifiable patient information
                is not displayed on this page.
              </p>

            </div>

          </>

        )}

      </div>
    </DashboardLayout>
  );
}

export default PopulationHealth;