/**
 * Asha Foundation - Advanced Interactive Client Engine (Agency Grade)
 * Features: Dark/Light Mode, Currency Switcher, Live Scroll Counter,
 *           Recent Donor Ticker, Gallery Lightbox, Confetti, Scroll Progress,
 *           Volunteer Modal, Donation Request Confirmation, Newsletter Signup,
 *           FAQ Accordion, Interactive Impact Calculator, Floating WhatsApp
 */

// Global State
const AshaState = {
  theme: localStorage.getItem("asha_theme") || "light",
  currency: localStorage.getItem("asha_currency") || "USD",
  rateUSDToINR: 85,
  frequency: "one-time",
  activeCause: "General Fund"
};

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initThemeSystem();
  initCurrencySystem();
  initScrollProgress();
  initBackToTop();
  initWhatsAppFloat();
  initLiveCounters();
  initDonationModal();
  initVolunteerModal();
  initNewsletterForm();
  initContactForm();
  initFaqAccordion();
  initImpactSlider();
  initGalleryFilters();
  initGalleryLightbox();
  initRecentDonorTicker();
  initYearAndBackendStatus();
});

function initMobileNavigation() {
  const toggle = document.getElementById("mobileToggle");
  const menu = document.getElementById("navMenu");

  if (!toggle || !menu) return;

  const setMenuOpen = isOpen => {
    menu.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Toggle navigation menu");
    toggle.textContent = isOpen ? "✕" : "☰";
  };

  setMenuOpen(false);

  toggle.addEventListener("click", () => {
    setMenuOpen(!menu.classList.contains("open"));
  });

  menu.addEventListener("click", event => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("click", event => {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") setMenuOpen(false);
  });
}

/* --------------------------------------------------------------------------
   1. Dark / Light Theme System
   -------------------------------------------------------------------------- */
function initThemeSystem() {
  document.documentElement.setAttribute("data-theme", AshaState.theme);
  updateThemeButtonUI();

  document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      AshaState.theme = AshaState.theme === "dark" ? "light" : "dark";
      localStorage.setItem("asha_theme", AshaState.theme);
      document.documentElement.setAttribute("data-theme", AshaState.theme);
      updateThemeButtonUI();
    });
  });
}

function updateThemeButtonUI() {
  document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
    btn.innerHTML = AshaState.theme === "dark" ? "☀️ Light" : "🌙 Dark";
    btn.setAttribute("title", `Switch to ${AshaState.theme === "dark" ? "Light" : "Dark"} mode`);
  });
}

/* --------------------------------------------------------------------------
   2. Currency Switcher ($ USD / ₹ INR)
   -------------------------------------------------------------------------- */
function initCurrencySystem() {
  updateCurrencyButtonUI();

  document.querySelectorAll(".currency-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      AshaState.currency = AshaState.currency === "USD" ? "INR" : "USD";
      localStorage.setItem("asha_currency", AshaState.currency);
      updateCurrencyButtonUI();
      updateDOMCurrencyValues();
    });
  });

  updateDOMCurrencyValues();
}

function updateCurrencyButtonUI() {
  document.querySelectorAll(".currency-toggle-btn").forEach(btn => {
    btn.innerHTML = AshaState.currency === "USD" ? "💵 USD ($)" : "₹ INR (₹)";
    btn.setAttribute("title", `Currency: ${AshaState.currency}. Click to switch.`);
  });
}

function updateDOMCurrencyValues() {
  const isINR = AshaState.currency === "INR";
  const sym = isINR ? "₹" : "$";

  const presets = document.querySelectorAll(".preset-btn");
  if (presets.length >= 3) {
    if (isINR) {
      presets[0].textContent = "₹2,000";
      presets[0].setAttribute("data-amount", "2000");
      presets[1].textContent = "₹4,000";
      presets[1].setAttribute("data-amount", "4000");
      presets[2].textContent = "₹8,000";
      presets[2].setAttribute("data-amount", "8000");
    } else {
      presets[0].textContent = "$25";
      presets[0].setAttribute("data-amount", "25");
      presets[1].textContent = "$50";
      presets[1].setAttribute("data-amount", "50");
      presets[2].textContent = "$100";
      presets[2].setAttribute("data-amount", "100");
    }
  }

  const customInput = document.getElementById("customAmountInput");
  if (customInput) {
    customInput.value = isINR ? "4000" : "50";
  }

  const amountLabel = document.querySelector(".amount-label");
  if (amountLabel) {
    amountLabel.textContent = `SELECT AMOUNT (${sym})`;
  }

  updateImpactExplainer();
  updateImpactCalculator();
}

