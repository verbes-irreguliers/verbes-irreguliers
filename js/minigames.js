/**
 * minigames.js - Mini-jeux débloqués par groupe
 */

// ============ MINI-GAMES DEFINITIONS ============
const MINI_GAMES = [
  {
    id: "pendu",
    titre: "Pendu 🎮",
    description: "Devinez les lettres des infinitifs des verbes",
    icon: "🎮",
    groupeMin: 1
  },
  {
    id: "vrai_faux",
    titre: "Vrai ou Faux ✓✗",
    description: "Identifiez les bonnes conjugaisons",
    icon: "✓✗",
    groupeMin: 1
  },
  {
    id: "memoire",
    titre: "Mémoire 🧠",
    description: "Trouvez les paires verbe-conjugaison",
    icon: "🧠",
    groupeMin: 2
  },
  {
    id: "traduction",
    titre: "Traduction 🔤",
    description: "Trouvez le verbe par sa traduction",
    icon: "🔤",
    groupeMin: 2
  },
  {
    id: "defi_vitesse",
    titre: "Défi de Vitesse ⚡",
    description: "Répondez rapidement aux conjugaisons",
    icon: "⚡",
    groupeMin: 3
  },
  {
    id: "relier",
    titre: "Relier les Formes 🔗",
    description: "Appariez les verbes avec leurs conjugaisons",
    icon: "🔗",
    groupeMin: 3
  },
  {
    id: "quiz_perso",
    titre: "Quiz Personnalisé ❓",
    description: "Questions variées sur les verbes",
    icon: "❓",
    groupeMin: 4
  },
  {
    id: "maitrise_verbe",
    titre: "Maîtrise du Verbe 👑",
    description: "Tous les types de questions en rafale",
    icon: "👑",
    groupeMin: 5
  }
];

// ============ GAME STATE ============
let jeuActif = null;
let scoreJeuActuel = 0;
let tempsJeuActuel = 0;

// ============ GET UNLOCKED GAMES ============
function getJeuxDébloques() {
  const groupes = groupesDebloques();
  const groupesDebloquesCount = groupes.filter(g => g.debloque).length;
  
  return MINI_GAMES.filter(game => game.groupeMin <= groupesDebloquesCount);
}

// ============ GET VERBS FOR GROUP ============
function getVerbesGroupe(numeroGroupe) {
  const TAILLE_GROUPE = 5;
  const debut = (numeroGroupe - 1) * TAILLE_GROUPE;
  const fin = debut + TAILLE_GROUPE;
  return VERBES.slice(debut, fin);
}

// ============ DISPLAY MINI-GAMES PANEL ============
function afficherMiniJeux() {
  hide("menu");
  hide("quiz");
  hide("statsPanel");
  hide("verbesPerso");
  show("miniJeuxPanel");
  
  const jeux = getJeuxDébloques();
  const groupes = groupesDebloques();
  const groupesDebloquesCount = groupes.filter(g => g.debloque).length;
  
  let html = `
    <h2>🎮 Mini-Jeux</h2>
    <p>Groupes débloqués : <strong>${groupesDebloquesCount}</strong></p>
    <hr>
  `;
  
  if (jeux.length === 0) {
    html += `<p>🔒 Aucun jeu débloqué pour le moment. Déverrouillez des groupes de verbes !</p>`;
  } else {
    html += `<div class="games-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">`;
    
    jeux.forEach(jeu => {
      html += `
        <div style="background: var(--input); padding: 15px; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" 
             onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'" 
             onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'"
             onclick="demarrerJeu('${jeu.id}')">
          <div style="font-size: 40px; margin-bottom: 10px;">${jeu.icon}</div>
          <h3 style="margin: 5px 0;">${jeu.titre}</h3>
          <p style="font-size: 12px; margin: 0 0 10px 0;">${jeu.description}</p>
          <button style="width: 100%; padding: 8px; background: var(--button); color: var(--text); border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Jouer</button>
        </div>
      `;
    });
    
    html += `<br>Débloquez des groupes de verbes pour déverrouiller de nouveaux jeux !</div>`;
  }
  
  html += `<button onclick="fermerMiniJeux()">⬅️ Retour</button>`;
  
  const container = document.getElementById("miniJeuxContent");
  if (container) container.innerHTML = html;
}

