// -----------------------------
// AUTH GUARD
// -----------------------------

let selectedDependencies = [];

const user = localStorage.getItem("loggedInUser");

if (!user) {
  window.location.href = "index.html";
}

// -----------------------------
// LOAD CURRENT PROJECT
// -----------------------------

let currentProjectId = localStorage.getItem("currentProject");

if (!currentProjectId) {
  alert("No project found");
  window.location.href = "projects.html";
}

// -----------------------------
// STEP 4: CORE DATA MODEL (from current project)
// -----------------------------

let tasks = [];

async function loadTasks() {
  try {
    const res = await fetch(`http://localhost:5000/api/tasks?projectId=${currentProjectId}`);
    const data = await res.json();

    console.log("API DATA:", data);

    // 🔥 STEP 1: update tasks
    tasks = data.map((t, i) => ({
      id: t._id,
      shortId: "t" + (i + 1),
      name: t.name,
      duration: Number(t.duration) || 1,
      dependencies: t.dependencies || [],
      status: t.status || "pending"
    }));

    console.log("TASKS AFTER LOAD:", tasks);

    // 🔥 STEP 2: clean invalid dependencies
    selectedDependencies = selectedDependencies.filter(id =>
      tasks.some(t => t.id === id)
    );

    // 🔥 STEP 3: update dropdown
    renderDependencyDropdown();
    updateDropdownDisplay();

    // 🔥 STEP 4: NOW recalculate EVERYTHING
    recalculateSystem();

  } catch (err) {
    console.error("Load tasks error:", err);
  }
}

console.log("Tasks loaded:", tasks);


let dependencyGraph = {};
let executionOrder = [];
let earliestTimes = {};
let projectDuration = 0;
let criticalPath = [];
let bottleneckScores = {};
let sortedBottlenecks = [];

// -----------------------------
// BUILD DEPENDENCY GRAPH
// -----------------------------

function buildDependencyGraph(tasks) {
  const graph = {};

  tasks.forEach(task => {
    if (!task.id) return;
    graph[task.id] = [];
  });

  tasks.forEach(task => {
    (task.dependencies || []).forEach(dep => {

      if (!graph[dep]) {
        graph[dep] = []; // ✅ ensures all nodes exist
      }

      graph[dep].push(task.id);
    });
  });

  return graph;
}


console.log("Dependency Graph:", dependencyGraph);

// -----------------------------
// UTIL FUNCTION
// -----------------------------

function getTaskById(id) {
  return tasks.find(task => task.id === id);
}

// -----------------------------
// DEPENDENT COUNT (BOTTLENECK SIGNAL)
// -----------------------------

function getDependentCount(taskId, graph) {
  return graph[taskId]?.length || 0;
}



// -----------------------------
// CYCLE DETECTION (DFS)
// -----------------------------

