const API_BASE_URL = "https://salonease-production.up.railway.app";

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (error) {
    return null;
  }
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function setUserMenu() {
  const userMenu = document.getElementById("userMenu");
  if (!userMenu) return;

  const user = getCurrentUser();

  if (user) {
    userMenu.innerHTML = `
      <a href="dashboard.html" class="user-chip">Hi, ${user.full_name || "User"}</a>
      <button onclick="logout()" class="btn-outline">Logout</button>
    `;
  } else {
    userMenu.innerHTML = `
      <a href="login.html" class="btn-outline">Login</a>
      <a href="register.html" class="btn-dark">Register</a>
    `;
  }
}

document.addEventListener("DOMContentLoaded", setUserMenu);