/**
 * verbesPerso.js - Gestion des listes de verbes personnalisées
 */

// ============ LIST MANAGEMENT ============
function creerListe() {
  const nomListe = document.getElementById("nomListe");
  if (!nomListe) return;

  const nom = nomListe.value.trim();
  if (!nom || listesPerso[nom]) {
    alert("Nom invalide ou déjà existant");
    return;
  }

  listesPerso[nom] = [];
  saveListesPerso();
  nomListe.value = "";
  afficherListes();
}

function supprimerListe(nom) {
  if (!confirm(`Supprimer la liste "${nom}" ?`)) return;
  delete listesPerso[nom];
  saveListesPerso();
  afficherListes();
}

function afficherListes() {
  const div = document.getElementById("listesExistantes");
  if (!div) return;

  div.innerHTML = "<h3>📚 Listes existantes</h3>";

  Object.keys(listesPerso).forEach(nom => {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.justifyContent = "space-between";
    container.style.alignItems = "center";
    container.style.marginBottom = "10px";
    container.style.padding = "8px";
    container.style.background = "var(--input)";
    container.style.borderRadius = "4px";

    const span = document.createElement("span");
    span.textContent = nom;
    span.style.flex = "1";

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "✏️";
    btnEdit.style.width = "40px";
    btnEdit.style.margin = "0 5px";
    btnEdit.addEventListener("click", () => ouvrirListe(nom));

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "❌";
    btnDelete.style.width = "40px";
    btnDelete.style.margin = "0";
    btnDelete.addEventListener("click", () => supprimerListe(nom));

    container.appendChild(span);
    container.appendChild(btnEdit);
    container.appendChild(btnDelete);

    div.appendChild(container);
  });
}

// ============ LIST OPENING ============
function ouvrirListe(nom) {
  listePersoActive = nom;
  const gestionListe = document.getElementById("gestionListe");
  const titreListe = document.getElementById("titreListe");

  if (gestionListe) gestionListe.classList.remove("hidden");
  if (titreListe) titreListe.textContent = `📘 ${nom}`;

  afficherVerbesListe();
}

function ouvrirVerbesPerso() {
  hide("menu");
  hide("quiz");
  show("verbesPerso");
  updateMenuState();
  afficherListes();
}

// ============ VERB LIST DISPLAY ============
function afficherVerbesListe() {
  const div = document.getElementById("listeVerbesPerso");
  if (!div || !listePersoActive) return;

  const liste = listesPerso[listePersoActive];
  div.innerHTML = "<h4>📖 Verbes</h4>";

  liste.forEach((v, i) => {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.justifyContent = "space-between";
    container.style.alignItems = "center";
    container.style.marginBottom = "8px";
    container.style.padding = "8px";
    container.style.background = "var(--input)";
    container.style.borderRadius = "4px";

    const info = document.createElement("span");
    info.textContent = `${v.inf} – ${v.sens}`;
    info.style.flex = "1";

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "❌";
    btnDelete.style.width = "40px";
    btnDelete.style.margin = "0";
    btnDelete.addEventListener("click", () => supprimerVerbeListe(i));

    container.appendChild(info);
    container.appendChild(btnDelete);

    div.appendChild(container);
  });
}

function supprimerVerbeListe(index) {
  listesPerso[listePersoActive].splice(index, 1);
  saveListesPerso();
  afficherVerbesListe();
}

// ============ VERB ADDING ============
function autoCompleterVerbe() {
  const p_inf = document.getElementById("p_inf");
  const p_pres = document.getElementById("p_pres");
  const p_pret = document.getElementById("p_pret");
  const p_parf = document.getElementById("p_parf");
  const p_sens = document.getElementById("p_sens");

  if (!p_inf) return;

  const inf = p_inf.value.trim().toLowerCase();
  if (!inf) return;

  const dict = getDictionnaireVerbes();
  const verbe = dict[inf];

  if (verbe) {
    if (p_pres) p_pres.value = verbe.pres || "";
    if (p_pret) p_pret.value = verbe.pret || "";
    if (p_parf) p_parf.value = verbe.parf || "";
    if (p_sens) p_sens.value = verbe.sens || "";

    [p_pres, p_pret, p_parf, p_sens].forEach(el => {
      if (el) el.disabled = true;
    });
  } else {
    [p_pres, p_pret, p_parf, p_sens].forEach(el => {
      if (el) el.disabled = false;
    });
  }
}

