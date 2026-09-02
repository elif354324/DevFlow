import { useState } from "react";

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    setMessage("Logging in...");

    try {
      const response = await fetch(
        "http://localhost:3000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);

      setMessage("Login successful!");

      onLoginSuccess(data.token);
    } catch {
      setMessage("Backend connection failed");
    }
  }

  return (
    <div className="login-page">
      <div className="login-showcase">
        <div className="login-brand">
          <span className="login-brand-icon">◈</span>
          <span>DevFlow</span>
        </div>

        <div className="login-showcase-content">
          <p className="login-eyebrow">
            DEVELOPER WORKSPACE
          </p>

          <h1>
            Build.
            <br />
            Track.
            <br />
            <span>Ship.</span>
          </h1>

          <p className="login-description">
            Manage your software projects, organize tasks,
            and keep your development workflow moving
            forward.
          </p>

          <div className="login-preview">
            <div className="preview-header">
              <div>
                <span className="preview-label">
                  PROJECT PROGRESS
                </span>
                <strong>DevFlow Platform</strong>
              </div>

              <span className="preview-percentage">
                78%
              </span>
            </div>

            <div className="preview-progress">
              <div className="preview-progress-fill" />
            </div>

            <div className="preview-stats">
              <div>
                <strong>12</strong>
                <span>Projects</span>
              </div>

              <div>
                <strong>48</strong>
                <span>Tasks</span>
              </div>

              <div>
                <strong>36</strong>
                <span>Completed</span>
              </div>
            </div>
          </div>

          <div className="preview-kanban">
            <div className="preview-kanban-column">
              <div className="preview-column-title">
                <span>To Do</span>
                <span>3</span>
              </div>

              <div className="preview-task">
                <span className="preview-task-dot" />
                Design dashboard
              </div>

              <div className="preview-task">
                <span className="preview-task-dot" />
                Setup API
              </div>
            </div>

            <div className="preview-kanban-column">
              <div className="preview-column-title">
                <span>In Progress</span>
                <span>2</span>
              </div>

              <div className="preview-task">
                <span className="preview-task-dot" />
                Build frontend
              </div>

              <div className="preview-task">
                <span className="preview-task-dot" />
                Task filters
              </div>
            </div>

            <div className="preview-kanban-column">
              <div className="preview-column-title">
                <span>Done</span>
                <span>5</span>
              </div>

              <div className="preview-task">
                <span className="preview-task-dot" />
                Authentication
              </div>

              <div className="preview-task">
                <span className="preview-task-dot" />
                Project setup
              </div>
            </div>
          </div>
        </div>

        <p className="login-footer">
          Plan smarter. Stay organized. Ship better.
        </p>
      </div>

      <div className="login-form-side">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome</h2>

            <p>
              Sign in to continue to your DevFlow workspace.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="login-form-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="login-form-group">
              <div className="login-label-row">
                <label htmlFor="password">
                  Password
                </label>
              </div>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              className="login-submit"
              type="submit"
            >
              Sign in
            </button>
          </form>

          {message && (
            <div className="login-message">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
