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
// ============ PROGRESSION CHART ============
function afficherGraphiqueProgression() {
  const canvas = document.getElementById("progressChart");
  if (!canvas) return;

  // Destroy existing chart if any
  if (window.progressChartInstance) {
    window.progressChartInstance.destroy();
  }

  // Prepare data per group
  const groupes = groupesDebloques();
  const labels = [];
  const maitrisesData = [];
  const totalData = [];
  const couleurs = [];
  const tailleGrille = 15;

  groupes.forEach((groupe, index) => {
    labels.push(`Groupe ${index + 1}`);
    
    let groupMaitrise = 0;
    let groupTotal = 0;
    
    // Count verbs in this group
    for (let i = groupe.debut; i <= groupe.fin; i++) {
      if (i - 1 < VERBES.length) {
        const verb = VERBES[i - 1];
        const verbStats = stats[verb.infinitif] || {};
        groupTotal++;
        if ((verbStats.maitrise || 0) >= 5) {
          groupMaitrise++;
        }
      }
    }
    
    maitrisesData.push(groupMaitrise);
    totalData.push(groupTotal);
    couleurs.push(`hsl(${120 - (index * 15)}, 70%, 60%)`);
  });

  const ctx = canvas.getContext("2d");
  window.progressChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "✅ Verbes maîtrisés",
          data: maitrisesData,
          backgroundColor: couleurs,
          borderColor: couleurs.map(c => c.replace("60%", "40%")),
          borderWidth: 2,
          borderRadius: 6
        },
        {
          label: "📚 Verbes totaux",
          data: totalData,
          backgroundColor: couleurs.map(c => c.replace("70%", "20%")),
          borderColor: couleurs.map(c => c.replace("60%", "30%")),
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: "x",
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: document.body.style.color || getComputedStyle(document.body).color,
            font: { size: 12, weight: "bold" }
          }
        },
        title: {
          display: true,
          text: "📈 Progression par groupe",
          color: document.body.style.color || getComputedStyle(document.body).color,
          font: { size: 14, weight: "bold" },
          padding: 15
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: Math.max(...totalData, 20),
          ticks: {
            color: document.body.style.color || getComputedStyle(document.body).color,
            stepSize: 1
          },
          grid: {
            color: "rgba(128, 128, 128, 0.1)"
          }
        },
        x: {
          ticks: {
            color: document.body.style.color || getComputedStyle(document.body).color
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// ============ STATS DISPLAY ============
function afficherStats() {
  hide("menu");
  hide("quiz");
  show("statsPanel");
  updateMenuState();

  // Show progression chart
  afficherGraphiqueProgression();

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
      <button onclick="reviserVerbesProblemes()">🎯 Réviser</button>
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

// ============ PDF EXPORT ============
function exporterPDF() {
  if (typeof jspdf === "undefined") {
    alert("La bibliotheque PDF n'est pas chargee");
    return;
  }

  const { jsPDF } = jspdf;
  const doc = new jsPDF();

  let y = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const sectionSpacing = 8;

  // ============ HEADER/TITLE PAGE ============
  doc.setFontSize(28);
  doc.setTextColor(52, 152, 219); // Blue
  doc.text("VERBES ALLEMANDS", 80, 40, { align: "center" });
  
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text("Rapport de Progression", 50, 80, { align: "center" });

  // Date
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Généré le ${formatDate(new Date())} à ${new Date().toLocaleTimeString("fr-FR").slice(0, 5)}`, 120, 80, { align: "center" });

  // Separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(15, 90, pageWidth - 15, 90);

  y = 100;

  // ============ QUICK STATS ============
  let total = 0, mait = 0, erreurs = 0, lapses = 0;
  Object.values(stats).forEach(v => {
    total += v.propositions || 0;
    mait += v.maitrise || 0;
    erreurs += v.erreurs || 0;
    lapses += v.lapses || 0;
  });

  const verbesTotal = Object.keys(stats).length;
  const masteredVerbs = Object.values(stats).filter(v => v.maitrise >= 5).length;
  const progressPercent = Math.round((masteredVerbs / Math.max(verbesTotal, 1)) * 100);

  // Stats boxes
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text("RESUME DES PERFORMANCES", 15, y);
  y += 8;

  // Box 1: Total attempts
  doc.setFillColor(230, 240, 250);
  doc.rect(15, y, 40, 20, "F");
  doc.setFontSize(12);
  doc.setTextColor(52, 152, 219);
  doc.text(String(total), 23, y + 12, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Tentatives", 23, y + 17, { align: "center" });

  // Box 2: Mastered
  doc.setFillColor(240, 250, 230);
  doc.rect(60, y, 40, 20, "F");
  doc.setFontSize(12);
  doc.setTextColor(39, 174, 96);
  doc.text(String(masteredVerbs), 80, y + 12, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Maitrises", 80, y + 17, { align: "center" });

  // Box 3: Errors
  doc.setFillColor(250, 240, 230);
  doc.rect(105, y, 40, 20, "F");
  doc.setFontSize(12);
  doc.setTextColor(230, 126, 34);
  doc.text(String(erreurs), 125, y + 12, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Erreurs", 125, y + 17, { align: "center" });

  // Box 4: Progress %
  doc.setFillColor(250, 230, 240);
  doc.rect(150, y, 40, 20, "F");
  doc.setFontSize(12);
  doc.setTextColor(155, 89, 182);
  doc.text(`${progressPercent}%`, 170, y + 12, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Progrès", 170, y + 17, { align: "center" });

  y += 35;

  // ============ STREAK ============
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text("SÉRIE ACTUELLE", 15, y);
  y += 7;

  doc.setFillColor(255, 235, 200);
  doc.rect(15, y, 170, 12, "F");
  doc.setFontSize(13);
  doc.setTextColor(230, 126, 34);
  doc.text(`${streak.count} jour${streak.count > 1 ? "s" : ""} consécutif${streak.count > 1 ? "s" : ""}`, 20, y + 8);
  y += 20;

  // ============ PAGE BREAK CHECK ============
  if (y > pageHeight - 60) {
    doc.addPage();
    y = 15;
  }

  // ============ MASTERED VERBS ============
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text("[OK] VERBES MAÎTRISÉS", 15, y);
  y += 8;

  const masteredList = Object.entries(stats)
    .filter(([_, v]) => v.maitrise >= 5)
    .sort((a, b) => b[1].maitrise - a[1].maitrise)
    .slice(0, 20);

  if (masteredList.length > 0) {
    doc.setFontSize(9);
    doc.setTextColor(39, 174, 96);
    masteredList.forEach(([inf, v]) => {
      doc.text(`• ${inf} (maîtrise: ${v.maitrise})`, 20, y);
      y += 5;
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 15;
      }
    });
  } else {
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Aucun verbe maîtrisé pour le moment", 20, y);
    y += 5;
  }

  y += 5;

  // ============ PAGE BREAK CHECK ============
  if (y > pageHeight - 60) {
    doc.addPage();
    y = 15;
  }

  // ============ TO REVIEW ============
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text("[!] VERBES À REVOIR", 15, y);
  y += 8;

  const toReviewList = Object.entries(stats)
    .filter(([_, v]) => (v.erreurs || 0) > (v.maitrise || 0))
    .sort((a, b) => (b[1].erreurs || 0) - (a[1].erreurs || 0))
    .slice(0, 15);

  if (toReviewList.length > 0) {
    doc.setFontSize(9);
    doc.setTextColor(230, 126, 34);
    toReviewList.forEach(([inf, v]) => {
      doc.text(`• ${inf} (erreurs: ${v.erreurs}, maîtrise: ${v.maitrise || 0})`, 20, y);
      y += 5;
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 15;
      }
    });
  } else {
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Aucun verbe problématique", 20, y);
    y += 5;
  }

  y += 10;

  // ============ PAGE BREAK CHECK ============
  if (y > pageHeight - 60) {
    doc.addPage();
    y = 15;
  }

  // ============ GROUP DETAILS ============
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text("PROGRESSION PAR GROUPE", 15, y);
  y += 8;

  const groupes = groupesDebloques();
  groupes.forEach((groupe, index) => {
    let groupMaitrise = 0;
    let groupTotal = 0;

    for (let i = groupe.debut; i <= groupe.fin; i++) {
      if (i - 1 < VERBES.length) {
        const verb = VERBES[i - 1];
        const verbStats = stats[verb.infinitif] || {};
        groupTotal++;
        if ((verbStats.maitrise || 0) >= 5) {
          groupMaitrise++;
        }
      }
    }

    const groupPercent = Math.round((groupMaitrise / Math.max(groupTotal, 1)) * 100);
    const barLength = (groupPercent / 100) * 30;

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.text(`Groupe ${index + 1}: ${groupPercent}%`, 20, y);

    // Progress bar
    doc.setDrawColor(200, 200, 200);
    doc.rect(60, y - 2.5, 30, 3);
    doc.setFillColor(52, 152, 219);
    doc.rect(60, y - 2.5, barLength, 3, "F");

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`${groupMaitrise}/${groupTotal}`, 95, y);

    y += 7;

    if (y > pageHeight - 20) {
      doc.addPage();
      y = 15;
    }
  });

  // ============ FOOTER ============
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text("Généré par Révision Verbes Allemands", pageWidth / 2, pageHeight - 10, { align: "center" });

  doc.save("verbes_allemands_progression.pdf");
}
