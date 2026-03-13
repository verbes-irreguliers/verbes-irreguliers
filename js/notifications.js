/**
 * notifications.js - Gestion des notifications du navigateur
 */

// ============ NOTIFICATION CHECK ============
function verifierRevisions() {
  if (!notificationsEnabled()) return;

  const today = getTodayDate();
  const derniereNotif = getLastNotificationDate();

  if (derniereNotif === today) return;

  const aReviser = verbesEnAttenteDeRevision();

  if (aReviser.length > 0) {
    envoyerNotification(aReviser.length);
    setLastNotificationDate(today);
    playSound("notif");
  }
}

function verbesEnAttenteDeRevision() {
  const maintenant = Date.now();
  return getAllVerbes().filter(v => {
    initCardStats(v.inf);
    return stats[v.inf].nextReview <= maintenant;
  });
}

// ============ SEND NOTIFICATION ============
function envoyerNotification(nb) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

  new Notification("📘 Révision allemande", {
    body: `Tu as ${nb} verbe(s) à réviser aujourd'hui 💪`,
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75'>📘</text></svg>"
  });
}

// ============ REQUEST PERMISSION ============
function activerNotifications() {
  if (typeof Notification === "undefined") {
    alert("Les notifications ne sont pas supportées par ce navigateur.");
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      setNotificationsEnabled(true);
      alert("🔔 Notifications activées !");
      verifierRevisions();
      majBoutonsNotifications();
    } else {
      alert("Notifications refusées.");
    }
  });
}

function desactiverNotifications() {
  setNotificationsEnabled(false);
  setLastNotificationDate(null);

  alert("🔕 Notifications désactivées");

  majBoutonsNotifications();
  majEtatNotifications();
}

// ============ UI UPDATE ============
function majBoutonsNotifications() {
  const btnActiver = document.getElementById("btnActiverNotif");
  const btnDesactiver = document.getElementById("btnDesactiverNotif");
  const actives = notificationsEnabled();

  if (btnActiver) btnActiver.classList.toggle("hidden", actives);
  if (btnDesactiver) btnDesactiver.classList.toggle("hidden", !actives);
}

function majEtatNotifications() {
  const etatNotif = document.getElementById("etatNotif");
  if (etatNotif) {
    etatNotif.textContent = notificationsEnabled() ? "🔔 Activées" : "🔕 Désactivées";
  }
}

// ============ INITIALIZATION ============
function initNotifications() {
  majBoutonsNotifications();
  majEtatNotifications();

  // Check notifications every hour
  setInterval(verifierRevisions, 60 * 60 * 1000);

  // Initial check
  verifierRevisions();
}
