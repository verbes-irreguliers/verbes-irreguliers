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
  let sessionColor = "";
  let sessionIcon = "";

  if (pomodoro.sessionType === "work") {
    sessionLabel = "Session de Travail";
    sessionColor = "#FF6B6B";
    sessionIcon = "🔴";
  } else if (pomodoro.sessionType === "pause") {
    sessionLabel = "Pause Courte";
    sessionColor = "#4ECDC4";
    sessionIcon = "🟢";
  } else {
    sessionLabel = "Pause Longue";
    sessionColor = "#95E1D3";
    sessionIcon = "🟦";
  }

  const btnStartText = pomodoro.isRunning
    ? (pomodoro.isPaused ? "▶️ Reprendre" : "⏸ Pause")
    : "▶️ Démarrer";

  let html = `
    <h2>🍅 Mode Pomodoro</h2>
    
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="
        background: linear-gradient(135deg, ${sessionColor}20 0%, ${sessionColor}40 100%);
        border: 3px solid ${sessionColor};
        border-radius: 12px;
        padding: 30px;
        margin-bottom: 20px;
      ">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: var(--text);">
          ${sessionIcon} ${sessionLabel}
        </p>
        <p style="
          margin: 0;
          font-size: 48px;
          font-weight: bold;
          color: ${sessionColor};
          font-family: 'Courier New', monospace;
          letter-spacing: 4px;
        ">
          ${timeDisplay}
        </p>
      </div>

      <!-- Progress bar -->
      <div style="margin-bottom: 20px;">
        <div style="
          background: var(--border);
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 5px;
        ">
          <div style="
            background: linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 50%, #95E1D3 100%);
            height: 100%;
            width: ${progressPercent}%;
            transition: width 0.3s ease;
          "></div>
        </div>
        <p style="margin: 0; font-size: 12px; color: var(--text); opacity: 0.7;">
          Cycles complétés: ${pomodoro.cycleCount}
        </p>
      </div>

      <!-- Buttons -->
      <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
        <button onclick="startPomodoro()" style="flex: 1; min-width: 100px;">
          ${btnStartText}
        </button>
        <button onclick="stopPomodoro()" style="flex: 1; min-width: 100px;">
          ⏹ Arrêter
        </button>
      </div>

      <!-- Settings -->
      <div style="
        background: var(--input);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 15px;
        text-align: left;
        margin-bottom: 20px;
      ">
        <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold; color: var(--text);">
          ⚙️ Paramètres
        </p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; font-size: 12px;">
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
      <div style="
        background: var(--success);
        border-radius: 8px;
        padding: 12px;
        font-size: 12px;
        color: #27ae60;
        text-align: center;
        margin-bottom: 20px;
      ">
        <p style="margin: 0;">
          💡 Astuce: Vous pouvez revenir au menu - le timer continue!
        </p>
      </div>

      <!-- Back button -->
      <button onclick="closePomodoro()" style="width: 100%; padding: 10px; background: var(--button); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
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
  afficherPomodoro();
}

function closePomodoro() {
  // Ne pas arrêter le timer - juste retourner au menu
  // Le timer continue en arrière-plan
  hide("pomodoroPanel");
  show("menu");
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
    miniWidget.style.cssText = `
      margin-top: 20px;
      padding: 12px;
      background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(78, 205, 196, 0.2) 100%);
      border: 2px solid #FF6B6B;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    miniWidget.onmouseover = function() {
      this.style.transform = "scale(1.05)";
      this.style.boxShadow = "0 4px 12px rgba(255, 107, 107, 0.3)";
    };
    miniWidget.onmouseout = function() {
      this.style.transform = "scale(1)";
      this.style.boxShadow = "none";
    };
    miniWidget.onclick = openPomodoro;
    menu.appendChild(miniWidget);
  }

  // Update widget content
  const timeDisplay = formatTempsPomodoro(pomodoro.timeLeft);
  const sessionIcon = pomodoro.sessionType === "work" ? "🔴" : (pomodoro.sessionType === "pause" ? "🟢" : "🟦");
  const statusText = pomodoro.isPaused ? "⏸ Pausé" : "▶️ En cours";

  miniWidget.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 18px;">${sessionIcon}</span>
        <div>
          <p style="margin: 0; font-size: 12px; opacity: 0.7;">Pomodoro ${statusText}</p>
          <p style="margin: 0; font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 2px; color: #FF6B6B;">${timeDisplay}</p>
        </div>
      </div>
      <span style="font-size: 12px; opacity: 0.7;">Cliquez pour agrandir</span>
    </div>
  `;
}

function removeMiniPomodoroWidget() {
  const widget = document.getElementById("miniPomodoroWidget");
  if (widget) {
    widget.remove();
  }
}
