document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const updateButtons = () => {
    const theme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    document.querySelectorAll(".theme-toggle-btn").forEach(button => {
      const nextTheme = theme === "dark" ? "light" : "dark";
      button.textContent = theme === "dark" ? "Light" : "Dark";
      button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
      button.setAttribute("aria-pressed", String(theme === "dark"));
    });
  };

  updateButtons();
  document.querySelectorAll(".theme-toggle-btn").forEach(button => {
    button.addEventListener("click", () => {
      const theme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", theme);
      try { localStorage.setItem("asha_theme", theme); } catch (_) { /* Storage may be disabled. */ }
      updateButtons();
    });
  });
});
