/**
 * storage.js - Gestion du stockage local (localStorage)
 */

// ============ INITIALIZATION ============
let stats = JSON.parse(localStorage.getItem("stats")) || {};
let streak = JSON.parse(localStorage.getItem("streak")) || { count: 0, lastDate: null };
let listesPerso = JSON.parse(localStorage.getItem("listesPerso")) || {};
let succesState = JSON.parse(localStorage.getItem("succes")) || { debloques: [], perfectStreak: 0 };

// Initialize stats for all base verbs
VERBES.forEach(v => initCardStats(v.inf));

// Initialize stats for personal list verbs
Object.values(listesPerso).forEach(liste => {
  liste.forEach(v => initCardStats(v.inf));
});

// Save stats to ensure all properties are persisted
saveStats();

// ============ CART STATS INITIALIZATION ============
function initCardStats(inf) {
  if (!stats[inf]) {
    stats[inf] = {
      repetitions: 0,
      interval: 0,
      easeFactor: 2.5,
      nextReview: 0,
      lapses: 0,
      propositions: 0,
      erreurs: 0,
      maitrise: 0
    };
  } else {
    // Ensure all required properties exist (migration for old data)
    if (!("maitrise" in stats[inf])) stats[inf].maitrise = 0;
    if (!("repetitions" in stats[inf])) stats[inf].repetitions = 0;
    if (!("interval" in stats[inf])) stats[inf].interval = 0;
    if (!("easeFactor" in stats[inf])) stats[inf].easeFactor = 2.5;
    if (!("nextReview" in stats[inf])) stats[inf].nextReview = 0;
    if (!("lapses" in stats[inf])) stats[inf].lapses = 0;
    if (!("propositions" in stats[inf])) stats[inf].propositions = 0;
    if (!("erreurs" in stats[inf])) stats[inf].erreurs = 0;
  }
}

// ============ SAVE FUNCTIONS ============
function saveStats() {
  localStorage.setItem("stats", JSON.stringify(stats));
}

function saveStreak() {
  localStorage.setItem("streak", JSON.stringify(streak));
}

function saveListesPerso() {
  localStorage.setItem("listesPerso", JSON.stringify(listesPerso));
}

function saveSucces() {
  localStorage.setItem("succes", JSON.stringify(succesState));
}

// ============ THEME MANAGEMENT ============
function getTheme() {
  return localStorage.getItem("theme") || "light";
}

function setTheme(theme) {
  localStorage.setItem("theme", theme);
}

function applyTheme() {
  const theme = getTheme();
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

// ============ NOTIFICATIONS MANAGEMENT ============
function notificationsEnabled() {
  return localStorage.getItem("notificationsActivees") === "true";
}

function setNotificationsEnabled(enabled) {
  localStorage.setItem("notificationsActivees", enabled ? "true" : "false");
}

function getLastNotificationDate() {
  return localStorage.getItem("derniereNotification");
}

function setLastNotificationDate(date) {
  localStorage.setItem("derniereNotification", date);
}

// ============ VERIFICATION STATE ============
let listePersoActive = null;
let verbesActifs = [...VERBES];
let sessionStats = {
  problematiquesRevises: 0
};

// ============ SM2 ALGORITHM ============
function updateSM2(card, quality) {
  if (quality < 3) {
    card.repetitions = 0;
    card.interval = 1;
    card.lapses++;
  } else {
    if (card.repetitions === 0) {
      card.interval = 1;
    } else if (card.repetitions === 1) {
      card.interval = 6;
    } else {
      card.interval = Math.round(card.interval * card.easeFactor);
    }
    card.repetitions++;
    card.maitrise++;
  }

  card.easeFactor =
    card.easeFactor +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  if (card.easeFactor < 1.3) {
    card.easeFactor = 1.3;
  }

  card.nextReview = Date.now() + card.interval * 24 * 60 * 60 * 1000;
}

// ============ STREAK MANAGEMENT ============
function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);

  if (streak.lastDate === today) return;

  if (!streak.lastDate) {
    streak.count = 1;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yestStr = yesterday.toISOString().slice(0, 10);

    if (streak.lastDate === yestStr) {
      streak.count++;
    } else {
      streak.count = 1;
    }
  }

  streak.lastDate = today;
  saveStreak();
}

// ============ EXPORT/IMPORT ============
function exportStats() {
  const data = {
    stats: stats,
    progression: {},
    streak: streak,
    notificationsActivees: notificationsEnabled(),
    derniereNotification: getLastNotificationDate(),
    dateExport: new Date().toISOString()
  };

  return data;
}

function importStats(data) {
  if (!data.stats) throw new Error("Stats invalides");

  stats = data.stats;
  streak = data.streak || { count: 0, lastDate: null };

  saveStats();
  saveStreak();

  if (data.notificationsActivees !== undefined) {
    setNotificationsEnabled(data.notificationsActivees);
  }

  if (data.derniereNotification) {
    setLastNotificationDate(data.derniereNotification);
  }

  // Initialize missing stats
  VERBES.forEach(v => initCardStats(v.inf));
  Object.values(listesPerso).forEach(liste => {
    liste.forEach(v => initCardStats(v.inf));
  });
}

// ============ GET ALL VERBS ============
function getAllVerbes() {
  let all = [...VERBES];

  Object.values(listesPerso).forEach(liste => {
    liste.forEach(v => {
      if (!all.find(x => x.inf === v.inf)) {
        all.push(v);
      }
    });
  });

  return all;
}

// ============ GET DICTIONARY ============
function getDictionnaireVerbes() {
  const dict = {};

  VERBES.forEach(v => {
    dict[v.inf.toLowerCase()] = v;
  });

  Object.values(listesPerso).forEach(liste => {
    liste.forEach(v => {
      dict[v.inf.toLowerCase()] = v;
    });
  });

  return dict;
}
