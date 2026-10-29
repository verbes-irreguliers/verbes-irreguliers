/**
 * stats.js - Système de statistiques, progression et succès
 */

const SUCCES = [
  {
    id: "premier_verbe",
    titre: "Première victoire 🎉",
    description: "Réviser ton premier verbe",
    condition: () => Object.values(stats).some(s => s.propositions >= 1)
  },
  {
    id: "10_maitrises",
    titre: "Ça rentre ! 💪",
    description: "Atteindre 10 maîtrises",
    condition: () => Object.values(stats).reduce((s, v) => s + (v.maitrise || 0), 0) >= 10
  },
  {
    id: "streak_7",
    titre: "Régularité 🔥",
    description: "Série de 7 jours consécutifs",
    condition: () => streak.count >= 7
  },
  {
    id: "sans_faute",
    titre: "Sans faute 🧠",
    description: "3 réponses parfaites d'affilée",
    condition: () => succesState.perfectStreak >= 3
  },
  {
    id: "verbe_maitrise",
    titre: "Sous contrôle ✅",
    description: "Maîtriser complètement un verbe",
    condition: () => Object.values(stats).some(v => v.maitrise >= 5)
  },
  {
    id: "revanche",
    titre: "Revanche 🔁",
    description: "Transformer un verbe problématique en verbe maîtrisé",
    condition: () => Object.values(stats).some(v => v.erreurs >= 3 && v.maitrise >= 5)
  },
  {
    id: "50_propositions",
    titre: "Ça travaille 📚",
    description: "Réviser 50 verbes au total",
    condition: () => Object.values(stats).reduce((s, v) => s + (v.propositions || 0), 0) >= 50
  },
  {
    id: "100_propositions",
    titre: "Machine à verbes 🤖",
    description: "Réviser 100 verbes au total",
    condition: () => Object.values(stats).reduce((s, v) => s + (v.propositions || 0), 0) >= 100
  },
  {
    id: "tout_vert",
    titre: "Tout au vert ✅",
    description: "Avoir 5 verbes en zone maîtrisée",
    condition: () => Object.values(stats)
      .filter(v => v.maitrise >= 5 && v.erreurs === 0).length >= 5
  },
  {
    id: "streak_30",
    titre: "Habitude ancrée 🔥",
    description: "Série de 30 jours consécutifs",
    condition: () => streak.count >= 30
  },
  {
    id: "perfectionniste",
    titre: "Perfectionniste ✨",
    description: "Répondre parfaitement à 10 verbes consécutifs",
    condition: () => succesState.perfectStreak >= 10
  }
];

// ============ ACHIEVEMENTS CHECK ============
function verifierSucces() {
  let nouveau = false;

  SUCCES.forEach(s => {
    if (!succesState.debloques.includes(s.id) && s.condition()) {
      succesState.debloques.push(s.id);
      afficherSucces(s);
      nouveau = true;
    }
  });

  if (nouveau) {
    saveSucces();
  }
}

function afficherSucces(succes) {
  showAlertNotification(
    `🏆 Succès débloqué !`,
    `<strong>${succes.titre}</strong><br><small>${succes.description}</small>`,
    4000
  );
}

// ============ STATISTICS DISPLAY ============
// ============ STATS DISPLAY ============
function afficherStats() {
  hide("menu");
  hide("quiz");
  show("statsPanel");
  updateMenuState();


  let total = 0, erreurs = 0, maitrise = 0;

  Object.values(stats).forEach(s => {
    total += s.propositions || 0;
    erreurs += s.erreurs || 0;
    maitrise += s.maitrise || 0;
  });

  const groupes = groupesDebloques();

  let html = `
    <p>📘 Réponses totales : <strong>${total}</strong></p>
    <p>❌ Erreurs : <strong>${erreurs}</strong></p>
    <p>⭐ Maîtrises : <strong>${maitrise}</strong></p>
    <hr>
    <h3>📦 Groupes débloqués</h3>
  `;

  groupes.forEach((g, i) => {
    html += `
      <p>
        Groupe ${i + 1} (verbes ${g.debut}–${g.fin}) :
        ${g.debloque ? "✅ Débloqué" : "🔒 Verrouillé"}
      </p>
    `;
  });

  html += `
    <hr>
    <h3>🔥 Série de jours</h3>
    <p>
      Série actuelle :
      <strong style="font-size:18px;">
        ${streak.count} jour${streak.count > 1 ? "s" : ""}
      </strong>
    </p>
    <hr>
    <h3>🏆 Succès</h3>
  `;

  SUCCES.forEach(s => {
    const debloque = succesState.debloques.includes(s.id);
    html += `
      <div class="stats-item ${debloque ? "unlocked" : "locked"}">
        <strong>${debloque ? "✅" : "🔒"} ${s.titre}</strong><br>
        <small>${s.description}</small>
      </div>
    `;
  });

  const statsContent = document.getElementById("statsContent");
  if (statsContent) statsContent.innerHTML = html;
}

// ============ ALL VERBS DISPLAY ============
let cacheTousLesVerbes = [];

