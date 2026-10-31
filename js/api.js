/**
 * Ayush NGO - API Service Layer
 * Connects frontend HTML/JS with Java Backend (REST API)
 * Includes graceful offline fallback for static HR demo / testing
 */

const CANDIDATE_PORTS = [8080, 8085, 9090, 8000, 5000];
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const localApiBase = LOCAL_HOSTS.has(window.location.hostname)
  ? `http://${window.location.hostname === "::1" ? "[::1]" : window.location.hostname}:8085/api`
  : "http://localhost:8085/api";

const API_CONFIG = {
  BASE_URL: window.AYUSH_API_BASE_URL
    ? `${window.AYUSH_API_BASE_URL.replace(/\/+$/, "")}/api`
    : (window.location.port === "8085" ? "/api" : (LOCAL_HOSTS.has(window.location.hostname) ? localApiBase : (window.location.port ? "/api" : localApiBase))),
  REMOTE: Boolean(window.AYUSH_API_BASE_URL),
  TIMEOUT_MS: 2000
};

// Check if Java backend is running (probes active port)
async function isBackendOnline() {
  if (API_CONFIG.REMOTE) {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/health`);
      return res.ok;
    } catch (_) {
      return false;
    }
  }
  // If running from same port as server
  if (window.location.protocol.startsWith("http") && window.location.port) {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        API_CONFIG.BASE_URL = "/api";
        return true;
      }
    } catch (_) {}
  }

  // Probe localhost candidate ports
  for (const port of CANDIDATE_PORTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 600);
      const res = await fetch(`http://localhost:${port}/api/health`, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        API_CONFIG.BASE_URL = `http://localhost:${port}/api`;
        return true;
      }
    } catch (_) {
      // Continue to next port
    }
  }
  return false;
}

// Fetch NGO Impact Statistics
async function getStatsData() {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/stats`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.info("Using local fallback stats (Java backend offline).");
  }
  return { available: false, message: "Verified impact data has not been configured." };
}

// Fetch Initiatives & Projects
async function getProjectsData() {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/projects`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.info("Using local fallback projects (Java backend offline).");
  }
  // Fallback projects matching UI
  return [
    {
      id: "shiksha-2026",
      title: "Shiksha Mission 2026",
      category: "Education",
      description: "Providing digital classrooms, free uniforms, and nutritious midday meals to remote rural schools.",
      sampleData: true,

      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "mobile-health-vans",
      title: "Mobile Health Vans",
      category: "Healthcare",
      description: "Equipped medical vans bringing free doctor consultations and medicines to remote villages.",
      sampleData: true,

      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "clean-earth-drive",
      title: "Clean Earth Drive",
      category: "Environment",
      description: "Planting native trees, restoring polluted water bodies, and advocating plastic-free urban areas.",
      sampleData: true,

      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
    }
  ];
}

// Fetch Blog & Latest News
async function getNewsData() {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/news`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.info("Using local fallback news (Java backend offline).");
  }
  return [
    {
      id: 1,
      badge: "News 1",
      meta: "PRESS RELEASE • OCT 2026",
      title: "Winter Relief Program Update",
      excerpt: "An illustrative update about community support during winter.",
      details: "This sample article is placeholder content and should be replaced with a verified update before publication."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
      meta: "EDUCATION • SEP 2026",
      title: "New Computer Lab Opened in Rural High School",
      excerpt: "An illustrative update about expanding access to digital learning.",
      details: "This sample article is placeholder content and should be replaced with a verified update before publication."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
      meta: "HEALTHCARE • AUG 2026",
      title: "Community Vision Care Program",
      excerpt: "Restoring vision and independence to residents in remote villages through screenings, eyeglasses and referrals.",
      details: "Mobile ophthalmology teams screened community members during the campaign. People needing further care received eyeglasses or referrals for follow-up treatment, including cataract surgery."
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
      meta: "ENVIRONMENT • JUL 2026",
      title: "Community Rainwater Harvesting Unit Installed",
      excerpt: "A new local storage unit helps communities conserve seasonal rainwater for household and agricultural use.",
      details: "This illustrative update needs verified details before publication. Community volunteers are helping maintain the system and monitor stored water so it can support household needs and small-scale farming through drier months."
    }
  ];
}

async function postApiRequest(path, payload) {
  return sendApiRequest(path, "POST", payload);
}

async function putApiRequest(path, payload) {
  return sendApiRequest(path, "PUT", payload);
}

async function sendApiRequest(path, method, payload) {
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
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": csrf.token || ""
      },
      body: JSON.stringify(payload),
      credentials: "include",
      signal: controller.signal
    });

    const result = await res.json().catch(() => ({}));
    if (res.ok) return result;
    return { success: false, message: result.message || "The request could not be completed." };
  } catch (err) {
    console.warn(`Backend request failed for ${path}.`, err);
    return { success: false, message: err.name === "AbortError" ? "The request timed out. Please try again." : "The Java backend is unavailable. Start it and try again." };
  } finally {
    clearTimeout(timer);
  }
}

async function getApiRequest(path) {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok, status: res.status, ...data };
  } catch (_) {
    return { success: false, status: 0, message: "The Ayush NGO service is unavailable." };
  }
}

function submitContactMessage(contactData) {
  return postApiRequest("/contact", contactData);
}

function processDonation(donationData) {
  return postApiRequest("/payment/order", donationData);
}

function verifyDonationPayment(paymentData) {
  return postApiRequest("/payment/verify", paymentData);
}

function getPaymentConfig() {
  return getApiRequest("/payment/config");
}

function submitVolunteerApplication(applicationData) {
  return postApiRequest("/volunteer", applicationData);
}

function submitNewsletterSubscription(subscriptionData) {
  return postApiRequest("/newsletter", subscriptionData);
}

// Expose API module
window.AyushAPI = {
  isBackendOnline,
  getBackendPort: () => new URL(API_CONFIG.BASE_URL, window.location.href).port,
  baseUrl: () => API_CONFIG.BASE_URL,
  get: getApiRequest,
  post: postApiRequest,
  put: putApiRequest,
  getStatsData,
  getProjectsData,
  getNewsData,
  submitContactMessage,
  processDonation,
  verifyDonationPayment,
  getPaymentConfig,
  submitVolunteerApplication,
  submitNewsletterSubscription
};
