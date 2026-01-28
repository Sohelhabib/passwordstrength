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

  // Very basic "common pattern" detection (upgrade later with zxcvbn if you want)
  function looksCommon(s) {
    const lower = s.toLowerCase();
    const common = ["password","qwerty","123456","12345678","111111","admin","letmein","iloveyou","welcome"];
    if (common.some(w => lower.includes(w))) return true;
    if (/^(.)\1{5,}$/.test(s)) return true;              // aaaaaaa
    if (/^(1234|abcd|qwer)/i.test(s)) return true;       // obvious sequences
    return false;
  }

  // Estimate combinations per character set size, then crack time assuming X guesses/sec
  function estimateCrackTimeSeconds(s) {
    if (!s) return null;
    let charset = 0;
    if (hasLower(s)) charset += 26;
    if (hasUpper(s)) charset += 26;
    if (hasNum(s)) charset += 10;
    if (hasSym(s)) charset += 33; // rough printable symbols

    // If only one category, assume smaller effective charset
    if (charset === 0) charset = 10;

    // guesses per second (rough consumer+botnet-ish midpoint)
    const guessesPerSec = 1e9; // 1 billion/sec (varies hugely by hash & attacker)
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

  function scorePassword(s) {
    if (!s) return { score: 0, label: "Very weak" };

    let score = 0;

    // length
    score += Math.min(40, s.length * 3);

    // variety
    const variety = [hasLower(s), hasUpper(s), hasNum(s), hasSym(s)].filter(Boolean).length;
    score += variety * 12;

    // penalties
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

  function setChecklistState(key, ok) {
    const li = checklist.querySelector(`li[data-key="${key}"]`);
    if (!li) return;
    li.classList.toggle("ok", !!ok);
  }

  function updateTips(state) {
    const tips = [];
    if (!state.len) tips.push("Increase length to 12–16+ characters.");
    if (!state.upper) tips.push("Add at least one uppercase letter (A–Z).");
    if (!state.lower) tips.push("Add at least one lowercase letter (a–z).");
    if (!state.num) tips.push("Add at least one number (0–9).");
    if (!state.sym) tips.push("Add a symbol (e.g., ! @ # $).");
    if (!state.common) tips.push("Avoid common words, names, and obvious patterns (1234, qwerty).");
    if (tips.length === 0) tips.push("Nice — this is a strong password. Consider using a password manager.");

    tipsList.innerHTML = tips.map(t => `<div class="tip">• ${escapeHtml(t)}</div>`).join("");
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
  }

  // ---------- Main update ----------
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

  pwd.addEventListener("input", render);

  // show/hide
  toggleBtn.addEventListener("click", () => {
    const isHidden = pwd.type === "password";
    pwd.type = isHidden ? "text" : "password";
    toggleBtn.textContent = isHidden ? "🙈" : "👁️";
    toggleBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  });

  // copy
  copyBtn.addEventListener("click", async () => {
    const val = pwd.value;
    if (!val) return showToast("Nothing to copy");
    try {
      await navigator.clipboard.writeText(val);
      showToast("Copied ✅");
    } catch {
      showToast("Copy failed");
    }
  });

  // generator
  lenRange.addEventListener("input", () => {
    lenVal.textContent = lenRange.value;
  });

  function generatePassword(length, useUpper, useLower, useNum, useSym) {
    const sets = [];
    if (useUpper) sets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    if (useLower) sets.push("abcdefghijklmnopqrstuvwxyz");
    if (useNum) sets.push("0123456789");
    if (useSym) sets.push("!@#$%^&*()-_=+[]{};:,.<>?/");

    if (sets.length === 0) return "";

    // ensure at least 1 char from each selected set
    const chars = [];
    for (const set of sets) {
      chars.push(set[Math.floor(Math.random() * set.length)]);
    }

    const all = sets.join("");
    while (chars.length < length) {
      chars.push(all[Math.floor(Math.random() * all.length)]);
    }

    // shuffle
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

  // initial
  render();
})();
