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

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["Doctor"]}
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

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["Hospital Administrator"]}
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
      </Route>

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["Healthcare Researcher"]}
          />
        }
      >
        <Route
          path="/research-dashboard"
          element={<ResearchDashboard />}
        />
      </Route>

    <Route
  element={
    <ProtectedRoute
      allowedRoles={["System Administrator"]}
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
    path="/admin/audit-logs"
    element={<AuditLogs />}
  />
  <Route
  path="/admin/datasets"
  element={<AdminDatasets />}
/>
</Route>


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

        <Route
          path="/reports"
          element={<Reports />}
        />
      </Route>

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