function fermerMiniJeux() {
  hide("miniJeuxPanel");
  show("menu");
}

// ============ GAME LAUNCHER ============
function demarrerJeu(jeuId) {
  jeuActif = jeuId;
  scoreJeuActuel = 0;
  tempsJeuActuel = 0;
  
  switch(jeuId) {
    case "pendu":
      demarrerPendu();
      break;
    case "vrai_faux":
      demarrerVraiFaux();
      break;
    case "memoire":
      demarrerMemoire();
      break;
    case "traduction":
      demarrerTraduction();
      break;
    case "defi_vitesse":
      demarrerDefiVitesse();
      break;
    case "relier":
      demarrerRelier();
      break;
    case "quiz_perso":
      demarrerQuizPerso();
      break;
    case "maitrise_verbe":
      demarrerMaitriseVerbe();
      break;
  }
}

// ============ PENDU GAME ============
let penduState = {
  verbes: [],
  verbeCourant: null,
  lettresTrouvees: [],
  lettresEssayees: [],
  tentativesRestantes: 6,
  mots: []
};

function demarrerPendu() {
  const groupes = groupesDebloques();
  const groupesDebloquesCount = groupes.filter(g => g.debloque).length;
  const verbes = getVerbesGroupe(1);
  
  penduState = {
    verbes: verbes,
    verbeCourant: verbes[Math.floor(Math.random() * verbes.length)],
    lettresTrouvees: [],
    lettresEssayees: [],
    tentativesRestantes: 6,
    mots: []
  };
  
  afficherPendu();
}

function afficherPendu() {
  hide("miniJeuxPanel");
  show("penduPanel");
  
  const mot = penduState.verbeCourant.inf.toLowerCase().replace("/", "");
  const affichage = mot.split("").map(l => 
    penduState.lettresTrouvees.includes(l) ? l : "_"
  ).join(" ");
  
  const alphabet = "abcdefghijklmnopqrstuvwxyzäöüß";
  let html = `
    <h2>🎮 Pendu</h2>
    <p><strong>Infinitif :</strong> ${penduState.verbeCourant.sens}</p>
    <p style="font-size: 24px; font-family: monospace; letter-spacing: 5px; font-weight: bold;">${affichage}</p>
    <p>Essais restants : <strong style="color: ${penduState.tentativesRestantes > 3 ? 'green' : penduState.tentativesRestantes > 1 ? 'orange' : 'red'};">${penduState.tentativesRestantes}</strong></p>
    <p>Lettres essayées : ${penduState.lettresEssayees.join(", ") || "Aucune"}</p>
    <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 5px; margin: 15px 0;">
  `;
  
  for (let lettre of alphabet) {
    const utilisee = penduState.lettresEssayees.includes(lettre);
    const trouvee = penduState.lettresTrouvees.includes(lettre);
    
    html += `
      <button 
        onclick="essayerLettrePendu('${lettre}')"
        ${utilisee ? 'disabled' : ''}
        style="padding: 8px; background: ${utilisee ? 'var(--disabled)' : trouvee ? 'green' : 'var(--button)'}; color: var(--text); border: none; border-radius: 4px; cursor: ${utilisee ? 'not-allowed' : 'pointer'}; font-weight: bold;">
        ${lettre.toUpperCase()}
      </button>
    `;
  }
  
  html += `</div>`;
  
  const motComplet = mot.split("").every(l => penduState.lettresTrouvees.includes(l));
  if (motComplet) {
    html += `<p style="color: green; font-weight: bold; font-size: 18px;">✅ Vous avez trouvé ! Le mot était : <strong>${mot}</strong></p>`;
    html += `<button onclick="demarrerPendu()">Suivant</button>`;
  } else if (penduState.tentativesRestantes === 0) {
    html += `<p style="color: red; font-weight: bold; font-size: 18px;">❌ Perdu ! Le mot était : <strong>${mot}</strong></p>`;
    html += `<button onclick="demarrerPendu()">Réessayer</button>`;
  }
  
  html += `<button onclick="afficherMiniJeux()">⬅️ Retour</button>`;
  
  const container = document.getElementById("penduContent");
  if (container) container.innerHTML = html;
}

