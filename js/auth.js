// -----------------------------
// SIGNUP
// -----------------------------
async function signup() {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Enter all fields");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    console.log("Signup response:", data);

    if (!res.ok) {
      alert(data.message || "User already exists");
      return;
    }

    alert("Signup successful");

    // redirect to login
    window.location.href = "index.html";

  } catch (err) {
    console.error("Signup error:", err);
    alert("Error connecting to server");
  }
}


// -----------------------------
// LOGIN
// -----------------------------
async function login() {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Enter all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    console.log("Login response:", data);

    if (!res.ok) {
      alert(data.message || "Invalid credentials");
      return;
    }

    // ✅ STORE SESSION
    localStorage.setItem("loggedInUser", data.user._id);

    

    window.location.href = "projects.html";

  } catch (err) {
    console.error("Login error:", err);
    alert("Server error");
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
// NAVIGATION
// -----------------------------
function showSignup() {
  window.location.href = "signup.html";
}

function goToLogin() {
  window.location.href = "index.html";
}