function hasCycle(graph) {
  const visited = new Set();
  const stack = new Set();

  function dfs(node) {
    if (!graph[node]) return false; // ✅ FIX

    if (stack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    stack.add(node);

    for (let neighbor of (graph[node] || [])) { // ✅ SAFE LOOP
      if (dfs(neighbor)) return true;
    }

    stack.delete(node);
    return false;
  }

  for (let node in graph) {
    if (dfs(node)) return true;
  }

  return false;
}

// -----------------------------
// GRAPH VALIDATION CHECK
// -----------------------------

if (hasCycle(dependencyGraph)) {
  console.error("❌ Invalid project: Circular dependency detected");
} else {
  console.log("✅ Dependency graph is valid (no cycles)");
}

// -----------------------------
// TOPOLOGICAL SORT + EXECUTION ORDER
// -----------------------------

function topologicalSort(tasks, graph) {
  const visited = {};
  const stack = [];

  function dfs(node) {
    visited[node] = true;

   for (let neighbor of graph[node])  {
      if (!visited[neighbor]) {
        dfs(neighbor);
      }
    }

    stack.push(node);
  }

  for (let task of tasks) {
    if (!visited[task.id]) {
      dfs(task.id);
    }
  }

  return stack.reverse();
}



console.log("Task Execution Order:");
executionOrder.forEach((taskId, index) => {
  const task = getTaskById(taskId);
  console.log(`${index + 1}. ${task.name}`);
});

// -----------------------------
// CRITICAL PATH - EARLIEST TIMES
// -----------------------------

function calculateEarliestTimes(tasks, graph, order) {
  const earliest = {};

  // Initialize
  tasks.forEach(task => {
    earliest[task.id] = 0;
  });

  // Process in topological order
  order.forEach(taskId => {
    const task = getTaskById(taskId);

    task.dependencies.forEach(dep => {
      const depTask = getTaskById(dep);
      earliest[taskId] = Math.max(
        earliest[taskId],
        earliest[dep] + depTask.duration
      );
    });
  });

  return earliest;
}



console.log("Earliest Times:", earliestTimes);

// -----------------------------
// PROJECT DURATION
// -----------------------------

projectDuration = 0;

tasks.forEach(task => {
  const finishTime = earliestTimes[task.id] + task.duration;
  projectDuration = Math.max(projectDuration, finishTime);
});

console.log("Project Duration:", projectDuration, "days");

// -----------------------------
// CRITICAL TASKS
// -----------------------------

const criticalTasks = [];

tasks.forEach(task => {
  const finishTime = earliestTimes[task.id] + task.duration;

  if (finishTime === projectDuration) {
    criticalTasks.push(task.id);
  }
});

console.log("Critical Tasks:", criticalTasks);

// -----------------------------
// FIND END TASK (MAX FINISH TIME)
// -----------------------------

let endTaskId = null;
let maxTime = 0;

tasks.forEach(task => {
  const finishTime = earliestTimes[task.id] + task.duration;

  if (finishTime > maxTime) {
    maxTime = finishTime;
    endTaskId = task.id;
  }
});

console.log("End Task:", endTaskId);

// -----------------------------
// BUILD FULL CRITICAL PATH
// -----------------------------

function buildCriticalPath(tasks, earliestTimes, endTaskId) {
  const path = [];
  let current = endTaskId;

  while (current) {
    path.unshift(current);

    const task = getTaskById(current);

    let next = null;

    task.dependencies.forEach(dep => {
      const depTask = getTaskById(dep);

      if (
        earliestTimes[current] ===
        earliestTimes[dep] + depTask.duration
      ) {
        next = dep;
      }
    });

    current = next;
  }

  return path;
}

console.log("Critical Path:", criticalPath);

console.log("Critical Path (Names):");

criticalPath.forEach((taskId, index) => {
  const task = getTaskById(taskId);
  console.log(`${index + 1}. ${task.name}`);
});

// -----------------------------
// BOTTLENECK SCORING
// -----------------------------

function calculateBottlenecks(tasks, graph, criticalPath) {
  const scores = {};

  tasks.forEach(task => {
    scores[task.id] = 0;
  });

  return scores;
}

function calculateBottlenecks(tasks, graph, criticalPath) {
  const scores = {};

  tasks.forEach(task => {
    scores[task.id] = 0;
  });

  // Factor 1: Dependents
  tasks.forEach(task => {
    const dependents = graph[task.id].length;
    scores[task.id] += dependents * 2;
  });

  // Factor 2: Critical path
  criticalPath.forEach(taskId => {
    scores[taskId] += 3;
  });

  return scores;
}

bottleneckScores = calculateBottlenecks(
  tasks,
  dependencyGraph,
  criticalPath
);

console.log("Bottleneck Scores:", bottleneckScores);

// -----------------------------
// SORT BOTTLENECKS
// -----------------------------

sortedBottlenecks = Object.entries(bottleneckScores)
  .sort((a, b) => b[1] - a[1]);

console.log("Top Bottlenecks:");

sortedBottlenecks.forEach(([taskId, score]) => {
  const task = getTaskById(taskId);
  console.log(`${task.name} → Score: ${score}`);
});

// -----------------------------
// RENDER DEPENDENCY OPTIONS
// -----------------------------

function renderDependencyDropdown() {
  const menu = document.getElementById("dropdownMenu");

  // 🔥 Clear old items
  menu.innerHTML = "";

  // 🔥 Remove invalid dependencies (deleted tasks)
  selectedDependencies = selectedDependencies.filter(id =>
    tasks.some(task => task.id === id)
  );

  tasks.forEach(task => {
    const item = document.createElement("div");
    item.className = "dropdown-item";

    const isChecked = selectedDependencies.includes(task.id);

    item.innerHTML = `
      <input type="checkbox" value="${task.id}" ${isChecked ? "checked" : ""} />
      ${task.name} (${task.shortId})
    `;

    const checkbox = item.querySelector("input");

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        // ✅ prevent duplicates
        if (!selectedDependencies.includes(task.id)) {
          selectedDependencies.push(task.id);
        }
      } else {
        selectedDependencies = selectedDependencies.filter(id => id !== task.id);
      }

      updateDropdownDisplay();
    });

    menu.appendChild(item);
  });
}