function essayerLettrePendu(lettre) {
  if (penduState.lettresEssayees.includes(lettre)) return;
  
  penduState.lettresEssayees.push(lettre);
  
  const mot = penduState.verbeCourant.inf.toLowerCase().replace("/", "");
  if (mot.includes(lettre)) {
    penduState.lettresTrouvees.push(lettre);
  } else {
    penduState.tentativesRestantes--;
  }
  
  afficherPendu();
}

// ============ VRAI OU FAUX GAME ============
let vraiFauxState = {
  verbes: [],
  verbeCourant: null,
  index: 0,
  score: 0,
  total: 0
};

function demarrerVraiFaux() {
  const verbes = getVerbesGroupe(1);
  vraiFauxState = {
    verbes: verbes,
    verbeCourant: null,
    index: 0,
    score: 0,
    total: 0
  };
  afficherVraiFaux();
}

function afficherVraiFaux() {
  hide("miniJeuxPanel");
  show("vraiFauxPanel");
  
  if (vraiFauxState.index >= vraiFauxState.verbes.length || vraiFauxState.total >= 10) {
    afficherResultatVraiFaux();
    return;
  }
  
  vraiFauxState.total++;
  const verbe = vraiFauxState.verbes[vraiFauxState.index];
  const typeConjugaison = ["pres", "pret", "parf"][Math.floor(Math.random() * 3)];
  const titleMap = { "pres": "Présent", "pret": "Prétérit", "parf": "Parfait" };
  
  // Generate correct and incorrect answers
  const bonneReponse = verbe[typeConjugaison];
  let mauvaiseReponse = verbe[typeConjugaison];
  
  while (mauvaiseReponse === bonneReponse) {
    const verbeAleatoire = vraiFauxState.verbes[Math.floor(Math.random() * vraiFauxState.verbes.length)];
    mauvaiseReponse = verbeAleatoire[typeConjugaison];
  }
  
  const reponseAffichee = Math.random() > 0.5 ? bonneReponse : mauvaiseReponse;
  const estCorrect = reponseAffichee === bonneReponse;
  
  let html = `
    <h2>✓✗ Vrai ou Faux</h2>
    <p>Score : <strong>${vraiFauxState.score}</strong> / <strong>${vraiFauxState.total}</strong></p>
    <hr>
    <p><strong>Infinitif :</strong> ${verbe.inf}</p>
    <p><strong>Sens :</strong> ${verbe.sens}</p>
    <p><strong>Le ${titleMap[typeConjugaison]} de "${verbe.inf}" est :</strong></p>
    <p style="font-size: 20px; background: var(--input); padding: 15px; border-radius: 8px; margin: 20px 0; font-family: monospace;">
      ${reponseAffichee}
    </p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
      <button onclick="repondreVraiFaux(true)" style="padding: 15px; background: green; color: white; font-size: 18px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">✓ Vrai</button>
      <button onclick="repondreVraiFaux(false)" style="padding: 15px; background: red; color: white; font-size: 18px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">✗ Faux</button>
    </div>
    <button onclick="afficherMiniJeux()">⬅️ Retour</button>
  `;
  
  // Store the correct answer for verification
  vraiFauxState.reponseCorrecte = estCorrect;
  
  const container = document.getElementById("vraiFauxContent");
  if (container) container.innerHTML = html;
}

function repondreVraiFaux(reponse) {
  if (reponse === vraiFauxState.reponseCorrecte) {
    vraiFauxState.score++;
  }
  vraiFauxState.index++;
  afficherVraiFaux();
}

function afficherResultatVraiFaux() {
  const container = document.getElementById("vraiFauxContent");
  if (container) {
    container.innerHTML = `
      <h2>✓✗ Vrai ou Faux - Terminé</h2>
      <p style="font-size: 24px; font-weight: bold;">Votre score : <strong style="color: var(--primary);">${vraiFauxState.score}</strong> / <strong>${vraiFauxState.total}</strong></p>
      <button onclick="demarrerVraiFaux()">Rejouer</button>
      <button onclick="afficherMiniJeux()">⬅️ Retour</button>
    `;
  }
}

// ============ MEMORY GAME ============
let memoireState = {
  cartes: [],
  cartesRetournees: [],
  pairesFound: 0,
  totalPaires: 0
};