function ajouterVerbePerso() {
  if (!listePersoActive) return;

  const p_inf = document.getElementById("p_inf");
  const p_pres = document.getElementById("p_pres");
  const p_pret = document.getElementById("p_pret");
  const p_parf = document.getElementById("p_parf");
  const p_sens = document.getElementById("p_sens");

  const v = {
    inf: p_inf?.value.trim() || "",
    pres: p_pres?.value.trim() || "",
    pret: p_pret?.value.trim() || "",
    parf: p_parf?.value.trim() || "",
    sens: p_sens?.value.trim() || ""
  };

  if (!v.inf) {
    alert("L'infinitif est obligatoire");
    return;
  }

  if (!v.pres || !v.pret || !v.parf || !v.sens) {
    alert("Verbe inconnu : merci de compléter toutes les formes");
    return;
  }

  listesPerso[listePersoActive].push(v);
  saveListesPerso();

  if (!stats[v.inf]) {
    initCardStats(v.inf);
    saveStats();
  }

  ["p_inf", "p_pres", "p_pret", "p_parf", "p_sens"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  [p_pres, p_pret, p_parf, p_sens].forEach(el => {
    if (el) el.disabled = false;
  });

  afficherVerbesListe();
}

// ============ LIST REVISION ============
function reviserListePerso() {
  const liste = listesPerso[listePersoActive];
  if (!liste || !liste.length) {
    alert("Liste vide");
    return;
  }

  // Convert list structure to match VERBES format if needed
  verbesActifs = liste.map(v => ({
    inf: v.inf,
    pres: v.pres,
    pret: v.pret,
    parf: v.parf,
    sens: v.sens
  }));
  
  mode = "targeted";
  updateStatsMode = false; // Don't update stats for custom lists

  hide("verbesPerso");
  show("quiz");
  updateMenuState();

  nextQuestion();
}

// ============ LIST IMPORT/EXPORT ============
function exporterListe() {
  if (!listePersoActive) return;

  const data = {
    nom: listePersoActive,
    verbes: listesPerso[listePersoActive]
  };

  downloadJSON(data, `${listePersoActive.replace(/\s+/g, "_")}.json`);
}

function importerListe(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);

      if (!data.nom || !Array.isArray(data.verbes)) {
        throw new Error("Format invalide");
      }

      let nom = data.nom;

      // Avoid overwriting
      if (listesPerso[nom]) {
        let i = 2;
        while (listesPerso[`${nom} (${i})`]) i++;
        nom = `${nom} (${i})`;
      }

      listesPerso[nom] = data.verbes;

      // Initialize missing stats
      data.verbes.forEach(v => {
        if (!stats[v.inf]) {
          initCardStats(v.inf);
        }
      });

      saveListesPerso();
      saveStats();

      afficherListes();
      alert(`Liste "${nom}" importée avec succès`);

      event.target.value = ""; // Reset input
    } catch (err) {
      alert("❌ Fichier invalide");
      console.error(err);
    }
  };

  reader.readAsText(file);
}

// ============ AUTOCOMPLETE ============
let indexSuggestion = -1;
let suggestionsActuelles = [];

function suggestionsInfinitif() {
  const input = document.getElementById("p_inf");
  const box = document.getElementById("suggestions");

  if (!input || !box) return;

  const value = input.value.trim().toLowerCase();
  box.innerHTML = "";
  indexSuggestion = -1;
  suggestionsActuelles = [];

  if (value.length < 2) {
    box.classList.add("hidden");
    return;
  }

  const dict = getDictionnaireVerbes();
  suggestionsActuelles = Object.keys(dict)
    .filter(k => k.startsWith(value))
    .slice(0, 8);

  if (!suggestionsActuelles.length) {
    box.classList.add("hidden");
    return;
  }

  suggestionsActuelles.forEach((inf, i) => {
    const div = document.createElement("div");
    div.textContent = inf;
    div.onclick = () => selectionnerVerbe(dict[inf]);
    box.appendChild(div);
  });

  box.classList.remove("hidden");
}

function selectionnerVerbe(verbe) {
  const p_inf = document.getElementById("p_inf");
  const p_pres = document.getElementById("p_pres");
  const p_pret = document.getElementById("p_pret");
  const p_parf = document.getElementById("p_parf");
  const p_sens = document.getElementById("p_sens");
  const suggestions = document.getElementById("suggestions");

  if (p_inf) p_inf.value = verbe.inf;
  if (p_pres) p_pres.value = verbe.pres;
  if (p_pret) p_pret.value = verbe.pret;
  if (p_parf) p_parf.value = verbe.parf;
  if (p_sens) p_sens.value = verbe.sens;

  [p_pres, p_pret, p_parf, p_sens].forEach(el => {
    if (el) el.disabled = true;
  });

  if (suggestions) suggestions.classList.add("hidden");
}

function fermerSuggestionsAvecDelai() {
  setTimeout(() => {
    const suggestions = document.getElementById("suggestions");
    if (suggestions) suggestions.classList.add("hidden");
    autoCompleterVerbe();
  }, 150);
}

// ============ KEYBOARD NAVIGATION ============
function initAutocompletKeyboard() {
  const p_inf = document.getElementById("p_inf");
  if (!p_inf) return;

  p_inf.addEventListener("input", () => {
    indexSuggestion = -1;
    const p_pres = document.getElementById("p_pres");
    const p_pret = document.getElementById("p_pret");
    const p_parf = document.getElementById("p_parf");
    const p_sens = document.getElementById("p_sens");

    [p_pres, p_pret, p_parf, p_sens].forEach(el => {
      if (el) el.disabled = false;
    });
  });

  p_inf.addEventListener("keydown", e => {
    const box = document.getElementById("suggestions");
    if (!box || box.classList.contains("hidden")) return;

    const items = box.children;
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      indexSuggestion = (indexSuggestion + 1) % items.length;
      majSelection(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      indexSuggestion = (indexSuggestion - 1 + items.length) % items.length;
      majSelection(items);
    } else if (e.key === "Enter" && indexSuggestion >= 0) {
      e.preventDefault();
      const inf = suggestionsActuelles[indexSuggestion];
      selectionnerVerbe(getDictionnaireVerbes()[inf]);
    } else if (e.key === "Escape") {
      box.classList.add("hidden");
    }
  });
}

function majSelection(items) {
  [...items].forEach((el, i) => {
    el.classList.toggle("active", i === indexSuggestion);
  });
}
