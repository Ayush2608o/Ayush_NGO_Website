/**
 * Asha Foundation - API Service Layer
 * Connects frontend HTML/JS with Java Backend (REST API)
 * Includes graceful offline fallback for static HR demo / testing
 */

const CANDIDATE_PORTS = [8080, 8085, 9090, 8000, 5000];

const API_CONFIG = {
  BASE_URL: window.ASHA_API_BASE_URL
    ? `${window.ASHA_API_BASE_URL.replace(/\/+$/, "")}/api`
    : (window.location.port ? `/api` : `http://localhost:8080/api`),
  REMOTE: Boolean(window.ASHA_API_BASE_URL),
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
  // Fallback data matching UI
  return {
    livesImpacted: "100,000+",
    schoolsBuilt: "120+",
    freeSurgeries: "45k+",
    treesPlanted: "250k",
    activeVolunteers: "1,200+"
  };
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
      raised: 80000,
      goal: 100000,
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "mobile-health-vans",
      title: "Mobile Health Vans",
      category: "Healthcare",
      description: "Equipped medical vans bringing free doctor consultations and medicines to remote villages.",
      raised: 45000,
      goal: 75000,
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "clean-earth-drive",
      title: "Clean Earth Drive",
      category: "Environment",
      description: "Planting native trees, restoring polluted water bodies, and advocating plastic-free urban areas.",
      raised: 35000,
      goal: 40000,
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
      title: "Annual Winter Relief Drive Launched Across 50 Districts",
      excerpt: "Providing blankets, warm clothing, and hot meals to thousands of shelterless people during winter.",
      details: "Local partner groups are distributing thermal kits and serving hot meals at community shelters across 50 districts. The drive focuses on reaching families and people without stable housing before the coldest weeks of winter."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
      meta: "EDUCATION • SEP 2026",
      title: "New Computer Lab Opened in Rural High School",
      excerpt: "Over 400 rural students now have daily access to high-speed internet and basic computer education.",
      details: "The new lab has 30 computers, internet access and solar power backup. Teachers will use it for introductory digital literacy lessons, research projects and practical computer skills for students across the school."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
      meta: "HEALTHCARE • AUG 2026",
      title: "1,200 Free Vision Care Camps Conducted",
      excerpt: "Restoring vision and independence to residents in remote villages through screenings, eyeglasses and referrals.",
      details: "Mobile ophthalmology teams screened more than 5,000 residents during the campaign. People needing further care received eyeglasses or referrals for follow-up treatment, including cataract surgery."
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
      meta: "ENVIRONMENT • JUL 2026",
      title: "Community Rainwater Harvesting Unit Installed",
      excerpt: "A new local storage unit helps communities conserve seasonal rainwater for household and agricultural use.",
      details: "The harvesting unit can store up to 100,000 liters of seasonal rainwater. Community volunteers are helping maintain the system and monitor stored water so it can support household needs and small-scale farming through drier months."
    }
  ];
}

async function postApiRequest(path, payload) {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json().catch(() => ({}));
    if (res.ok) return result;
    return { success: false, message: result.message || "The request could not be completed." };
  } catch (err) {
    console.warn(`Backend request failed for ${path}.`, err);
    return { success: false, message: "The Java backend is unavailable. Start it and try again." };
  }
}

function submitContactMessage(contactData) {
  return postApiRequest("/contact", contactData);
}

function processDonation(donationData) {
  return postApiRequest("/donate", donationData);
}

function submitVolunteerApplication(applicationData) {
  return postApiRequest("/volunteer", applicationData);
}

function submitNewsletterSubscription(subscriptionData) {
  return postApiRequest("/newsletter", subscriptionData);
}

// Expose API module
window.AshaAPI = {
  isBackendOnline,
  getBackendPort: () => new URL(API_CONFIG.BASE_URL, window.location.href).port,
  getStatsData,
  getProjectsData,
  getNewsData,
  submitContactMessage,
  processDonation,
  submitVolunteerApplication,
  submitNewsletterSubscription
};
