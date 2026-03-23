/**
 * quiz.js - Logique du système de quiz et questions
 */

let currentVerb = null;
let questionType = "classique";
let mode = "random";
let updateStatsMode = true; // false for targeted (revision ciblée) and custom lists

// ============ QUIZ INITIALIZATION ============
function startQuiz(m = "random") {
  mode = m;
  // Don't update stats for targeted mode (revision ciblée and custom lists)
  updateStatsMode = (mode !== "targeted");
  hide("menu");
  show("quiz");
  updateMenuState();
  nextQuestion();
}

function nextQuestion() {
  currentVerb = choisirVerbe();
  initCardStats(currentVerb.inf);

  stats[currentVerb.inf].propositions++;

  questionType =
    CONFIG.QUESTION_TYPES[Math.floor(Math.random() * CONFIG.QUESTION_TYPES.length)];

  // Reset form
  const infEl = document.getElementById("inf");
  const sensEl = document.getElementById("sens");
  const presEl = document.getElementById("pres");
  const pretEl = document.getElementById("pret");
  const parfEl = document.getElementById("parf");
  const extraInput = document.getElementById("extraInput");

  if (infEl) infEl.textContent = "";
  if (sensEl) sensEl.textContent = "";
  if (presEl) presEl.value = "";
  if (pretEl) pretEl.value = "";
  if (parfEl) parfEl.value = "";
  if (extraInput) extraInput.value = "";

  // Hide/show labels
  const extraLabel = document.getElementById("extraLabel");
  const presLabel = document.getElementById("presLabel");
  const pretLabel = document.getElementById("pretLabel");
  const parfLabel = document.getElementById("parfLabel");
  const resultDiv = document.getElementById("result");
  const nextBtn = document.getElementById("nextBtn");
  const messageEncouragement = document.getElementById("messageEncouragement");

  if (extraLabel) extraLabel.classList.add("hidden");
  if (presLabel) presLabel.classList.remove("hidden");
  if (pretLabel) pretLabel.classList.remove("hidden");
  if (parfLabel) parfLabel.classList.remove("hidden");

  // Set question based on type
  if (questionType === "classique") {
    if (infEl) infEl.textContent = currentVerb.inf;
    if (sensEl) sensEl.textContent = currentVerb.sens;
  } else if (questionType === "sens_inf") {
    if (sensEl) sensEl.textContent = currentVerb.sens;
    if (extraLabel) extraLabel.classList.remove("hidden");
    if (presLabel) presLabel.classList.add("hidden");
    if (pretLabel) pretLabel.classList.add("hidden");
    if (parfLabel) parfLabel.classList.add("hidden");
  } else if (questionType === "inf_sens") {
    if (infEl) infEl.textContent = currentVerb.inf;
    if (extraLabel) extraLabel.classList.remove("hidden");
    if (presLabel) presLabel.classList.add("hidden");
    if (pretLabel) pretLabel.classList.add("hidden");
    if (parfLabel) parfLabel.classList.add("hidden");
  }

  // Reset result display
  if (resultDiv) resultDiv.innerHTML = "";
  if (nextBtn) nextBtn.classList.add("hidden");
  if (messageEncouragement) messageEncouragement.classList.add("hidden");

  updateGroupUI();

  // Focus management
  setTimeout(() => {
    if (questionType !== "classique") {
      const input = document.getElementById("extraInput");
      if (input) input.focus();
    } else {
      const pres = document.getElementById("pres");
      if (pres) pres.focus();
    }
  }, 50);
}

