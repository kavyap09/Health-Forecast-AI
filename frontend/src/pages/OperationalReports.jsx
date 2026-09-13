import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

import {
  FaFileMedical,
  FaDownload,
  FaPrint,
  FaChartBar,
  FaExclamationTriangle,
  FaUsers,
  FaHospital,
  FaPills,
  FaCalendarCheck,
  FaCheckCircle,
} from "react-icons/fa";

function OperationalReports() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  const isDoctor = role === "Doctor";
  const isHospitalAdmin = role === "Hospital Administrator";

  // =====================================================
  // STATE
  // =====================================================

  const [reportType, setReportType] = useState("");
  const [patientId, setPatientId] = useState("");
  const [department, setDepartment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");

  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDepartments, setLoadingDepartments] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // REPORT TYPES
  // =====================================================

  const doctorReportTypes = [
    {
      value: "patient_outcome",
      label: "Patient Outcome Report",
    },
   
  ];

  const hospitalReportTypes = [
    {
      value: "hospital_performance",
      label: "Hospital Performance Report",
    },
    {
      value: "department_performance",
      label: "Department Performance Report",
    },
    {
      value: "readmission",
      label: "Readmission Report",
    },
    {
      value: "treatment_outcome",
      label: "Treatment Outcome Report",
    },
  ];

  const reportTypes = isDoctor
    ? doctorReportTypes
    : hospitalReportTypes;

  // =====================================================
  // PATIENT-LEVEL REPORT TYPES
  // =====================================================

  const patientLevelReports = [
    "patient_outcome",
    "treatment_followup",
    "readmission",
    "treatment_outcome",
  ];

  const isPatientLevelReport =
    patientLevelReports.includes(reportType);

  const isHospitalLevelReport =
    reportType === "hospital_performance" ||
    reportType === "department_performance";

  // =====================================================
  // LOAD PATIENTS
  // DOCTOR + HOSPITAL ADMIN
  // =====================================================

  useEffect(() => {
    if (!isDoctor && !isHospitalAdmin) {
      return;
    }

    const loadPatients = async () => {
      try {
        setLoadingPatients(true);

        const response = await api.get("/api/patients");

        setPatients(response.data || []);
      } catch (error) {
        console.error("Patient loading error:", error);

        setPatients([]);

        setError(
          error.response?.data?.detail ||
            "Unable to load patients."
        );
      } finally {
        setLoadingPatients(false);
      }
    };

    loadPatients();
  }, [isDoctor, isHospitalAdmin]);

  // =====================================================
  // LOAD DEPARTMENTS
  // ONLY HOSPITAL ADMINISTRATOR
  // =====================================================

  useEffect(() => {
    if (!isHospitalAdmin) {
      return;
    }

    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);

        const response = await api.get(
          "/api/analytics/department-performance"
        );

        setDepartments(
          response.data?.departments || []
        );
      } catch (error) {
        console.error(
          "Department loading error:",
          error
        );

        // Department loading should not block
        // Operational Reports.
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, [isHospitalAdmin]);

  // =====================================================
  // ACCESS CHECK
  // =====================================================

  if (!isDoctor && !isHospitalAdmin) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6">
          <p className="font-semibold">
            Access denied
          </p>

          <p className="text-sm mt-2">
            You do not have permission to access
            Operational Reports.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // REPORT TYPE CHANGE
  // =====================================================

  const handleReportTypeChange = (value) => {
    setReportType(value);

    // Reset report-specific values
    setPatientId("");
    setDepartment("");
    setStartDate("");
    setEndDate("");
    setCurrentStatus("");

    setData(null);
    setError("");
    setSuccess("");
  };

  // =====================================================
  // GENERATE REPORT
  // =====================================================

  const generateReport = async () => {
    setError("");
    setSuccess("");

    // ---------------------------------------------
    // REPORT TYPE VALIDATION
    // ---------------------------------------------

    if (!reportType) {
      setError("Please select a report type.");
      return;
    }

    // ---------------------------------------------
    // DOCTOR VALIDATION
    // ---------------------------------------------

    if (isDoctor) {
      if (!patientId) {
        setError("Please select a patient.");
        return;
      }

      if (!startDate) {
        setError("Please select a start date.");
        return;
      }

      if (!endDate) {
        setError("Please select an end date.");
        return;
      }

      if (startDate > endDate) {
        setError(
          "Start date cannot be later than end date."
        );
        return;
      }

      if (!currentStatus) {
        setError("Please select the current status.");
        return;
      }
    }

    // ---------------------------------------------
    // HOSPITAL ADMIN PATIENT-LEVEL VALIDATION
    // ---------------------------------------------

    if (
      isHospitalAdmin &&
      isPatientLevelReport &&
      !patientId
    ) {
      setError(
        "Please select a patient for this report."
      );
      return;
    }

    try {
      setLoading(true);
      setData(null);

      const payload = {
        report_type: reportType,
        patient_id: patientId || null,
        department: department || null,
        start_date: startDate || null,
        end_date: endDate || null,
        current_status: currentStatus || null,
      };

      const response = await api.post(
        "/api/reports/operational",
        payload
      );

      setData(response.data);

      setSuccess(
        "Operational report generated successfully."
      );
    } catch (error) {
      console.error(
        "Operational report error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Unable to generate operational report."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DOWNLOAD PDF
  // =====================================================

  const downloadPDF = async () => {
    setError("");
    setSuccess("");

    if (!reportType) {
      setError(
        "Please select a report type first."
      );
      return;
    }

    // ---------------------------------------------
    // DOCTOR VALIDATION
    // ---------------------------------------------

    if (isDoctor) {
      if (!patientId) {
        setError("Please select a patient.");
        return;
      }

      if (!startDate) {
        setError("Please select a start date.");
        return;
      }

      if (!endDate) {
        setError("Please select an end date.");
        return;
      }

      if (startDate > endDate) {
        setError(
          "Start date cannot be later than end date."
        );
        return;
      }

      if (!currentStatus) {
        setError("Please select the current status.");
        return;
      }
    }

    // ---------------------------------------------
    // HOSPITAL ADMIN VALIDATION
    // ---------------------------------------------

    if (
      isHospitalAdmin &&
      isPatientLevelReport &&
      !patientId
    ) {
      setError(
        "Please select a patient for this report."
      );
      return;
    }

    try {
      const payload = {
        report_type: reportType,
        patient_id: patientId || null,
        department: department || null,
        start_date: startDate || null,
        end_date: endDate || null,
        current_status: currentStatus || null,
      };

      const response = await api.post(
        "/api/reports/operational/pdf",
        payload,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url =
        window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      const safeReportName =
        reportType.replaceAll("_", "-");

      const selectedPatient =
        patients.find(
          (patient) =>
            String(patient._id || patient.id) ===
            String(patientId)
        );

      const patientName =
        selectedPatient?.name
          ?.replace(/[^a-zA-Z0-9]/g, "-")
          .toLowerCase() || "";

      link.download = patientName
        ? `operational-report-${safeReportName}-${patientName}.pdf`
        : `operational-report-${safeReportName}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setSuccess(
        "Operational report PDF downloaded successfully."
      );
    } catch (error) {
      console.error(
        "Operational report PDF error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Unable to download operational report PDF."
      );
    }
  };

  // =====================================================
  // PRINT
  // =====================================================

  const printReport = () => {
    if (!data) {
      setError(
        "Generate a report before printing."
      );
      return;
    }

    window.print();
  };

  // =====================================================
  // HELPERS
  // Backend returns statistics at top-level.
  // Keep fallback support for nested structures too.
  // =====================================================

  const summary = data?.summary || {};

  const riskDistribution =
    data?.risk_distribution || {};

  const operationalStats =
    data?.operational_stats || {};

  const reportDepartments =
    data?.departments || [];

  const totalPatients =
    data?.total_patients ??
    summary.total_patients ??
    0;

  const highRisk =
    data?.high_risk ??
    data?.high_risk_patients ??
    summary.high_risk_patients ??
    riskDistribution.high ??
    0;

  const mediumRisk =
    data?.medium_risk ??
    data?.medium_risk_patients ??
    summary.medium_risk_patients ??
    riskDistribution.medium ??
    0;

  const lowRisk =
    data?.low_risk ??
    data?.low_risk_patients ??
    summary.low_risk_patients ??
    riskDistribution.low ??
    0;

  const readmitted =
    data?.readmitted ??
    data?.readmitted_patients ??
    data?.readmissions ??
    summary.readmitted_patients ??
    summary.readmissions ??
    0;

  const treatmentPlans =
    data?.treatment_plans ??
    summary.treatment_plans ??
    0;

  const followUps =
    data?.follow_ups ??
    summary.follow_ups ??
    0;

  // =====================================================
  // UI
  // =====================================================

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="bg-blue-100 p-3 rounded-xl">
              <FaFileMedical
                className="text-blue-600"
                size={25}
              />
            </div>

            <div>

   <h1 className="text-3xl font-bold text-slate-800">
  {isDoctor ? "Generate Outcome Reports" : "Operational Reports"}
</h1>
<p className="text-gray-500 mt-1">
  {isDoctor
    ? "Generate patient outcome reports using hospital patient data."
    : "Generate operational and performance reports using hospital patient data."}
</p>

            </div>

          </div>

        </div>


        {/* =================================================
            REPORT CONFIGURATION
        ================================================= */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-bold text-slate-800 mb-6">
            Generate Report
          </h2>


          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

            {/* =================================================
                REPORT TYPE
            ================================================= */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Report Type
              </label>

              <select
                value={reportType}
                onChange={(e) =>
                  handleReportTypeChange(
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="">
                  Select report type
                </option>

                {reportTypes.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ))}

              </select>

            </div>


            {/* =================================================
                PATIENT
            ================================================= */}

            {(isDoctor ||
              (isHospitalAdmin &&
                isPatientLevelReport)) && (

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient
                  {isDoctor && (
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  )}
                </label>

                <select
                  value={patientId}
                  onChange={(e) => {
                    setPatientId(e.target.value);
                    setData(null);
                    setError("");
                    setSuccess("");
                  }}
                  disabled={loadingPatients}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="">
                    {loadingPatients
                      ? "Loading patients..."
                      : "Select patient"}
                  </option>

                  {patients.map((patient) => {

                    const id =
                      patient._id ||
                      patient.id;

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {patient.name}
                        {patient.age
                          ? ` - Age ${patient.age}`
                          : ""}
                      </option>
                    );
                  })}

                </select>

              </div>
            )}


            {/* =================================================
                DEPARTMENT
                HOSPITAL ADMIN ONLY
            ================================================= */}

            {isHospitalAdmin && (
              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department
                </label>

                <select
                  value={department}
                  onChange={(e) => {
                    setDepartment(
                      e.target.value
                    );
                    setData(null);
                  }}
                  disabled={loadingDepartments}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="">
                    {loadingDepartments
                      ? "Loading departments..."
                      : "All Departments"}
                  </option>

                  {departments.map((item) => (
                    <option
                      key={item.department}
                      value={item.department}
                    >
                      {item.department}
                    </option>
                  ))}

                </select>

              </div>
            )}


            {/* =================================================
                START DATE
                DOCTOR ONLY
            ================================================= */}

            {isDoctor && (
              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From Date
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(
                      e.target.value
                    );
                    setData(null);
                    setError("");
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>
            )}


            {/* =================================================
                END DATE
                DOCTOR ONLY
            ================================================= */}

            {isDoctor && (
              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To Date
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(
                      e.target.value
                    );
                    setData(null);
                    setError("");
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>
            )}


            {/* =================================================
                CURRENT STATUS
                DOCTOR ONLY
            ================================================= */}

            {isDoctor && (
              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Status
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <select
                  value={currentStatus}
                  onChange={(e) => {
                    setCurrentStatus(
                      e.target.value
                    );
                    setData(null);
                    setError("");
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="">
                    Select current status
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Under Treatment">
                    Under Treatment
                  </option>

                  <option value="Recovered">
                    Recovered
                  </option>

                  <option value="Discharged">
                    Discharged
                  </option>

                  <option value="Follow-up">
                    Follow-up
                  </option>

                </select>

              </div>
            )}

          </div>


          {/* =================================================
              REPORT SELECTION INFORMATION
          ================================================= */}

          {reportType && (
            <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg p-4">

              <p className="text-sm text-blue-800">

                {isDoctor && (
                  <>
                    <strong>Doctor report:</strong>{" "}
                    Select a patient, reporting period,
                    and current patient status.
                  </>
                )}

                {isHospitalAdmin &&
                  isPatientLevelReport && (
                    <>
                      <strong>
                        Patient-level report:
                      </strong>{" "}
                      Select the patient whose
                      operational information you
                      want to report.
                    </>
                  )}

                {isHospitalAdmin &&
                  isHospitalLevelReport && (
                    <>
                      <strong>
                        Hospital-level report:
                      </strong>{" "}
                      Generate aggregate operational
                      information for the hospital
                      or selected department.
                    </>
                  )}

              </p>

            </div>
          )}


          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="flex flex-wrap gap-4 mt-6">

            <button
              type="button"
              onClick={generateReport}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-semibold transition"
            >

              <FaChartBar />

              {loading
                ? "Generating..."
                : "Generate Report"}

            </button>


            <button
              type="button"
              onClick={downloadPDF}
              disabled={!reportType}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold transition"
            >

              <FaDownload />

              Download PDF

            </button>


            <button
              type="button"
              onClick={printReport}
              disabled={!data}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold transition"
            >

              <FaPrint />

              Print Report

            </button>

          </div>

        </div>


        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (

          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-5 flex items-center gap-3">

            <FaCheckCircle />

            <span>
              {success}
            </span>

          </div>

        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-5">

            <p className="font-semibold">
              Unable to generate operational report
            </p>

            <p className="text-sm mt-2">
              {error}
            </p>

          </div>

        )}


        {/* =================================================
            REPORT RESULTS
        ================================================= */}

        {data && (

          <div id="operational-report-content">

            {/* =================================================
                REPORT TITLE
            ================================================= */}

            <div className="bg-white rounded-xl shadow p-6 mb-6">

              <div className="flex items-center gap-3">

                <FaFileMedical
                  className="text-blue-600"
                  size={25}
                />

                <div>

                  <h2 className="text-2xl font-bold text-slate-800">
                    {data.report_title ||
                      data.title ||
                      "Operational Report"}
                  </h2>

                  <p className="text-gray-500 mt-1">
                    Generated operational report
                    based on available hospital data.
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                SELECTED PATIENT
            ================================================= */}

            {data.patient && (
              <div className="bg-white rounded-xl shadow p-6 mb-6">

                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  Patient Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

                  <div>
                    <p className="text-sm text-gray-500">
                      Patient
                    </p>

                    <p className="font-semibold text-slate-800 mt-1">
                      {data.patient.name ||
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Age
                    </p>

                    <p className="font-semibold text-slate-800 mt-1">
                      {data.patient.age ??
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Disease
                    </p>

                    <p className="font-semibold text-slate-800 mt-1">
                      {data.patient.disease ||
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Risk
                    </p>

                    <p className="font-semibold text-slate-800 mt-1">
                      {data.patient.risk ||
                        "N/A"}
                    </p>
                  </div>

                </div>

              </div>
            )}


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">

              {/* TOTAL PATIENTS */}

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
                    className="text-blue-600"
                    size={28}
                  />

                </div>

              </div>


              {/* HIGH RISK */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex justify-between items-center">

                  <div>

                    <p className="text-sm text-gray-500">
                      High-Risk Patients
                    </p>

                    <p className="text-3xl font-bold text-red-600 mt-2">
                      {highRisk}
                    </p>

                  </div>

                  <FaExclamationTriangle
                    className="text-red-500"
                    size={28}
                  />

                </div>

              </div>


              {/* READMISSIONS */}

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

                  <FaHospital
                    className="text-orange-500"
                    size={28}
                  />

                </div>

              </div>


              {/* TREATMENTS */}

              <div className="bg-white rounded-xl shadow p-6">

                <div className="flex justify-between items-center">

                  <div>

                    <p className="text-sm text-gray-500">
                      Treatment Plans
                    </p>

                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {treatmentPlans}
                    </p>

                  </div>

                  <FaPills
                    className="text-purple-500"
                    size={28}
                  />

                </div>

              </div>

            </div>


            {/* =================================================
                RISK DISTRIBUTION
            ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

              {/* HIGH */}

              <div className="bg-red-50 border border-red-100 rounded-xl p-6">

                <div className="flex items-center gap-3">

                  <FaExclamationTriangle className="text-red-600" />

                  <h3 className="font-semibold text-red-800">
                    High Risk
                  </h3>

                </div>

                <p className="text-3xl font-bold text-red-700 mt-3">
                  {highRisk}
                </p>

              </div>


              {/* MEDIUM */}

              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">

                <div className="flex items-center gap-3">

                  <FaChartBar className="text-yellow-600" />

                  <h3 className="font-semibold text-yellow-800">
                    Medium Risk
                  </h3>

                </div>

                <p className="text-3xl font-bold text-yellow-700 mt-3">
                  {mediumRisk}
                </p>

              </div>


              {/* LOW */}

              <div className="bg-green-50 border border-green-100 rounded-xl p-6">

                <div className="flex items-center gap-3">

                  <FaCheckCircle className="text-green-600" />

                  <h3 className="font-semibold text-green-800">
                    Low Risk
                  </h3>

                </div>

                <p className="text-3xl font-bold text-green-700 mt-3">
                  {lowRisk}
                </p>

              </div>

            </div>


            {/* =================================================
                OPERATIONAL STATS
            ================================================= */}

            {Object.keys(operationalStats).length > 0 && (

              <div className="bg-white rounded-xl shadow p-6 mb-6">

                <h2 className="text-xl font-bold text-slate-800 mb-5">
                  Operational Statistics
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

                  {Object.entries(
                    operationalStats
                  ).map(([key, value]) => (

                    <div
                      key={key}
                      className="border rounded-lg p-4"
                    >

                      <p className="text-sm text-gray-500 capitalize">
                        {key
                          .replaceAll("_", " ")
                          .replace(
                            /\b\w/g,
                            (letter) =>
                              letter.toUpperCase()
                          )}
                      </p>

                      <p className="text-2xl font-bold text-slate-800 mt-2">
                        {String(value)}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

            )}


            {/* =================================================
                FOLLOW-UP
            ================================================= */}

            {followUps > 0 && (
              <div className="bg-white rounded-xl shadow p-6 mb-6">

                <div className="flex items-center gap-3">

                  <FaCalendarCheck className="text-blue-500" />

                  <div>

                    <p className="text-sm text-gray-500">
                      Follow-ups
                    </p>

                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {followUps}
                    </p>

                  </div>

                </div>

              </div>
            )}


            {/* =================================================
                DEPARTMENT DATA
                HOSPITAL ADMIN ONLY
            ================================================= */}

            {isHospitalAdmin &&
              reportDepartments.length > 0 && (

                <div className="bg-white rounded-xl shadow overflow-hidden mb-6">

                  <div className="p-6 border-b">

                    <h2 className="text-xl font-bold text-slate-800">
                      Department Performance
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Department-wise operational
                      performance.
                    </p>

                  </div>


                  <div className="overflow-x-auto">

                    <table className="w-full">

                      <thead className="bg-gray-50">

                        <tr>

                          <th className="text-left px-6 py-4">
                            Department
                          </th>

                          <th className="text-center px-6 py-4">
                            Doctors
                          </th>

                          <th className="text-center px-6 py-4">
                            Patients
                          </th>

                          <th className="text-center px-6 py-4">
                            High Risk
                          </th>

                          <th className="text-center px-6 py-4">
                            Readmitted
                          </th>

                          <th className="text-center px-6 py-4">
                            Treatments
                          </th>

                          <th className="text-center px-6 py-4">
                            Follow-ups
                          </th>

                        </tr>

                      </thead>


                      <tbody className="divide-y">

                        {reportDepartments.map(
                          (item) => (

                            <tr
                              key={item.department}
                              className="hover:bg-gray-50"
                            >

                              <td className="px-6 py-4 font-semibold">
                                {item.department}
                              </td>

                              <td className="text-center px-6 py-4">
                                {item.doctor_count ??
                                  0}
                              </td>

                              <td className="text-center px-6 py-4">
                                {item.patient_count ??
                                  0}
                              </td>

                              <td className="text-center px-6 py-4">
                                {item.high_risk ??
                                  0}
                              </td>

                              <td className="text-center px-6 py-4">
                                {item.readmitted_patients ??
                                  0}
                              </td>

                              <td className="text-center px-6 py-4">

                                <span className="inline-flex items-center gap-1">

                                  <FaPills className="text-purple-500" />

                                  {item.treatment_plans ??
                                    0}

                                </span>

                              </td>

                              <td className="text-center px-6 py-4">

                                <span className="inline-flex items-center gap-1">

                                  <FaCalendarCheck className="text-blue-500" />

                                  {item.follow_ups ??
                                    0}

                                </span>

                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

              )}


            {/* =================================================
                REPORT INFORMATION
            ================================================= */}

            <div className="bg-white rounded-xl shadow p-6">

              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Report Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

                <div>
                  <span className="text-gray-500">
                    Role:
                  </span>

                  <span className="ml-2 font-semibold">
                    {role}
                  </span>
                </div>


                <div>
                  <span className="text-gray-500">
                    Report Type:
                  </span>

                  <span className="ml-2 font-semibold">
                    {reportType}
                  </span>
                </div>


                {patientId && (
                  <div>
                    <span className="text-gray-500">
                      Patient:
                    </span>

                    <span className="ml-2 font-semibold">
                      {patients.find(
                        (patient) =>
                          String(
                            patient._id ||
                              patient.id
                          ) ===
                          String(patientId)
                      )?.name || patientId}
                    </span>
                  </div>
                )}


                {department && (
                  <div>
                    <span className="text-gray-500">
                      Department:
                    </span>

                    <span className="ml-2 font-semibold">
                      {department}
                    </span>
                  </div>
                )}


                {startDate && (
                  <div>
                    <span className="text-gray-500">
                      From Date:
                    </span>

                    <span className="ml-2 font-semibold">
                      {startDate}
                    </span>
                  </div>
                )}


                {endDate && (
                  <div>
                    <span className="text-gray-500">
                      To Date:
                    </span>

                    <span className="ml-2 font-semibold">
                      {endDate}
                    </span>
                  </div>
                )}


                {currentStatus && (
                  <div>
                    <span className="text-gray-500">
                      Current Status:
                    </span>

                    <span className="ml-2 font-semibold">
                      {currentStatus}
                    </span>
                  </div>
                )}

              </div>

            </div>

          </div>

        )}

      </div>
    </DashboardLayout>
  );
}

export default OperationalReports;