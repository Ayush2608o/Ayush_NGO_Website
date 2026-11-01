/* Account navigation and profile forms use the local SQLite-backed session service. */
document.addEventListener("DOMContentLoaded", () => {
  initAccountNavigation();
  initPasswordToggles();
  initLoginForm();
  initSignupForm();
  initProfilePage();
  initDonationDashboard();
  initLogoutButtons();
});


function accountStatus(element, message, state = "") {
  if (!element) return;
  element.textContent = message;
  if (state) element.dataset.state = state;
  else delete element.dataset.state;
}

function setBusy(button, busy, busyText, idleText) {
  if (!button) return;
  button.disabled = busy;
  button.textContent = busy ? busyText : idleText;
}

function safeReturnPath() {
  const next = new URLSearchParams(window.location.search).get("next") || "index.html#myProfileSection";
  if (next === "dashboard.html") return "index.html#myDonationsSection";
  if (next === "profile.html") return "index.html#myProfileSection";
  return next === "index.html#myProfileSection" || next === "index.html#myDonationsSection"
    ? next : "index.html#myProfileSection";
}

async function initAccountNavigation() {
  const menu = document.getElementById("navMenu");
  if (!menu) return;
  const signin = document.createElement("li");
  signin.className = "nav-account-signin";
  signin.innerHTML = '<a class="nav-link" href="login.html">Sign in</a>';
  const signup = document.createElement("li");
  signup.className = "nav-account-signup";
  signup.innerHTML = '<a class="nav-link" href="signup.html">Create account</a>';
  const profile = document.createElement("li");
  profile.className = "nav-account-profile";
  profile.hidden = true;
  profile.innerHTML = '<a class="nav-link" href="index.html#myProfileSection">My profile</a>';
  const donations = document.createElement("li");
  donations.className = "nav-account-dashboard";
  donations.hidden = true;
  donations.innerHTML = '<a class="nav-link" href="index.html#myDonationsSection">My donations</a>';
  const adminPage = document.createElement("li");
  adminPage.className = "nav-account-admin";
  adminPage.hidden = true;
  adminPage.innerHTML = '<a class="nav-link" href="admin.html">Payment review</a>';
  const logout = document.createElement("li");
  logout.className = "nav-account-logout";
  logout.hidden = true;
  logout.innerHTML = '<button type="button" id="logoutButton" class="nav-link account-nav-logout">Sign out</button>';
  menu.append(signin, signup, profile, donations, adminPage, logout);

  const options = await window.AyushAPI.get("/auth/options");
  document.querySelectorAll("#googleLogin, #googleSignup").forEach(link => {
    if (options.success && options.googleEnabled) {
      link.href = `${window.AyushAPI.baseUrl().replace(/\/api$/, "")}/oauth2/authorization/google`;
      link.hidden = false;
    }
  });

  const me = await window.AyushAPI.get("/auth/me");
  if (me.success && me.user) {
    signin.hidden = true;
    signup.hidden = true;
    profile.hidden = false;
    donations.hidden = false;
    adminPage.hidden = !(me.user.role === "ADMIN" && me.user.email?.toLowerCase() === "ayushsk2041@gmail.com");
    logout.hidden = false;
    document.querySelectorAll('.footer-links-list a[href="login.html"], .footer-links-list a[href="signup.html"]').forEach(link => {
      const item = link.closest("li");
      if (item) item.hidden = true;
    });
  }
}

function initPasswordToggles() {
  document.querySelectorAll("[data-password-toggle]").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;
      const reveal = input.type === "password";
      input.type = reveal ? "text" : "password";
      button.textContent = reveal ? "Hide" : "Show";
      button.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
    });
  });
}

function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;
  const redirectIfSignedIn = async () => {
    const current = await window.AyushAPI.get("/auth/me");
    if (current.success && current.user) window.location.replace(safeReturnPath());
  };
  redirectIfSignedIn();
  window.addEventListener("pageshow", event => {
    if (event.persisted) redirectIfSignedIn();
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    const status = document.getElementById("loginStatus");
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
      accountStatus(status, "Enter a valid email and password.", "error");
      return;
    }
    setBusy(button, true, "Signing in…", "Sign in");
    const result = await window.AyushAPI.post("/auth/login", { email, password });
    setBusy(button, false, "", "Sign in");
    if (!result.success) {
      accountStatus(status, result.message || "Sign-in failed. Check your details and verification status.", "error");
      return;
    }
    window.location.replace(safeReturnPath());
  });
}