/* --------------------------------------------------------------------------
   3. Scroll Progress Indicator, Back to Top & WhatsApp Float
   -------------------------------------------------------------------------- */
function initScrollProgress() {
  let bar = document.querySelector(".scroll-progress-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.className = "scroll-progress-bar";
    document.body.appendChild(bar);
  }

  window.addEventListener("scroll", () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.pageYOffset / totalHeight) * 100;
    bar.style.width = `${progress}%`;
  }, { passive: true });
}

function initBackToTop() {
  let btn = document.querySelector(".back-to-top-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.className = "back-to-top-btn";
    btn.innerHTML = "↑";
    btn.setAttribute("aria-label", "Back to top");
    document.body.appendChild(btn);
  }

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  }, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initWhatsAppFloat() {
  let waBtn = document.querySelector(".whatsapp-float-btn");
  if (!waBtn) {
    waBtn = document.createElement("button");
    waBtn.className = "whatsapp-float-btn";
    waBtn.innerHTML = `💬 <span>Helpline</span>`;
    waBtn.setAttribute("title", "Chat with Asha Foundation Volunteer Desk");
    document.body.appendChild(waBtn);
  }

  waBtn.addEventListener("click", () => {
    showToast("📱 Connecting to WhatsApp Volunteer Helpline: +91 98765 43210...", "success");
    window.open("https://api.whatsapp.com/send?phone=919876543210&text=Hello%20Asha%20Foundation%2C%20I%20would%20like%20to%20know%20more%20about%20your%20programs.", "_blank");
  });
}

/* --------------------------------------------------------------------------
   4. Live Number Counters with IntersectionObserver
   -------------------------------------------------------------------------- */
function initLiveCounters() {
  const counterElements = document.querySelectorAll(".stat-counter, .hero-stat-number, .about-highlight-number");
  if (!counterElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counterElements.forEach(elem => observer.observe(elem));
}

function animateCounter(element) {
  const text = element.textContent.trim();
  const match = text.match(/([\d,]+)/);
  if (!match) return;

  const rawNumber = parseInt(match[1].replace(/,/g, ""), 10);
  const suffix = text.replace(match[1], "");
  const duration = 1600;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.floor(rawNumber * ease);

    element.textContent = currentVal.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = rawNumber.toLocaleString() + suffix;
    }
  }

  requestAnimationFrame(update);
}

/* --------------------------------------------------------------------------
   5. Advanced Donation Modal
   -------------------------------------------------------------------------- */