function afficherTousLesVerbes() {
  const container = document.getElementById("listeCompleteVerbes");
  if (!container) return;

  container.classList.remove("hidden");

  let tousLesVerbes = [...VERBES];
  cacheTousLesVerbes = tousLesVerbes;

  Object.values(listesPerso).forEach(liste => {
    liste.forEach(v => {
      if (!tousLesVerbes.find(x => x.inf === v.inf)) {
        tousLesVerbes.push(v);
      }
    });
  });

  let html = `
    <hr>
    <h3>📋 Tous les verbes</h3>

    <div class="button-group">
      <button onclick="filtrerVerbes('tous')">📋 Tous</button>
      <button onclick="filtrerVerbes('probleme')">🔴 Problématiques</button>
      <button onclick="filtrerVerbes('maitrise')">🟢 Maîtrisés</button>
      <button onclick="filtrerVerbes('encours')">⚪ En cours</button>
      <button onclick="reviserVerbesProblemes()">🎯 Réviser les verbes non maîtrisés</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Infinitif</th>
          <th>Sens</th>
          <th>⭐ Maîtrise</th>
          <th>❌ Erreurs</th>
          <th>🔁 Proposé</th>
        </tr>
      </thead>
      <tbody id="tbodyVerbes">
  `;

  tousLesVerbes.forEach(v => {
    const s = stats[v.inf] || { propositions: 0, erreurs: 0, maitrise: 0 };

    let classe = "verbe-neutre";

    if (s.erreurs > s.maitrise) {
      classe = "verbe-probleme";
    } else if (s.maitrise >= 3 && s.erreurs <= s.maitrise) {
      classe = "verbe-maitrise";
    }

    html += `
      <tr class="${classe}" onclick="afficherConjugaisonsVerbe('${v.inf}')" style="cursor: pointer; transition: background-color 0.2s;">
        <td>${v.inf}</td>
        <td>${v.sens}</td>
        <td style="text-align:center;">${s.maitrise}</td>
        <td style="text-align:center;">${s.erreurs}</td>
        <td style="text-align:center;">${s.propositions}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    <button onclick="fermerListeComplete()">⬆ Masquer</button>
  `;

  container.innerHTML = html;
  
  // Add hover effect
  const rows = container.querySelectorAll('tbody tr');
  rows.forEach(row => {
    row.addEventListener('mouseenter', function() {
      this.style.backgroundColor = 'var(--hover)';
    });
    row.addEventListener('mouseleave', function() {
      this.style.backgroundColor = '';
    });
  });
}


function fermerListeComplete() {
  hide("listeCompleteVerbes");
}

// ============ DISPLAY CONJUGAISONS ============
function afficherConjugaisonsVerbe(inf) {
  // Find the verb in all verbs
  let verbe = VERBES.find(v => v.inf === inf);
  
  if (!verbe) {
    // Check personal lists
    Object.values(listesPerso).forEach(liste => {
      if (!verbe) {
        verbe = liste.find(v => v.inf === inf);
      }
    });
  }

  if (!verbe) return;

  const s = stats[inf] || { propositions: 0, erreurs: 0, maitrise: 0, lapses: 0 };

  const html = `
    <h3 style="margin-top: 0; margin-bottom: 15px;">📖 ${verbe.inf}</h3>
    <p><strong>Sens :</strong> ${verbe.sens}</p>
    <hr>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
      <div>
        <strong>Présent :</strong><br>
        ${verbe.pres}
      </div>
      <div>
        <strong>Prétérit :</strong><br>
        ${verbe.pret}
      </div>
      <div>
        <strong>Parfait :</strong><br>
        ${verbe.parf}
      </div>
      <div>
        <strong>Statistiques :</strong><br>
        ⭐ Maîtrise: ${s.maitrise}<br>
        ❌ Erreurs: ${s.erreurs}<br>
        ⚠️ Faux pas: ${s.lapses}<br>
        🔁 Proposé: ${s.propositions}
      </div>
    </div>
    <hr>
    <button onclick="fermerConjugaisons()" style="width: 100%; padding: 10px; background: var(--button); color: var(--text); border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Fermer</button>
  `;

  const modalContent = document.getElementById("modalContent");
  const modal = document.getElementById("modalConjugaisons");
  
  if (modalContent && modal) {
    modalContent.innerHTML = html;
    modal.classList.remove("hidden");
  }
}

function fermerConjugaisons() {
  const modal = document.getElementById("modalConjugaisons");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// Close modal when clicking outside of it
document.addEventListener("DOMContentLoaded", function() {
  const modal = document.getElementById("modalConjugaisons");
  if (modal) {
    modal.addEventListener("click", function(e) {
      if (e.target === modal) {
        fermerConjugaisons();
      }
    });
  }
});

// ============ PROBLEMATIC VERBS ============
function reviserVerbesProblemes() {
  let problematiques = [];

  VERBES.forEach(v => {
    const s = stats[v.inf];
    if (s && s.erreurs > s.maitrise) {
      problematiques.push(v);
    }
  });

  Object.values(listesPerso).forEach(liste => {
    liste.forEach(v => {
      const s = stats[v.inf];
      if (s && s.erreurs > s.maitrise && !problematiques.find(x => x.inf === v.inf)) {
        problematiques.push(v);
      }
    });
  });

  if (problematiques.length === 0) {
    alert("🎉 Aucun verbe problématique !");
    return;
  }

  verbesActifs = problematiques;
  mode = "targeted";
  updateStatsMode = false; // Don't update stats for targeted revision

  hide("statsPanel");
  show("quiz");
  updateMenuState();

  nextQuestion();
}

// ============ STATS PANEL CONTROL ============
function fermerStats() {
  hide("statsPanel");
  show("menu");
  updateMenuState();
}

// ============ DATA EXPORT/IMPORT ============
function exporterDonnees() {
  const data = exportStats();
  downloadJSON(data, "verbes_allemands_stats.json");
  succesState.exportEffectue = true;
  saveSucces();
  verifierSucces();
}

function importerDonnees() {
  const input = document.getElementById("importFile");
  if (input) input.click();
}

function handleImportStats(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      importStats(data);
      succesState.importEffectue = true;
      saveSucces();
      alert("✅ Statistiques importées avec succès !");
      location.reload();
    } catch (err) {
      alert("❌ Fichier invalide ou corrompu");
      console.error(err);
    }
  };

  reader.readAsText(file);
}

