import { useCallback, useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Projects from "./components/Projects";
import ProjectDetail from "./components/ProjectDetail";

type View = "dashboard" | "projects" | "project-detail";

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const [view, setView] = useState<View>("dashboard");

  const [selectedProjectId, setSelectedProjectId] =
    useState<string | null>(null);

  function handleLoginSuccess(newToken: string) {
    setToken(newToken);
    setView("dashboard");
  }

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setView("dashboard");
    setSelectedProjectId(null);
  }, []);

  function handleOpenProject(projectId: string) {
    setSelectedProjectId(projectId);
    setView("project-detail");
  }

  function handleBackToProjects() {
    setSelectedProjectId(null);
    setView("projects");
  }

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      {view !== "project-detail" && (
        <nav className="navbar">
          <div className="navbar-brand">
            DevFlow
          </div>

          <div className="navbar-links">
            <button onClick={() => setView("dashboard")}>
              Dashboard
            </button>

            <button onClick={() => setView("projects")}>
              Projects
            </button>
          </div>
        </nav>
      )}

      {view === "dashboard" && (
        <Dashboard onLogout={handleLogout} />
      )}

      {view === "projects" && (
        <Projects
          onLogout={handleLogout}
          onOpenProject={handleOpenProject}
        />
      )}

      {view === "project-detail" && selectedProjectId && (
        <ProjectDetail
          projectId={selectedProjectId}
          onBack={handleBackToProjects}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;