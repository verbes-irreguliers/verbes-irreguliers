/**
 * app.js - Initialisation et routage principal de l'application
 */

// ============ PAGE INITIALIZATION ============
function initializeApp() {
  // Initialize audio elements
  audioElements.youpi = document.getElementById("youpiAudio");
  audioElements.eOh = document.getElementById("eOhAudio");
  audioElements.notif = document.getElementById("notifSound");
  audioElements.themeSwitch = document.getElementById("themeSwitchSound");
  audioElements.quack = document.getElementById("quackSound");

  // Initialize features
  initTheme();
  initNotifications();
  initKeyboardNavigation();
  initAutocompletKeyboard();

  // Setup event listeners
  setupEventListeners();

  // Update UI
  updateStreak();
  majBoutonsNotifications();
  majEtatNotifications();
  updateDyslexicButtonText();

  // Update streak display
  const streakMenu = document.getElementById("streakMenu");
  if (streakMenu) {
    streakMenu.textContent = streak.count;
  }
}

// ============ EVENT LISTENERS ============
function setupEventListeners() {
  // Import stats listener
  const importFile = document.getElementById("importFile");
  if (importFile) {
    importFile.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        handleImportStats(file);
      }
    });
  }

  // Import custom list listener
  const importListeInput = document.getElementById("importListeInput");
  if (importListeInput) {
    importListeInput.addEventListener("change", importerListe);
  }
}

// ============ MAIN MENU NAVIGATION ============
function startQuizMode() {
  if (typeof startQuiz === "function") {
    startQuiz("random");
  }
}

function openStats() {
  if (typeof afficherStats === "function") {
    afficherStats();
  }
}

function openCustomLists() {
  if (typeof ouvrirVerbesPerso === "function") {
    ouvrirVerbesPerso();
  }
}

function closeStats() {
  if (typeof fermerStats === "function") {
    fermerStats();
  }
}

function closeCustomLists() {
  hide("verbesPerso");
  show("menu");
  const gestionListe = document.getElementById("gestionListe");
  if (gestionListe) gestionListe.classList.add("hidden");
}

// ============ SETTINGS PANEL ============
function openSettings() {
  hide("menu");
  show("settingsPanel");
  updateDyslexicButtonText();
}

function closeSettings() {
  hide("settingsPanel");
  show("menu");
}

// ============ UPDATE UI STATES ============
function updateDyslexicButtonText() {
  const isDyslexic = document.body.classList.contains("dyslexic");
  const btnText = isDyslexic ? "📖 Désactiver police dyslexique" : "📖 Activer police dyslexique";
  
  const btnSettings = document.getElementById("btnDyslexicSettings");
  if (btnSettings) {
    btnSettings.textContent = btnText;
  }
}

// ============ DOCUMENT READY ============
document.addEventListener("DOMContentLoaded", initializeApp);
