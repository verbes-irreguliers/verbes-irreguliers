/**
 * utils.js - Fonctions utilitaires et communes
 */

function normaliserAvancee(texte) {
  return texte
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
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
  let longer = str1;
  let shorter = str2;

  if (shorter.length > longer.length) {
    [longer, shorter] = [shorter, longer];
  }

  let previousRow = Array.from({ length: shorter.length + 1 }, (_, index) => index);

  for (let row = 1; row <= longer.length; row++) {
    const currentRow = [row];

    for (let column = 1; column <= shorter.length; column++) {
      const substitutionCost = longer[row - 1] === shorter[column - 1] ? 0 : 1;
      currentRow[column] = Math.min(
        previousRow[column] + 1,
        currentRow[column - 1] + 1,
        previousRow[column - 1] + substitutionCost
      );
    }

    previousRow = currentRow;
  }

  return previousRow[shorter.length];
}

// Vérifie si la réponse est correcte avec tolérance aux fautes de frappe
function reponseSensCorrect(userInput, correctSense) {
  const user = normaliserAvancee(userInput);
  const correct = normaliserAvancee(correctSense);
  if (!user) return false;

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
    audio.play().catch(err => console.warn("Son non joué:", err));
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
  const pool = mode === "targeted" ? verbesActifs : getActivePool();
  if (!pool.length) return null;
  
  const due = getDueVerbs(pool);

  if (due.length > 0) {
    return due[Math.floor(Math.random() * due.length)];
  }

  return pool.reduce((earliest, verb) =>
    stats[verb.inf].nextReview < stats[earliest.inf].nextReview ? verb : earliest
  );
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

function insertSpecialChar(character, event) {
  if (event) {
    event.preventDefault();
  }

  const active = document.activeElement;
  const target = (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement)
    ? active
    : null;

  if (!target) {
    return;
  }

  const start = target.selectionStart ?? target.value.length;
  const end = target.selectionEnd ?? start;
  const value = target.value || "";
  target.value = value.slice(0, start) + character + value.slice(end);
  const cursorPos = start + character.length;
  target.selectionStart = target.selectionEnd = cursorPos;
  target.focus();
}

// ============ NOTIFICATION UTILITIES ============
function showAlertNotification(title, message, duration = 4000) {
  const div = document.createElement("div");
  div.className = "notification-toast";

  const heading = document.createElement("strong");
  heading.textContent = title;
  const body = document.createElement("p");
  body.textContent = message;
  div.append(heading, body);

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
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    const visible = type === "probleme"
      ? row.classList.contains("verbe-probleme")
      : type === "maitrise"
        ? row.classList.contains("verbe-maitrise")
        : type === "encours"
          ? !row.classList.contains("verbe-probleme") &&
            !row.classList.contains("verbe-maitrise")
          : true;

    row.classList.toggle("filtered-out", !visible);
  });
}