function updateDropdownDisplay() {
  const display = document.getElementById("dropdownSelected");

  if (selectedDependencies.length === 0) {
    display.innerText = "Select dependencies";
  } else {
    const names = selectedDependencies.map(id => {
      const task = tasks.find(t => t.id === id);
      return task ? task.shortId : id;
    });

    display.innerText = names.join(", ");
  }
}

document.getElementById("dropdownSelected").addEventListener("click", () => {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});

// -----------------------------
// UPDATE STATS UI
// -----------------------------

function updateStats() {
  document.getElementById("totalTasks").innerText = tasks.length;

  const completed = tasks.filter(t => t.status === "completed").length;
  document.getElementById("completedTasks").innerText = completed;

  document.getElementById("criticalTasks").innerText =
    (criticalPath || []).length;

  document.getElementById("bottleneckCount").innerText =
    (sortedBottlenecks || []).length;

  document.getElementById("overdueTasks").innerText = 0;
}

function updateInsights() {
  const list = document.getElementById("insightsList");
  list.innerHTML = "";

  // 1. Bottleneck insight
  if (sortedBottlenecks.length > 0) {
    const [taskId, score] = sortedBottlenecks[0];
    const task = tasks.find(t => t.id === taskId);

    const li = document.createElement("li");
    li.innerText = `${task.name} is the biggest bottleneck (score: ${score})`;
    list.appendChild(li);
  }

  // 2. Critical path insight
  if (criticalPath.length > 0) {
    const names = criticalPath.map(id => {
      const t = tasks.find(x => x.id === id);
      return t?.name;
    });

    const li = document.createElement("li");
    li.innerText = `Critical path: ${names.join(" → ")}`;
    list.appendChild(li);
  }

  // 3. Risk insight
  if (projectDuration > 10) {
    const li = document.createElement("li");
    li.innerText = "Project risk is high due to long duration";
    list.appendChild(li);
  }

  // 4. Empty state
  if (list.children.length === 0) {
    const li = document.createElement("li");
    li.innerText = "No insights available";
    list.appendChild(li);
  }
}

// -----------------------------
// TOOLTIP SYSTEM
// -----------------------------

const tooltip = document.getElementById("tooltip");

function showTooltip(content, x, y) {
  tooltip.innerHTML = content;
  tooltip.style.left = x + 10 + "px";
  tooltip.style.top = y + 10 + "px";
  tooltip.style.display = "block";
}

function hideTooltip() {
  tooltip.style.display = "none";
}

// -----------------------------
// RENDER TASK TABLE
// -----------------------------

function renderTaskTable() {
  const tableBody = document.getElementById("taskTableBody");
  tableBody.innerHTML = "";

  tasks.forEach(task => {
    const row = document.createElement("tr");

    const isCritical = criticalPath.includes(task.id);

    row.innerHTML = `
      <td>${task.name}</td>
      <td><span class="status ${task.status}">${task.status}</span></td>
      <td>${task.priority}</td>
      <td>${isCritical ? "Yes" : "No"}</td>
      <td><button class="delete-btn" data-id="${task.id}">Delete</button></td>
    `;

    row.addEventListener("mousemove", (e) => {
      const score = bottleneckScores[task.id];

      showTooltip(
        `
          <strong>${task.name}</strong><br>
          Priority: ${task.priority}<br>
          Bottleneck Score: ${score}<br>
          Dependencies: ${task.dependencies.join(", ") || "None"}
        `,
        e.pageX,
        e.pageY
      );
    });

    row.addEventListener("mouseleave", hideTooltip);

    const deleteBtn = row.querySelector(".delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", e => {
        e.stopPropagation();
        deleteTask(task.id);
      });
    }

    tableBody.appendChild(row);
  });
}

