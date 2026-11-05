/**
 * pomodoro.js - Mode Pomodoro avec timer intégré
 */

// ============ POMODORO STATE ============
const pomodoro = {
  isRunning: false,
  isPaused: false,
  sessionType: "work", // "work" ou "pause"
  timeLeft: 25 * 60, // 25 minutes en secondes
  totalTime: 25 * 60,
  cycleCount: 0,
  timerId: null,
  soundPlayed: false
};

const pomodoroSettings = {
  workDuration: 25 * 60, // 25 minutes
  shortBreakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  cyclesBeforeLongBreak: 4
};

// ============ POMODORO TIMER ============
function startPomodoro() {
  if (pomodoro.isRunning && !pomodoro.isPaused) return;

  pomodoro.isRunning = true;
  pomodoro.isPaused = false;
  pomodoro.soundPlayed = false;

  if (pomodoro.timerId) clearInterval(pomodoro.timerId);

  pomodoro.timerId = setInterval(() => {
    if (pomodoro.isPaused) return;

    pomodoro.timeLeft--;

    // Update display (both panel and widget if visible)
    updateAllPomodoroDisplays();

    // Session completed
    if (pomodoro.timeLeft <= 0) {
      completerSessionPomodoro();
    }

    // 10 seconds warning
    if (pomodoro.timeLeft === 10 && !pomodoro.soundPlayed) {
      pomodoro.soundPlayed = true;
      playSound("notif");
    }
  }, 1000);

  afficherPomodoro();
}

function pausePomodoro() {
  pomodoro.isPaused = !pomodoro.isPaused;
  afficherPomodoro();
}

function stopPomodoro() {
  if (pomodoro.timerId) clearInterval(pomodoro.timerId);
  removeMiniPomodoroWidget();
  pomodoro.isRunning = false;
  pomodoro.isPaused = false;
  pomodoro.sessionType = "work";
  pomodoro.cycleCount = 0;
  pomodoro.timeLeft = pomodoroSettings.workDuration;
  pomodoro.totalTime = pomodoroSettings.workDuration;
  pomodoro.soundPlayed = false;
  afficherPomodoro();
}

function completerSessionPomodoro() {
  if (pomodoro.timerId) clearInterval(pomodoro.timerId);

  // Play completion sound
  playSound("youpi");

  if (pomodoro.sessionType === "work") {
    pomodoro.cycleCount++;

    // Determine next break type
    if (pomodoro.cycleCount % pomodoroSettings.cyclesBeforeLongBreak === 0) {
      // Long break
      pomodoro.sessionType = "longBreak";
      pomodoro.timeLeft = pomodoroSettings.longBreakDuration;
      pomodoro.totalTime = pomodoroSettings.longBreakDuration;
      showNotification("🏆 Excellent! Prenez une pause longue!", 3000);
    } else {
      // Short break
      pomodoro.sessionType = "pause";
      pomodoro.timeLeft = pomodoroSettings.shortBreakDuration;
      pomodoro.totalTime = pomodoroSettings.shortBreakDuration;
      showNotification("✅ Session de travail complétée! Pause courte.", 3000);
    }
  } else {
    // Break finished, return to work
    pomodoro.sessionType = "work";
    pomodoro.timeLeft = pomodoroSettings.workDuration;
    pomodoro.totalTime = pomodoroSettings.workDuration;
    showNotification("🚀 Pause terminée! Prêt pour la prochaine session?", 3000);
  }

  pomodoro.isRunning = false;
  pomodoro.isPaused = false;
  pomodoro.soundPlayed = false;
  updateAllPomodoroDisplays();
}