function demarrerMemoire() {
  const groupes = groupesDebloques();
  const groupesDebloquesCount = groupes.filter(g => g.debloque).length;
  const verbes = getVerbesGroupe(1).slice(0, 6);
  
  let cartes = [];
  verbes.forEach((v, i) => {
    cartes.push({ id: i * 2, type: "verbe", data: v, affiche: v.inf });
    cartes.push({ id: i * 2 + 1, type: "conjugaison", data: v, affiche: v.pres });
  });
  
  cartes = cartes.sort(() => Math.random() - 0.5);
  
  memoireState = {
    cartes: cartes,
    cartesRetournees: [],
    cartesTrouvees: [],
    pairesFound: 0,
    totalPaires: verbes.length,
    verbesUtilises: verbes
  };
  
  afficherMemoire();
}

function afficherMemoire() {
  hide("miniJeuxPanel");
  show("memoirePanel");
  
  let html = `
    <h2>🧠 Jeu de Mémoire</h2>
    <p>Paires trouvées : <strong>${memoireState.pairesFound}</strong> / <strong>${memoireState.totalPaires}</strong></p>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0;">
  `;
  
  memoireState.cartes.forEach(carte => {
    const estRetournee = memoireState.cartesRetournees.find(c => c.id === carte.id);
    const estTrouvee = memoireState.cartesTrouvees.find(c => c.id === carte.id);
    
    html += `
      <div 
        onclick="${estTrouvee ? '' : `retournerCarteMémoire(${carte.id})`}"
        style="
          width: 100%;
          aspect-ratio: 1;
          background: ${estTrouvee ? 'var(--success)' : estRetournee ? 'var(--input)' : 'var(--button)'};
          border: 2px solid ${estTrouvee ? 'green' : 'var(--primary)'};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: ${estTrouvee ? 'default' : 'pointer'};
          font-weight: bold;
          font-size: 12px;
          text-align: center;
          padding: 5px;
          transition: all 0.3s;
          overflow: hidden;
          word-break: break-word;
        "
        onmouseover="${estTrouvee ? '' : `this.style.transform='scale(1.05)'`}"
        onmouseout="${estTrouvee ? '' : `this.style.transform='scale(1)'`}"
      >
        ${estTrouvee || estRetournee ? carte.affiche : '?'}
      </div>
    `;
  });
  
  html += `</div>`;
  
  if (memoireState.pairesFound === memoireState.totalPaires) {
    html += `<p style="color: green; font-weight: bold; font-size: 18px;">🎉 Bravo ! Vous avez trouvé toutes les paires !</p>`;
    html += `<button onclick="demarrerMemoire()">Rejouer</button>`;
  }
  
  html += `<button onclick="afficherMiniJeux()">⬅️ Retour</button>`;
  
  const container = document.getElementById("memoireContent");
  if (container) container.innerHTML = html;
}

function retournerCarteMémoire(carteId) {
  const carte = memoireState.cartes.find(c => c.id === carteId);
  if (!carte || memoireState.cartesRetournees.find(c => c.id === carteId)) return;
  if (memoireState.cartesTrouvees.find(c => c.id === carteId)) return;
  
  memoireState.cartesRetournees.push(carte);
  
  if (memoireState.cartesRetournees.length === 2) {
    const [carte1, carte2] = memoireState.cartesRetournees;
    
    const estPaire = (
      carte1.data.inf === carte2.data.inf &&
      carte1.type !== carte2.type
    );
    
    setTimeout(() => {
      if (estPaire) {
        memoireState.pairesFound++;
        memoireState.cartesTrouvees.push(carte1, carte2);
        memoireState.cartesRetournees = [];
      } else {
        memoireState.cartesRetournees = [];
      }
      afficherMemoire();
    }, 800);
  } else {
    afficherMemoire();
    return;
  }
  
  afficherMemoire();
}

// ============ TRADUCTION GAME ============
let traductionState = {
  verbes: [],
  index: 0,
  score: 0,
  total: 0
};

function demarrerTraduction() {
  const verbes = getVerbesGroupe(1);
  traductionState = {
    verbes: verbes,
    index: 0,
    score: 0,
    total: 0
  };
  afficherTraduction();
}