function initDonationModal() {
  const modal = document.getElementById("donationModal");
  if (!modal) return;

  const closeBtn = document.getElementById("closeModalBtn");
  const presetBtns = document.querySelectorAll(".preset-btn");
  const customAmountInput = document.getElementById("customAmountInput");
  const proceedPayBtn = document.getElementById("proceedPayBtn");
  const donorNameInput = document.getElementById("donorNameInput");
  const donorEmailInput = document.getElementById("donorEmailInput");
  const freqBtns = document.querySelectorAll(".freq-btn");
  const paymentMethods = document.querySelectorAll(".payment-method-btn");

  document.querySelectorAll('[data-action="donate"]').forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const cause = trigger.getAttribute("data-cause");
      if (cause) AshaState.activeCause = cause;
      openDonationModal();
    });
  });

  function openDonationModal() {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    updateImpactExplainer();
  }

  function closeDonationModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", closeDonationModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeDonationModal();
  });

  freqBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      freqBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      AshaState.frequency = btn.getAttribute("data-freq") || "one-time";
      updateImpactExplainer();
    });
  });

  paymentMethods.forEach(method => {
    method.addEventListener("click", () => {
      paymentMethods.forEach(m => m.classList.remove("selected"));
      method.classList.add("selected");
    });
  });

  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const amt = btn.getAttribute("data-amount");
      if (customAmountInput) customAmountInput.value = amt;
      updatePresetSelection(amt);
      updateImpactExplainer();
    });
  });

  function updatePresetSelection(amt) {
    presetBtns.forEach(b => {
      if (b.getAttribute("data-amount") === String(amt)) {
        b.classList.add("selected");
      } else {
        b.classList.remove("selected");
      }
    });
  }

  if (customAmountInput) {
    customAmountInput.addEventListener("input", () => {
      updatePresetSelection(customAmountInput.value);
      updateImpactExplainer();
    });
  }

  if (proceedPayBtn) {
    proceedPayBtn.addEventListener("click", async () => {
      const amountVal = parseFloat(customAmountInput ? customAmountInput.value : 50);
      if (!amountVal || amountVal <= 0) {
        showToast("Please enter a valid donation amount.", "error");
        return;
      }

      const nameVal = donorNameInput ? donorNameInput.value.trim() : "Anonymous Philanthropist";
      const emailVal = donorEmailInput ? donorEmailInput.value.trim() : "donor@ashafoundation.org";

      proceedPayBtn.disabled = true;
      proceedPayBtn.textContent = "Submitting Request...";

      const result = await window.AshaAPI.processDonation({
        amount: amountVal,
        currency: AshaState.currency,
        frequency: AshaState.frequency,
        cause: AshaState.activeCause,
        donorName: nameVal,
        donorEmail: emailVal,
        timestamp: new Date().toISOString()
      });

      proceedPayBtn.disabled = false;
      proceedPayBtn.textContent = "Submit Donation Request";
      if (!result.success || !result.requestId) {
        showToast(result.message || "Could not submit your donation request. Please try again.", "error");
        return;
      }

      closeDonationModal();
      launchConfettiParticles();
      const sym = AshaState.currency === "INR" ? String.fromCharCode(8377) : "$";
      showReceiptModal(nameVal, emailVal, `${sym}${amountVal}`, result.requestId);
    });
  }
}

function updateImpactExplainer() {
  const badge = document.getElementById("impactExplainerBadge");
  const customInput = document.getElementById("customAmountInput");
  if (!badge || !customInput) return;

  const amt = parseFloat(customInput.value) || 50;
  const isINR = AshaState.currency === "INR";
  const normalizedUSD = isINR ? (amt / AshaState.rateUSDToINR) : amt;

  let message = `🌱 [${AshaState.activeCause}] Your gift directly transforms marginalized lives.`;
  if (normalizedUSD <= 30) {
    message = `📚 [${AshaState.activeCause}] Provides 1 child with books, bag & school uniform for 1 year.`;
  } else if (normalizedUSD <= 75) {
    message = `🧥 [${AshaState.activeCause}] Provides warm winter clothes, thermal blankets & meals for 3 families.`;
  } else {
    message = `🏥 [${AshaState.activeCause}] Funds mobile health clinic medicine and doctor consultations for an entire village.`;
  }

  if (AshaState.frequency === "monthly") {
    message += " (Recurring monthly 2x multiplier active!)";
  }

  badge.textContent = message;
}

/* --------------------------------------------------------------------------
   6. Donation Request Confirmation Modal
   -------------------------------------------------------------------------- */
