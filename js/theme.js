/**
 * theme.js - Gestion des thèmes et police dyslexic-friendly
 */

const AVAILABLE_THEMES = ["light", "dark", "dracula", "nord", "colorful", "highcontrast"];

// ============ CHANGE THEME ============
function changeTheme(theme) {
  // Remove all theme classes
  AVAILABLE_THEMES.forEach(t => document.body.classList.remove(t));
  
  // Apply new theme
  if (theme !== "light") {
    document.body.classList.add(theme);
  }
  
  // Store preference
  localStorage.setItem("selectedTheme", theme);
  playSound("themeSwitch");
}

// ============ TOGGLE DARK (Legacy) ============
function toggleTheme() {
  const currentTheme = localStorage.getItem("selectedTheme") || "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  changeTheme(newTheme);
}

// ============ TOGGLE DYSLEXIC FONT ============
function toggleDyslexicFont() {
  const isDyslexic = document.body.classList.contains("dyslexic");
  
  if (isDyslexic) {
    document.body.classList.remove("dyslexic");
    localStorage.setItem("dyslexicFont", "false");
  } else {
    document.body.classList.add("dyslexic");
    localStorage.setItem("dyslexicFont", "true");
  }
  
  playSound("themeSwitch");
  
  // Update button text if function exists
  if (typeof updateDyslexicButtonText === "function") {
    updateDyslexicButtonText();
  }
}

// ============ THEME INITIALIZATION ============
function initTheme() {
  // Load saved theme
  const savedTheme = localStorage.getItem("selectedTheme") || "light";
  changeTheme(savedTheme);
  
  // Load dyslexic font preference
  const useDyslexic = localStorage.getItem("dyslexicFont") === "true";
  if (useDyslexic) {
    document.body.classList.add("dyslexic");
  }
}

// ============ APPLY THEME (Legacy function) ============
function applyTheme() {
  initTheme();
}
