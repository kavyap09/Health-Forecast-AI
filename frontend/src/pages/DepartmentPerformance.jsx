import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

import {
  FaBuilding,
  FaUserMd,
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarCheck,
  FaPills,
  FaChartBar,
} from "react-icons/fa";

function DepartmentPerformance() {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD DEPARTMENT PERFORMANCE
  // =====================================================

  useEffect(() => {

    const loadDepartmentPerformance = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await api.get(
          "/api/analytics/department-performance"
        );

        setData(response.data);

      } catch (error) {

        console.error(
          "Department performance error:",
          error
        );

        setError(
          error.response?.data?.detail ||
          "Unable to load department performance."
        );

      } finally {

        setLoading(false);

      }
    };

    loadDepartmentPerformance();

  }, []);


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <DashboardLayout>

        <div className="flex items-center justify-center min-h-[400px]">

          <p className="text-gray-500 text-lg">
            Loading department performance...
          </p>

        </div>

      </DashboardLayout>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (
      <DashboardLayout>

        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6">

          <p className="font-semibold">
            Unable to load department performance
          </p>

          <p className="text-sm mt-2">
            {error}
          </p>

        </div>

      </DashboardLayout>
    );
  }


  const summary = data?.summary || {};
  const departments = data?.departments || [];


  return (
    <DashboardLayout>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Department Performance
        </h1>

        <p className="text-gray-500 mt-1">
          Monitor department-wise hospital performance,
          patient workload, risk levels and treatment activity.
        </p>

      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        {/* Departments */}

        <div className="bg-white rounded-xl shadow p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Departments
              </p>

              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {summary.total_departments || 0}
              </h2>

            </div>

            <FaBuilding
              className="text-blue-600"
              size={30}
            />

          </div>

        </div>


        {/* Doctors */}

        <div className="bg-white rounded-xl shadow p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Doctors
              </p>

              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {summary.total_doctors || 0}
              </h2>

            </div>

            <FaUserMd
              className="text-purple-600"
              size={30}
            />

          </div>

        </div>


        {/* Patients */}

        <div className="bg-white rounded-xl shadow p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                Total Patients
              </p>

              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {summary.total_patients || 0}
              </h2>

            </div>

            <FaUsers
              className="text-green-600"
              size={30}
            />

          </div>

        </div>


        {/* High Risk */}

        <div className="bg-white rounded-xl shadow p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500">
                High-Risk Patients
              </p>

              <h2 className="text-3xl font-bold text-red-600 mt-2">
                {summary.high_risk_patients || 0}
              </h2>

            </div>

            <FaExclamationTriangle
              className="text-red-500"
              size={30}
            />

          </div>

        </div>

      </div>


      {/* =================================================
          DEPARTMENT TABLE
      ================================================= */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="p-6 border-b">

          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">

            <FaChartBar className="text-blue-600" />

            Department Overview

          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Performance based on registered doctors and
            patients assigned to them.
          </p>

        </div>


        {departments.length === 0 ? (

          <div className="p-10 text-center text-gray-500">

            No department data available yet.

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Department
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                    Doctors
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                    Patients
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold text-red-600">
                    High Risk
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold text-yellow-600">
                    Medium Risk
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold text-green-600">
                    Low Risk
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                    Readmitted
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                    Treatments
                  </th>

                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                    Follow-ups
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y">

                {departments.map(
                  (department) => (

                    <tr
                      key={department.department}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <div className="font-semibold text-slate-800">
                          {department.department}
                        </div>

                        {department.doctors?.length > 0 && (

                          <div className="text-xs text-gray-500 mt-1">

                            {department.doctors
                              .map(
                                (doctor) =>
                                  doctor.name
                              )
                              .join(", ")}

                          </div>

                        )}

                      </td>


                      <td className="text-center px-6 py-4">

                        {department.doctor_count}

                      </td>


                      <td className="text-center px-6 py-4 font-semibold">

                        {department.patient_count}

                      </td>


                      <td className="text-center px-6 py-4">

                        <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">

                          {department.high_risk}

                        </span>

                      </td>


                      <td className="text-center px-6 py-4">

                        <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">

                          {department.medium_risk}

                        </span>

                      </td>


                      <td className="text-center px-6 py-4">

                        <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">

                          {department.low_risk}

                        </span>

                      </td>


                      <td className="text-center px-6 py-4">

                        {department.readmitted_patients}

                      </td>


                      <td className="text-center px-6 py-4">

                        <span className="inline-flex items-center gap-1">

                          <FaPills className="text-purple-500" />

                          {department.treatment_plans}

                        </span>

                      </td>


                      <td className="text-center px-6 py-4">

                        <span className="inline-flex items-center gap-1">

                          <FaCalendarCheck className="text-blue-500" />

                          {department.follow_ups}

                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =================================================
          RISK SUMMARY
      ================================================= */}

      <div className="grid md:grid-cols-3 gap-6 mt-8">

        <div className="bg-red-50 border border-red-100 rounded-xl p-6">

          <div className="flex items-center gap-3">

            <FaExclamationTriangle className="text-red-600" />

            <h3 className="font-semibold text-red-800">
              High Risk
            </h3>

          </div>

          <p className="text-3xl font-bold text-red-700 mt-3">
            {summary.high_risk_patients || 0}
          </p>

          <p className="text-sm text-red-600 mt-1">
            Patients requiring closer monitoring
          </p>

        </div>


        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">

          <div className="flex items-center gap-3">

            <FaChartBar className="text-yellow-600" />

            <h3 className="font-semibold text-yellow-800">
              Medium Risk
            </h3>

          </div>

          <p className="text-3xl font-bold text-yellow-700 mt-3">
            {summary.medium_risk_patients || 0}
          </p>

          <p className="text-sm text-yellow-600 mt-1">
            Patients requiring regular monitoring
          </p>

        </div>


        <div className="bg-green-50 border border-green-100 rounded-xl p-6">

          <div className="flex items-center gap-3">

            <FaCheckCircle className="text-green-600" />

            <h3 className="font-semibold text-green-800">
              Low Risk
            </h3>

          </div>

          <p className="text-3xl font-bold text-green-700 mt-3">
            {summary.low_risk_patients || 0}
          </p>

          <p className="text-sm text-green-600 mt-1">
            Patients with lower predicted risk
          </p>

        </div>

      </div>

    </DashboardLayout>
  );
}

export default DepartmentPerformance;