// -----------------------------
// BASE URL (🔥 IMPORTANT)
// -----------------------------
const BASE_URL = "https://bottleneck-analyzer-backend.onrender.com";


// -----------------------------
// AUTH GUARD
// -----------------------------
const user = localStorage.getItem("loggedInUser");
if (!user) {
  window.location.href = "index.html";
}

window.onload = () => {
  document.getElementById("projectName").value = "";
  document.getElementById("projectPriority").selectedIndex = 0;
};


// -----------------------------
// PROJECT DATA
// -----------------------------
let projects = [];


// -----------------------------
// LOAD PROJECTS
// -----------------------------
async function loadProjects() {
  const userId = localStorage.getItem("loggedInUser");

  try {
    const res = await fetch(`${BASE_URL}/api/projects?userId=${userId}`);
    projects = await res.json();

    renderProjects();
  } catch (err) {
    console.error("Load projects error:", err);
  }
}


// -----------------------------
// RENDER PROJECTS
// -----------------------------
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

    // open project
    div.addEventListener("click", () => openProject(project._id));

    // delete button
    const deleteBtn = div.querySelector(".delete-project-btn");

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteProject(project._id);
    });

    container.appendChild(div);
  });
}


// -----------------------------
// ADD PROJECT
// -----------------------------
async function addProject() {
  const nameInput = document.getElementById("projectName");
  const prioritySelect = document.getElementById("projectPriority");

  const name = nameInput.value.trim();
  const priority = prioritySelect.value;
  const userId = localStorage.getItem("loggedInUser");

  if (!name) {
    alert("Enter project name");
    return;
  }

  if (!priority) {
    alert("Please select priority");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, priority, userId })
    });

    if (!res.ok) {
      throw new Error("Failed to create project");
    }

    await res.json();

    // reset form
    nameInput.value = "";
    prioritySelect.selectedIndex = 0;

    loadProjects();

  } catch (err) {
    console.error("Add project error:", err);
    alert("Error creating project");
  }
}


// -----------------------------
// DELETE PROJECT
// -----------------------------
async function deleteProject(projectId) {
  if (!confirm("Delete this project?")) return;

  if (projectId === localStorage.getItem("currentProject")) {
    localStorage.removeItem("currentProject");
  }

  try {
    await fetch(`${BASE_URL}/api/projects/${projectId}`, {
      method: "DELETE"
    });

    loadProjects();

  } catch (err) {
    console.error("Delete project error:", err);
  }
}


// -----------------------------
// LOGOUT
// -----------------------------
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}


// -----------------------------
// OPEN PROJECT
// -----------------------------
function openProject(projectId) {
  localStorage.setItem("currentProject", projectId);
  window.location.href = "dashboard.html";
}


// -----------------------------
// INIT
// -----------------------------
loadProjects();