// ============ ANSWER CHECKING ============
function checkAnswer() {
  let score = 0;
  let feedback = "";

  const presEl = document.getElementById("pres");
  const pretEl = document.getElementById("pret");
  const parfEl = document.getElementById("parf");
  const extraInput = document.getElementById("extraInput");

  if (questionType === "classique") {
    if (normaliserAvancee(presEl.value) === normaliserAvancee(currentVerb.pres) || 
        (presEl.value) === (currentVerb.pres)) score++;
    if (normaliserAvancee(pretEl.value) === normaliserAvancee(currentVerb.pret) || 
        (pretEl.value) === (currentVerb.pret)) score++;
    if (normaliserAvancee(parfEl.value) === normaliserAvancee(currentVerb.parf) || 
        (parfEl.value) === (currentVerb.parf)) score++;
  } else if (questionType === "sens_inf") {
    if (reponseCorrecte(extraInput.value, currentVerb.inf) || extraInput.value === currentVerb.inf) score = 3;
  } else if (questionType === "inf_sens") {
    // Tolérance aux fautes de frappe pour le sens
    if (reponseSensCorrect(extraInput.value, currentVerb.sens)) score = 3;
  }

  let quality;
  if (score === 3) quality = 5;
  else if (score === 2) quality = 4;
  else if (score === 1) quality = 2;
  else quality = 0;

  // Play audio and update stats
  if (score === 3) {
    playSound("youpi");
  } else {
    stats[currentVerb.inf].erreurs++;
    playSound("eOh");
  }

  // Only update SM2 stats if in update mode (propositions and erreurs always updated)
  if (updateStatsMode) {
    updateSM2(stats[currentVerb.inf], quality);
  }
  saveStats();

  // Display result
  const resultDiv = document.getElementById("result");
  if (resultDiv) {
    resultDiv.innerHTML = `
      <strong>Correction :</strong><br>
      ${currentVerb.inf} – ${currentVerb.sens}<br>
      Présent : ${currentVerb.pres}<br>
      Prétérit : ${currentVerb.pret}<br>
      Parfait : ${currentVerb.parf}<br>
      🎯 Score : ${score}/3<br>
      ⏳ Prochaine révision : ${formatDate(stats[currentVerb.inf].nextReview)}
    `;
  }

  const nextBtn = document.getElementById("nextBtn");
  const messageEncouragement = document.getElementById("messageEncouragement");

  if (score === 3) {
    if (nextBtn) nextBtn.classList.remove("hidden");
    if (nextBtn) nextBtn.focus();
    animationBonneReponse();
  } else {
    if (messageEncouragement) messageEncouragement.classList.remove("hidden");
  }

  updateStreak();
  updateGroupUI();
}

// ============ GROUP UI UPDATE ============
function updateGroupUI() {
  // Don't update group UI in targeted mode
  if (mode === "targeted") {
    return;
  }
  
  const groupIndex = getUnlockedGroupIndex();
  const start = groupIndex * CONFIG.GROUP_SIZE;
  const end = start + CONFIG.GROUP_SIZE;
  const group = VERBES.slice(start, end);

  let masteredCount = 0;

  group.forEach(v => {
    initCardStats(v.inf);
    if (stats[v.inf].repetitions >= 3) {
      masteredCount++;
    }
  });

  const percent = Math.round((masteredCount / group.length) * 100);

  const currentGroupDisplay = document.getElementById("currentGroup");
  const groupProgressBar = document.getElementById("groupProgressBar");
  const groupPercent = document.getElementById("groupPercent");

  if (currentGroupDisplay) currentGroupDisplay.textContent = groupIndex + 1;
  if (groupProgressBar) groupProgressBar.style.width = percent + "%";
  if (groupPercent) groupPercent.textContent = percent;
}

// ============ KEYBOARD NAVIGATION ============
function initKeyboardNavigation() {
  const inputsQuiz = ["extraInput", "pres", "pret", "parf"];

  inputsQuiz.forEach((id, index) => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();

        const nextIndex = index + 1;

        if (nextIndex < inputsQuiz.length) {
          const nextInput = document.getElementById(inputsQuiz[nextIndex]);
          const label = nextInput?.closest("label");

          if (nextInput && label && !label.classList.contains("hidden")) {
            nextInput.focus();
          } else {
            const checkBtn = document.querySelector("#quiz button");
            if (checkBtn) checkBtn.click();
          }
        } else {
          const checkBtn = document.querySelector("#quiz button");
          if (checkBtn) checkBtn.click();
        }
      }
    });
  });
}

// ============ QUIT QUIZ ============
function quitQuiz() {
  hide("quiz");
  show("menu");
  updateMenuState();
  currentVerb = null;
  mode = "random";
  updateStatsMode = true;
  verbesActifs = [...VERBES]; // Reset to all verbs
}