function afficherTraduction() {
  hide("miniJeuxPanel");
  show("traductionPanel");
  
  if (traductionState.index >= traductionState.verbes.length || traductionState.total >= 10) {
    afficherResultatTraduction();
    return;
  }
  
  traductionState.total++;
  const verbe = traductionState.verbes[traductionState.index];
  
  // Get 4 different verbs for options
  const options = [verbe];
  while (options.length < 4) {
    const aleatoire = traductionState.verbes[Math.floor(Math.random() * traductionState.verbes.length)];
    if (!options.find(v => v.inf === aleatoire.inf)) {
      options.push(aleatoire);
    }
  }
  
  options.sort(() => Math.random() - 0.5);
  
  let html = `
    <h2>🔤 Traduction</h2>
    <p>Score : <strong>${traductionState.score}</strong> / <strong>${traductionState.total}</strong></p>
    <hr>
    <p style="font-size: 18px; font-weight: bold; margin: 20px 0;">Quel verbe signifie :</p>
    <p style="font-size: 24px; background: var(--input); padding: 15px; border-radius: 8px; margin: 20px 0; color: var(--primary); font-weight: bold;">
      ${verbe.sens}
    </p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
  `;
  
  options.forEach(option => {
    html += `
      <button 
        onclick="repondreTraduction('${option.inf}')"
        style="padding: 15px; background: var(--button); color: var(--text); border: 2px solid var(--primary); border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 16px;">
        ${option.inf}
      </button>
    `;
  });
  
  html += `</div><button onclick="afficherMiniJeux()">⬅️ Retour</button>`;
  
  traductionState.bonneReponse = verbe.inf;
  
  const container = document.getElementById("traductionContent");
  if (container) container.innerHTML = html;
}

function repondreTraduction(reponse) {
  if (reponse === traductionState.bonneReponse) {
    traductionState.score++;
  }
  traductionState.index++;
  afficherTraduction();
}

function afficherResultatTraduction() {
  const container = document.getElementById("traductionContent");
  if (container) {
    container.innerHTML = `
      <h2>🔤 Traduction - Terminé</h2>
      <p style="font-size: 24px; font-weight: bold;">Votre score : <strong style="color: var(--primary);">${traductionState.score}</strong> / <strong>${traductionState.total}</strong></p>
      <button onclick="demarrerTraduction()">Rejouer</button>
      <button onclick="afficherMiniJeux()">⬅️ Retour</button>
    `;
  }
}

// ============ RELIER GAME ============
let relierState = {
  verbes: [],
  index: 0,
  pairesRappelees: 0,
  totalPaires: 0,
  verbeCourant: null,
  conjugaisonSelectionnee: null
};

function demarrerRelier() {
  const verbes = getVerbesGroupe(1).slice(0, 5);
  const types = ["pres", "pret", "parf"];
  
  relierState = {
    verbes: verbes,
    index: 0,
    pairesRappelees: 0,
    totalPaires: verbes.length * 3,
    verbeCourant: null,
    conjugaisonSelectionnee: null,
    types: types,
    verbesAlea: [...verbes].sort(() => Math.random() - 0.5),
    conjugaisonsAlea: []
  };
  
  // Create all conjugations in random order
  let allConj = [];
  verbes.forEach((v, i) => {
    types.forEach((type, typeIdx) => {
      allConj.push({
        infinitif: v.inf,
        conjugaison: v[type],
        type: type,
        verbeIdx: i
      });
    });
  });
  relierState.conjugaisonsAlea = allConj.sort(() => Math.random() - 0.5);
  
  afficherRelier();
}

