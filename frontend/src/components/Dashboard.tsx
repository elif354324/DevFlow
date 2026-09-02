import { useEffect, useState } from "react";

interface DashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  projects: number;
  tasks: number;
  todo: number;
  inProgress: number;
  done: number;
  highPriority: number;
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
}

function StatCard({
  title,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="card">
      <p
        style={{
          margin: 0,
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          margin: "8px 0",
          fontSize: "32px",
        }}
      >
        {value}
      </h2>

      <p
        style={{
          margin: 0,
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        {description}
      </p>
    </div>
  );
}

function Dashboard({
  onLogout,
}: DashboardProps) {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [message, setMessage] = useState(
    "Loading dashboard...",
  );

  useEffect(() => {
    async function loadDashboardStats() {
      const token =
        localStorage.getItem("token");

      if (!token) {
        onLogout();
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/dashboard/stats",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.error ??
              "Failed to load dashboard",
          );
          return;
        }

        setStats(data);
        setMessage("");
      } catch {
        setMessage(
          "Backend connection failed",
        );
      }
    }

    loadDashboardStats();
  }, [onLogout]);

  if (message && !stats) {
    return (
      <main className="page">
        <div className="card">
          <p>{message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>

          <p
            style={{
              color: "#6b7280",
              marginTop: "6px",
            }}
          >
            Overview of your development
            projects and tasks.
          </p>
        </div>

        <button
          className="danger-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-3">
            <StatCard
              title="Projects"
              value={stats.projects}
              description="Total projects"
            />

            <StatCard
              title="Tasks"
              value={stats.tasks}
              description="Total tasks"
            />

            <StatCard
              title="High Priority"
              value={stats.highPriority}
              description="Tasks requiring attention"
            />
          </div>

          <br />

          <h2>Task Overview</h2>

          <div className="grid grid-3">
            <StatCard
              title="To Do"
              value={stats.todo}
              description="Tasks waiting to be started"
            />

            <StatCard
              title="In Progress"
              value={stats.inProgress}
              description="Tasks currently being worked on"
            />

            <StatCard
              title="Done"
              value={stats.done}
              description="Completed tasks"
            />
          </div>
        </>
      )}
    </main>
  );
}

export default Dashboard;