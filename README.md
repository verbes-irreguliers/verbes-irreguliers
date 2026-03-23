# 📘 Révision des Verbes Irréguliers

Système interactif et gamifié pour réviser les verbes irréguliers (allemand + anglais à venir).

## 🚀 Démarrage rapide

1. **Ouvrir le projet** : Double-cliquez sur `index.html`
2. **Sélectionner la langue** : Cliquez sur 🇩🇪 Allemand
3. **Commencer** : Cliquez sur "🎯 Révision ciblée"

C'est tout ! L'application fonctionne complètement hors ligne.

---

## 📁 Structure du projet

```
.
├── index.html               ← Page d'accueil
├── allemand.html            ← App principale
├── anglais.html             ← Bientôt
├── css/
│   └── style.css            ← Styles (+ thème sombre)
├── js/
│   ├── app.js              ← Initialisation
│   ├── data.js             ← Données verbes
│   ├── storage.js          ← Local storage + SM2
│   ├── utils.js            ← Utilitaires
│   ├── quiz.js             ← Logique quiz
│   ├── stats.js            ← Stats + succès + PDF
│   ├── verbesPerso.js      ← Listes personnalisées
│   ├── notifications.js    ← Notifications
│   └── theme.js            ← Thème sombre

├── ARCHITECTURE.md         ← Guide technique
├── CHANGELOG.md            ← Modifications
├── REFACTORING_SUMMARY.md  ← Résumé refonte
└── README.md               ← Ce fichier
```

---

## 🎮 Fonctionnalités principales

### 1. 🎯 Révision ciblée
- Système de progression par groupes
- Déblocage progressif des verbes
- Questions de 3 types différents

### 2. 🧩 Listes personnalisées
- **Créer** des listes thématiques
- **Ajouter** des verbes personnalisés
- **Importer/Exporter** en JSON
- **Autocomplétion** intelligente

### 3. 📊 Statistiques
- Vue d'ensemble du progrès
- Verbes maîtrisés et problématiques
- Groupe actuel et progression
- Streak journalier

### 4. 🏆 Système d'achievements
11 succès débloquables pour gamifier l'apprentissage :
- Première victoire 🎉
- 10 maîtrises 💪
- 7 jours de streak 🔥
- Et bien d'autres...

### 5. 🔔 Notifications
- Rappels du navigateur
- Vérification des révisions dues
- Configurable avec un clic

### 6. 🌙 Thème sombre
- Switch facile
- Persiste entre sessions
- Confortable pour les yeux

### 7. 💾 Export/Import
- Sauvegarder vos progrès en JSON
- Exporter en PDF
- Restaurer complètement votre progression

---

## 🎓 Système de progression

### Comment ça marche ?

1. **Groupes de 10 verbes**
   - Groupe 1 : verbes 1-10
   - Groupe 2 : verbes 11-20
   - etc.

2. **Déblocage progressif**
   - Le groupe suivant se déverrouille quand le groupe courant est maîtrisé
   - Voir votre progression en barre

3. **Algorithme SM2**
   - Spaced Repetition optimisée
   - Intervals automatiques

4. **3 types de questions**
   - Classique : Donner les 3 formes
   - Sens → Infinitif : Traduire la définition
   - Infinitif → Sens : Donner la définition

---

## 💾 Données locales

### Stockage automatique

Tout est sauvegardé localement :
- ✅ Vos statistiques
- ✅ Votre progression
- ✅ Vos listes perso
- ✅ Vos préférences (thème, notifications)
- ✅ Votre streak

Rien ne remonte vers un serveur = **100% privé**.

### Exemples d'export

Vous pouvez exporter vos données pour :
- 📂 Sauvegarder sur autre appareil
- 💻 Restaurer après réinitialisation
- 📊 Analyser vos progrès
- 🔄 Synchroniser entre appareils

---

## ⌨️ Raccourcis clavier

Dans le quiz :
- `Enter` : Valider ou passer au champ suivant
- `Flèche haut/bas` : Naviguer dans les suggestions
- `Échap` : Fermer les suggestions

---

## 🔧 Configuration

### Thème
- **Auto** : Respecte les préférences système
- **Clair** : Mode clair classique
- **Sombre** : Mode sombre confortable

### Notifications
- Cliquez sur "Activer les notifications"
- Acceptez la permission du navigateur
- Recevez des rappels quotidiens

---

## 🚀 Commandes

### Démarrer l'app
```
Double cliquer sur index.html
```

### Développement
- Pas de serveur requis
- Fonctionne en mode offline complet
- localStorage persistant

### Export de progrès
1. Allez dans Statistiques
2. Cliquez "Exporter mes progrès"
3. Choisissez le format (JSON ou PDF)
4. Sauvegardez le fichier

### Import de progrès
1. Allez dans Statistiques
2. Cliquez "Importer mes progrès"
3. Sélectionnez le fichier JSON
4. Les données restaurées

---

## 🐛 Dépannage

### Les données n'apparaissent pas
- Effacez le cache du navigateur
- Vérifiez que JS est activé
- Vérifiez la console (F12) pour les erreurs

### Les sons ne jouent pas
- Vérifiez que les fichiers `.mp3` sont présents
- Vérifiez les permissions audio du navigateur

### Les notifications ne marchent pas
- Vérifiez les permissions du navigateur
- Vérifiez que vous avez accepté les notifications

### Mon thème ne se sauvegarde pas
- localStorage doit être activé
- Pas en mode navigation privée

---

## 📱 Compatibilité

- ✅ Chrome/Chromium (90+)
- ✅ Firefox (88+)
- ✅ Safari (14+)
- ✅ Edge (90+)
- ✅ Responsive (mobile à desktop)

---

## 🛠️ Architecture technique

### Modules JavaScript

| Module | Rôle |
|--------|------|
| `data.js` | Données des verbes |
| `storage.js` | Persistance + SM2 |
| `utils.js` | Fonctions réutilisables |
| `quiz.js` | Logique du quiz |
| `stats.js` | Statistiques et succès |
| `verbesPerso.js` | Listes personnalisées |
| `notifications.js` | Notifications navigateur |
| `theme.js` | Thème sombre/clair |
| `app.js` | Initialisation |

### Styles

- **Responsive** : Mobile → Desktop
- **Dark mode** : CSS variables
- **Accessible** : Contraste suffisant
- **Performant** : Minimal et optimisé

---

## 📚 Documentation

- **ARCHITECTURE.md** - Guide technique détaillé
- **CHANGELOG.md** - Historique des modifications
- **REFACTORING_SUMMARY.md** - Résumé de la refonte

---

## 🤝 Contribuer

Si vous trouvez un bug ou avez des suggestions :
1. Vérifiez la console (F12)
2. Essayez d'autres navigateurs
3. Documentez le problème précisément

---

## 📝 Licence

Libre d'usage. Modifiez comme vous le souhaitez.

---

## 🎯 Feuille de route

- [ ] Support de l'anglais
- [ ] PWA (Progressive Web App)
- [ ] Graphiques de progression
- [ ] Synchronisation cloud
- [ ] Mode offline amélioré

---

**Version** : 2.0 (Refonte complète)  
**Dernière mise à jour** : 12 Mars 2026  
**Status** : Production-ready ✅

---

## 💡 Astuces

1. **Créez des listes** pour des thèmes spécifiques
2. **Attendez le lendemain** pour réviser = meilleur apprentissage
3. **Utilisez le mode sombre** si vous révisez le soir
4. **Exportez régulièrement** pour sauvegarder vos progrès
5. **Visez 30 jours** de streak pour une vraie habitude !

---

Bon courage dans votre apprentissage ! 🚀📘