function afficherRelier() {
  hide("miniJeuxPanel");
  show("relierPanel");
  
  if (relierState.pairesRappelees >= relierState.totalPaires) {
    afficherResultatRelier();
    return;
  }
  
  let html = `
    <h2>🔗 Relier les Formes</h2>
    <p>Paires trouvées : <strong>${relierState.pairesRappelees}</strong> / <strong>${relierState.totalPaires}</strong></p>
    <hr>
    <p style="font-size: 14px;">Cliquez sur un infinitif puis sur sa conjugaison :</p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
      <div style="border: 2px solid var(--primary); padding: 15px; border-radius: 8px;">
        <p style="font-weight: bold; margin-bottom: 10px;">Infinitifs :</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
  `;
  
  relierState.verbes.forEach((v, i) => {
    html += `
      <button 
        onclick="selectionnerInfinitif(${i})"
        style="
          padding: 10px;
          background: ${relierState.verbeCourant === i ? 'var(--primary)' : 'var(--button)'};
          color: var(--text);
          border: 2px solid ${relierState.verbeCourant === i ? 'green' : 'var(--primary)'};
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          text-align: left;
        ">
        ${v.inf}
      </button>
    `;
  });
  
  html += `</div></div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
      <div style="border: 2px solid var(--primary); padding: 15px; border-radius: 8px;">
        <p style="font-weight: bold; margin-bottom: 10px;">Conjugaisons :</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
  `;
  
  relierState.conjugaisonsAlea.forEach((c, i) => {
    html += `
      <button 
        onclick="selectionnerConjugaison(${i})"
        style="
          padding: 10px;
          background: var(--button);
          color: var(--text);
          border: 2px solid var(--primary);
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          text-align: left;
        ">
        ${c.conjugaison}
      </button>
    `;
  });
  
  html += `</div></div><button onclick="afficherMiniJeux()">⬅️ Retour</button>`;
  
  const container = document.getElementById("relierContent");
  if (container) container.innerHTML = html;
}

function selectionnerInfinitif(idx) {
  if (relierState.verbeCourant === idx) {
    relierState.verbeCourant = null;
  } else {
    relierState.verbeCourant = idx;
  }
  afficherRelier();
}

function selectionnerConjugaison(idx) {
  if (relierState.verbeCourant === null) return;
  
  const conj = relierState.conjugaisonsAlea[idx];
  if (conj.verbeIdx === relierState.verbeCourant) {
    relierState.pairesRappelees++;
    relierState.conjugaisonsAlea.splice(idx, 1);
    relierState.verbes.splice(relierState.verbeCourant, 1);
    relierState.verbeCourant = null;
  }
  
  afficherRelier();
}

function afficherResultatRelier() {
  const container = document.getElementById("relierContent");
  if (container) {
    container.innerHTML = `
      <h2>🔗 Relier les Formes - Terminé</h2>
      <p style="font-size: 24px; font-weight: bold;">Bravo ! 🎉</p>
      <p>Vous avez trouvé toutes les paires !</p>
      <button onclick="demarrerRelier()">Rejouer</button>
      <button onclick="afficherMiniJeux()">⬅️ Retour</button>
    `;
  }
}

// ============ SPEED CHALLENGE GAME ============
let defiVitesseState = {
  score: 0,
  temps: 30,
  verbeCourant: null,
  verbes: [],
  index: 0,
  type: "pret"
};1

function demarrerDefiVitesse() {
  const groupes = groupesDebloques();
  const groupesDebloquesCount = groupes.filter(g => g.debloque).length;
  const verbes = getVerbesGroupe(groupesDebloquesCount);
  
  defiVitesseState = {
    score: 0,
    temps: 30,
    verbeCourant: verbes[0],
    verbes: verbes,
    index: 0,
    type: "pret"
  };
  
  afficherDefiVitesse();
  
  const timer = setInterval(() => {
    defiVitesseState.temps--;
    if (defiVitesseState.temps <= 0) {
      clearInterval(timer);
      terminerDefiVitesse();
    } else {
      mettreAJourDefiVitesse();
    }
  }, 4000);
}

function afficherDefiVitesse() {
  hide("miniJeuxPanel");
  show("defiVitessePanel");
  mettreAJourDefiVitesse();
}