// ============ FORMAT TIME ============
function formatTempsPomodoro(secondes) {
  const minutes = Math.floor(secondes / 60);
  const secs = secondes % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// ============ UPDATE ALL DISPLAYS ============
function updateAllPomodoroDisplays() {
  const pomPanel = document.getElementById("pomodoroPanel");
  const menuPanel = document.getElementById("menu");
  
  // Update main pomodoro panel if visible
  if (pomPanel && !pomPanel.classList.contains("hidden")) {
    afficherPomodoro();
  }
  
  // Update mini widget if menu is visible and widget exists
  if (menuPanel && !menuPanel.classList.contains("hidden")) {
    const miniWidget = document.getElementById("miniPomodoroWidget");
    if (miniWidget && pomodoro.isRunning) {
      afficherMiniWidgetPomodoro();
    }
  }
}

// ============ POMODORO DISPLAY ============
function afficherPomodoro() {
  const container = document.getElementById("pomodoroPanel");
  if (!container) return;

  const timeDisplay = formatTempsPomodoro(pomodoro.timeLeft);
  const progressPercent = Math.round(((pomodoro.totalTime - pomodoro.timeLeft) / pomodoro.totalTime) * 100);

  let sessionLabel = "";
  let sessionIcon = "";

  if (pomodoro.sessionType === "work") {
    sessionLabel = "Session de Travail";
    sessionIcon = "🔴";
  } else if (pomodoro.sessionType === "pause") {
    sessionLabel = "Pause Courte";
    sessionIcon = "🟢";
  } else {
    sessionLabel = "Pause Longue";
    sessionIcon = "🟦";
  }

  const btnStartText = pomodoro.isRunning
    ? (pomodoro.isPaused ? "▶️ Reprendre" : "⏸ Pause")
    : "▶️ Démarrer";

  let html = `
    <h2>🍅 Mode Pomodoro</h2>
    
    <div class="pomodoro">
      <div class="pomodoro__session pomodoro__session--${pomodoro.sessionType}">
        <p class="pomodoro__session-label">
          ${sessionIcon} ${sessionLabel}
        </p>
        <p class="pomodoro__time">
          ${timeDisplay}
        </p>
      </div>

      <!-- Progress bar -->
      <div class="pomodoro__progress">
        <progress max="100" value="${progressPercent}" aria-label="Progression de la session"></progress>
        <p class="pomodoro__cycles">
          Cycles complétés: ${pomodoro.cycleCount}
        </p>
      </div>

      <!-- Buttons -->
      <div class="pomodoro__actions">
        <button class="pomodoro__action" onclick="startPomodoro()">
          ${btnStartText}
        </button>
        <button class="pomodoro__action" onclick="stopPomodoro()">
          ⏹ Arrêter
        </button>
      </div>

      <!-- Settings -->
      <div class="pomodoro__settings">
        <p class="pomodoro__settings-title">
          ⚙️ Paramètres
        </p>
        <div class="pomodoro__settings-fields">
          <label>
            <input type="number" id="pomWorkDuration" min="1" max="60" value="25" onchange="updatePomodoroSettings()">
            min travail
          </label>
          <label>
            <input type="number" id="pomBreakDuration" min="1" max="30" value="5" onchange="updatePomodoroSettings()">
            min pause
          </label>
          <label>
            <input type="number" id="pomLongBreakDuration" min="5" max="60" value="15" onchange="updatePomodoroSettings()">
            min longue pause
          </label>
        </div>
      </div>

      <!-- Info -->
      <div class="pomodoro__tip">
        <p>
          💡 Astuce: Vous pouvez revenir au menu - le timer continue!
        </p>
      </div>

      <!-- Back button -->
      <button class="pomodoro__back" onclick="closePomodoro()">
        ⬅ Retour au menu
      </button>
    </div>
  `;

  container.innerHTML = html;
}

// ============ UPDATE SETTINGS ============
function updatePomodoroSettings() {
  const workInput = document.getElementById("pomWorkDuration");
  const breakInput = document.getElementById("pomBreakDuration");
  const longBreakInput = document.getElementById("pomLongBreakDuration");

  if (workInput) pomodoroSettings.workDuration = parseInt(workInput.value) * 60;
  if (breakInput) pomodoroSettings.shortBreakDuration = parseInt(breakInput.value) * 60;
  if (longBreakInput) pomodoroSettings.longBreakDuration = parseInt(longBreakInput.value) * 60;

  // Reset timer if not running
  if (!pomodoro.isRunning) {
    if (pomodoro.sessionType === "work") {
      pomodoro.timeLeft = pomodoroSettings.workDuration;
      pomodoro.totalTime = pomodoroSettings.workDuration;
    }
  }

  afficherPomodoro();
}

// ============ OPEN/CLOSE POMODORO ============
function openPomodoro() {
  removeMiniPomodoroWidget();
  hide("menu");
  show("pomodoroPanel");
  updateMenuState();
  afficherPomodoro();
}

function closePomodoro() {
  // Ne pas arrêter le timer - juste retourner au menu
  // Le timer continue en arrière-plan
  hide("pomodoroPanel");
  show("menu");
  updateMenuState();
  afficherMiniWidgetPomodoro();
}

// ============ MINI WIDGET POMODORO ============
function afficherMiniWidgetPomodoro() {
  const menu = document.getElementById("menu");
  if (!menu || !pomodoro.isRunning) return;

  let miniWidget = document.getElementById("miniPomodoroWidget");
  if (!miniWidget) {
    miniWidget = document.createElement("div");
    miniWidget.id = "miniPomodoroWidget";
    miniWidget.className = "pomodoro-widget";
    miniWidget.addEventListener("click", openPomodoro);
    menu.appendChild(miniWidget);
  }

  // Update widget content
  const timeDisplay = formatTempsPomodoro(pomodoro.timeLeft);
  const sessionIcon = pomodoro.sessionType === "work" ? "🔴" : (pomodoro.sessionType === "pause" ? "🟢" : "🟦");
  const statusText = pomodoro.isPaused ? "⏸ Pausé" : "▶️ En cours";

  miniWidget.innerHTML = `
    <div class="pomodoro-widget__content">
      <div class="pomodoro-widget__session">
        <span class="pomodoro-widget__icon">${sessionIcon}</span>
        <div>
          <p class="pomodoro-widget__status">Pomodoro ${statusText}</p>
          <p class="pomodoro-widget__time">${timeDisplay}</p>
        </div>
      </div>
      <span class="pomodoro-widget__hint">Cliquez pour agrandir</span>
    </div>
  `;
}

function removeMiniPomodoroWidget() {
  const widget = document.getElementById("miniPomodoroWidget");
  if (widget) {
    widget.remove();
  }
}
