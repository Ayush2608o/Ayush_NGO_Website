/**
 * Ayush NGO - Advanced Interactive Client Engine (Agency Grade)
 * Shared navigation, theme and currency controls, forms, donation requests,
 * gallery filtering and lightbox, FAQ accordion, and page status.
 */

// Global State
function readPreference(key, fallback) {
  try { return localStorage.getItem(key) || fallback; }
  catch (_) { return fallback; }
}

function savePreference(key, value) {
  try { localStorage.setItem(key, value); } catch (_) { /* Storage may be disabled. */ }
}

const AyushState = {
  theme: readPreference("asha_theme", "light"),
  currency: readPreference("asha_currency", "USD"),
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
  initDonationModal();
  initVolunteerModal();
  initNewsletterForm();
  initContactForm();
  initFaqAccordion();
  initGalleryFilters();
  initGalleryLightbox();
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
  document.documentElement.setAttribute("data-theme", AyushState.theme);
  updateThemeButtonUI();

  document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      AyushState.theme = AyushState.theme === "dark" ? "light" : "dark";
      savePreference("asha_theme", AyushState.theme);
      document.documentElement.setAttribute("data-theme", AyushState.theme);
      updateThemeButtonUI();
    });
  });
}

function updateThemeButtonUI() {
  document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
    btn.innerHTML = AyushState.theme === "dark" ? "☀️ Light" : "🌙 Dark";
    btn.setAttribute("title", `Switch to ${AyushState.theme === "dark" ? "Light" : "Dark"} mode`);
  });
}

/* --------------------------------------------------------------------------
   2. Currency Switcher ($ USD / ₹ INR)
   -------------------------------------------------------------------------- */
function initCurrencySystem() {
  updateCurrencyButtonUI();

  document.querySelectorAll(".currency-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      AyushState.currency = AyushState.currency === "USD" ? "INR" : "USD";
      savePreference("asha_currency", AyushState.currency);
      updateCurrencyButtonUI();
      updateDOMCurrencyValues();
    });
  });

  updateDOMCurrencyValues();
}

function updateCurrencyButtonUI() {
  document.querySelectorAll(".currency-toggle-btn").forEach(btn => {
    btn.innerHTML = AyushState.currency === "USD" ? "💵 USD ($)" : "₹ INR (₹)";
    btn.setAttribute("title", `Currency: ${AyushState.currency}. Click to switch.`);
  });
}

