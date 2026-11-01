/**
 * Ayush NGO - API Service Layer
 * Connects the static frontend to the Ayush NGO REST API.
 * Uses verified API responses only; it never invents local fallback records.
 */

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const localApiBase = LOCAL_HOSTS.has(window.location.hostname)
  ? `http://${window.location.hostname === "::1" ? "[::1]" : window.location.hostname}:8085/api`
  : "http://localhost:8085/api";

const API_CONFIG = {
  BASE_URL: window.AYUSH_API_BASE_URL
    ? `${window.AYUSH_API_BASE_URL.replace(/\/+$/, "")}/api`
    : (window.location.port === "8085" ? "/api" : (LOCAL_HOSTS.has(window.location.hostname) ? localApiBase : "")),
  TIMEOUT_MS: 5000
};

// Check the configured API only; do not probe unrelated local services.
async function isBackendOnline() {
  if (!API_CONFIG.BASE_URL) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      credentials: "include",
      signal: controller.signal
    });
    return response.ok;
  } catch (error) {
    console.warn("Configured Ayush NGO API health check failed.", error);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// These sections render only data published by the API.
async function getStatsData() {
  if (!API_CONFIG.BASE_URL) return { available: false, message: "Verified impact data is not available.", items: [] };
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/stats`);
    if (!res.ok) return { available: false, message: "Verified impact data is not available.", items: [] };
    return await res.json();
  } catch (error) {
    console.warn("Verified impact data could not be loaded.", error);
    return { available: false, message: "Verified impact data could not be loaded.", items: [] };
  }
}

async function getProjectsData() {
  if (!API_CONFIG.BASE_URL) return { success: false, message: "Published projects are not available.", items: [] };
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/projects`);
    if (!res.ok) return { success: false, message: "Published projects are not available.", items: [] };
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.items;
    return Array.isArray(items) ? { success: true, items } : { success: false, message: "The projects response is invalid.", items: [] };
  } catch (error) {
    console.warn("Published projects could not be loaded.", error);
    return { success: false, message: "Published projects could not be loaded.", items: [] };
  }
}

async function getNewsData() {
  if (!API_CONFIG.BASE_URL) return { success: false, message: "Published news is not available.", items: [] };
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/news`);
    if (!res.ok) return { success: false, message: "Published news is not available.", items: [] };
    const items = await res.json();
    return Array.isArray(items) ? { success: true, items } : { success: false, message: "The news response is invalid.", items: [] };
  } catch (error) {
    console.warn("Published news could not be loaded.", error);
    return { success: false, message: "Published news could not be loaded.", items: [] };
  }
}

async function postApiRequest(path, payload) {
  return sendApiRequest(path, "POST", payload);
}

async function putApiRequest(path, payload) {
  return sendApiRequest(path, "PUT", payload);
}

async function patchApiRequest(path, payload) {
  return sendApiRequest(path, "PATCH", payload);
}

async function sendApiRequest(path, method, payload) {
  if (!API_CONFIG.BASE_URL) {
    return { success: false, status: 0, message: "The Ayush NGO API is not configured." };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const csrfResponse = await fetch(`${API_CONFIG.BASE_URL}/auth/csrf`, {
      credentials: "include",
      signal: controller.signal
    });
    const csrf = await csrfResponse.json().catch(() => ({}));
    if (!csrfResponse.ok) return { success: false, message: csrf.message || "Authentication service is unavailable." };

    const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
      method,
      headers: {
        ...(payload instanceof FormData ? {} : { "Content-Type": "application/json" }),
        "X-XSRF-TOKEN": csrf.token || "",
        "X-CSRF-Token": csrf.token || ""
      },
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
      credentials: "include",
      signal: controller.signal
    });

    const result = await res.json().catch(() => ({}));
    if (res.ok) return result;
    return { success: false, message: result.message || "The request could not be completed." };
  } catch (err) {
    console.warn(`Backend request failed for ${path}.`, err);
    return { success: false, message: err.name === "AbortError" ? "The request timed out. Please try again." : "The Ayush NGO backend is unavailable. Start the API and try again." };
  } finally {
    clearTimeout(timer);
  }
}

async function postFormApiRequest(path, formData) {
  return sendApiRequest(path, "POST", formData);
}

async function putFormApiRequest(path, formData) {
  return sendApiRequest(path, "PUT", formData);
}

async function getApiRequest(path) {
  if (!API_CONFIG.BASE_URL) {
    return { success: false, status: 0, message: "The Ayush NGO API is not configured." };
  }
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok, status: res.status, ...data };
  } catch (error) {
    console.warn(`Backend request failed for ${path}.`, error);
    return { success: false, status: 0, message: "The Ayush NGO service is unavailable." };
  }
}

function submitContactMessage(contactData) {
  return postApiRequest("/contact", contactData);
}

function submitVolunteerApplication(applicationData) {
  return postApiRequest("/volunteer", applicationData);
}

function submitNewsletterSubscription(subscriptionData) {
  return postApiRequest("/newsletter", subscriptionData);
}

async function submitNetlifyForm(form) {
  const configuredHost = window.AYUSH_SITE_DATA?.brand?.productionUrl
    ? new URL(window.AYUSH_SITE_DATA.brand.productionUrl).hostname
    : "";
  const hostname = window.location.hostname.toLowerCase();
  const isNetlifyHost = Boolean(configuredHost) &&
    (hostname === configuredHost.toLowerCase() || hostname.endsWith(".netlify.app"));
  const formName = form.getAttribute("name");
  if (!isNetlifyHost || !formName || form.dataset.netlify !== "true") {
    return { success: false, skipped: true, message: "Netlify Forms is not available on this host." };
  }

  const formData = new FormData(form);
  formData.set("form-name", formName);
  try {
    const response = await fetch(window.location.pathname, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString()
    });
    return response.ok
      ? { success: true, message: "Your submission has been received." }
      : { success: false, message: "The form service could not accept this submission." };
  } catch (_) {
    return { success: false, message: "The form service is unavailable. Please try again later." };
  }
}

// Expose API module
window.AyushAPI = {
  isConfigured: () => Boolean(API_CONFIG.BASE_URL),
  isBackendOnline,
  getBackendPort: () => new URL(API_CONFIG.BASE_URL, window.location.href).port,
  baseUrl: () => API_CONFIG.BASE_URL,
  get: getApiRequest,
  post: postApiRequest,
  postForm: postFormApiRequest,
  put: putApiRequest,
  patch: patchApiRequest,
  putForm: putFormApiRequest,
  getStatsData,
  getProjectsData,
  getNewsData,
  submitContactMessage,
  submitVolunteerApplication,
  submitNewsletterSubscription,
  submitNetlifyForm
};