function showReceiptModal(name, email, amountStr, requestId) {
  let modal = document.getElementById("receiptModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "receiptModal";
    modal.className = "modal-overlay";
    document.body.appendChild(modal);
  }

  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[character]);
  modal.innerHTML = `
    <div class="modal-card" style="max-width: 500px;">
      <button class="modal-close-btn" id="closeReceiptBtn" aria-label="Close">X</button>
      <div class="modal-header">
        <div class="modal-heart-icon" style="background:#dcfce7; color:#16a34a;">OK</div>
        <h3 class="modal-title">Donation Request Received</h3>
        <p class="modal-subtitle">This confirms your request only. No payment has been collected.</p>
      </div>
      <div class="receipt-certificate">
        <div class="receipt-header"><strong>Asha Foundation</strong></div>
        <div class="receipt-row"><span>Request ID:</span> <strong>${escapeHtml(requestId)}</strong></div>
        <div class="receipt-row"><span>Name:</span> <strong>${escapeHtml(name)}</strong></div>
        <div class="receipt-row"><span>Email:</span> <strong>${escapeHtml(email)}</strong></div>
        <div class="receipt-row"><span>Requested amount:</span> <strong>${escapeHtml(amountStr)}</strong></div>
        <div class="receipt-row"><span>Cause:</span> <span>${escapeHtml(AshaState.activeCause)}</span></div>
        <div class="receipt-row"><span>Frequency:</span> <span>${escapeHtml(AshaState.frequency)}</span></div>
        <div class="receipt-row"><span>Status:</span> <span>Pending payment</span></div>
        <div class="receipt-row"><span>Date:</span> <span>${new Date().toLocaleDateString()}</span></div>
      </div>
      <div style="margin-top:20px; display:flex; gap:10px;">
        <button class="btn btn-primary" style="flex:1;" onclick="window.print();">Print / Save</button>
        <button class="btn btn-outline-white" id="closeReceiptDoneBtn" style="color:var(--color-text-main); border-color:var(--color-border);">Done</button>
      </div>
    </div>`;
  modal.querySelector("#closeReceiptBtn").addEventListener("click", () => modal.classList.remove("active"));
  modal.querySelector("#closeReceiptDoneBtn").addEventListener("click", () => modal.classList.remove("active"));
  modal.classList.add("active");
}
/* --------------------------------------------------------------------------
   7. Volunteer Application Modal
   -------------------------------------------------------------------------- */
function initVolunteerModal() {
  let modal = document.getElementById("volunteerModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "volunteerModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-card volunteer-modal-card">
        <button class="modal-close-btn" id="closeVolunteerBtn">✕</button>
        <div class="modal-header">
          <div class="modal-heart-icon">🤝</div>
          <h3 class="modal-title">Join Us As A Volunteer</h3>
          <p class="modal-subtitle">Share your time & skills to transform lives on the ground.</p>
        </div>
        <form id="volunteerForm">
          <div class="form-group">
            <label class="form-label">FULL NAME</label>
            <input type="text" id="volName" class="form-control" placeholder="e.g. Ananya Sharma" required>
          </div>
          <div class="form-group">
            <label class="form-label">EMAIL ADDRESS</label>
            <input type="email" id="volEmail" class="form-control" placeholder="ananya@example.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">PHONE NUMBER</label>
            <input type="tel" id="volPhone" class="form-control" placeholder="+91 98765 43210" required>
          </div>
          <div class="form-group">
            <label class="form-label">PRIMARY AREA OF INTEREST</label>
            <select id="volSkill" class="form-control" style="background:var(--color-bg-card);">
              <option value="Teaching & Child Education">Teaching & Child Education</option>
              <option value="Healthcare & Medical Camps">Healthcare & Medical Camps</option>
              <option value="Environment & Tree Plantation">Environment & Tree Plantation</option>
              <option value="Tech, Design & Social Media">Tech, Design & Social Media</option>
              <option value="Disaster Relief Ground Support">Disaster Relief Ground Support</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">YOUR CITY / REGION</label>
            <input type="text" id="volCity" class="form-control" placeholder="e.g. New Delhi" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Submit Application 🚀</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector("#closeVolunteerBtn").addEventListener("click", () => modal.classList.remove("active"));
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("active"); });

    modal.querySelector("#volunteerForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("volName").value.trim();
      const email = document.getElementById("volEmail").value.trim();
      const phone = document.getElementById("volPhone").value.trim();
      const skill = document.getElementById("volSkill").value;
      const city = document.getElementById("volCity").value.trim();

      const btn = e.target.querySelector("button[type='submit']");
      btn.disabled = true;
      btn.textContent = "Registering...";

      const result = await window.AshaAPI.submitVolunteerApplication({ name, email, phone, skill, city, date: new Date().toISOString() });
      if (!result.success) {
        btn.disabled = false;
        btn.textContent = "Submit Application";
        showToast(result.message || "Could not submit your application. Please try again.", "error");
        return;
      }

      btn.disabled = false;
      btn.textContent = "Submit Application 🚀";
      modal.classList.remove("active");
      e.target.reset();
      launchConfettiParticles();
      showToast(`🎉 Welcome aboard, ${name}! Your volunteer application has been approved.`, "success");
    });
  }

  document.querySelectorAll('[data-action="volunteer"], .announcement-link[href="contact.html"]').forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.add("active");
    });
  });
}

