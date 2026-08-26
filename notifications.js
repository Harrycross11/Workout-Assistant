// ============================================================
// Notifications - best effort, foreground/periodic-sync based
// ============================================================
// REAL LIMITATION, read this before assuming these are reliable:
// There is no standard web API to fire a notification at an exact future
// wall-clock time while the app/browser is fully closed, especially on iOS.
//   - Android/Chrome: an installed PWA CAN register Periodic Background
//     Sync, which wakes the service worker roughly every so often (the
//     browser decides the actual interval based on how often you use the
//     app and battery/network conditions - it's a suggestion, not a
//     schedule you control precisely) to run a check. That's what
//     registerPeriodicSync() below attempts, wrapped in a feature check
//     since most browsers don't support it at all.
//   - iOS Safari (including an installed "Add to Home Screen" PWA): there
//     is NO local scheduled-notification capability independent of the app
//     being open. Notification permission and the Notifications API do
//     exist, but firing one later requires either the app being in the
//     foreground when the time arrives, or a real Push API message sent
//     from a server (this app has no backend, by design - see the README).
// FALLBACK BEHAVIOUR: every time the app is opened or comes back to the
// foreground (see checkScheduledNotifications, called from app.js on load
// and on the 'visibilitychange'/'focus' events), it checks "should a
// notification have fired by now that hasn't yet" and fires it immediately
// if so. In practice this means: reminders are reliable if you have the
// app open or check your phone reasonably often, and may simply not arrive
// if the phone sits untouched with the app fully closed - there's no way
// around that with a backend-free PWA.

async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

function showLocalNotification(title, body, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  // Via the service worker registration when available (works even if the
  // page itself is backgrounded, as long as the OS still lets the SW run) -
  // falls back to a plain `new Notification` (page must be foregrounded)
  // otherwise.
  if (navigator.serviceWorker && navigator.serviceWorker.ready) {
    navigator.serviceWorker.ready.then(reg => {
      if (reg.showNotification) reg.showNotification(title, { body, tag, icon: 'icons/icon-192.png' });
      else new Notification(title, { body, tag });
    });
  } else {
    new Notification(title, { body, tag });
  }
}

// Registers Periodic Background Sync if the browser supports it (Chrome/
// Android, installed PWAs only) - a best-effort nudge, see this file's own
// top comment. Silently no-ops everywhere else, including iOS.
async function registerPeriodicSyncIfAvailable() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    if ('periodicSync' in reg) {
      const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
      if (status.state === 'granted') {
        await reg.periodicSync.register('workout-assistant-check', { minInterval: 30 * 60 * 1000 });
      }
    }
  } catch (e) { /* not supported on this browser - the foreground check is the real fallback */ }
}

// The actual "is it time yet" logic - run on every app open/foreground (see
// app.js) AND from the service worker's periodic sync handler (see sw.js),
// so whichever one actually gets to run first is the one that fires it.
function checkScheduledNotifications(data) {
  if (!data.settings.notificationsEnabled) return;
  const now = new Date();
  const day = now.getDay();
  const plan = WORKOUT_PLAN[day];
  const todayKeyVal = todayKey();
  data.lastNotified = data.lastNotified || {};

  if (plan && plan.type === 'training') {
    const timeStr = (data.settings.workoutTimes && data.settings.workoutTimes[day]) || '18:30';
    const [hh, mm] = timeStr.split(':').map(Number);
    const workoutTime = new Date(now);
    workoutTime.setHours(hh, mm, 0, 0);
    const reminderTime = new Date(workoutTime.getTime() - 15 * 60 * 1000);
    const already = data.lastNotified.workoutReminder === todayKeyVal;
    if (!already && now >= reminderTime && now <= workoutTime) {
      showLocalNotification('Workout in 15 minutes', `${plan.name} starts soon - time to get ready.`, 'workout-reminder');
      data.lastNotified.workoutReminder = todayKeyVal;
      saveData(data);
    }
  } else if (plan) {
    const already = data.lastNotified.restDayReminder === todayKeyVal;
    const morningWindowEnd = new Date(now); morningWindowEnd.setHours(10, 0, 0, 0);
    if (!already && now.getHours() >= 8 && now <= morningWindowEnd) {
      showLocalNotification('Rest Day', 'No lifting today - light walking or stretching is fine.', 'rest-day-reminder');
      data.lastNotified.restDayReminder = todayKeyVal;
      saveData(data);
    }
  }

  // Weekly check-in - fires at/after Sunday 12:00, then every 30 minutes
  // until BOTH weight and a photo are logged for the week (see
  // getWeeklyCheckIn), then stops.
  if (day === 0) {
    const weekOf = currentWeekOfKey(now);
    const checkIn = getWeeklyCheckIn(data, weekOf);
    const noonToday = new Date(now); noonToday.setHours(12, 0, 0, 0);
    if (now >= noonToday && !(checkIn.weightLogged && checkIn.photoLogged)) {
      const lastFired = data.lastNotified.weeklyCheckIn ? new Date(data.lastNotified.weeklyCheckIn) : null;
      const dueForAnother = !lastFired || (now - lastFired) >= 30 * 60 * 1000;
      if (dueForAnother) {
        const missing = [];
        if (!checkIn.weightLogged) missing.push('body weight');
        if (!checkIn.photoLogged) missing.push('a progress photo');
        showLocalNotification('Weekly Check-In', `Don't forget to log ${missing.join(' and ')} this week.`, 'weekly-checkin');
        data.lastNotified.weeklyCheckIn = now.toISOString();
        saveData(data);
      }
    }
  }
}