// -----------------------------
// RENDER BOTTLENECK PANEL
// -----------------------------

function renderBottlenecks() {
  const container = document.getElementById("bottleneckList");
  container.innerHTML = "";

  sortedBottlenecks.slice(0, 3).forEach(([taskId, score]) => {
    const task = getTaskById(taskId);

    const div = document.createElement("div");
    div.className = "bottleneck-item";

    div.innerHTML = `
      <h4>${task.name}</h4>
      <p>Score: ${score}</p>
      <span class="impact ${score > 4 ? "high" : "medium"}">
        ${score > 4 ? "High Impact" : "Medium Impact"}
      </span>
    `;

    container.appendChild(div);
  });
}

// -----------------------------
// RENDER DEPENDENCY GRAPH
// -----------------------------

function renderGraph() {
  const container = document.querySelector(".graph-container");
  const svg = document.getElementById("graphSVG");

  container.querySelectorAll(".node").forEach(n => n.remove());
  svg.innerHTML = "";

  const centerY = 180;
  const containerWidth = container.clientWidth;
  const total = executionOrder.length;
  const spacingX = containerWidth / (total + 1);

  executionOrder.forEach((taskId, index) => {
    const task = getTaskById(taskId);

    const x = spacingX * (index + 1);
    const y = centerY;

    // CREATE NODE
    const node = document.createElement("div");
    node.className = "node";

    if (criticalPath.includes(taskId)) {
      node.classList.add("critical");
    }

    node.innerText = task.name;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    node.addEventListener("mousemove", (e) => {
      const score = bottleneckScores[task.id];

      showTooltip(
        `
          <strong>${task.name}</strong><br>
          Duration: ${task.duration} days<br>
          Dependents: ${dependencyGraph[task.id].length}<br>
          Score: ${score}
        `,
        e.pageX,
        e.pageY
      );
    });

    node.addEventListener("mouseleave", hideTooltip);

    container.appendChild(node);

    // DRAW LINE
    if (index > 0) {
      const prevX = 100 + (index - 1) * spacingX;

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );

      line.setAttribute("x1", prevX);
      line.setAttribute("y1", y);
      line.setAttribute("x2", x);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "#9ca3af");
      line.setAttribute("stroke-width", "2");

      svg.appendChild(line);
    }
  });
}

// -----------------------------
// RENDER GANTT CHART
// -----------------------------

function renderGanttChart() {
  const container = document.getElementById("ganttContainer");
  container.innerHTML = "";

  const scale = 40; // pixels per day

  tasks.forEach(task => {
    const row = document.createElement("div");
    row.className = "gantt-row";

    const label = document.createElement("div");
    label.className = "gantt-label";
    label.innerText = task.name;

    const bar = document.createElement("div");
    bar.className = "gantt-bar";

    if (criticalPath.includes(task.id)) {
      bar.classList.add("critical");
    }

    // Position and size
    bar.style.marginLeft = `${earliestTimes[task.id] * scale}px`;
    bar.style.width = `${task.duration * scale}px`;

    bar.addEventListener("mousemove", (e) => {
      showTooltip(
        `
          <strong>${task.name}</strong><br>
          Duration: ${task.duration} days<br>
          Start: ${earliestTimes[task.id]}<br>
          Critical: ${criticalPath.includes(task.id) ? "Yes" : "No"}
        `,
        e.pageX,
        e.pageY
      );
    });

    bar.addEventListener("mouseleave", hideTooltip);

    row.appendChild(label);
    row.appendChild(bar);

    container.appendChild(row);
  });
}
// -----------------------------
// ADD NEW TASK
// -----------------------------

async function addTask() {
  const name = document.getElementById("taskName").value.trim();
  const durationInput = document.getElementById("taskDuration").value;
  const duration = parseInt(durationInput, 10);

  if (!name) {
    alert("Please enter task name");
    return;
  }

  if (isNaN(duration) || duration <= 0) {
    alert("Enter valid duration");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        duration,
        dependencies: selectedDependencies || [],
        projectId: currentProjectId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to add task");
    }

    // ✅ SUCCESS FEEDBACK
    console.log("Task added:", data);
    alert("Task added successfully");

    // reset form
    document.getElementById("taskName").value = "";
    document.getElementById("taskDuration").value = "";

    selectedDependencies = [];
    
    await loadTasks(); // ✅ wait for reload
    updateDropdownDisplay();

  } catch (err) {
    console.error("Add Task Error:", err);
    alert("Error adding task");
  }
}

