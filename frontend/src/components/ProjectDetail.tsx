import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  description: string;
}

interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  created_at: string;
}

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onLogout: () => void;
}

function ProjectDetail({
  projectId,
  onBack,
  onLogout,
}: ProjectDetailProps) {
  const [project, setProject] =
    useState<Project | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [dragOverStatus, setDragOverStatus] =
    useState<
      "todo" | "in_progress" | "done" | null
    >(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState<"todo" | "in_progress" | "done">(
      "todo",
    );

  const [priority, setPriority] =
    useState<"low" | "medium" | "high">(
      "medium",
    );

  const [message, setMessage] = useState(
    "Loading project...",
  );

  const [showTaskForm, setShowTaskForm] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [priorityFilter, setPriorityFilter] =
    useState<
      "all" | "low" | "medium" | "high"
    >("all");

  const [statusFilter, setStatusFilter] =
    useState<
      "all" | "todo" | "in_progress" | "done"
    >("all");

  const [isEditing, setIsEditing] =
    useState(false);

  const [editingTaskId, setEditingTaskId] =
    useState<string | null>(null);

  async function loadProject() {
    const token =
      localStorage.getItem("token");

    if (!token) {
      onLogout();
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/projects/${projectId}`,
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
            "Failed to load project",
        );
        return;
      }

      setProject(data);
      setMessage("");
    } catch {
      setMessage(
        "Backend connection failed",
      );
    }
  }

  async function loadTasks() {
    const token =
      localStorage.getItem("token");

    if (!token) {
      onLogout();
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/projects/${projectId}/tasks`,
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
            "Failed to load tasks",
        );
        return;
      }

      setTasks(data);
    } catch {
      setMessage(
        "Backend connection failed",
      );
    }
  }

  useEffect(() => {
    loadProject();
    loadTasks();
  }, [projectId]);

  function openCreateTaskForm() {
    setIsEditing(false);
    setEditingTaskId(null);

    setTitle("");
    setDescription("");
    setStatus("todo");
    setPriority("medium");

    setMessage("");
    setShowTaskForm(true);
  }

  function startEditingTask(task: Task) {
    setIsEditing(true);
    setEditingTaskId(task.id);

    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);

    setMessage("");
    setShowTaskForm(true);
  }

  function cancelTaskForm() {
    setIsEditing(false);
    setEditingTaskId(null);

    setTitle("");
    setDescription("");
    setStatus("todo");
    setPriority("medium");

    setShowTaskForm(false);
    setMessage("");
  }

  async function handleCreateTask(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    const token =
      localStorage.getItem("token");

    if (!token) {
      onLogout();
      return;
    }

    if (!title.trim()) {
      setMessage(
        "Task title is required.",
      );
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:3000/projects/${projectId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            status,
            priority,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ??
            "Failed to create task",
        );
        return;
      }

      setTasks((currentTasks) => [
        data,
        ...currentTasks,
      ]);

      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");

      setShowTaskForm(false);

      setMessage(
        "Task created successfully!",
      );
    } catch {
      setMessage(
        "Backend connection failed",
      );
    }
  }

  async function handleUpdateTask(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!editingTaskId) {
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      onLogout();
      return;
    }

    if (!title.trim()) {
      setMessage(
        "Task title is required.",
      );
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:3000/tasks/${editingTaskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            status,
            priority,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ??
            "Failed to update task",
        );
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId
            ? data
            : task,
        ),
      );

      setIsEditing(false);
      setEditingTaskId(null);

      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");

      setShowTaskForm(false);

      setMessage(
        "Task updated successfully!",
      );
    } catch {
      setMessage(
        "Backend connection failed",
      );
    }
  }

  async function handleDeleteTask(
    taskId: string,
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?",
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
        `http://localhost:3000/tasks/${taskId}`,
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
            "Failed to delete task",
        );
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) =>
            task.id !== taskId,
        ),
      );

      setMessage(
        "Task deleted successfully!",
      );
    } catch {
      setMessage(
        "Backend connection failed",
      );
    }
  }

  function getFilteredTasks() {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        normalizedSearch === "" ||
        task.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        task.description
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesPriority =
        priorityFilter === "all" ||
        task.priority === priorityFilter;

      const matchesStatus =
        statusFilter === "all" ||
        task.status === statusFilter;

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus
      );
    });
  }

  function getPriorityClass(
    taskPriority:
      | "low"
      | "medium"
      | "high",
  ) {
    return `priority-${taskPriority}`;
  }

  async function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
    newStatus:
      | "todo"
      | "in_progress"
      | "done",
  ) {
    event.preventDefault();

    setDragOverStatus(null);

    const taskId =
      event.dataTransfer.getData(
        "taskId",
      );

    if (!taskId) {
      return;
    }

    const task = tasks.find(
      (item) => item.id === taskId,
    );

    if (!task) {
      return;
    }

    if (task.status === newStatus) {
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      onLogout();
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            status: newStatus,
            priority: task.priority,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.error ??
            "Failed to move task",
        );
        return;
      }

      setTasks(
        (currentTasks) =>
          currentTasks.map(
            (currentTask) =>
              currentTask.id === taskId
                ? data
                : currentTask,
          ),
      );

      setMessage(
        "Task moved successfully!",
      );
    } catch {
      setMessage(
        "Backend connection failed",
      );
    }
  }

  function TaskCard({
    task,
  }: {
    task: Task;
  }) {
    function handleDragStart(
      event: React.DragEvent<HTMLDivElement>,
    ) {
      event.dataTransfer.setData(
        "taskId",
        task.id,
      );
    }

    return (
      <div
        className="task-card"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={() => {
          setDragOverStatus(null);
        }}
      >
        <div className="task-card-header">
          <h3>{task.title}</h3>

          <span
            className={`priority-badge ${getPriorityClass(
              task.priority,
            )}`}
          >
            {task.priority}
          </span>
        </div>

        {task.description && (
          <p className="task-description">
            {task.description}
          </p>
        )}

        <small className="task-date">
          Created{" "}
          {new Date(
            task.created_at,
          ).toLocaleDateString()}
        </small>

        <div className="actions task-actions">
          <button
            className="secondary-button"
            onClick={() =>
              startEditingTask(task)
            }
          >
            Edit
          </button>

          <button
            className="danger-button"
            onClick={() =>
              handleDeleteTask(task.id)
            }
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <main className="page">
        <div className="card">
          <p>{message}</p>

          <button
            className="secondary-button"
            onClick={onBack}
          >
            Back to Projects
          </button>
        </div>
      </main>
    );
  }

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "done",
  ).length;

  const completionRate =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100,
        );
  const filteredTasks =
    getFilteredTasks();

  const todoTasks =
    filteredTasks.filter(
      (task) => task.status === "todo",
    );

  const inProgressTasks =
    filteredTasks.filter(
      (task) =>
        task.status === "in_progress",
    );

  const doneTasks =
    filteredTasks.filter(
      (task) => task.status === "done",
    );

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <button
            className="secondary-button"
            onClick={onBack}
          >
            ← Back to Projects
          </button>

          <h1 style={{ marginTop: "20px" }}>
            {project.name}
          </h1>

          <p
            style={{
              color: "#6b7280",
              marginTop: "6px",
            }}
          >
            {project.description}
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

            <div
        className="card"
        style={{
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>
              Project Progress
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#6b7280",
              }}
            >
              Task completion for this project
            </p>
          </div>

          <strong style={{ fontSize: "24px" }}>
            {completionRate}%
          </strong>
        </div>

        <div
          style={{
            width: "100%",
            height: "12px",
            background: "#e5e7eb",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${completionRate}%`,
              height: "100%",
              background: "#2563eb",
              borderRadius: "999px",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <p
          style={{
            margin: "10px 0 0",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          {completedTasks} of {totalTasks} tasks
          completed
        </p>
      </div>

      {showTaskForm && (
        <div
          className="card"
          style={{
            marginBottom: "24px",
          }}
        >
          <h2>
            {isEditing
              ? "Edit Task"
              : "Create Task"}
          </h2>

          <form
            onSubmit={
              isEditing
                ? handleUpdateTask
                : handleCreateTask
            }
          >
            <div className="form-group">
              <label>
                Task Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value,
                  )
                }
                placeholder="Implement authentication"
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
                placeholder="Describe the task..."
              />
            </div>

            <div className="form-group">
              <label>Status</label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target
                      .value as
                      | "todo"
                      | "in_progress"
                      | "done",
                  )
                }
              >
                <option value="todo">
                  To Do
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="done">
                  Done
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>

              <select
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target
                      .value as
                      | "low"
                      | "medium"
                      | "high",
                  )
                }
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>
            </div>

            <div className="actions">
              <button
                className="primary-button"
                type="submit"
              >
                {isEditing
                  ? "Update Task"
                  : "Create Task"}
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={
                  cancelTaskForm
                }
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="page-header">
        <div>
          <h2>Task Board</h2>

          <p
            style={{
              color: "#6b7280",
              marginTop: "6px",
            }}
          >
            Drag and drop tasks between
            columns to update their status.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={
            openCreateTaskForm
          }
        >
          + Create Task
        </button>
      </div>

      <div
        className="card"
        style={{
          marginBottom: "24px",
        }}
      >
        <div className="filter-grid">
          <div className="form-group">
            <label>
              Search Tasks
            </label>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search by title or description..."
            />
          </div>

          <div className="form-group">
            <label>
              Priority
            </label>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target
                    .value as
                    | "all"
                    | "low"
                    | "medium"
                    | "high",
                )
              }
            >
              <option value="all">
                All priorities
              </option>

              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as
                    | "all"
                    | "todo"
                    | "in_progress"
                    | "done",
                )
              }
            >
              <option value="all">
                All statuses
              </option>

              <option value="todo">
                To Do
              </option>

              <option value="in_progress">
                In Progress
              </option>

              <option value="done">
                Done
              </option>
            </select>
          </div>
        </div>
      </div>

      <div className="kanban-board">
        <div className="kanban-column">
          <div className="kanban-column-header">
            <div>
              <h3>To Do</h3>

              <span>
                {todoTasks.length}
              </span>
            </div>
          </div>

          <div
            className={`kanban-tasks ${
              dragOverStatus === "todo"
                ? "kanban-drop-active"
                : ""
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverStatus("todo");
            }}
            onDrop={(event) =>
              handleDrop(
                event,
                "todo",
              )
            }
          >
            {todoTasks.length === 0 ? (
              <p className="empty-column">
                No tasks
              </p>
            ) : (
              todoTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                />
              ))
            )}
          </div>
        </div>

        <div className="kanban-column">
          <div className="kanban-column-header">
            <div>
              <h3>In Progress</h3>

              <span>
                {inProgressTasks.length}
              </span>
            </div>
          </div>

          <div
            className={`kanban-tasks ${
              dragOverStatus === "in_progress"
                ? "kanban-drop-active"
                : ""
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverStatus("in_progress");
            }}
            onDrop={(event) =>
              handleDrop(
                event,
                "in_progress",
              )
            }
          >
            {inProgressTasks.length ===
            0 ? (
              <p className="empty-column">
                No tasks
              </p>
            ) : (
              inProgressTasks.map(
                (task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                  />
                ),
              )
            )}
          </div>
        </div>

        <div className="kanban-column">
          <div className="kanban-column-header">
            <div>
              <h3>Done</h3>

              <span>
                {doneTasks.length}
              </span>
            </div>
          </div>

          <div
            className={`kanban-tasks ${
              dragOverStatus === "done"
                ? "kanban-drop-active"
                : ""
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverStatus("done");
            }}
            onDrop={(event) =>
              handleDrop(
                event,
                "done",
              )
            }
          >
            {doneTasks.length === 0 ? (
              <p className="empty-column">
                No tasks
              </p>
            ) : (
              doneTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProjectDetail;