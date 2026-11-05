# Architecture du projet - Verbes irréguliers

## 📁 Structure des fichiers

```
/
├── src/                       # Sources lisibles à modifier
│   ├── index.html
│   ├── allemand.html
│   ├── anglais.html
│   ├── css/
│   ├── js/
│   ├── scss/
│   └── *.mp3, *.ogg
├── scripts/build.mjs          # Build/minification
├── index.html                 # Page générée, prête à publier
├── allemand.html              # Page générée, prête à publier
├── anglais.html               # Page générée, prête à publier
└── package.json
```

`npm ci` installe les outils ; `npm run build` compile le SCSS, regroupe/minifie le JavaScript, intègre JS et CSS dans les pages à la racine, puis copie les fichiers audio.

## 🔧 Modules JavaScript

### data.js
- **Contenu** : Liste complète des verbes allemands (avec corrections)
- **Corrections apportées** :
  - `sheinen` → `scheinen`
  - `gafällt` → `gefällt`
  - `verschwimdet` → `verschwindet`
- **Export** : `VERBES[]`, `CONFIG`

### storage.js
- Gestion du `localStorage`
- Initialisation des stats (algorithme SM2)
- Import/export de données
- **Fonctions clés** : `initCardStats()`, `updateSM2()`, `updateStreak()`, `getAllVerbes()`

### utils.js
- Normalization (accents, casse)
- Comparaison de réponses
- Gestion de groupe (unlock system)
- Utilitaires DOM
- **Fonctions clés** : `normaliserAvancee()`, `getUnlockedGroupIndex()`, `show()`, `hide()`

### quiz.js
- Logique principale du quiz
- Question types (classique, sens→inf, inf→sens)
- Gestion des réponses (scoring, audio)
- **Fonctions clés** : `startQuiz()`, `nextQuestion()`, `checkAnswer()`, `updateGroupUI()`

### stats.js
- Affichage des statistiques
- Système d'achievements (11 succès)
- Export PDF (avec jsPDF)
- Filtrage des verbes
- **Fonctions clés** : `afficherStats()`, `verifierSucces()`, `exporterPDF()`, `reviserVerbesProblemes()`

### verbesPerso.js
- Création/suppression de listes personnalisées
- Ajout/suppression de verbes
- Autocomplétion intelligente
- Import/export de listes
- **Fonctions clés** : `creerListe()`, `ajouterVerbePerso()`, `suggestionsInfinitif()`

### notifications.js
- Notifications du navigateur
- Vérification des révisions dues
- **Fonctions clés** : `activerNotifications()`, `verifierRevisions()`, `initNotifications()`

### theme.js
- Toggle thème sombre/clair
- Persistance du choix
- **Fonctions clés** : `toggleTheme()`, `initTheme()`

### app.js
- Point d'entrée principal
- Initialisation de tous les modules
- Configuration des event listeners
- **Événements** : `DOMContentLoaded`

## 🎮 Fonctionnalités

### 1. Système de progression par groupes
- Les verbes sont organisés par groupes de 10
- Déverrouillage progressif (maîtrise requise)
- Barre de progression interactive

### 2. Algorithme SM2 (Spaced Repetition)
- Calcul intelligent du prochain rappel
- Facteur de facilité dynamique
- Intervalle optimisé

### 3. Système d'achievements
- 11 succès débloquables
- Détection automatique des conditions
- Notification lors du déverrouillage

### 4. Listes personnalisées
- Créer des listes thématiques
- Importer/exporter au format JSON
- Autocomplétîon avec dictionnaire complet

### 5. Export/Import de progrès
- Export en JSON
- PDF avec statistiques détaillées
- Restauration complète du progression

## 🐛 Erreurs corrigées

| Avant | Après | Notes |
|-------|-------|-------|
| `sheinen` | `scheinen` | Typo verbe "sembler/briller" |
| `gafällt` | `gefällt` | Typo verbe "plaire" |
| `verschwimdet` | `verschwindet` | Typo verbe "disparaître" |
| Présent dans le HTML | CSS séparé | Meilleure maintenabilité |
| Verbes en ligne | data.js | Code plus lisible |
| Scripts en ligne | Modules séparés | Meilleure organisation |

## 📊 Structure des données

### Stats par verbe
```javascript
stats[infinitif] = {
  repetitions: 0,      // SM2
  interval: 0,         // SM2
  easeFactor: 2.5,     // SM2
  nextReview: 0,       // Timestamp
  lapses: 0,           // SM2
  propositions: 0,     // Nombre de fois présenté
  erreurs: 0,          // Nombre d'erreurs
  maitrise: 0          // Compteur de maîtrise
}
```

### Streak
```javascript
streak = {
  count: 0,            // Nombre de jours consécutifs
  lastDate: "YYYY-MM-DD"
}
```

## 🚀 Utilisation

1. **Démarrer le quiz** : Click "Révision ciblée"
2. **Créer une liste** : "Listes personnalisées" → Créer
3. **Vérifier le progrès** : "Statistiques" → Voir les groupes
4. **Exporter** : "Statistiques" → "Exporter mes progrès"

## 🔮 Améliorations futures

- [ ] Support de l'anglais
- [ ] Dark mode par défaut
- [ ] Web app (PWA)
- [ ] Synchronisation cloud
- [ ] Mode offline amélioré
- [ ] Graphiques de progression

## 📝 Notes

- Tous les fichiers utilisent `const` et `let` (ES6+)
- Code organisé par responsabilité (séparation des préoccupations)
- Pas de dépendances externes obligatoires (jsPDF est optionnel)
- localStorage pour la persistance locale
- Normalisation avancée (accents et casse)

---
**Dernière mise à jour** : 12 Mars 2026
**Auteur** : Système de nettoyage automatisé
