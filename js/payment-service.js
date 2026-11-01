/* Client side payment adapter. Payment secrets must remain on the server. */
window.AyushPaymentService = Object.freeze({
  currency: window.AYUSH_SITE_DATA?.payment?.currency || "INR",
  getAvailability() {
    const payment = window.AYUSH_SITE_DATA?.payment;
    return Boolean(payment?.enabled && payment.publicKeyId && window.AyushAPI);
  },
  async createDonation(payload) {
    if (!this.getAvailability()) {
      return { success: false, message: "Online payment is currently unavailable. Please try again later." };
    }
    const response = await window.AyushAPI.post("/donate", { ...payload, currency: "INR" });
    if (!response.success || !response.paymentConfigured) {
      return { success: false, message: response.message || "Online payment is currently unavailable. Please try again later." };
    }
    return response;
  }
});