// -----------------------------
// RECALCULATE FULL SYSTEM
// -----------------------------

function recalculateSystem() {
  // -----------------------------
  // RESET STATE (IMPORTANT)
  // -----------------------------
  // 🔥 RESET ALL SYSTEM STATE
dependencyGraph = {};
executionOrder = [];
earliestTimes = {};
projectDuration = 0;
criticalPath = [];
bottleneckScores = {};
sortedBottlenecks = [];

  // -----------------------------
  // BUILD GRAPH
  // -----------------------------
  const newGraph = buildDependencyGraph(tasks);

  // -----------------------------
  // VALIDATE
  // -----------------------------
  if (hasCycle(newGraph)) {
    alert("Invalid dependency! Cycle detected.");
    tasks.pop(); // revert last
    return;
  }

  dependencyGraph = newGraph;

  // -----------------------------
  // HANDLE EMPTY TASKS
  // -----------------------------
  if (tasks.length === 0) {
  updateStats();
  renderTaskTable();
  renderBottlenecks();
  renderGraph();
  renderGanttChart();
  updateInsights(); // 🔥 ADD THIS LINE
  return;
}

  // -----------------------------
  // TOPOLOGICAL ORDER
  // -----------------------------
  executionOrder = topologicalSort(tasks, dependencyGraph);

  // -----------------------------
  // EARLIEST TIMES
  // -----------------------------
  earliestTimes = calculateEarliestTimes(
    tasks,
    dependencyGraph,
    executionOrder
  );

  // -----------------------------
  // FIX: HANDLE TASKS WITH NO DEPENDENCIES
  // -----------------------------
  tasks.forEach(task => {
    if (!task.dependencies || task.dependencies.length === 0) {
      earliestTimes[task.id] = 0;
    }
  });

  // -----------------------------
  // PROJECT DURATION
  // -----------------------------
  projectDuration = 0;

  tasks.forEach(task => {
    const finish = (earliestTimes[task.id] || 0) + task.duration;
    projectDuration = Math.max(projectDuration, finish);
  });

  // -----------------------------
  // FIND END TASK
  // -----------------------------
  let endTask = null;
  let maxTime = -1;

  tasks.forEach(task => {
    const finish = (earliestTimes[task.id] || 0) + task.duration;

    if (finish > maxTime) {
      maxTime = finish;
      endTask = task.id;
    }
  });

  // -----------------------------
  // CRITICAL PATH (SAFE)
  // -----------------------------
  if (endTask) {
    criticalPath = buildCriticalPath(tasks, earliestTimes, endTask) || [];
  } else {
    criticalPath = [];
  }

  // -----------------------------
  // BOTTLENECKS
  // -----------------------------
  bottleneckScores = calculateBottlenecks(
    tasks,
    dependencyGraph,
    criticalPath
  ) || {};

  sortedBottlenecks = Object.entries(bottleneckScores)
    .sort((a, b) => b[1] - a[1]);

  // -----------------------------
  // UPDATE DROPDOWN
  // -----------------------------
  renderDependencyDropdown();

 

  // -----------------------------
  // UPDATE UI
  // -----------------------------
  updateStats();
  renderTaskTable();
  renderBottlenecks();
  renderGraph();
  renderGanttChart();
  updateInsights();
}
// -----------------------------
// DELETE TASK (optional nice touch)
// -----------------------------

async function deleteTask(taskId) {
  if (!confirm("Delete this task?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Delete failed");

    // remove only deleted dependency
    selectedDependencies = selectedDependencies.filter(id => id !== taskId);

    // clear dropdown
    const menu = document.getElementById("dropdownMenu");
    if (menu) menu.innerHTML = "";

    await loadTasks();

    

    updateDropdownDisplay();

  } catch (err) {
    console.error("Delete error:", err);
  }
}

// -----------------------------
// INIT UI
// -----------------------------

loadTasks();