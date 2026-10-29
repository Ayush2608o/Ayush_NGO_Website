/* Account pages use Spring-managed sessions. This file keeps the public pages anonymous by default. */
document.addEventListener("DOMContentLoaded", () => {
  initAccountNavigation();
  initPasswordToggles();
  initLoginForm();
  initSignupForm();
  initProfilePage();
  initDonationDashboard();
  initVerificationPage();
  initPasswordResetPage();
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
  const next = new URLSearchParams(window.location.search).get("next") || "dashboard.html";
  return /^(dashboard|profile)\.html$/.test(next) ? next : "dashboard.html";
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
  profile.innerHTML = '<a class="nav-link" href="profile.html">My profile</a>';
  menu.append(signin, signup, profile);

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
    window.location.assign(safeReturnPath());
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
    window.setTimeout(() => window.location.assign("login.html?next=" + encodeURIComponent(window.location.pathname.split("/").pop())), 500);
    return null;
  }
  return result.user;
}

function initProfilePage() {
  const form = document.getElementById("profileForm");
  if (!form) return;
  const load = async () => {
    const user = await requireUser(document.getElementById("profileAlert"));
    if (!user) return;
    document.getElementById("profileTitle").textContent = user.fullName;
    document.getElementById("profileAvatar").textContent = (user.fullName || "A").trim().charAt(0).toUpperCase();
    document.getElementById("memberSince").textContent = user.memberSince ? `Member since ${new Date(user.memberSince).toLocaleDateString()}` : "Your account profile";
    document.getElementById("profileName").value = user.fullName || "";
    document.getElementById("profileEmail").value = user.email || "";
    document.getElementById("emailVerificationState").textContent = user.emailVerified ? "Email verified" : "Email verification required";
    document.getElementById("profilePhone").value = user.phone || "";
    document.getElementById("profileAddress").value = user.address || "";
  };
  load();
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
  const load = async () => {
    const user = await requireUser(document.getElementById("dashboardStatus"));
    if (!user) return;
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
  };
  load();
}

function renderDonationSummary(summary) {
  const totals = summary.successfulTotals || [];
  document.getElementById("personalTotal").textContent = totals.length
    ? totals.map(item => `${item.currency} ${Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`).join(" · ")
    : "0";
  document.getElementById("totalCurrencyNote").textContent = totals.length ? "Successful donations by currency" : "No verified donations yet";
  document.getElementById("successfulCount").textContent = String(summary.successfulCount || 0);
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
    const values = [new Date(item.createdAt).toLocaleDateString(), item.projectName || "General", `${item.currency} ${item.amount}`, item.frequency, item.status];
    values.forEach((value, index) => {
      const cell = document.createElement("td");
      if (index === 4) {
        const badge = document.createElement("span");
        badge.className = "donation-status";
        badge.dataset.status = item.status;
        badge.textContent = item.status;
        cell.append(badge);
      } else cell.textContent = value;
      row.append(cell);
    });
    const receipt = document.createElement("td");
    if (item.status === "SUCCEEDED") {
      const link = document.createElement("a");
      link.href = `${window.AyushAPI.baseUrl()}/donations/${encodeURIComponent(item.id)}/receipt`;
      link.textContent = "Download";
      link.setAttribute("download", "");
      receipt.append(link);
    } else receipt.textContent = "—";
    row.append(receipt);
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

function initVerificationPage() {
  const form = document.getElementById("verifyForm");
  if (!form) return;
  const params = new URLSearchParams(window.location.search);
  document.getElementById("verifyToken").value = params.get("token") || "";
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const result = await window.AyushAPI.post("/auth/verify-email", { token: document.getElementById("verifyToken").value.trim() });
    accountStatus(document.getElementById("verifyStatus"), result.message || (result.success ? "Email verified. You can sign in." : "Verification link is invalid or expired."), result.success ? "success" : "error");
  });
  document.getElementById("resendVerification").addEventListener("click", async () => {
    const email = document.getElementById("resendEmail");
    if (!email.value.trim()) return accountStatus(document.getElementById("resendStatus"), "Enter the email address used for signup.", "error");
    const result = await window.AyushAPI.post("/auth/resend-verification", { email: email.value.trim() });
    accountStatus(document.getElementById("resendStatus"), result.message || "If an eligible account exists, a message will be sent.", result.success ? "success" : "error");
  });
}

function initPasswordResetPage() {
  const forgot = document.getElementById("forgotForm");
  if (forgot) forgot.addEventListener("submit", async event => {
    event.preventDefault();
    const result = await window.AyushAPI.post("/auth/forgot-password", { email: document.getElementById("forgotEmail").value.trim() });
    accountStatus(document.getElementById("forgotStatus"), result.message || "If that address is eligible, reset instructions will be sent.", "success");
  });
  const reset = document.getElementById("resetForm");
  if (reset) {
    document.getElementById("resetToken").value = new URLSearchParams(window.location.search).get("token") || "";
    reset.addEventListener("submit", async event => {
      event.preventDefault();
      const password = document.getElementById("resetPassword").value;
      if (password !== document.getElementById("resetConfirm").value) return accountStatus(document.getElementById("resetStatus"), "The passwords do not match.", "error");
      const result = await window.AyushAPI.post("/auth/reset-password", { token: document.getElementById("resetToken").value.trim(), password });
      accountStatus(document.getElementById("resetStatus"), result.message || (result.success ? "Password updated. Sign in with your new password." : "Reset link is invalid or expired."), result.success ? "success" : "error");
      if (result.success) reset.reset();
    });
  }
}

function initLogoutButtons() {
  document.querySelectorAll("#logoutButton").forEach(button => button.addEventListener("click", async () => {
    const result = await window.AyushAPI.post("/auth/logout", {});
    if (result.success) window.location.assign("login.html");
    else accountStatus(document.getElementById("profileAlert") || document.getElementById("dashboardStatus"), result.message || "Could not sign out.", "error");
  }));
}