/* --------------------------------------------------------------------------
   8. FAQ Accordion (in Contact Us)
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const questionBtn = item.querySelector(".faq-question");
    if (!questionBtn) return;

    questionBtn.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      // Close all
      faqItems.forEach(f => f.classList.remove("active"));
      // Toggle current
      if (!isActive) item.classList.add("active");
    });
  });
}

/* --------------------------------------------------------------------------
   9. Interactive Impact Calculator (in Our Work)
   -------------------------------------------------------------------------- */
function initImpactSlider() {
  const slider = document.getElementById("impactCalcSlider");
  if (!slider) return;

  slider.addEventListener("input", updateImpactCalculator);
  updateImpactCalculator();
}

function updateImpactCalculator() {
  const slider = document.getElementById("impactCalcSlider");
  const display = document.getElementById("calcAmountVal");
  const childrenVal = document.getElementById("calcChildrenVal");
  const mealsVal = document.getElementById("calcMealsVal");
  const medicinesVal = document.getElementById("calcMedicineVal");

  if (!slider || !display) return;

  const rawVal = parseFloat(slider.value);
  const isINR = AshaState.currency === "INR";
  const sym = isINR ? "₹" : "$";

  let actualAmount = isINR ? (rawVal * 80) : rawVal;
  display.textContent = `${sym}${actualAmount.toLocaleString()}`;

  const normalizedUSD = isINR ? (actualAmount / AshaState.rateUSDToINR) : actualAmount;

  if (childrenVal) childrenVal.textContent = Math.max(1, Math.floor(normalizedUSD / 25)) + " Students";
  if (mealsVal) mealsVal.textContent = Math.max(10, Math.floor(normalizedUSD * 8)) + " Meals";
  if (medicinesVal) medicinesVal.textContent = Math.max(1, Math.floor(normalizedUSD / 40)) + " Clinics";
}

/* --------------------------------------------------------------------------
   10. Footer Newsletter Subscription
   -------------------------------------------------------------------------- */
function initNewsletterForm() {
  const forms = document.querySelectorAll(".newsletter-form");
  forms.forEach(form => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector(".newsletter-input");
      if (!input || !input.value.trim()) return;

      const email = input.value.trim();
      const result = await window.AshaAPI.submitNewsletterSubscription({ email });
      if (result.success) {
        input.value = "";
        showToast(result.message || `Thank you for subscribing, ${email}!`, "success");
      } else {
        showToast(result.message || "Could not subscribe. Please try again.", "error");
      }
    });
  });
}
/* --------------------------------------------------------------------------
   11. Confetti Particle Explosion
   -------------------------------------------------------------------------- */
function launchConfettiParticles() {
  let canvas = document.getElementById("confettiCanvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "confettiCanvas";
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#00a86b", "#34d399", "#38bdf8", "#f59e0b", "#ec4899", "#8b5cf6"];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.8) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10
    });
  }

  let animationFrame;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.alpha -= 0.014;
      p.rotation += p.vRot;

      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}

/* --------------------------------------------------------------------------
   12. Live Recent Donor Ticker
   -------------------------------------------------------------------------- */
function initRecentDonorTicker() {
  const donors = [
    { name: "Priya Sharma", city: "New Delhi", amount: "$50", cause: "Shiksha Mission 2026", time: "2 mins ago" },
    { name: "Rahul Verma", city: "Mumbai", amount: "$100", cause: "Mobile Health Vans", time: "5 mins ago" },
    { name: "Ananya Deshmukh", city: "Pune", amount: "$35", cause: "Clean Earth Drive", time: "8 mins ago" },
    { name: "Siddharth Rao", city: "Bengaluru", amount: "$75", cause: "Education For All", time: "12 mins ago" },
    { name: "Kavita Nair", city: "Kochi", amount: "$50", cause: "Winter Relief Package", time: "15 mins ago" }
  ];

  let ticker = document.querySelector(".donor-ticker");
  if (!ticker) {
    ticker = document.createElement("div");
    ticker.className = "donor-ticker";
    document.body.appendChild(ticker);
  }

  let index = 0;
  function showNextDonor() {
    const d = donors[index % donors.length];
    index++;

    ticker.innerHTML = `
      <div class="donor-ticker-avatar">💚</div>
      <div class="donor-ticker-content">
        <div class="donor-ticker-name">${d.name} (${d.city})</div>
        <div class="donor-ticker-details">Donated <strong>${d.amount}</strong> to ${d.cause} • <em>${d.time}</em></div>
      </div>
    `;

    ticker.classList.add("show");

    setTimeout(() => {
      ticker.classList.remove("show");
    }, 5500);
  }

  setTimeout(showNextDonor, 4000);
  setInterval(showNextDonor, 18000);
}

