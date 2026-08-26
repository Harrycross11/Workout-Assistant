// ============================================================
// Workout Assistant - local storage layer
// ============================================================
// Everything here is LOCAL ONLY - localStorage for text/numbers, IndexedDB
// for photo Blobs (localStorage is string-only and has a small quota, way
// too small for even a handful of photos). Nothing is ever sent anywhere;
// see the Settings screen and the note on the Photos screen for the
// user-facing version of this same point.

// ---------- Date helpers ----------
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function todayKey() { return toDateKey(new Date()); }
// The most recent Sunday (or today, if today IS Sunday) - the anchor date
// used to group a week's check-in (body weight + photo) together,
// independent of which exact day someone actually gets around to logging it.
function currentWeekOfKey(date) {
  date = date || new Date();
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return toDateKey(d);
}

// ---------- Main localStorage blob ----------
const STORAGE_KEY = 'workoutAssistantData';
function defaultData() {
  return {
    // null until onboarding finishes (see isOnboarded/saveProfile) - the
    // Today view shows the onboarding wizard instead of a plan whenever this
    // is null, so a brand new install (or a browser with storage cleared)
    // always starts there rather than silently falling back to generic
    // defaults nobody actually chose.
    profile: null,
    settings: {
      theme: 'dark',
      notificationsEnabled: false,
      lastBackup: null,
      // { 2: '18:30', 3: '18:30', ... } - editable in Settings, see
      // populateWorkoutTimeSettings. Keys are the same Date.getDay() values
      // WORKOUT_PLAN uses.
      workoutTimes: { 2: '18:30', 3: '18:30', 4: '18:30', 6: '18:30', 0: '18:30' },
    },
    chickenSwap: {}, // { "2026-08-25": true } - per-date, see toggleChickenSwap
    exerciseLogs: {}, // { "2026-08-25": { "tue-pushups": {weight, done, couldntFinish, note, subNote, feltEasy} } }
    mealLogs: {}, // { "2026-08-25": { "breakfast": true } }
    bodyWeightLog: [], // [{ date, weight }], oldest first
    sleepLog: {}, // { "2026-08-25": 7.5 }
    waterLog: {}, // { "2026-08-25": 4 }
    streak: { count: 0, lastCompletedDate: null },
    weeklyCheckIns: {}, // { "2026-08-24": { weightLogged: true, photoLogged: true } } keyed by weekOf
    lastNotified: {}, // { workoutReminder: "2026-08-25", weeklyCheckIn: "2026-08-24T13:00" } - de-dupes repeat checks
  };
}
function loadData() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!raw) return defaultData();
    // Object.assign one level deep so a version of this file that adds a new
    // top-level field doesn't wipe out anyone's existing save just because
    // it's missing from an older stored blob.
    return Object.assign(defaultData(), raw, {
      settings: Object.assign(defaultData().settings, raw.settings || {}),
      profile: raw.profile ? Object.assign(defaultProfile(), raw.profile) : null,
    });
  } catch (e) {
    return defaultData();
  }
}
function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* localStorage unavailable/full - this session's changes just won't persist */ }
}

// ---------- Profile (see the onboarding wizard) ----------
function defaultProfile() {
  return {
    weightKg: null, age: null, heightCm: null,
    dietType: 'omnivore', // 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian'
    proteinPreference: 'beef', // key into PROTEIN_SOURCES, filtered by dietType in the wizard
    dislikedFoods: '', // free text, shown as a note only - not algorithmically filtered, see data.js's own disclaimer
    hindrances: [], // any of 'knee' | 'back' | 'shoulder' | 'wrist'
    equipment: 'fullGym', // 'fullGym' | 'homeDumbbells' | 'bodyweightOnly'
    experienceLevel: 'beginner', // 'beginner' | 'intermediate' | 'advanced'
  };
}
function isOnboarded(data) { return !!data.profile; }
function saveProfile(data, profile) {
  data.profile = Object.assign(defaultProfile(), data.profile || {}, profile);
  saveData(data);
}

// ---------- Exercise logs ----------
function getExerciseLog(data, dateKey, exerciseId) {
  return (data.exerciseLogs[dateKey] && data.exerciseLogs[dateKey][exerciseId]) || {
    weight: null, done: false, couldntFinish: false, note: '', subNote: '', feltEasy: false,
  };
}
function setExerciseLog(data, dateKey, exerciseId, patch) {
  data.exerciseLogs[dateKey] = data.exerciseLogs[dateKey] || {};
  data.exerciseLogs[dateKey][exerciseId] = Object.assign(getExerciseLog(data, dateKey, exerciseId), patch);
  saveData(data);
}
// The last logged weight for this exercise BEFORE today - used to pre-fill
// next time it comes up, so you always see what you did last and adjust
// from there rather than starting from a blank box.
function lastLoggedWeight(data, exerciseId, beforeDateKey) {
  const dates = Object.keys(data.exerciseLogs).filter(d => d < beforeDateKey).sort().reverse();
  for (const d of dates) {
    const entry = data.exerciseLogs[d][exerciseId];
    if (entry && entry.weight != null) return { weight: entry.weight, date: d, feltEasy: !!entry.feltEasy };
  }
  return null;
}
// Every past session's weight for this exercise, oldest first - used by the
// mini-history expand and the progress graph.
function exerciseHistory(data, exerciseId) {
  return Object.keys(data.exerciseLogs)
    .filter(d => data.exerciseLogs[d][exerciseId] && data.exerciseLogs[d][exerciseId].weight != null)
    .sort()
    .map(d => ({ date: d, weight: data.exerciseLogs[d][exerciseId].weight }));
}

