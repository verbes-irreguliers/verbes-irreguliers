/**
 * utils.js - Fonctions utilitaires et communes
 */

// ============ NORMALIZATION ============
function normaliser(texte) {
  return texte.trim().toLowerCase();
}

function normaliserAvancee(texte) {
  return texte
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ============ ANSWER COMPARISON ============
function reponseCorrecte(userInput, solutions) {
  const user = normaliserAvancee(userInput);
  return solutions
    .split(/[,/]/)
    .map(s => normaliserAvancee(s))
    .some(s => s === user);
}

// Distance de Levenshtein pour tolérer les fautes de frappe
function distanceLevenshtein(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Vérifie si la réponse est correcte avec tolérance aux fautes de frappe
function reponseSensCorrect(userInput, correctSense) {
  const user = normaliserAvancee(userInput);
  const correct = normaliserAvancee(correctSense);
  
  // Match exact
  if (user === correct) return true;
  
  // Vérifier les variantes avec slashes
  const variants = correctSense.split(/[,/]/).map(s => normaliserAvancee(s));
  if (variants.some(v => user === v)) return true;
  
  // Tolérance aux fautes de frappe (distance de Levenshtein)
  const maxDistance = Math.max(1, Math.floor(user.length * 0.2)); // 20% de tolérance
  
  for (let variant of variants) {
    const distance = distanceLevenshtein(user, variant);
    if (distance <= maxDistance && distance <= 3) {
      return true;
    }
  }
  
  return false;
}

function comparaisonVisuelle(userInput, solution) {
  let html = "";
  const max = Math.max(userInput.length, solution.length);

  for (let i = 0; i < max; i++) {
    const u = userInput[i] || "";
    const s = solution[i] || "";

    if (u === s) {
      html += `<span style="color:green">${u}</span>`;
    } else {
      html += `<span style="color:red">${u || "␣"}</span>`;
    }
  }
  return html;
}

// ============ ANIMATIONS ============
function animationBonneReponse() {
  const card = document.querySelector(".card");
  if (!card) return;
  
  card.classList.remove("success-animation");
  void card.offsetWidth;
  card.classList.add("success-animation");
}

// ============ AUDIO MANAGEMENT ============
const audioElements = {
  youpi: null,
  eOh: null,
  notif: null,
  themeSwitch: null,
  quack: null
};

function playSound(soundName) {
  const audio = audioElements[soundName];
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(err => console.log("Son non joué:", err));
  }
}

// ============ GROUP MANAGEMENT ============
function getUnlockedGroupIndex() {
  let total = VERBES.length;
  let groups = Math.ceil(total / CONFIG.GROUP_SIZE);

  for (let g = 0; g < groups; g++) {
    let start = g * CONFIG.GROUP_SIZE;
    let end = start + CONFIG.GROUP_SIZE;
    let group = VERBES.slice(start, end);

    let mastered = group.every(v => {
      initCardStats(v.inf);
      return stats[v.inf].repetitions >= 6;
    });

    if (!mastered) {
      return g;
    }
  }

  return groups - 1;
}

function getActivePool() {
  const groupIndex = getUnlockedGroupIndex();
  const start = groupIndex * CONFIG.GROUP_SIZE;
  const end = start + CONFIG.GROUP_SIZE;

  return VERBES.slice(0, end);
}

function getDueVerbs(pool) {
  const now = Date.now();
  return pool.filter(v => {
    initCardStats(v.inf);
    return stats[v.inf].nextReview <= now;
  });
}

function choisirVerbe() {
  // Use verbesActifs if in targeted mode (revision ciblée, listes perso, etc.)
  let pool;
  if (mode === "targeted" && verbesActifs && verbesActifs.length > 0) {
    pool = verbesActifs;
  } else {
    // Normal mode: use group-based progression
    pool = getActivePool();
  }
  
  const due = getDueVerbs(pool);

  if (due.length > 0) {
    return due[Math.floor(Math.random() * due.length)];
  }

  return pool.sort((a, b) => {
    return stats[a.inf].nextReview - stats[b.inf].nextReview;
  })[0];
}

// ============ GROUPS DISPLAY ============
function groupesDebloques() {
  let groupes = [];
  const TAILLE_GROUPE = 5;

  for (let i = 0; i < VERBES.length; i += TAILLE_GROUPE) {
    const groupe = VERBES.slice(i, i + TAILLE_GROUPE);
    const maitriseOK = groupe.every(v => stats[v.inf]?.maitrise >= 1);

    groupes.push({
      debut: i + 1,
      fin: Math.min(i + TAILLE_GROUPE, VERBES.length),
      debloque: maitriseOK
    });

    if (!maitriseOK) break;
  }

  return groupes;
}

// ============ DOM UTILITIES ============
function show(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.classList.remove("hidden");
}

function hide(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.classList.add("hidden");
}

function toggle(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.classList.toggle("hidden");
}

// ============ NOTIFICATION UTILITIES ============
function showAlertNotification(title, message, duration = 4000) {
  const div = document.createElement("div");
  div.style.position = "fixed";
  div.style.bottom = "20px";
  div.style.right = "20px";
  div.style.background = "#ffd700";
  div.style.padding = "15px";
  div.style.borderRadius = "10px";
  div.style.boxShadow = "0 4px 10px rgba(0,0,0,.2)";
  div.style.zIndex = "9999";
  div.innerHTML = `
    <strong>${title}</strong><br>
    ${message}
  `;

  document.body.appendChild(div);

  setTimeout(() => div.remove(), duration);
}

// ============ FILE DOWNLOAD UTILITIES ============
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

// ============ DATE UTILITIES ============
function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(date) {
  if (typeof date === "number") {
    date = new Date(date);
  }
  return date.toLocaleDateString();
}

// ============ FILTER UTILITIES ============
function filtrerVerbes(type, containerSelector = "#tbodyVerbes") {
  const rows = document.querySelectorAll(containerSelector + " tr");

  rows.forEach(row => {
    row.style.display = "";

    if (type === "probleme" && !row.classList.contains("verbe-probleme")) {
      row.style.display = "none";
    }

    if (type === "maitrise" && !row.classList.contains("verbe-maitrise")) {
      row.style.display = "none";
    }

    if (type === "encours" &&
        (row.classList.contains("verbe-probleme") || row.classList.contains("verbe-maitrise"))) {
      row.style.display = "none";
    }
  });
}