function initSignupForm() {
  const form = document.getElementById("signupForm");
  if (!form) return;
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const status = document.getElementById("signupStatus");
    const button = form.querySelector('[type="submit"]');
    const fullName = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const phone = document.getElementById("signupPhone").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirm").value;
    if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      accountStatus(status, "Enter your name and a valid email address.", "error");
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,72}$/.test(password)) {
      accountStatus(status, "Use 12–72 characters with upper and lower case letters, a number, and a symbol.", "error");
      return;
    }
    if (password !== confirmPassword) {
      accountStatus(status, "The passwords do not match.", "error");
      return;
    }
    if (!document.getElementById("acceptTerms").checked) {
      accountStatus(status, "Accept the Terms and Privacy Policy to continue.", "error");
      return;
    }
    setBusy(button, true, "Creating account…", "Create account");
    const result = await window.AyushAPI.post("/auth/register", { fullName, email, phone, password });
    setBusy(button, false, "", "Create account");
    accountStatus(status, result.message || (result.success ? "Check your email to verify your account." : "Account registration could not be completed."), result.success ? "success" : "error");
    if (result.success) form.reset();
  });
}

async function requireUser(statusElement) {
  const result = await window.AyushAPI.get("/auth/me");
  if (!result.success || !result.user) {
    if (statusElement) accountStatus(statusElement, "Sign in to view this page.", "error");
    const page = window.location.pathname.split("/").pop();
    const next = page === "dashboard.html" ? "index.html#myDonationsSection" : "index.html#myProfileSection";
    window.setTimeout(() => window.location.assign("login.html?next=" + encodeURIComponent(next)), 500);
    return null;
  }
  return result.user;
}

