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
  completionRate: number;
}

interface ProjectProgress {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  variant?: "default" | "danger" | "blue" | "success";
}

function StatCard({
  title,
  value,
  description,
  variant = "default",
}: StatCardProps) {
  return (
    <div className={`dashboard-stat-card ${variant}`}>
      <div className="dashboard-stat-top">
        <span className="dashboard-stat-title">
          {title}
        </span>

        <span className="dashboard-stat-icon">
          {variant === "danger"
            ? "!"
            : variant === "success"
              ? "✓"
              : variant === "blue"
                ? "◆"
                : "•"}
        </span>
      </div>

      <div className="dashboard-stat-value">
        {value}
      </div>

      <p className="dashboard-stat-description">
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

  const [projectProgress, setProjectProgress] =
    useState<ProjectProgress[]>([]);

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

    async function loadProjectProgress() {
      const token =
        localStorage.getItem("token");

      if (!token) {
        onLogout();
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/dashboard/project-progress",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setProjectProgress(data);
      } catch {
        // Project progress yüklenemezse
        // dashboard'un geri kalanını göstermeye devam ediyoruz.
      }
    }

    loadDashboardStats();
    loadProjectProgress();
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
    <main className="page dashboard-page">
      <div className="page-header dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            DEVELOPER WORKSPACE
          </p>

          <h1>Dashboard</h1>

          <p className="dashboard-subtitle">
            Overview of your development projects
            and tasks.
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
          <section>
            <div className="dashboard-stats-grid">
              <StatCard
                title="Projects"
                value={stats.projects}
                description="Total projects"
                variant="blue"
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
                variant="danger"
              />
            </div>
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <div>
                <h2>Task Overview</h2>
                <p>
                  Current status of your tasks.
                </p>
              </div>
            </div>

            <div className="dashboard-stats-grid">
              <StatCard
                title="To Do"
                value={stats.todo}
                description="Waiting to be started"
              />

              <StatCard
                title="In Progress"
                value={stats.inProgress}
                description="Currently being worked on"
                variant="blue"
              />

              <StatCard
                title="Done"
                value={stats.done}
                description="Completed tasks"
                variant="success"
              />
            </div>
          </section>

          <section className="dashboard-section">
            <div className="dashboard-insights-grid">
              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2>Task Completion</h2>

                    <p>
                      Overall project task progress
                    </p>
                  </div>

                  <strong className="completion-value">
                    {stats.completionRate}%
                  </strong>
                </div>

                <div className="dashboard-progress-track large">
                  <div
                    className="dashboard-progress-fill"
                    style={{
                      width: `${stats.completionRate}%`,
                    }}
                  />
                </div>

                <div className="dashboard-panel-footer">
                  <span>
                    {stats.done} of {stats.tasks} tasks
                    completed
                  </span>

                  <span>
                    {stats.tasks === 0
                      ? "No tasks yet"
                      : stats.completionRate === 100
                        ? "All tasks completed"
                        : "Keep going"}
                  </span>
                </div>
              </div>

              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2>Project Progress</h2>

                    <p>
                      Progress across your projects
                    </p>
                  </div>
                </div>

                <div className="dashboard-project-list">
                  {projectProgress.length === 0 ? (
                    <p className="dashboard-empty">
                      No projects yet.
                    </p>
                  ) : (
                    projectProgress.map((project) => (
                      <div
                        className="dashboard-project-item"
                        key={project.id}
                      >
                        <div className="dashboard-project-header">
                          <div>
                            <strong>
                              {project.name}
                            </strong>

                            <span>
                              {project.completedTasks} of{" "}
                              {project.totalTasks} tasks
                            </span>
                          </div>

                          <strong>
                            {project.completionRate}%
                          </strong>
                        </div>

                        <div className="dashboard-progress-track">
                          <div
                            className="dashboard-progress-fill"
                            style={{
                              width: `${project.completionRate}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default Dashboard;