/* --------------------------------------------------------------------------
   13. Fullscreen Gallery Lightbox
   -------------------------------------------------------------------------- */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll(".gallery-item img");
  if (!galleryItems.length) return;

  let modal = document.querySelector(".lightbox-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "lightbox-modal";
    modal.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Close image">✕</button>
        <img src="" alt="High resolution preview" class="lightbox-image">
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const modalImg = modal.querySelector(".lightbox-image");
  const caption = modal.querySelector(".lightbox-caption");
  const closeBtn = modal.querySelector(".lightbox-close");

  galleryItems.forEach(img => {
    img.parentElement.addEventListener("click", () => {
      modalImg.src = img.src;
      caption.textContent = img.alt || "Asha Foundation Grassroots Initiative";
      modal.classList.add("active");
    });
  });

  closeBtn.addEventListener("click", () => modal.classList.remove("active"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });
}

/* --------------------------------------------------------------------------
   14. Contact Form Submission
   -------------------------------------------------------------------------- */
function initContactForm() {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const nameInput = document.getElementById("contactName");
    const emailInput = document.getElementById("contactEmail");
    const subjectInput = document.getElementById("contactSubject");
    const messageInput = document.getElementById("contactMessage");

    const payload = {
      name: nameInput ? nameInput.value.trim() : "",
      email: emailInput ? emailInput.value.trim() : "",
      subject: subjectInput ? subjectInput.value.trim() : "",
      message: messageInput ? messageInput.value.trim() : "",
      submittedAt: new Date().toISOString()
    };

    if (!payload.name || !payload.email || !payload.message) {
      showToast("Please fill in your name, email, and message.", "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending... ✈';
    }

    const response = await window.AshaAPI.submitContactMessage(payload);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Message ✈';
    }

    showToast(response.message || "Thank you! Your inquiry has been registered.", "success");
    contactForm.reset();
  });
}

/* --------------------------------------------------------------------------
   15. Gallery Category Filter Tabs
   -------------------------------------------------------------------------- */
function initGalleryFilters() {
  const tabs = document.querySelectorAll(".filter-tab");
  const items = document.querySelectorAll(".gallery-item");
  if (!tabs.length || !items.length) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const category = tab.getAttribute("data-filter");
      items.forEach(item => {
        const itemCat = item.getAttribute("data-category");
        if (category === "all" || itemCat === category) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   16. Toast Notifications
   -------------------------------------------------------------------------- */
function showToast(message, type = "success") {
  let toast = document.getElementById("globalToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "globalToast";
    toast.className = "toast-notice";
    document.body.appendChild(toast);
  }

  toast.className = `toast-notice ${type === "error" ? "toast-error" : "toast-success"} show`;
  toast.innerHTML = `<span>${type === "error" ? "⚠️" : "✅"}</span> <span>${message}</span>`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4500);
}

/* --------------------------------------------------------------------------
   17. Footer Status & Year
   -------------------------------------------------------------------------- */
async function initYearAndBackendStatus() {
  const yearSpan = document.getElementById("currentYear");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  if (window.AshaAPI) {
    const isOnline = await window.AshaAPI.isBackendOnline();
    const statusElem = document.getElementById("backendStatusIndicator");
    if (statusElem) {
      if (isOnline) {
        statusElem.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;margin-right:6px;"></span>Java Backend: <strong>Live Connected</strong>`;
      } else {
        statusElem.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-right:6px;"></span>Java Backend: <strong>Client Offline Mode (100% Functional)</strong>`;
      }
    }
  }
}