async function refreshProfilePaymentSummary() {
  const paymentSummary = await window.AyushAPI.get("/profile/me");
  const totalElement = document.getElementById("profilePaidTotal");
  const countElement = document.getElementById("profilePaidCount");
  if (!paymentSummary.success) return;
  if (totalElement) totalElement.textContent = `INR ${Number(paymentSummary.summary?.total || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (countElement) countElement.textContent = String(paymentSummary.summary?.verified_count || 0);
}

function initProfilePage() {
  const form = document.getElementById("profileForm");
  if (!form) return;
  const homeSection = document.getElementById("myProfileSection");
  const isHomeProfile = form.dataset.homeProfile === "true";
  const load = async () => {
    let user;
    if (isHomeProfile) {
      if (window.location.hash !== "#myProfileSection") {
        homeSection.hidden = true;
        return;
      }
      const current = await window.AyushAPI.get("/auth/me");
      user = current.success ? current.user : null;
      if (!user || window.location.hash !== "#myProfileSection") {
        homeSection.hidden = true;
        return;
      }
      homeSection.hidden = false;
    } else {
      user = await requireUser(document.getElementById("profileAlert"));
      if (!user) return;
    }
    document.getElementById("profileTitle").textContent = user.fullName;
    document.getElementById("profileAvatar").textContent = (user.fullName || "A").trim().charAt(0).toUpperCase();
    const registeredAt = user.createdAt || user.memberSince || user.created_at;
    document.getElementById("memberSince").textContent = registeredAt ? `Member since ${new Date(registeredAt).toLocaleDateString()}` : "Your account profile";
    document.getElementById("profileName").value = user.fullName || "";
    document.getElementById("profileEmail").value = user.email || "";
    document.getElementById("emailVerificationState").textContent = user.emailVerified ? "Email verified" : "Email verification is not configured";
    document.getElementById("profilePhone").value = user.phone || "";
    document.getElementById("profileAddress").value = user.address || "";
    await refreshProfilePaymentSummary();
    if (isHomeProfile && window.location.hash === "#myProfileSection") {
      requestAnimationFrame(() => homeSection.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };
  load();
  if (isHomeProfile) window.addEventListener("hashchange", load);
  window.addEventListener("pageshow", event => {
    if (event.persisted) load();
  });
  window.setInterval(() => {
    const profileVisible = isHomeProfile
      ? window.location.hash === "#myProfileSection"
      : window.location.pathname.endsWith("profile.html");
    if (profileVisible && document.visibilityState === "visible") refreshProfilePaymentSummary();
  }, 15000);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    const status = document.getElementById("profileAlert");
    const fullName = document.getElementById("profileName").value.trim();
    if (!fullName) return accountStatus(status, "Your name is required.", "error");
    setBusy(button, true, "Saving…", "Save changes");
    const result = await window.AyushAPI.put("/profile/me", {
      fullName,
      phone: document.getElementById("profilePhone").value.trim(),
      address: document.getElementById("profileAddress").value.trim()
    });
    setBusy(button, false, "", "Save changes");
    accountStatus(status, result.message || (result.success ? "Profile saved." : "Profile could not be saved."), result.success ? "success" : "error");
    if (result.success) load();
  });
}

function initDonationDashboard() {
  const rows = document.getElementById("donationRows");
  if (!rows) return;
  const homeSection = document.getElementById("myDonationsSection");
  const isHomeDashboard = homeSection?.dataset.homeDashboard === "true";
  let hasRendered = false;
  if (!isHomeDashboard) {
    const target = "index.html#myDonationsSection";
    window.AyushAPI.get("/auth/me").then(user => {
      window.location.replace(user.success ? target : `login.html?next=${encodeURIComponent(target)}`);
    });
    return;
  }
  const load = async () => {
    if (window.location.hash !== "#myDonationsSection") {
      homeSection.hidden = true;
      return;
    }
    const current = await window.AyushAPI.get("/auth/me");
    if (!current.success || !current.user || window.location.hash !== "#myDonationsSection") {
      homeSection.hidden = true;
      return;
    }
    const user = current.user;
    homeSection.hidden = false;
    document.getElementById("dashboardAvatar").textContent = (user.fullName || "A").trim().charAt(0).toUpperCase();
    document.getElementById("dashboardUserName").textContent = user.fullName || user.full_name || "Your account";
    document.getElementById("dashboardUserEmail").textContent = user.email || "";
    document.getElementById("dashboardUserContact").textContent = [user.phone, user.address].filter(Boolean).join(" · ");
    const [summary, donations] = await Promise.all([
      window.AyushAPI.get("/donations/me/summary"),
      window.AyushAPI.get("/donations/me")
    ]);
    if (!summary.success || !donations.success) {
      accountStatus(document.getElementById("dashboardStatus"), summary.message || donations.message || "Donation history is unavailable.", "error");
      rows.innerHTML = '<tr><td colspan="6">Donation history could not be loaded.</td></tr>';
      return;
    }
    renderDonationSummary(summary);
    renderDonationRows(donations.items || []);
    renderMonthlyChart(summary.monthly || []);
    if (window.location.hash === "#myDonationsSection" && !hasRendered) {
      hasRendered = true;
      requestAnimationFrame(() => homeSection.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };
  load();
  window.addEventListener("hashchange", () => { hasRendered = false; load(); });
  window.addEventListener("pageshow", event => {
    if (event.persisted) { hasRendered = false; load(); }
  });
  window.setInterval(() => {
    if (window.location.hash === "#myDonationsSection" && document.visibilityState === "visible") load();
  }, 15000);
}

function renderDonationSummary(summary) {
  const totals = summary.successfulTotals || [];
  document.getElementById("personalTotal").textContent = totals.length
    ? totals.map(item => `${item.currency} ${Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`).join(" · ")
    : "0";
  document.getElementById("totalCurrencyNote").textContent = totals.length ? "Successful donations by currency" : "No verified donations yet";
  document.getElementById("successfulCount").textContent = String(summary.successfulCount || 0);
  document.getElementById("totalDonationCount").textContent = String(summary.totalCount || 0);
  document.getElementById("pendingDonationCount").textContent = String(summary.pendingCount || 0);
  document.getElementById("rejectedDonationCount").textContent = String(summary.rejectedCount || 0);
  document.getElementById("recentDonation").textContent = summary.mostRecentAmount
    ? `${summary.mostRecentCurrency} ${summary.mostRecentAmount}` : "—";
  document.getElementById("recentDonationDate").textContent = summary.mostRecentAt
    ? new Date(summary.mostRecentAt).toLocaleDateString() : "No successful donations yet";
}

function renderDonationRows(items) {
  const body = document.getElementById("donationRows");
  const empty = document.getElementById("donationEmpty");
  if (!items.length) {
    body.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  body.replaceChildren(...items.map(item => {
    const row = document.createElement("tr");
    const values = [item.id, new Date(item.createdAt || item.created_at).toLocaleDateString(), `INR ${item.amount}`, item.transaction_reference || "—", item.status, item.admin_note || "—"];
    values.forEach((value, index) => {
      const cell = document.createElement("td");
      if (index === 4) {
        const badge = document.createElement("span");
        badge.className = "donation-status";
        badge.dataset.status = item.status;
        badge.textContent = ({
          PENDING: "Pending admin confirmation",
          VERIFIED: "Accepted",
          REJECTED: "Payment not received"
        })[item.status] || item.status;
        cell.append(badge);
      } else cell.textContent = value;
      row.append(cell);
    });
    return row;
  }));
}

function renderMonthlyChart(points) {
  const chart = document.getElementById("monthlyDonationChart");
  const shown = points.slice(-6);
  if (!shown.length) {
    chart.textContent = "Verified monthly donation data will appear here.";
    chart.setAttribute("role", "status");
    return;
  }
  const max = Math.max(...shown.map(point => Number(point.total) || 0), 1);
  chart.replaceChildren(...shown.map(point => {
    const column = document.createElement("div");
    column.className = "monthly-chart-column";
    column.setAttribute("aria-label", `${point.month}: ${point.currency} ${point.total}`);
    const bar = document.createElement("span");
    bar.className = "monthly-chart-bar";
    bar.style.height = `${Math.max(3, Number(point.total) / max * 100)}%`;
    const label = document.createElement("span");
    label.textContent = new Date(`${point.month}-01T00:00:00`).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
    column.append(bar, label);
    return column;
  }));
}

function initLogoutButtons() {
  document.querySelectorAll("#logoutButton").forEach(button => button.addEventListener("click", async () => {
    const result = await window.AyushAPI.post("/auth/logout", {});
    if (result.success) window.location.replace("index.html");
    else accountStatus(document.getElementById("profileAlert") || document.getElementById("dashboardStatus"), result.message || "Could not sign out.", "error");
  }));
}
