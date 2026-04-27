// -----------------------------
// AUTH GUARD
// -----------------------------

const user = localStorage.getItem("loggedInUser");
if (!user) {
  window.location.href = "index.html";
}

// -----------------------------
// PROJECT DATA
// -----------------------------

let projects = [];

// -----------------------------
// RENDER PROJECTS
// -----------------------------

async function loadProjects() {
  const userId = localStorage.getItem("loggedInUser");

  const res = await fetch(`http://localhost:5000/api/projects?userId=${userId}`);
  projects = await res.json();

  renderProjects();
}

function renderProjects() {
  const container = document.getElementById("projectList");
  container.innerHTML = "";

  projects.forEach(project => {
    const div = document.createElement("div");
    div.className = `project-card ${project.priority}`;

    div.innerHTML = `
      <div class="project-card-header">
        <h3>${project.name}</h3>
        <button class="delete-project-btn" data-id="${project._id}">
          Delete
        </button>
      </div>
      <p>Priority: ${project.priority}</p>
    `;

    // open project (only if not clicking delete)
    div.addEventListener("click", () => openProject(project._id));

    // delete button
    const deleteBtn = div.querySelector(".delete-project-btn");

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // 🔥 prevent opening project
      deleteProject(project._id);
    });

    container.appendChild(div);
  });
}

async function addProject() {
  const name = document.getElementById("projectName").value;
  const priority = document.getElementById("projectPriority").value;
  const userId = localStorage.getItem("loggedInUser");

  if (!name) {
    alert("Enter project name");
    return;
  }

  const res = await fetch("http://localhost:5000/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, priority, userId })
  });

  await res.json();
  loadProjects();
}

async function deleteProject(projectId) {
  if (!confirm("Delete this project?")) return;

  if (projectId === localStorage.getItem("currentProject")) {
    localStorage.removeItem("currentProject");
  }

  await fetch(`http://localhost:5000/api/projects/${projectId}`, {
    method: "DELETE"
  });

  loadProjects();
}

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

function openProject(projectId) {
  localStorage.setItem("currentProject", projectId);
  window.location.href = "dashboard.html";
}

loadProjects();