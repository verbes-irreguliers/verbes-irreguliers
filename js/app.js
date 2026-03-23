/**
 * app.js - Initialisation et routage principal de l'application
 */

// ============ BACK BUTTON / GESTURE HANDLING ============
let isOnMainMenu = true;

function setupBackButtonHandling() {
  // Push initial state for the main menu
  history.pushState({ screen: "menu" }, "", window.location.href);
  
  // Handle back button/gesture
  window.addEventListener("popstate", function (event) {
    // If not on main menu, go back to main menu instead of navigating away
    if (!isOnMainMenu) {
      goToGermanMenu();
      // Push state to prevent going back to previous page
      history.pushState({ screen: "menu" }, "", window.location.href);
    }
  });
}

function updateMenuState() {
  const menuElement = document.getElementById("menu");
  isOnMainMenu = menuElement && !menuElement.classList.contains("hidden");
  
  if (!isOnMainMenu) {
    // Push state to intercept back gesture
    history.pushState({ screen: "panel" }, "", window.location.href);
  }
}

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
  setupBackButtonHandling();

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
    updateMenuState();
  }
}

function openStats() {
  if (typeof afficherStats === "function") {
    afficherStats();
    updateMenuState();
  }
}

function openCustomLists() {
  if (typeof ouvrirVerbesPerso === "function") {
    ouvrirVerbesPerso();
    updateMenuState();
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
  updateMenuState();
}

// ============ SETTINGS PANEL ============
function openSettings() {
  hide("menu");
  show("settingsPanel");
  updateDyslexicButtonText();
  updateMenuState();
}

function closeSettings() {
  hide("settingsPanel");
  show("menu");
  updateMenuState();
}

// ============ HOME NAVIGATION ============
function goToGermanMenu() {
  // Hide all panels
  hide("settingsPanel");
  hide("pomodoroPanel");
  hide("quiz");
  hide("verbesPerso");
  hide("statsPanel");
  hide("miniJeuxPanel");
  hide("penduPanel");
  hide("memoirePanel");
  hide("vraiFauxPanel");
  hide("traductionPanel");
  hide("relierPanel");
  hide("maitrisePanel");
  hide("defiVitessePanel");
  
  // Show main menu
  show("menu");
  
  // Reset streak display
  const streakMenu = document.getElementById("streakMenu");
  if (streakMenu) {
    streakMenu.textContent = streak.count;
  }
  
  // Update menu state
  updateMenuState();
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
