import { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaUserShield,
} from "react-icons/fa";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await api.get(
          "/api/admin/audit-logs"
        );

        setAuditLogs(response.data?.logs || []);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Unable to load audit logs."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  // --------------------------------------------------
  // GROUP LOGS BY DAY
  // --------------------------------------------------

  const groupedLogs = auditLogs.reduce(
    (groups, log) => {
      if (!log.created_at) {
        return groups;
      }

      const date = new Date(log.created_at);

      const dayKey = date.toLocaleDateString(
        "en-CA"
      );

      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }

      groups[dayKey].push(log);

      return groups;
    },
    {}
  );

  // --------------------------------------------------
  // FORMAT DAY LABEL
  // --------------------------------------------------

  const formatDayLabel = (dateString) => {
    const date = new Date(
      `${dateString}T00:00:00`
    );

    const today = new Date();

    const todayString =
      today.toLocaleDateString("en-CA");

    const yesterday = new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const yesterdayString =
      yesterday.toLocaleDateString("en-CA");

    if (dateString === todayString) {
      return "Today";
    }

    if (dateString === yesterdayString) {
      return "Yesterday";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // --------------------------------------------------
  // FORMAT ACTION
  // --------------------------------------------------

  const formatAction = (action) => {
    if (!action) {
      return "Unknown Action";
    }

    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  return (
    <DashboardLayout>
      <div className="p-6">

        {/* PAGE HEADER */}

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <FaClipboardList className="text-slate-700 text-3xl" />

            <h1 className="text-3xl font-bold text-slate-800">
              Audit Logs
            </h1>
          </div>

          <p className="text-gray-500 mt-2">
            System activity and security events from the last 7 days.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <p className="text-gray-500">
            Loading audit logs...
          </p>
        ) : auditLogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <FaClipboardList className="text-gray-300 text-5xl mx-auto mb-4" />

            <h2 className="text-xl font-semibold text-slate-700">
              No Audit Activity
            </h2>

            <p className="text-gray-500 mt-2">
              No audit events were recorded during the last 7 days.
            </p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* DAY-WISE LOGS */}

            {Object.keys(groupedLogs)
              .sort((a, b) =>
                b.localeCompare(a)
              )
              .map((day) => (
                <div key={day}>

                  {/* DAY HEADER */}

                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-3 w-3 rounded-full bg-blue-600" />

                    <h2 className="text-xl font-bold text-slate-800">
                      {formatDayLabel(day)}
                    </h2>
                  </div>

                  {/* LOG CONTAINER */}

                  <div className="bg-white rounded-xl shadow overflow-hidden">

                    {groupedLogs[day].map(
                      (log, index) => (
                        <div
                          key={
                            log._id || index
                          }
                          className="flex items-start gap-5 p-5 border-b last:border-b-0 hover:bg-slate-50 transition"
                        >

                          {/* ICON */}

                          <div className="bg-blue-100 text-blue-600 rounded-full p-3">
                            <FaUserShield />
                          </div>

                          {/* LOG DETAILS */}

                          <div className="flex-1">

                            <p className="font-semibold text-slate-800">
                              {formatAction(
                                log.action
                              )}
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                              {log.user_name ||
                                "System"}

                              {log.role
                                ? ` • ${log.role}`
                                : ""}
                            </p>

                            {log.user_email && (
                              <p className="text-sm text-gray-400 mt-1">
                                {log.user_email}
                              </p>
                            )}

                            {log.resource && (
                              <p className="text-xs text-gray-400 mt-1">
                                Resource:{" "}
                                {log.resource}
                              </p>
                            )}

                          </div>

                        </div>
                      )
                    )}

                  </div>
                </div>
              ))}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default AuditLogs;