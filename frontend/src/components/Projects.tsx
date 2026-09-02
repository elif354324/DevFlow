import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

interface ProjectsProps {
  onLogout: () => void;
  onOpenProject: (projectId: string) => void;
}

function Projects({
  onLogout,
  onOpenProject,
}: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState(
    "Loading projects...",
  );

  const [isCreating, setIsCreating] =
    useState(false);

  const [isEditing, setIsEditing] =
    useState(false);

  const [editingProjectId, setEditingProjectId] =
    useState<string | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  async function loadProjects() {
    const token =
      localStorage.getItem("token");

    if (!token) {
      onLogout();
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/projects",
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
            "Failed to load projects",
        );
        return;
      }

      setProjects(data);
      setMessage("");
    } catch {
      setMessage(
        "Backend connection failed",
      );
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function openCreateForm() {
    setIsEditing(false);
    setEditingProjectId(null);

    setName("");
    setDescription("");

    setMessage("");
    setShowForm(true);
  }

  function startEditing(project: Project) {
    setIsEditing(true);
    setEditingProjectId(project.id);

    setName(project.name);
    setDescription(project.description);

    setMessage("");
    setShowForm(true);
  }

  function cancelForm() {
    setIsEditing(false);
    setEditingProjectId(null);

    setName("");
    setDescription("");

    setShowForm(false);
    setMessage("");
  }

  async function handleCreateProject(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    const token =
      localStorage.getItem("token");

    if (!token) {
      onLogout();
      return;
    }

    setIsCreating(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:3000/projects",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ??
            "Failed to create project",
        );
        return;
      }

      setProjects((currentProjects) => [
        data,
        ...currentProjects,
      ]);

      setName("");
      setDescription("");
      setShowForm(false);

      setMessage(
        "Project created successfully!",
      );
    } catch {
      setMessage(
        "Backend connection failed",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdateProject(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!editingProjectId) {
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      onLogout();
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:3000/projects/${editingProjectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ??
            "Failed to update project",
        );
        return;
      }

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === editingProjectId
            ? data
            : project,
        ),
      );

      setIsEditing(false);
      setEditingProjectId(null);
      setName("");
      setDescription("");
      setShowForm(false);

      setMessage(
        "Project updated successfully!",
      );
    } catch {
      setMessage(
        "Backend connection failed",
      );
    }
  }

  async function handleDeleteProject(
    projectId: string,
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this project?",
      );

    if (!confirmed) {
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      onLogout();
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:3000/projects/${projectId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ??
            "Failed to delete project",
        );
        return;
      }

      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) =>
            project.id !== projectId,
        ),
      );

      setMessage(
        "Project deleted successfully!",
      );
    } catch {
      setMessage(
        "Backend connection failed",
      );
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>

          <p
            style={{
              color: "#6b7280",
              marginTop: "6px",
            }}
          >
            Manage your development
            projects.
          </p>
        </div>

        <div className="actions">
          <button
            className="primary-button"
            onClick={openCreateForm}
          >
            + New Project
          </button>

          <button
            className="danger-button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      {showForm && (
        <div
          className="card"
          style={{
            marginBottom: "24px",
          }}
        >
          <h2>
            {isEditing
              ? "Edit Project"
              : "Create Project"}
          </h2>

          <form
            onSubmit={
              isEditing
                ? handleUpdateProject
                : handleCreateProject
            }
          >
            <div className="form-group">
              <label>
                Project Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="DevFlow"
              />
            </div>

            <div className="form-group">
              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                placeholder="Project management application"
              />
            </div>

            <div className="actions">
              <button
                className="primary-button"
                type="submit"
                disabled={isCreating}
              >
                {isEditing
                  ? "Update Project"
                  : isCreating
                    ? "Creating..."
                    : "Create Project"}
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={cancelForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="page-header">
        <h2>My Projects</h2>

        <span
          style={{
            color: "#6b7280",
          }}
        >
          {projects.length} project
          {projects.length !== 1
            ? "s"
            : ""}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <h3>No projects found</h3>

          <p
            style={{
              color: "#6b7280",
            }}
          >
            Create your first project
            to get started.
          </p>

          <button
            className="primary-button"
            onClick={openCreateForm}
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-2">
          {projects.map((project) => (
            <div
              className="card"
              key={project.id}
            >
              <h2>{project.name}</h2>

              <p
                style={{
                  color: "#6b7280",
                  minHeight: "48px",
                }}
              >
                {project.description}
              </p>

              {project.created_at && (
                <small
                  style={{
                    color: "#9ca3af",
                  }}
                >
                  Created{" "}
                  {new Date(
                    project.created_at,
                  ).toLocaleDateString()}
                </small>
              )}

              <div
                className="actions"
                style={{
                  marginTop: "20px",
                }}
              >
                <button
                  className="primary-button"
                  onClick={() =>
                    onOpenProject(
                      project.id,
                    )
                  }
                >
                  View
                </button>

                <button
                  className="secondary-button"
                  onClick={() =>
                    startEditing(project)
                  }
                >
                  Edit
                </button>

                <button
                  className="danger-button"
                  onClick={() =>
                    handleDeleteProject(
                      project.id,
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Projects;