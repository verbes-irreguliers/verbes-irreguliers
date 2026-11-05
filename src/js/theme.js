/**
 * theme.js - Gestion des thèmes
 */

const AVAILABLE_THEMES = ["light", "dark", "dracula", "nord", "colorful", "highcontrast", "everforestdark", "everforestlight"];

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

// ============ THEME INITIALIZATION ============
function initTheme() {
  // Load saved theme
  const savedTheme = localStorage.getItem("selectedTheme") || "light";
  changeTheme(savedTheme);
}
