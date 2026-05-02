# 🚀 Bottleneck Analyzer - Project Management System

## 📌 Overview
Bottleneck Analyzer is a web-based project management application that helps users efficiently manage projects and tasks with dependencies. It uses graph-based algorithms to analyze task execution flow, identify bottlenecks, and determine the critical path for optimized scheduling.

---

## 🎯 Key Features
- 📁 Create and manage multiple projects
- ✅ Add tasks with or without dependencies
- 🔗 Multi-select task dependencies
- 🔄 Detect cyclic dependencies (invalid workflows)
- 📊 Identify bottlenecks in task execution
- ⏱️ Calculate Critical Path
- 📈 Generate Key Insights for project optimization
- 💾 Local storage support (data persistence)
- 🔐 Login & Signup functionality (with validation)
- 🗑️ Delete tasks and projects

---

## 🧠 Core Concepts Used
- Graph Theory (Directed Acyclic Graph - DAG)
- Topological Sorting
- Critical Path Method (CPM)
- Cycle Detection (DFS/BFS)
- Dependency Resolution

---

## 🛠️ Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Storage:** LocalStorage (Browser-based)
- **Logic:** Vanilla JavaScript (No frameworks)

---

## ⚙️ How It Works
1. User creates a project
2. Adds tasks and defines dependencies
3. System builds a dependency graph
4. Algorithms process:
   - Execution order (Topological Sort)
   - Cycle detection
   - Earliest start & finish times
5. Outputs:
   - Critical Path
   - Bottleneck tasks
   - Project duration
   - Key Insights

---

## 📸 Screenshots
*(Add your project screenshots here)*

---

## 🚧 Challenges Faced
- Handling tasks without dependencies
- Managing dynamic multi-select dropdowns
- Ensuring consistent data persistence using localStorage
- Debugging dependency graph issues and cycle detection
- Updating insights dynamically

---

## 🔮 Future Improvements
- Backend integration (MongoDB / Node.js)
- Real-time collaboration
- Gantt Chart visualization
- Export project reports (PDF/Excel)
- AI-based task duration prediction

---

## ▶️ How to Run the Project
1. Clone the repository:
   ```bash
   git clone https://github.com/Vaachi405/BottleNeck-Analyzer
