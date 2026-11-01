/* Verified public information stays empty until the organization supplies it. */
window.AYUSH_SITE_DATA = Object.freeze({
  brand: Object.freeze({
    name: "Ayush NGO",
    tagline: "Care that moves us forward",
    productionUrl: "https://ayushngo.netlify.app"
  }),
  organization: Object.freeze({
    verified: false,
    registrationNumbers: Object.freeze([]),
    certifications: Object.freeze([]),
    partners: Object.freeze([]),
    contact: Object.freeze({ email: null, phone: null, address: null, officeHours: null })
  }),
  payment: Object.freeze({
    enabled: false,
    currency: "INR",
    method: "manual-upi",
    configurationNote: "UPI details are loaded from the backend when an administrator configures the genuine QR code and UPI ID."
  }),
  themes: Object.freeze([
    Object.freeze({ id: "education", label: "Learning" }),
    Object.freeze({ id: "healthcare", label: "Wellbeing" }),
    Object.freeze({ id: "environment", label: "Environment" }),
    Object.freeze({ id: "community", label: "Community" })
  ]),
  content: Object.freeze({ projects: Object.freeze([]), posts: Object.freeze([]), team: Object.freeze([]), impact: null }),
  gallery: Object.freeze({
    verifiedImages: Object.freeze([]),
    illustrativeStock: Object.freeze([
      Object.freeze({ category: "education", src: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1000&q=80", alt: "Children learning together", caption: "Learning opens new possibilities" }),
      Object.freeze({ category: "community", src: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1000&q=80", alt: "Community members working together", caption: "Stronger, together" }),
      Object.freeze({ category: "education", src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80", alt: "Students taking part in a classroom lesson", caption: "A place to learn and grow" }),
      Object.freeze({ category: "healthcare", src: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80", alt: "Healthcare worker caring for a patient", caption: "Care with compassion" }),
      Object.freeze({ category: "environment", src: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80", alt: "Hands holding a small green plant", caption: "Growing a greener future" }),
      Object.freeze({ category: "community", src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1000&q=80", alt: "Volunteers joining hands in a circle", caption: "People make the difference" }),
      Object.freeze({ category: "environment", src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80", alt: "Sunlight falling over green hills", caption: "A world worth caring for" }),
      Object.freeze({ category: "healthcare", src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80", alt: "Healthcare team discussing patient care", caption: "Wellbeing for every community" })
    ])
  })
});