function updateDOMCurrencyValues() {
  const presets = document.querySelectorAll(".preset-btn");
  const donationAmounts = [500, 1000, 2500, 5000];
  presets.forEach((button, index) => {
    const amount = donationAmounts[index];
    if (!amount) return;
    button.dataset.amount = String(amount);
    button.textContent = `\u20B9${amount.toLocaleString("en-IN")}`;
  });

  const customInput = document.getElementById("customAmountInput");
  if (customInput) customInput.min = "1";

  const amountLabel = document.querySelector("#donationModal .preset-amounts-row")?.previousElementSibling;
  if (amountLabel) amountLabel.textContent = "SELECT AMOUNT (\u20B9)";
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
    waBtn = document.createElement("a");
    waBtn.className = "whatsapp-float-btn";
    waBtn.href = "contact.html";
    waBtn.textContent = "Contact Us";
    waBtn.setAttribute("aria-label", "Contact Ayush NGO");
    document.body.appendChild(waBtn);
  }
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
  const donorPhoneInput = document.getElementById("donorPhoneInput");
  const freqBtns = document.querySelectorAll(".freq-btn");
  const paymentMethods = document.querySelectorAll(".payment-method-btn");

  document.querySelectorAll('[data-action="donate"]').forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const cause = trigger.getAttribute("data-cause");
      if (cause) AyushState.activeCause = cause;
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
      AyushState.frequency = btn.getAttribute("data-freq") || "one-time";
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
      if (!Number.isFinite(amountVal) || !Number.isInteger(amountVal) || amountVal < 1 || amountVal > 1000000) {
        showToast("Enter a valid whole-rupee amount between ₹1 and ₹10,00,000.", "error");
        return;
      }

      const nameVal = donorNameInput ? donorNameInput.value.trim() : "";
      const emailVal = donorEmailInput ? donorEmailInput.value.trim() : "";
      const phoneVal = donorPhoneInput ? donorPhoneInput.value.trim() : "";
      if (!nameVal || !emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)
          || !/^[+0-9(). -]{7,20}$/.test(phoneVal) || phoneVal.replace(/\D/g, "").length < 7) {
        showToast("Enter your name, a valid email, and a valid phone number.", "error");
        return;
      }

      proceedPayBtn.disabled = true;
      proceedPayBtn.textContent = "Processing...";
      let checkoutOpened = false;
      let paymentFinished = false;
      try {
        if (AyushState.frequency !== "one-time") {
          showToast("Monthly donations are coming soon.", "error");
          return;
        }
        const config = await window.AyushAPI.getPaymentConfig();
        if (!config.success || !config.enabled || !config.keyId) {
          showToast("Online payments are not configured. Please contact the website administrator.", "error");
          return;
        }
        if (!(await loadRazorpayCheckout())) {
          showToast("Secure checkout could not load. Check your connection and try again.", "error");
          return;
        }
        const order = await window.AyushAPI.processDonation({
          amount: amountVal,
          currency: "INR",
          frequency: "one-time",
          cause: AyushState.activeCause || "General support",
          donorName: nameVal,
          donorEmail: emailVal,
          donorPhone: phoneVal
        });
        if (!order.success || !order.orderId) {
          showToast(order.message || "Could not start payment. Please try again.", "error");
          return;
        }
        const checkout = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Ayush NGO",
          description: "Donation to Ayush NGO",
          order_id: order.orderId,
          prefill: { name: nameVal, email: emailVal, contact: phoneVal },
          theme: { color: "#15803d" },
          handler: async payment => {
            paymentFinished = true;
            proceedPayBtn.disabled = true;
            proceedPayBtn.textContent = "Verifying payment...";
            try {
              const verified = await window.AyushAPI.verifyDonationPayment(payment);
              if (!verified.success || verified.verified !== true) {
                showToast("Payment verification failed. Please contact support if money was deducted.", "error");
                return;
              }
              closeDonationModal();
              showReceiptModal(nameVal, emailVal, `₹${amountVal.toLocaleString("en-IN")}`, order.requestId, "SUCCEEDED");
              showToast("Thank you! Your donation was successful.", "success");
            } catch (_) {
              showToast("Payment verification failed. Please contact support if money was deducted.", "error");
            } finally {
              proceedPayBtn.disabled = false;
              proceedPayBtn.textContent = "Donate Securely";
            }
          },
          modal: { ondismiss: () => {
            if (checkoutOpened && !paymentFinished) {
              showToast("Payment cancelled or checkout closed. No successful payment was recorded.", "error");
            }
            proceedPayBtn.disabled = false;
            proceedPayBtn.textContent = "Donate Securely";
          } }
        });
        checkout.on("payment.failed", () => {
          paymentFinished = true;
          showToast("Payment failed. Please contact support if money was deducted.", "error");
        });
        checkout.open();
        checkoutOpened = true;
      } catch (_) {
        showToast("Could not start payment. Check your connection and try again.", "error");
      } finally {
        if (!checkoutOpened) {
          proceedPayBtn.disabled = false;
          proceedPayBtn.textContent = "Donate Securely";
        }
      }
    });
  }
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise(resolve => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

function updateImpactExplainer() {
  const badge = document.getElementById("impactExplainerBadge");
  if (badge) badge.textContent = "Choose a one-time INR donation. Monthly donations are coming soon.";
}

/* --------------------------------------------------------------------------
   6. Donation Request Confirmation Modal
   -------------------------------------------------------------------------- */
function showReceiptModal(name, email, amountStr, requestId, status = "PENDING_PAYMENT") {
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
        <h3 class="modal-title">${status === "SUCCEEDED" ? "Donation Payment Successful" : "Donation Request Received"}</h3>
        <p class="modal-subtitle">${status === "SUCCEEDED" ? "Your payment has been verified by the payment provider." : "Payment remains pending. No successful payment has been confirmed."}</p>
      </div>
      <div class="receipt-certificate">
        <div class="receipt-header"><strong>Ayush NGO</strong></div>
        <div class="receipt-row"><span>Request ID:</span> <strong>${escapeHtml(requestId)}</strong></div>
        <div class="receipt-row"><span>Name:</span> <strong>${escapeHtml(name)}</strong></div>
        <div class="receipt-row"><span>Email:</span> <strong>${escapeHtml(email)}</strong></div>
        <div class="receipt-row"><span>Requested amount:</span> <strong>${escapeHtml(amountStr)}</strong></div>
        <div class="receipt-row"><span>Cause:</span> <span>${escapeHtml(AyushState.activeCause)}</span></div>
        <div class="receipt-row"><span>Frequency:</span> <span>${escapeHtml(AyushState.frequency)}</span></div>
        <div class="receipt-row"><span>Status:</span> <span>${status === "SUCCEEDED" ? "Payment verified" : "Pending payment"}</span></div>
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

      const result = await window.AyushAPI.submitVolunteerApplication({ name, email, phone, skill, city, date: new Date().toISOString() });
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
      showToast(`Thanks, ${name}. Your volunteer application has been received.`, "success");
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
    questionBtn.setAttribute("aria-expanded", String(item.classList.contains("active")));

    questionBtn.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      // Close all
      faqItems.forEach(f => f.classList.remove("active"));
      // Toggle current
      if (!isActive) item.classList.add("active");
      faqItems.forEach(f => {
        const button = f.querySelector(".faq-question");
        if (button) button.setAttribute("aria-expanded", String(f.classList.contains("active")));
      });
    });
  });
}