function mettreAJourDefiVitesse() {
  const types = { "pret": "Prétérit", "parf": "Parfait", "pres": "Présent" };
  const typeActuel = defiVitesseState.type;
  
  let html = `
    <h2>⚡ Défi de Vitesse</h2>
    <p>Score : <strong>${defiVitesseState.score}</strong> | Temps : <strong style="color: ${defiVitesseState.temps <= 10 ? 'red' : 'green'};">${defiVitesseState.temps}s</strong></p>
    <hr>
    <p><strong>Infinitif :</strong> ${defiVitesseState.verbeCourant.inf}</p>
    <p><strong>Sens :</strong> ${defiVitesseState.verbeCourant.sens}</p>
    <p><strong>Trouvez le ${types[typeActuel]} :</strong></p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
  `;
  
  const bonneReponse = defiVitesseState.verbeCourant[typeActuel];
  const reponses = [bonneReponse];
  
  while (reponses.length < 4) {
    const verbeAleatoire = defiVitesseState.verbes[Math.floor(Math.random() * defiVitesseState.verbes.length)];
    const reponseAleatoire = verbeAleatoire[typeActuel];
    if (!reponses.includes(reponseAleatoire)) {
      reponses.push(reponseAleatoire);
    }
  }
  
  reponses.sort(() => Math.random() - 0.5);
  
  reponses.forEach(reponse => {
    html += `
      <button 
        onclick="verifierReponseDefi('${reponse}')"
        style="padding: 15px; background: var(--button); color: var(--text); border: 2px solid var(--primary); border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px;">
        ${reponse}
      </button>
    `;
  });
  
  html += `</div><button onclick="afficherMiniJeux()">⬅️ Arrêter</button>`;
  
  const container = document.getElementById("defiVitesseContent");
  if (container) container.innerHTML = html;
}

function verifierReponseDefi(reponse) {
  if (reponse === defiVitesseState.verbeCourant[defiVitesseState.type]) {
    defiVitesseState.score++;
  }
  else { defiVitesseState.temps -= 5; playSound("quack");}
  
  defiVitesseState.index++;
  if (defiVitesseState.index >= defiVitesseState.verbes.length) {
    defiVitesseState.index = 0;
  }
  
  defiVitesseState.verbeCourant = defiVitesseState.verbes[defiVitesseState.index];
  
  const types = ["pret", "parf", "pres"];
  defiVitesseState.type = types[Math.floor(Math.random() * types.length)];
  
  mettreAJourDefiVitesse();
}

function terminerDefiVitesse() {
  const container = document.getElementById("defiVitesseContent");
  if (container) {
    container.innerHTML = `
      <h2>⚡ Défi de Vitesse Terminé</h2>
      <p style="font-size: 24px; font-weight: bold;">Votre score : <strong style="color: var(--primary);">${defiVitesseState.score}</strong></p>
      <button onclick="demarrerDefiVitesse()">Réessayer</button>
      <button onclick="afficherMiniJeux()">⬅️ Retour</button>
    `;
  }
}

// ============ CUSTOM QUIZ GAME ============
function demarrerQuizPerso() {
  const groupes = groupesDebloques();
  const groupesDebloquesCount = groupes.filter(g => g.debloque).length;
  const verbes = getVerbesGroupe(1);
  
  verbesActifs = verbes;
  mode = "random";
  
  hide("miniJeuxPanel");
  show("quiz");
  
  nextQuestion();
}

// ============ MASTERY CHALLENGE GAME ============
let maitriseState = {
  verbes: [],
  index: 0,
  score: 0,
  total: 0,
  typeQuestion: 0
};

function demarrerMaitriseVerbe() {
  const verbes = getVerbesGroupe(1);
  maitriseState = {
    verbes: verbes,
    index: 0,
    score: 0,
    total: 0,
    typeQuestion: 0
  };
  afficherMaitrise();
}

