import { Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

import Dashboard from "../pages/Dashboard";
import Patients from "../pages/Patients";
import PatientDetails from "../pages/PatientDetails";
import RiskPrediction from "../pages/RiskPrediction";
import Readmission from "../pages/Readmission";
import Treatment from "../pages/Treatment";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import OperationalReports from "../pages/OperationalReports";
import Profile from "../pages/Profile";
import ExportAnalytics from "../pages/ExportAnalytics";

import AdminUsers from "../pages/AdminUsers";
import AdminDatasets from "../pages/AdminDatasets";
import CareRecommendations from "../pages/CareRecommendations";
import FollowUpPlanning from "../pages/FollowUpPlanning";

import HospitalDashboard from "../pages/HospitalDashboard";
import DepartmentPerformance from "../pages/DepartmentPerformance";
import ResearchDashboard from "../pages/ResearchDashboard";
import SystemAdminDashboard from "../pages/SystemAdminDashboard";
import AuditLogs from "../pages/AuditLogs";

import ProtectedRoute from "../components/ProtectedRoute";


function AppRoutes() {

  return (

    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />


      {/* =====================================================
          PROFILE
          ALL AUTHENTICATED ROLES
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Doctor",
              "Hospital Administrator",
              "Healthcare Researcher",
              "System Administrator",
            ]}
          />
        }
      >

        <Route
          path="/profile"
          element={<Profile />}
        />

      </Route>


      {/* =====================================================
          DOCTOR ROUTES
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Doctor",
            ]}
          />
        }
      >

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/care-recommendations"
          element={<CareRecommendations />}
        />

        <Route
          path="/follow-up-planning"
          element={<FollowUpPlanning />}
        />

      </Route>


      {/* =====================================================
          HOSPITAL ADMINISTRATOR ROUTES
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Hospital Administrator",
            ]}
          />
        }
      >

        <Route
          path="/hospital-dashboard"
          element={<HospitalDashboard />}
        />

        <Route
          path="/department-performance"
          element={<DepartmentPerformance />}
        />
      <Route
          path="/operatinal-reports"
          element={<OperationalReports />}
        />
      </Route>


      {/* =====================================================
          HEALTHCARE RESEARCHER ROUTES
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Healthcare Researcher",
            ]}
          />
        }
      >

        <Route
          path="/research-dashboard"
          element={<ResearchDashboard />}
        />

      </Route>


      {/* =====================================================
          SYSTEM ADMINISTRATOR ROUTES
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "System Administrator",
            ]}
          />
        }
      >

        <Route
          path="/admin"
          element={<SystemAdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        <Route
          path="/admin/datasets"
          element={<AdminDatasets />}
        />

        <Route
          path="/admin/audit-logs"
          element={<AuditLogs />}
        />

      </Route>


      {/* =====================================================
          PATIENTS / ANALYTICS / EXISTING REPORTS
          DOCTOR + HOSPITAL ADMIN + SYSTEM ADMIN
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Doctor",
              "Hospital Administrator",
              "System Administrator",
            ]}
          />
        }
      >

        <Route
          path="/patients"
          element={<Patients />}
        />

        <Route
          path="/patients/:id"
          element={<PatientDetails />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        {/* Existing Patient Outcome Reports */}
        <Route
          path="/reports"
          element={<Reports />}
        />

      </Route>


      {/* =====================================================
          OPERATIONAL REPORTS
          DOCTOR + HOSPITAL ADMINISTRATOR
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Doctor",
              "Hospital Administrator",
            ]}
          />
        }
      >

        <Route
          path="/operational-reports"
          element={<OperationalReports />}
        />

      </Route>


      {/* =====================================================
          EXPORT ANALYTICS
          HOSPITAL ADMIN + SYSTEM ADMIN
          
          KEEPING THIS FEATURE INTACT
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Hospital Administrator",
              "System Administrator",
            ]}
          />
        }
      >

        <Route
          path="/export"
          element={<ExportAnalytics />}
        />

      </Route>


      {/* =====================================================
          READMISSION
          DOCTOR + HOSPITAL ADMIN + SYSTEM ADMIN
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Doctor",
              "Hospital Administrator",
              "System Administrator",
            ]}
          />
        }
      >

        <Route
          path="/readmission"
          element={<Readmission />}
        />

      </Route>


      {/* =====================================================
          RISK PREDICTION + TREATMENT
          DOCTOR + SYSTEM ADMIN
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Doctor",
              "System Administrator",
            ]}
          />
        }
      >

        <Route
          path="/risk-prediction"
          element={<RiskPrediction />}
        />

        <Route
          path="/treatment"
          element={<Treatment />}
        />

      </Route>

    </Routes>
  );
}

export default AppRoutes;