/* --------------------------------------------------------------------------
   9. Interactive Impact Calculator (in Our Work)
   -------------------------------------------------------------------------- */
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
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      try {
        const result = await window.AyushAPI.submitNewsletterSubscription({ email });
        if (result.success) {
          input.value = "";
          showToast(result.message || "Your signup request was recorded.", "success");
        } else {
          showToast(result.message || "Could not submit your signup. Please try again.", "error");
        }
      } catch (_) {
        showToast("Could not submit your signup. Please try again later.", "error");
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  });
}
/* --------------------------------------------------------------------------
   11. Confetti Particle Explosion
   -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   12. Live Recent Donor Ticker
   -------------------------------------------------------------------------- */
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
  let returnFocusTo = null;

  galleryItems.forEach(img => {
    const item = img.parentElement;
    const overlay = item.querySelector(".gallery-item-overlay");
    const inner = document.createElement("div");
    const front = document.createElement("div");
    const back = document.createElement("div");
    const openButton = document.createElement("button");
    const title = img.alt || "Gallery photo";

    inner.className = "gallery-card-inner";
    front.className = "gallery-card-face gallery-card-front";
    back.className = "gallery-card-face gallery-card-back";
    front.setAttribute("role", "button");
    front.setAttribute("tabindex", "0");
    front.setAttribute("aria-label", `Flip card for ${title}`);
    front.setAttribute("aria-expanded", "false");
    back.setAttribute("aria-hidden", "true");
    openButton.className = "gallery-open-button";
    openButton.type = "button";
    openButton.tabIndex = -1;
    openButton.textContent = "Open image";
    back.append(Object.assign(document.createElement("p"), { textContent: title }), openButton);
    if (overlay) front.append(img, overlay);
    else front.append(img);
    inner.append(front, back);
    item.replaceChildren(inner);
    item.setAttribute("role", "group");
    item.setAttribute("aria-label", title);

    const flip = isFlipped => {
      item.classList.toggle("is-flipped", isFlipped);
      front.setAttribute("aria-expanded", String(isFlipped));
      back.setAttribute("aria-hidden", String(!isFlipped));
      openButton.tabIndex = isFlipped ? 0 : -1;
      if (isFlipped) openButton.focus();
      else front.focus();
    };
    const open = () => {
      returnFocusTo = openButton;
      modalImg.src = img.src;
      modalImg.alt = title;
      caption.textContent = title;
      modal.classList.add("active");
      closeBtn.focus();
    };

    front.addEventListener("click", () => flip(true));
    front.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        flip(true);
      }
    });
    back.addEventListener("click", event => {
      if (event.target !== openButton) flip(false);
    });
    back.addEventListener("keydown", event => {
      if (event.key === "Escape") flip(false);
    });
    openButton.addEventListener("click", open);
  });

  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  const closeModal = () => {
    modal.classList.remove("active");
    if (returnFocusTo) returnFocusTo.focus();
  };
  closeBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.classList.contains("active")) closeModal();
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
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

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      showToast("Please fill in your name, email, subject, and message.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || payload.name.length > 120 || payload.subject.length > 200 || payload.message.length > 4000) {
      showToast("Check your email and keep the message within the allowed length.", "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending... ✈';
    }

    try {
      const response = await window.AyushAPI.submitContactMessage(payload);
      if (!response.success) {
        showToast(response.message || "Your message could not be sent. Please try again.", "error");
        return;
      }
      showToast(response.message || "Your message has been received.", "success");
      contactForm.reset();
    } catch (_) {
      showToast("Your message could not be sent. Please try again later.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Message ✈';
      }
    }
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
  toast.replaceChildren();
  const icon = document.createElement("span");
  icon.textContent = type === "error" ? "⚠️" : "✅";
  const text = document.createElement("span");
  text.textContent = message;
  toast.append(icon, document.createTextNode(" "), text);

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

  if (window.AyushAPI) {
    const isOnline = await window.AyushAPI.isBackendOnline();
    const statusElem = document.getElementById("backendStatusIndicator");
    if (statusElem) {
      if (isOnline) {
        statusElem.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;margin-right:6px;"></span>Java Backend: <strong>Live Connected</strong>`;
      } else {
      statusElem.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-right:6px;"></span>Java Backend: <strong>Offline</strong>`;
      }
    }
  }
}