function afficherMaitrise() {
  hide("miniJeuxPanel");
  show("maitrisePanel");
  
  if (maitriseState.index >= maitriseState.verbes.length || maitriseState.total >= 20) {
    afficherResultatMaitrise();
    return;
  }
  
  maitriseState.total++;
  const verbe = maitriseState.verbes[maitriseState.index % maitriseState.verbes.length];
  const typeQuestion = maitriseState.typeQuestion % 4;
  
  let html = `
    <h2>👑 Maîtrise du Verbe</h2>
    <p>Score : <strong>${maitriseState.score}</strong> / <strong>${maitriseState.total}</strong></p>
    <hr>
  `;
  
  // Generate 4 options
  const options = [verbe];
  while (options.length < 4) {
    const aleatoire = maitriseState.verbes[Math.floor(Math.random() * maitriseState.verbes.length)];
    if (!options.find(v => v.inf === aleatoire.inf)) {
      options.push(aleatoire);
    }
  }
  options.sort(() => Math.random() - 0.5);
  
  if (typeQuestion === 0) {
    // Traduction
    html += `
      <p style="font-size: 18px; font-weight: bold;">Quel verbe signifie : <span style="color: var(--primary);">${verbe.sens}</span> ?</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
    `;
    options.forEach(option => {
      html += `
        <button onclick="repondreMaitrise('${option.inf}')" 
          style="padding: 15px; background: var(--button); color: var(--text); border: 2px solid var(--primary); border-radius: 6px; cursor: pointer; font-weight: bold;">
          ${option.inf}
        </button>
      `;
    });
    maitriseState.bonneReponse = verbe.inf;
  } else if (typeQuestion === 1 || typeQuestion === 2 || typeQuestion === 3) {
    // Conjugaison (Présent/Prétérit/Parfait) ou Vrai/Faux
    if (typeQuestion !== 3 || Math.random() > 0.7) {
      // Question de conjugaison
      const typeConjTypes = { 1: "pres", 2: "pret" };
      const typeConjMap = typeConjTypes[typeQuestion] || "parf";
      const typeLabel = { "pres": "Présent", "pret": "Prétérit", "parf": "Parfait" }[typeConjMap];
      
      html += `
        <p style="font-size: 18px; font-weight: bold;">Quel est le ${typeLabel} de "${verbe.inf}" (${verbe.sens}) ?</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
      `;
      
      const bonneReponse = verbe[typeConjMap];
      const reponses = [bonneReponse];
      while (reponses.length < 4) {
        const v = maitriseState.verbes[Math.floor(Math.random() * maitriseState.verbes.length)];
        if (!reponses.includes(v[typeConjMap])) {
          reponses.push(v[typeConjMap]);
        }
      }
      reponses.sort(() => Math.random() - 0.5);
      
      reponses.forEach(reponse => {
        html += `
          <button onclick="repondreMaitrise('${reponse}')" 
            style="padding: 15px; background: var(--button); color: var(--text); border: 2px solid var(--primary); border-radius: 6px; cursor: pointer; font-weight: bold;">
            ${reponse}
          </button>
        `;
      });
      maitriseState.bonneReponse = bonneReponse;
    } else {
      // Vrai/Faux
      const typeConjMap = ["pres", "pret", "parf"][Math.floor(Math.random() * 3)];
      const typeLabel = { "pres": "Présent", "pret": "Prétérit", "parf": "Parfait" }[typeConjMap];
      
      let reponseAffichee = verbe[typeConjMap];
      let estCorrect = true;
      
      if (Math.random() > 0.5) {
        const v = maitriseState.verbes[Math.floor(Math.random() * maitriseState.verbes.length)];
        reponseAffichee = v[typeConjMap];
        estCorrect = false;
      }
      
      html += `
        <p style="font-size: 18px; font-weight: bold;">Le ${typeLabel} de "${verbe.inf}" est :</p>
        <p style="font-size: 20px; background: var(--input); padding: 15px; border-radius: 8px; margin: 20px 0; font-family: monospace;">
          ${reponseAffichee}
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
          <button onclick="repondreMaitrise(true)" style="padding: 15px; background: green; color: white; font-size: 18px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">✓ Vrai</button>
          <button onclick="repondreMaitrise(false)" style="padding: 15px; background: red; color: white; font-size: 18px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">✗ Faux</button>
        </div>
      `;
      maitriseState.bonneReponse = estCorrect;
    }
  }
  
  html += `</div><button onclick="afficherMiniJeux()">⬅️ Retour</button>`;
  
  const container = document.getElementById("maitriseContent");
  if (container) container.innerHTML = html;
}

function repondreMaitrise(reponse) {
  if (reponse === maitriseState.bonneReponse) {
    maitriseState.score++;
  }
  maitriseState.index++;
  maitriseState.typeQuestion++;
  afficherMaitrise();
}

function afficherResultatMaitrise() {
  const container = document.getElementById("maitriseContent");
  if (container) {
    container.innerHTML = `
      <h2>👑 Maîtrise du Verbe - Terminé</h2>
      <p style="font-size: 24px; font-weight: bold;">Votre score : <strong style="color: var(--primary);">${maitriseState.score}</strong> / <strong>${maitriseState.total}</strong></p>
      <button onclick="demarrerMaitriseVerbe()">Rejouer</button>
      <button onclick="afficherMiniJeux()">⬅️ Retour</button>
    `;
  }
}