// ---------- Meals ----------
function isMealEaten(data, dateKey, mealId) {
  return !!(data.mealLogs[dateKey] && data.mealLogs[dateKey][mealId]);
}
function toggleMealEaten(data, dateKey, mealId) {
  data.mealLogs[dateKey] = data.mealLogs[dateKey] || {};
  data.mealLogs[dateKey][mealId] = !data.mealLogs[dateKey][mealId];
  saveData(data);
}
function isChickenSwapped(data, dateKey) { return !!data.chickenSwap[dateKey]; }
function toggleChickenSwap(data, dateKey) {
  data.chickenSwap[dateKey] = !data.chickenSwap[dateKey];
  saveData(data);
}

// ---------- Body weight / sleep / water ----------
function logBodyWeight(data, dateKey, weight) {
  const existing = data.bodyWeightLog.find(e => e.date === dateKey);
  if (existing) existing.weight = weight;
  else data.bodyWeightLog.push({ date: dateKey, weight });
  data.bodyWeightLog.sort((a, b) => a.date.localeCompare(b.date));
  saveData(data);
}
function logSleep(data, dateKey, hours) {
  data.sleepLog[dateKey] = hours;
  saveData(data);
}
function getWaterCount(data, dateKey) { return data.waterLog[dateKey] || 0; }
function addWater(data, dateKey, delta) {
  const next = Math.max(0, getWaterCount(data, dateKey) + delta);
  data.waterLog[dateKey] = next;
  saveData(data);
  return next;
}

// ---------- Weekly check-in ----------
function getWeeklyCheckIn(data, weekOf) {
  return data.weeklyCheckIns[weekOf] || { weightLogged: false, photoLogged: false };
}
function markWeeklyCheckIn(data, weekOf, patch) {
  data.weeklyCheckIns[weekOf] = Object.assign(getWeeklyCheckIn(data, weekOf), patch);
  saveData(data);
}

// ---------- Streak ----------
// A day "counts" once every exercise on a training day is either done or
// honestly logged as couldn't-finish (see markExerciseDone) - a rest day
// doesn't add to or break the streak either way.
function updateStreakForDate(data, dateKey) {
  const day = new Date(dateKey + 'T00:00:00').getDay();
  const plan = WORKOUT_PLAN[day];
  if (!plan || plan.type !== 'training') return;
  const log = data.exerciseLogs[dateKey] || {};
  const allAddressed = plan.exercises.every(ex => {
    const entry = log[ex.id];
    return entry && (entry.done || entry.couldntFinish);
  });
  if (!allAddressed) return;
  if (data.streak.lastCompletedDate === dateKey) return; // already counted today
  data.streak.count = (data.streak.count || 0) + 1;
  data.streak.lastCompletedDate = dateKey;
  saveData(data);
}

// ---------- IndexedDB: progress photos ----------
// A single object store keyed by auto-increment id, each record tagged with
// both the exact date taken and the weekOf anchor (see currentWeekOfKey) so
// the weekly comparison view can always find "this week's" and "last week's"
// photo even if they weren't taken exactly on a Sunday.
const PHOTO_DB_NAME = 'workoutAssistantPhotos';
const PHOTO_STORE = 'photos';
function openPhotoDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PHOTO_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        const store = db.createObjectStore(PHOTO_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('weekOf', 'weekOf', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function savePhoto(blob, weekOf, dateKey) {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, 'readwrite');
    const req = tx.objectStore(PHOTO_STORE).add({ blob, weekOf, date: dateKey, createdAt: Date.now() });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function getAllPhotos() {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, 'readonly');
    const req = tx.objectStore(PHOTO_STORE).getAll();
    req.onsuccess = () => resolve(req.result.sort((a, b) => a.date.localeCompare(b.date)));
    req.onerror = () => reject(req.error);
  });
}
async function getPhotoForWeek(weekOf) {
  const all = await getAllPhotos();
  // Last match wins if somehow more than one photo got saved for the same
  // week (e.g. retaking it) - most recent upload for that week is the one
  // that should show.
  const matches = all.filter(p => p.weekOf === weekOf);
  return matches.length ? matches[matches.length - 1] : null;
}
async function deletePhoto(id) {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, 'readwrite');
    tx.objectStore(PHOTO_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------- Backup export/import ----------
// Photos are stored as base64 inside the exported JSON (rather than a zip)
// to keep this a single downloadable file with no extra library - fine at
// the scale of a personal weekly-photo log, would get unwieldy at a much
// larger scale, which is a reasonable trade for staying dependency-free.
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
function base64ToBlob(base64) {
  return fetch(base64).then(r => r.blob());
}
async function exportAllData() {
  const data = loadData();
  const photos = await getAllPhotos();
  const photosEncoded = await Promise.all(photos.map(async p => ({
    weekOf: p.weekOf, date: p.date, createdAt: p.createdAt, blobBase64: await blobToBase64(p.blob),
  })));
  return {
    format: 'workout-assistant-backup',
    exportedAt: new Date().toISOString(),
    data,
    photos: photosEncoded,
  };
}
async function importAllData(bundle) {
  if (!bundle || bundle.format !== 'workout-assistant-backup') throw new Error('Not a Workout Assistant backup file.');
  saveData(bundle.data);
  const db = await openPhotoDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, 'readwrite');
    tx.objectStore(PHOTO_STORE).clear();
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  for (const p of bundle.photos || []) {
    const blob = await base64ToBlob(p.blobBase64);
    await savePhoto(blob, p.weekOf, p.date);
  }
}
