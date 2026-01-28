window.addEventListener("DOMContentLoaded", () => {
  const $ = (q) => document.querySelector(q);

  // Elements (must exist in index.html)
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

  // Quick check: if anything is missing, stop and tell you
  const required = {
    pwd, barFill, scorePill, labelPill, crackPill, tipsList, checklist,
    toggleBtn, copyBtn, toast, themeBtn, themeIcon,
    lenRange, lenVal, genBtn, optUpper, optLower, optNum, optSym
  };

  const missing = Object.entries(required).filter(([, el]) => !el).map(([k]) => k);
  if (missing.length) {
    console.error("Missing elements in HTML:", missing);
    alert("JS loaded but HTML is missing elements: " + missing.join(", ") +
      "\n\nYou likely didn’t replace index.html fully.");
    return;
  }

  // ---------- Toast ----------
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 1400);
  }

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

  // ---------- Password checks ----------
  const hasUpper = (s) => /[A-Z]/.test(s);
  const hasLower = (s) => /[a-z]/.test(s);
  const hasNum = (s) => /[0-9]/.test(s);
  const hasSym = (s) => /[^A-Za-z0-9]/.test(s);

  function looksCommon(s) {
    const lower = s.toLowerCase();
    const common = ["password","qwerty","123456","12345678","111111","admin","letmein","iloveyou","welcome"];
    if (common.some(w => lower.includes(w))) return true;
    if (/^(.)\1{5,}$/.test(s)) return true;
    if (/^(1234|abcd|qwer)/i.test(s)) return true;
    return false;
  }

  function scorePassword(s) {
    if (!s) return { score: 0, label: "Very weak" };
    let score = 0;

    score += Math.min(40, s.length * 3);

    const variety = [hasLower(s), hasUpper(s), hasNum(s), hasSym(s)].filter(Boolean).length;
    score += variety * 12;

    if (looksCommon(s)) score -= 25;
    if (s.length < 12) score -= 10;

    score = Math.max(0, Math.min(100, score));

    const label =
      score >= 85 ? "Excellent" :
      score >= 70 ? "Strong" :
      score >= 50 ? "Good" :
      score >= 30 ? "Weak" : "Very weak";

    return { score, label };
  }

  function estimateCrackTimeSeconds(s) {
    if (!s) return null;
    let charset = 0;
    if (hasLower(s)) charset += 26;
    if (hasUpper(s)) charset += 26;
    if (hasNum(s)) charset += 10;
    if (hasSym(s)) charset += 33;
    if (charset === 0) charset = 10;

    const guessesPerSec = 1e9;
    const combos = Math.pow(charset, s.length);
    const avgTries = combos / 2;
    return avgTries / guessesPerSec;
  }

  function formatTime(sec) {
    if (sec == null || !isFinite(sec)) return "—";
    if (sec < 1) return "< 1 second";
    const units = [
      ["year", 365 * 24 * 3600],
      ["day", 24 * 3600],
      ["hour", 3600],
      ["minute", 60],
      ["second", 1],
    ];
    for (const [name, value] of units) {
      const n = Math.floor(sec / value);
      if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""}`;
    }
    return `${Math.floor(sec)} seconds`;
  }

  function setChecklistState(key, ok) {
    const li = checklist.querySelector(`li[data-key="${key}"]`);
    if (li) li.classList.toggle("ok", !!ok);
  }

  function updateTips(state) {
    const tips = [];
    if (!state.len) tips.push("Increase length to 12–16+ characters.");
    if (!state.upper) tips.push("Add at least one uppercase letter (A–Z).");
    if (!state.lower) tips.push("Add at least one lowercase letter (a–z).");
    if (!state.num) tips.push("Add at least one number (0–9).");
    if (!state.sym) tips.push("Add a symbol (e.g., ! @ # $).");
    if (!state.common) tips.push("Avoid common words and patterns (1234, qwerty).");
    if (tips.length === 0) tips.push("Nice — this is strong. Consider using a password manager.");

    tipsList.innerHTML = tips.map(t => `<div>• ${t}</div>`).join("");
  }

  function render() {
    const s = pwd.value;

    const state = {
      len: s.length >= 12,
      upper: hasUpper(s),
      lower: hasLower(s),
      num: hasNum(s),
      sym: hasSym(s),
      common: s.length > 0 ? !looksCommon(s) : false,
    };

    Object.entries(state).forEach(([k, v]) => setChecklistState(k, v));

    const { score, label } = scorePassword(s);
    scorePill.textContent = `Score: ${score}/100`;
    labelPill.textContent = label;
    barFill.style.width = `${score}%`;

    const sec = estimateCrackTimeSeconds(s);
    crackPill.textContent = `Crack time: ${s ? formatTime(sec) : "—"}`;

    updateTips(state);
  }

  // Input live update
  pwd.addEventListener("input", render);

  // Show/hide
  toggleBtn.addEventListener("click", () => {
    const hidden = pwd.type === "password";
    pwd.type = hidden ? "text" : "password";
    toggleBtn.textContent = hidden ? "🙈" : "👁️";
  });

  // Copy
  copyBtn.addEventListener("click", async () => {
    if (!pwd.value) return showToast("Nothing to copy");
    try {
      await navigator.clipboard.writeText(pwd.value);
      showToast("Copied ✅");
    } catch {
      showToast("Copy failed");
    }
  });

  // Generator UI
  lenRange.addEventListener("input", () => (lenVal.textContent = lenRange.value));

  function generatePassword(length, useUpper, useLower, useNum, useSym) {
    const sets = [];
    if (useUpper) sets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    if (useLower) sets.push("abcdefghijklmnopqrstuvwxyz");
    if (useNum) sets.push("0123456789");
    if (useSym) sets.push("!@#$%^&*()-_=+[]{};:,.<>?/");

    if (sets.length === 0) return "";

    const chars = [];
    for (const set of sets) chars.push(set[Math.floor(Math.random() * set.length)]);

    const all = sets.join("");
    while (chars.length < length) chars.push(all[Math.floor(Math.random() * all.length)]);

    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
  }

  genBtn.addEventListener("click", () => {
    const length = Number(lenRange.value);
    const g = generatePassword(length, optUpper.checked, optLower.checked, optNum.checked, optSym.checked);
    if (!g) return showToast("Select at least 1 option");
    pwd.value = g;
    render();
    showToast("Generated ✨");
  });

  // Init
  render();
  console.log("Password Strength JS loaded ✅");
});
