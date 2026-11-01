/**
 * Ayush NGO - Advanced Interactive Client Engine (Agency Grade)
 * Shared navigation, theme controls, forms, donation requests,
 * gallery filtering and lightbox, FAQ accordion, and page status.
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initScrollProgress();
  initBackToTop();
  initWhatsAppFloat();
  initDonationModal();
  initNewsletterForm();
  initContactForm();
  initVolunteerPageForm();
  initFaqAccordion();
  initGalleryContent();
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

  const title = document.getElementById("donationModalTitle");
  const body = modal.querySelector(".modal-body");
  if (title) title.textContent = "Support our work";
  if (body) {
    body.replaceChildren();
    body.innerHTML = `
      <p class="form-help" id="donationAvailability">Online payment is currently unavailable. Please try again later.</p>
      <form id="donationForm" novalidate>
        <div class="donation-freq-toggle" role="group" aria-label="Donation frequency">
          <button class="freq-btn active" type="button" data-frequency="ONE_TIME" aria-pressed="true">One-time</button>
          <button class="freq-btn" type="button" data-frequency="MONTHLY" aria-pressed="false">Monthly</button>
        </div>
        <label class="amount-label" for="customAmountInput">Choose an amount (INR ₹)</label>
        <div class="preset-amounts-row" role="group" aria-label="Donation amount">
          <button class="preset-btn selected" type="button" data-amount="500" aria-pressed="true">₹500</button>
          <button class="preset-btn" type="button" data-amount="1000" aria-pressed="false">₹1,000</button>
          <button class="preset-btn" type="button" data-amount="2500" aria-pressed="false">₹2,500</button>
          <button class="preset-btn" type="button" data-amount="5000" aria-pressed="false">₹5,000</button>
        </div>
        <div class="form-group">
          <label class="form-label" for="customAmountInput">Custom amount (₹)</label>
          <input class="form-control" id="customAmountInput" name="amount" type="number" min="5" max="1000000" step="1" value="500" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="donorName">Full name</label>
          <input class="form-control" id="donorName" name="name" type="text" autocomplete="name" maxlength="120" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="donorEmail">Email address</label>
          <input class="form-control" id="donorEmail" name="email" type="email" autocomplete="email" maxlength="254" required>
        </div>
        <p id="donationStatus" class="form-status" role="status" aria-live="polite"></p>
        <button class="btn btn-primary" type="submit">Continue to payment</button>
      </form>`;

    const form = body.querySelector("#donationForm");
    const amountInput = body.querySelector("#customAmountInput");
    const frequencyButtons = [...body.querySelectorAll("[data-frequency]")];
    const amountButtons = [...body.querySelectorAll("[data-amount]")];
    const status = body.querySelector("#donationStatus");
    const submitButton = form.querySelector('[type="submit"]');
    let frequency = "ONE_TIME";

    frequencyButtons.forEach(button => button.addEventListener("click", () => {
      frequency = button.dataset.frequency;
      frequencyButtons.forEach(option => {
        const selected = option === button;
        option.classList.toggle("active", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
    }));

    amountButtons.forEach(button => button.addEventListener("click", () => {
      amountInput.value = button.dataset.amount;
      amountButtons.forEach(option => {
        const selected = option === button;
        option.classList.toggle("selected", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
    }));

    amountInput.addEventListener("input", () => {
      amountButtons.forEach(button => {
        const selected = button.dataset.amount === amountInput.value;
        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    });

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const email = form.elements.namedItem("email");
      email.setCustomValidity(email.validity.typeMismatch ? "Please enter a valid email address." : "");
      if (!form.reportValidity()) return;

      const originalLabel = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "Checking payment availability…";
      status.dataset.state = "pending";
      status.textContent = "Checking payment availability…";
      try {
        const result = await window.AyushPaymentService?.createDonation({
          amount: Number(amountInput.value),
          currency: "INR",
          frequency,
          donorName: form.elements.namedItem("name").value.trim(),
          donorEmail: email.value.trim(),
          cause: "General Fund"
        });
        const message = result?.success && result.checkoutUrl
          ? "Opening secure payment…"
          : (result?.success ? "Online payment is currently unavailable. Please try again later." : (result?.message || "Online payment is currently unavailable. Please try again later."));
        status.dataset.state = result?.success && result.checkoutUrl ? "pending" : "error";
        status.textContent = message;
        if (result?.success && result.checkoutUrl) window.location.assign(result.checkoutUrl);
        else showToast(message, "error");
      } catch (_) {
        status.dataset.state = "error";
        status.textContent = "Online payment is currently unavailable. Please try again later.";
        showToast(status.textContent, "error");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    });
  }

  const closeBtn = document.getElementById("closeModalBtn");
  let lastTrigger = null;

  document.querySelectorAll('[data-action="donate"]').forEach(trigger => {
    trigger.addEventListener("click", event => {
      event.preventDefault();
      lastTrigger = trigger;
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      closeBtn?.focus();
    });
  });

  function closeDonationModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    lastTrigger?.focus();
  }

  if (closeBtn) closeBtn.addEventListener("click", closeDonationModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeDonationModal();
  });
  document.addEventListener("keydown", event => {
    if (!modal.classList.contains("active")) return;
    if (event.key === "Escape") closeDonationModal();
    if (event.key === "Tab") {
      const focusable = [...modal.querySelectorAll('a[href], button:not([disabled])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });
}
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
      const honeypot = form.elements.namedItem("bot-field");
      if (!input || !input.value.trim()) return;

      input.setCustomValidity(input.validity.valueMissing || input.validity.typeMismatch
        ? "Please enter a valid email address."
        : "");
      if (!form.reportValidity()) return;

      if (honeypot?.value) {
        form.reset();
        return;
      }

      const email = input.value.trim();
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      try {
        const result = window.AyushAPI.isConfigured()
          ? await window.AyushAPI.submitNewsletterSubscription({ email })
          : await window.AyushAPI.submitNetlifyForm(form);
        if (result.success) {
          input.value = "";
          showToast("Thank you for subscribing!", "success");
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
        <button class="lightbox-close" type="button" aria-label="Close image">✕</button>
        <button class="lightbox-prev" type="button" aria-label="Previous image">←</button>
        <img src="" alt="High resolution preview" class="lightbox-image">
        <button class="lightbox-next" type="button" aria-label="Next image">→</button>
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const modalImg = modal.querySelector(".lightbox-image");
  const caption = modal.querySelector(".lightbox-caption");
  const closeBtn = modal.querySelector(".lightbox-close");
  const previousBtn = modal.querySelector(".lightbox-prev");
  const nextBtn = modal.querySelector(".lightbox-next");
  let returnFocusTo = null;
  let currentImages = [];
  let currentIndex = 0;

  galleryItems.forEach(img => {
    const item = img.closest(".gallery-item") || img.parentElement;
    const title = item.querySelector(".gallery-item-overlay p")?.textContent.trim() || img.alt || "Gallery photo";
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `Open image: ${title}`);
    const open = () => {
      returnFocusTo = item;
      currentImages = [...document.querySelectorAll(".gallery-item:not([hidden]) img")];
      currentIndex = currentImages.indexOf(img);
      showCurrentImage();
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    };
    item.addEventListener("click", open);
    item.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });

  function showCurrentImage() {
    const img = currentImages[currentIndex];
    if (!img) return;
    modalImg.src = img.currentSrc || img.src;
    modalImg.alt = img.alt || "Gallery photo";
    caption.textContent = img.closest(".gallery-item")?.querySelector(".gallery-item-overlay p")?.textContent.trim() || img.alt || "Gallery photo";
    const multiple = currentImages.length > 1;
    previousBtn.hidden = !multiple;
    nextBtn.hidden = !multiple;
  }

  const moveImage = direction => {
    if (currentImages.length < 2) return;
    currentIndex = (currentIndex + direction + currentImages.length) % currentImages.length;
    showCurrentImage();
  };

  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Gallery image viewer");
  const closeModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    if (returnFocusTo) returnFocusTo.focus();
  };
  closeBtn.addEventListener("click", closeModal);
  previousBtn.addEventListener("click", () => moveImage(-1));
  nextBtn.addEventListener("click", () => moveImage(1));
  document.addEventListener("keydown", event => {
    if (!modal.classList.contains("active")) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowLeft") moveImage(-1);
    if (event.key === "ArrowRight") moveImage(1);
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

function initGalleryContent() {
  const grid = document.getElementById("galleryGrid");
  const gallery = window.AYUSH_SITE_DATA?.gallery;
  if (!grid || !gallery) return;

  const verified = gallery.verifiedImages.length > 0;
  const photos = verified ? gallery.verifiedImages : gallery.illustrativeStock;
  const note = document.querySelector(".gallery-demo-note");
  if (note) {
    const label = document.createElement("strong");
    label.textContent = verified ? "Verified gallery" : "Illustrative gallery";
    const text = document.createElement("p");
    text.append(label, document.createTextNode(verified
      ? " — images provided and approved by Ayush NGO."
      : " — these stock photographs are visual examples, not documentation of Ayush NGO programs or events."));
    const icon = document.createElement("span");
    icon.textContent = "ⓘ";
    icon.setAttribute("aria-hidden", "true");
    note.replaceChildren(icon, text);
  }

  const fragment = document.createDocumentFragment();
  photos.forEach(photo => {
    const card = document.createElement("div");
    card.className = "gallery-item";
    card.dataset.category = photo.category;
    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = photo.alt;
    image.loading = "lazy";
    image.decoding = "async";
    const overlay = document.createElement("div");
    overlay.className = "gallery-item-overlay";
    const affordance = document.createElement("span");
    affordance.textContent = "↗";
    affordance.setAttribute("aria-hidden", "true");
    const caption = document.createElement("p");
    caption.textContent = photo.caption;
    overlay.append(affordance, caption);
    card.append(image, overlay);
    fragment.append(card);
  });
  grid.replaceChildren(fragment);

  const count = document.getElementById("galleryCount");
  const results = document.getElementById("galleryResults");
  if (count) count.textContent = String(photos.length).padStart(2, "0");
  if (results) results.textContent = `Showing ${photos.length} ${photos.length === 1 ? "story" : "stories"}`;
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
    const phoneInput = document.getElementById("contactPhone");
    const status = document.getElementById("contactStatus");
    const honeypot = contactForm.elements.namedItem("bot-field");

    if (!contactForm.reportValidity()) return;
    if (honeypot?.value) {
      contactForm.reset();
      return;
    }

    const payload = {
      name: nameInput ? nameInput.value.trim() : "",
      email: emailInput ? emailInput.value.trim() : "",
      phone: phoneInput ? phoneInput.value.trim() : "",
      botField: honeypot ? honeypot.value : "",
      subject: subjectInput ? subjectInput.value.trim() : "",
      message: messageInput ? messageInput.value.trim() : "",
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
    if (status) { status.textContent = "Sending your message…"; status.dataset.state = "pending"; }

    try {
      const response = window.AyushAPI.isConfigured()
        ? await window.AyushAPI.submitContactMessage(payload)
        : await window.AyushAPI.submitNetlifyForm(contactForm);
      if (!response.success) {
        if (status) { status.textContent = response.message || "Your message could not be sent. Please try again."; status.dataset.state = "error"; }
        showToast(response.message || "Your message could not be sent. Please try again.", "error");
        return;
      }
      if (status) { status.textContent = response.message || "Your message has been received."; status.dataset.state = "success"; }
      showToast(response.message || "Your message has been received.", "success");
      contactForm.reset();
    } catch (_) {
      if (status) { status.textContent = "Your message could not be sent. Please try again later."; status.dataset.state = "error"; }
      showToast("Your message could not be sent. Please try again later.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Message ✈';
      }
    }
  });
}

function initVolunteerPageForm() {
  const form = document.getElementById("volunteerPageForm");
  if (!form) return;
  const interestOptions = [...form.querySelectorAll(".volunteer-interest-option")];
  const interestValue = document.getElementById("volunteerInterestValue");
  const status = document.getElementById("volunteerPageStatus");
  const updateInterests = () => {
    const selected = interestOptions.filter(option => option.checked).map(option => option.value);
    if (interestValue) interestValue.value = selected.join(", ");
    if (interestOptions[0]) interestOptions[0].setCustomValidity(selected.length ? "" : "Choose at least one area of interest.");
  };
  interestOptions.forEach(option => option.addEventListener("change", updateInterests));
  updateInterests();

  form.addEventListener("submit", async event => {
    event.preventDefault();
    updateInterests();
    if (!form.reportValidity()) return;
    const honeypot = form.elements.namedItem("bot-field");
    if (honeypot?.value) {
      form.reset();
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const payload = {
      name: form.elements.namedItem("name").value.trim(),
      email: form.elements.namedItem("email").value.trim(),
      phone: form.elements.namedItem("phone").value.trim(),
      age: Number(form.elements.namedItem("age").value),
      city: form.elements.namedItem("city").value.trim(),
      state: form.elements.namedItem("state").value.trim(),
      occupation: form.elements.namedItem("occupation").value.trim(),
      skill: form.elements.namedItem("skill").value.trim(),
      areasOfInterest: interestValue?.value || "",
      availability: form.elements.namedItem("availability").value.trim(),
      preference: form.elements.namedItem("preference").value,
      motivation: form.elements.namedItem("motivation").value.trim(),
      botField: ""
    };

    if (button) { button.disabled = true; button.dataset.originalText = button.textContent; button.textContent = "Sending…"; }
    if (status) { status.textContent = "Sending your application…"; status.dataset.state = "pending"; }
    try {
      const response = window.AyushAPI.isConfigured()
        ? await window.AyushAPI.submitVolunteerApplication(payload)
        : await window.AyushAPI.submitNetlifyForm(form);
      if (!response.success) {
        if (status) { status.textContent = response.message || "Your application could not be sent."; status.dataset.state = "error"; }
        showToast(response.message || "Your application could not be sent. Please try again.", "error");
        return;
      }
      form.reset();
      updateInterests();
      if (status) { status.textContent = response.message || "Your volunteer interest has been received."; status.dataset.state = "success"; }
      showToast(response.message || "Your volunteer interest has been received.", "success");
    } catch (_) {
      if (status) { status.textContent = "Your application could not be sent. Please try again later."; status.dataset.state = "error"; }
      showToast("Your application could not be sent. Please try again later.", "error");
    } finally {
      if (button) { button.disabled = false; button.textContent = button.dataset.originalText || "Send volunteer interest"; }
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

  const results = document.getElementById("galleryResults");
  const count = document.getElementById("galleryCount");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-pressed", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-pressed", "true");

      const category = tab.getAttribute("data-filter");
      let visibleCount = 0;
      items.forEach(item => {
        const itemCat = item.getAttribute("data-category");
        const isVisible = category === "all" || itemCat === category;
        item.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });
      if (results) results.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? "story" : "stories"}`;
      if (count) count.textContent = String(visibleCount).padStart(2, "0");
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

  if (window.AyushAPI && !window.AyushAPI.isConfigured()) {
    const statusElem = document.getElementById("backendStatusIndicator");
    if (statusElem) statusElem.textContent = "Public forms use Netlify Forms.";
  } else if (window.AyushAPI) {
    const isOnline = await window.AyushAPI.isBackendOnline();
    const statusElem = document.getElementById("backendStatusIndicator");
    if (statusElem) {
      if (isOnline) {
        statusElem.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;margin-right:6px;"></span>Backend: <strong>Live Connected</strong>`;
      } else {
      statusElem.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-right:6px;"></span>Backend: <strong>Offline</strong>`;
      }
    }
  }
}
