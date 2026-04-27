// -----------------------------
// SIGNUP
// -----------------------------
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Fill all fields");
    return;
  }

  // ✅ PASSWORD CONSTRAINT
  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const exists = users.find(u => u.email === email);

  if (exists) {
    alert("User already exists. Please login.");
    return;
  }

  users.push({ email, password });

  localStorage.setItem("users", JSON.stringify(users));

  alert("Signup successful!");
  window.location.href = "index.html";
}

// -----------------------------
// LOGIN
// -----------------------------
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert("Invalid credentials");
    return;
  }

  localStorage.setItem("loggedInUser", email);

  window.location.href = "projects.html";
}

// -----------------------------
// NAVIGATION
// -----------------------------
function showSignup() {
  window.location.href = "signup.html";
}

function goToLogin() {
  window.location.href = "index.html";
}