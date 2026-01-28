(() => {
  const $ = (q) => document.querySelector(q);

  const pwd = $("#pwd");
  const barFill = $("#barFill");
  const scorePill = $("#scorePill");
  const labelPill = $("#labelPill");
  const crackPill = $("#crackPill");
  const tipsList = $("#tipsList");
  const checklist = $("#checklist");
  const toggleBtn = $("#toggleBtn");
  const copyBtn = $("#copyBtn");
  const toast = $("#toast");

  const themeBtn = $("#themeBtn");
  const themeIcon = $("#themeIcon");

  const lenRange = $("#lenRange");
  const lenVal = $("#lenVal");
  const genBtn = $("#genBtn");
  const optUpper = $("#optUpper");
  const optLower = $("#optLower");
  const optNum = $("#optNum");
  const optSym = $("#optSym");

  // ---------- Theme ----------
  const savedTheme = localStorage.getItem("ps_theme");
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  syncThemeIcon();

  themeBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("ps_theme", next);
    syncThemeIcon();
  });

  function syncThemeIcon() {
    const t = document.documentElement.getAttribute("data-theme") || "dark";
    themeIcon.textContent = t === "dark" ? "🌙" : "☀️";
  }

  // ---------- Helpers ----------
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 1400);
  }

  function hasUpper(s) { return /[A-Z]/.test(s); }
  function hasLower(s) { return /[a-z]/.test(s); }
  function hasNum(s) { return /[0-9]/.test(s); }
  function hasSym(s) { return /[^A-Za-z0-9]/.test(s); }

  // Basic "common pattern" detection (simple but useful)
  function looksCommon(s) {
    const lower = s.toLowerCase();
    const common = ["password","qwerty","123456","12345678","111111","admin","letmein","iloveyou","welcome"];
    if (common.some(w => lower.includes(w))) return true;
    if (/^(.)\1{5
