(() => {
  try {
    const saved = localStorage.getItem("asha_theme");
    const system = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const theme = saved === "dark" || saved === "light" ? saved : system;
    document.documentElement.setAttribute("data-theme", theme);
  } catch (_) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
