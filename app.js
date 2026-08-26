// ============================================================
// Workout Assistant - main app logic
// ============================================================
let DATA = loadData();
let restTimerInterval = null;
let photoObjectUrls = []; // revoked on each re-render that creates new ones, see revokePhotoUrls

// ---------- View switching ----------
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const el = document.getElementById(`view-${name}`);
  if (el) el.classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  if (name === 'today') renderToday();
  else if (name === 'weekly') renderWeeklyOverview();
  else if (name === 'checkin') renderCheckIn();
  else if (name === 'photos') renderPhotoTimeline();
  else if (name === 'progress') renderProgress();
  else if (name === 'monthly') renderMonthly();
  else if (name === 'settings') renderSettings();
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  el.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.classList.add('hidden'), 300); }, 2600);
}

// ============================================================
// Onboarding wizard
// ============================================================
function populateProteinOptions(dietType) {
  const select = document.getElementById('ob-protein');
  const options = proteinOptionsForDiet(dietType);
  select.innerHTML = options.map(key => `<option value="${key}">${PROTEIN_SOURCES[key].label}</option>`).join('');
}
function initOnboarding() {
  document.getElementById('ob-diet-type').addEventListener('change', e => populateProteinOptions(e.target.value));
  populateProteinOptions('omnivore');

  document.getElementById('ob-next-1').addEventListener('click', () => {
    document.getElementById('onboard-step-basics').classList.add('hidden');
    document.getElementById('onboard-step-diet').classList.remove('hidden');
  });
  document.getElementById('ob-back-2').addEventListener('click', () => {
    document.getElementById('onboard-step-diet').classList.add('hidden');
    document.getElementById('onboard-step-basics').classList.remove('hidden');
  });
  document.getElementById('ob-next-2').addEventListener('click', () => {
    document.getElementById('onboard-step-diet').classList.add('hidden');
    document.getElementById('onboard-step-workout').classList.remove('hidden');
  });
  document.getElementById('ob-back-3').addEventListener('click', () => {
    document.getElementById('onboard-step-workout').classList.add('hidden');
    document.getElementById('onboard-step-diet').classList.remove('hidden');
  });
  document.getElementById('ob-finish').addEventListener('click', finishOnboarding);
}
function finishOnboarding() {
  const hindrances = Array.from(document.querySelectorAll('.ob-hindrance:checked')).map(c => c.value);
  const profile = {
    weightKg: parseFloat(document.getElementById('ob-weight').value) || null,
    age: parseInt(document.getElementById('ob-age').value, 10) || null,
    heightCm: parseFloat(document.getElementById('ob-height').value) || null,
    dietType: document.getElementById('ob-diet-type').value,
    proteinPreference: document.getElementById('ob-protein').value,
    dislikedFoods: document.getElementById('ob-disliked').value.trim(),
    hindrances,
    equipment: document.getElementById('ob-equipment').value,
    experienceLevel: document.getElementById('ob-experience').value,
  };
  saveProfile(DATA, profile);
  document.getElementById('view-onboarding').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
  showView('today');
  showToast("Your plan is ready - let's go!");
}
function startOnboardingFlow() {
  // Reset the wizard to step 1 every time it's opened (e.g. via Settings >
  // Rebuild My Plan on a profile that already exists) rather than resuming
  // wherever it was left mid-flow last time.
  document.getElementById('onboard-step-basics').classList.remove('hidden');
  document.getElementById('onboard-step-diet').classList.add('hidden');
  document.getElementById('onboard-step-workout').classList.add('hidden');
  if (DATA.profile) {
    document.getElementById('ob-weight').value = DATA.profile.weightKg || '';
    document.getElementById('ob-age').value = DATA.profile.age || '';
    document.getElementById('ob-height').value = DATA.profile.heightCm || '';
    document.getElementById('ob-diet-type').value = DATA.profile.dietType;
    populateProteinOptions(DATA.profile.dietType);
    document.getElementById('ob-protein').value = DATA.profile.proteinPreference;
    document.getElementById('ob-disliked').value = DATA.profile.dislikedFoods || '';
    document.querySelectorAll('.ob-hindrance').forEach(c => { c.checked = DATA.profile.hindrances.includes(c.value); });
    document.getElementById('ob-equipment').value = DATA.profile.equipment;
    document.getElementById('ob-experience').value = DATA.profile.experienceLevel;
  }
  document.getElementById('app-shell').classList.add('hidden');
  document.getElementById('view-onboarding').classList.remove('hidden');
}

// ============================================================
// Today view
// ============================================================
function renderToday() {
  const now = new Date();
  document.getElementById('today-date').textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const dayOfWeek = now.getDay();
  const dateKeyVal = todayKey();
  const plan = buildPersonalizedWorkoutPlan(DATA.profile)[dayOfWeek];
  renderWorkoutCard(plan, dateKeyVal);
  renderTodayMeals(dayOfWeek, dateKeyVal);
  renderHabits(dateKeyVal);
  renderStreakCard();
}

function renderMiniHistory(exId) {
  const history = exerciseHistory(DATA, exId).slice(-5).reverse();
  if (!history.length) return '<p class="hint-small">No history yet.</p>';
  return '<ul class="mini-history-list">' + history.map(h => `<li>${h.date}: <b>${h.weight}kg</b></li>`).join('') + '</ul>';
}

// "Felt easy" last time is treated as the signal to suggest a small bump
// (~5%, rounded to the nearest 0.5kg) - this app logs a single weight per
// exercise per day rather than a rep count for every set (kept deliberately
// quick to fill in), so "hit the top of the rep range" is approximated by
// the felt-easy tag alone rather than tracked precisely rep-by-rep.
function suggestWeightIncrease(ex, last) {
  if (ex.timed || !last || !last.feltEasy || last.weight == null) return null;
  const bump = Math.max(1, Math.round(last.weight * 0.05 * 2) / 2);
  return Math.round((last.weight + bump) * 2) / 2;
}

function renderWorkoutCard(dayPlan, dateKeyVal) {
  const card = document.getElementById('today-workout-card');
  if (!dayPlan || dayPlan.type === 'rest') {
    card.innerHTML = `
      <h2>Rest Day</h2>
      <p class="hint">No lifting today — light walking or stretching is fine. This is when your muscles actually rebuild.</p>
      <button class="btn-secondary" id="btn-manual-rest">Start Rest Timer</button>`;
    document.getElementById('btn-manual-rest').addEventListener('click', startRestTimer);
    return;
  }
  const doneCount = dayPlan.exercises.filter(ex => getExerciseLog(DATA, dateKeyVal, ex.id).done).length;
  let html = `
    <div class="card-header">
      <h2>${dayPlan.name}</h2>
      <span class="pill">${doneCount}/${dayPlan.exercises.length} done</span>
    </div>
    <p class="hint-small">${dayPlan.time || ''}</p>`;

  dayPlan.exercises.forEach(ex => {
    const log = getExerciseLog(DATA, dateKeyVal, ex.id);
    const last = lastLoggedWeight(DATA, ex.id, dateKeyVal);
    const prefillWeight = log.weight != null ? log.weight : (last ? last.weight : '');
    const suggestion = suggestWeightIncrease(ex, last);
    html += `
      <div class="exercise-row ${log.done ? 'exercise-done' : ''} ${log.couldntFinish ? 'exercise-skipped' : ''}" data-ex="${ex.id}">
        <div class="exercise-name">${ex.name}${ex.swappedFor ? '<span class="swap-tag">Swapped for you</span>' : ''}</div>
        <div class="exercise-sets">${ex.sets} sets x ${ex.reps}</div>
        <details class="exercise-details"><summary>How to</summary><p class="hint-small">${ex.howTo}</p></details>
        ${!ex.timed ? `
        <div class="exercise-weight-row">
          <label>Weight (kg)</label>
          <input type="number" class="exercise-weight-input" inputmode="decimal" step="0.5" value="${prefillWeight}">
        </div>
        ${last ? `<p class="hint-small">Last time: ${last.weight}kg (${last.date})</p>` : ''}
        ${suggestion ? `<p class="suggestion-badge">💡 Felt easy last time - try ${suggestion}kg today</p>` : ''}
        <label class="checkbox-inline"><input type="checkbox" class="exercise-felt-easy" ${log.feltEasy ? 'checked' : ''}> Felt easy today</label>
        ` : ''}
        <div class="exercise-actions">
          <label class="checkbox-inline big"><input type="checkbox" class="exercise-done-checkbox" ${log.done ? 'checked' : ''}> Done</label>
          <button class="btn-text exercise-cant-finish">${log.couldntFinish ? "✓ Couldn't finish (logged)" : "Couldn't finish"}</button>
        </div>
        <details class="exercise-details">
          <summary>Notes &amp; substitution</summary>
          <label>Notes<textarea class="exercise-note" rows="2" placeholder="e.g. felt a shoulder twinge">${log.note || ''}</textarea></label>
          <label>Substitution today<textarea class="exercise-subnote" rows="2" placeholder="e.g. did bodyweight squats instead">${log.subNote || ''}</textarea></label>
        </details>
        ${!ex.timed ? `<details class="exercise-details"><summary>History</summary>${renderMiniHistory(ex.id)}</details>` : ''}
      </div>`;
  });
  html += `<button class="btn-secondary" id="btn-manual-rest">Start Rest Timer</button>`;
  card.innerHTML = html;
  wireExerciseCardEvents(dayPlan, dateKeyVal);
}

function wireExerciseCardEvents(dayPlan, dateKeyVal) {
  const card = document.getElementById('today-workout-card');
  card.querySelectorAll('.exercise-row').forEach(row => {
    const exId = row.dataset.ex;
    const ex = dayPlan.exercises.find(e => e.id === exId);

    const weightInput = row.querySelector('.exercise-weight-input');
    if (weightInput) {
      weightInput.addEventListener('change', () => {
        const val = weightInput.value === '' ? null : parseFloat(weightInput.value);
        const priorBest = exerciseHistory(DATA, exId).filter(h => h.date < dateKeyVal).reduce((m, h) => Math.max(m, h.weight), 0);
        setExerciseLog(DATA, dateKeyVal, exId, { weight: val });
        if (val != null && val > priorBest && priorBest > 0) showToast(`🏆 New PR on ${ex.name}: ${val}kg!`);
      });
    }
    const feltEasyCheckbox = row.querySelector('.exercise-felt-easy');
    if (feltEasyCheckbox) {
      feltEasyCheckbox.addEventListener('change', () => setExerciseLog(DATA, dateKeyVal, exId, { feltEasy: feltEasyCheckbox.checked }));
    }
    row.querySelector('.exercise-done-checkbox').addEventListener('change', (e) => {
      setExerciseLog(DATA, dateKeyVal, exId, { done: e.target.checked, couldntFinish: e.target.checked ? false : getExerciseLog(DATA, dateKeyVal, exId).couldntFinish });
      updateStreakForDate(DATA, dateKeyVal);
      if (e.target.checked) startRestTimer();
      renderToday();
    });
    row.querySelector('.exercise-cant-finish').addEventListener('click', () => {
      const log = getExerciseLog(DATA, dateKeyVal, exId);
      setExerciseLog(DATA, dateKeyVal, exId, { couldntFinish: !log.couldntFinish, done: false });
      updateStreakForDate(DATA, dateKeyVal);
      renderToday();
    });
    const noteEl = row.querySelector('.exercise-note');
    if (noteEl) noteEl.addEventListener('change', () => setExerciseLog(DATA, dateKeyVal, exId, { note: noteEl.value }));
    const subNoteEl = row.querySelector('.exercise-subnote');
    if (subNoteEl) subNoteEl.addEventListener('change', () => setExerciseLog(DATA, dateKeyVal, exId, { subNote: subNoteEl.value }));
  });
  const restBtn = document.getElementById('btn-manual-rest');
  if (restBtn) restBtn.addEventListener('click', startRestTimer);
}

// ---------- Meals ----------
function renderTodayMeals(dayOfWeek, dateKeyVal) {
  const meals = mealPlanForDay(dayOfWeek, DATA.profile).map(m => applyDailyProteinOverride(m, dateKeyVal, DATA));
  const list = document.getElementById('today-meals-list');
  let totalProtein = 0, totalCalories = 0;
  list.innerHTML = meals.map(meal => {
    totalProtein += meal.protein || 0;
    totalCalories += meal.calories || 0;
    const eaten = isMealEaten(DATA, dateKeyVal, meal.id);
    const showSwap = meal.id === 'dinner' && canQuickSwapToChicken(DATA.profile);
    return `
      <div class="meal-row ${eaten ? 'meal-eaten' : ''}" data-meal="${meal.id}">
        <label class="checkbox-inline">
          <input type="checkbox" class="meal-checkbox" ${eaten ? 'checked' : ''}>
          <span><b>${meal.time}</b> — ${meal.name}</span>
        </label>
        <p class="hint-small meal-food">${meal.food}</p>
        <p class="hint-small">~${meal.protein}g protein · ~${meal.calories} kcal</p>
        ${showSwap ? `<label class="checkbox-inline"><input type="checkbox" class="meal-chicken-swap" ${isChickenSwapped(DATA, dateKeyVal) ? 'checked' : ''}> Swap to chicken today</label>` : ''}
      </div>`;
  }).join('');
  document.getElementById('today-nutrition-total').textContent = `~${totalProtein}g protein · ~${totalCalories} kcal`;

  list.querySelectorAll('.meal-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      toggleMealEaten(DATA, dateKeyVal, cb.closest('.meal-row').dataset.meal);
      renderTodayMeals(dayOfWeek, dateKeyVal);
    });
  });
  const swapCb = list.querySelector('.meal-chicken-swap');
  if (swapCb) swapCb.addEventListener('change', () => { toggleChickenSwap(DATA, dateKeyVal); renderTodayMeals(dayOfWeek, dateKeyVal); });
}

// ---------- Habits ----------
function renderHabits(dateKeyVal) {
  const sleepInput = document.getElementById('today-sleep');
  sleepInput.value = DATA.sleepLog[dateKeyVal] != null ? DATA.sleepLog[dateKeyVal] : '';
  sleepInput.onchange = () => logSleep(DATA, dateKeyVal, sleepInput.value === '' ? null : parseFloat(sleepInput.value));
  document.getElementById('water-count').textContent = getWaterCount(DATA, dateKeyVal);
  document.getElementById('btn-water-plus').onclick = () => { document.getElementById('water-count').textContent = addWater(DATA, dateKeyVal, 1); };
  document.getElementById('btn-water-minus').onclick = () => { document.getElementById('water-count').textContent = addWater(DATA, dateKeyVal, -1); };
}
function renderStreakCard() {
  document.getElementById('today-streak').innerHTML = `<h2>🔥 ${DATA.streak.count || 0} day streak</h2><p class="hint-small">Counts a training day once every exercise is marked done or honestly logged as couldn't-finish.</p>`;
}

// ============================================================
// Rest timer
// ============================================================
function startRestTimer(seconds) {
  clearInterval(restTimerInterval);
  let remaining = seconds || DEFAULT_REST_SECONDS;
  const overlay = document.getElementById('rest-timer-overlay');
  const display = document.getElementById('rest-timer-display');
  overlay.classList.remove('hidden');
  display.textContent = remaining;
  restTimerInterval = setInterval(() => {
    remaining--;
    display.textContent = remaining;
    if (remaining <= 0) endRestTimer(true);
  }, 1000);
}
function endRestTimer(finished) {
  clearInterval(restTimerInterval);
  document.getElementById('rest-timer-overlay').classList.add('hidden');
  if (finished) {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    playBeep();
  }
}
// A short synthesized beep via the Web Audio API - no audio file needed.
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) { /* Web Audio unavailable - vibration above still fires on supporting devices */ }
}

// ============================================================
// Weekly overview
// ============================================================
function renderWeeklyOverview() {
  const plan = buildPersonalizedWorkoutPlan(DATA.profile);
  const list = document.getElementById('weekly-overview-list');
  const today = new Date();
  const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay());
  let html = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i);
    const dayPlan = plan[d.getDay()];
    const isToday = toDateKey(d) === todayKey();
    html += `
      <div class="week-day-row ${isToday ? 'week-day-today' : ''}">
        <span class="week-day-name">${DAY_NAMES[d.getDay()]}</span>
        <span class="week-day-focus">${dayPlan.type === 'rest' ? 'Rest Day' : dayPlan.name}</span>
        <span class="hint-small">${dayPlan.time || ''}</span>
      </div>`;
  }
  list.innerHTML = html;
}

// ============================================================
// Weekly check-in (body weight + photo)
// ============================================================
function revokePhotoUrls() { photoObjectUrls.forEach(u => URL.revokeObjectURL(u)); photoObjectUrls = []; }

function renderCheckIn() {
  const weekOf = currentWeekOfKey();
  document.getElementById('checkin-weight').value = '';
  document.getElementById('btn-save-checkin-weight').onclick = () => {
    const val = parseFloat(document.getElementById('checkin-weight').value);
    if (!val) return;
    logBodyWeight(DATA, todayKey(), val);
    markWeeklyCheckIn(DATA, weekOf, { weightLogged: true });
    showToast('Weight logged');
    renderCheckInWeightHistory();
    updateAppBadge();
  };
  renderCheckInWeightHistory();

  document.getElementById('btn-take-photo').onclick = () => document.getElementById('checkin-photo-input').click();
  document.getElementById('checkin-photo-input').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await savePhoto(file, weekOf, todayKey());
    markWeeklyCheckIn(DATA, weekOf, { photoLogged: true });
    showToast('Photo saved (stored only on this device)');
    renderPhotoCompare();
    updateAppBadge();
  };
  renderPhotoCompare();
}
function renderCheckInWeightHistory() {
  const recent = DATA.bodyWeightLog.slice(-5).reverse();
  document.getElementById('checkin-weight-history').innerHTML = recent.length
    ? '<ul class="mini-history-list">' + recent.map(e => `<li>${e.date}: <b>${e.weight}kg</b></li>`).join('') + '</ul>'
    : '<p class="hint-small">No weight logged yet.</p>';
}
async function renderPhotoCompare() {
  revokePhotoUrls();
  const thisWeek = currentWeekOfKey();
  const d = new Date(); d.setDate(d.getDate() - 7);
  const lastWeek = currentWeekOfKey(d);
  const [current, previous] = await Promise.all([getPhotoForWeek(thisWeek), getPhotoForWeek(lastWeek)]);
  const el = document.getElementById('checkin-photo-compare');
  const cell = (photo, label) => {
    if (!photo) return `<div class="photo-cell photo-cell-empty">${label}<br>No photo</div>`;
    const url = URL.createObjectURL(photo.blob);
    photoObjectUrls.push(url);
    return `<div class="photo-cell">${label}<br><img src="${url}" alt="${label}"></div>`;
  };
  el.innerHTML = `<div class="photo-compare-grid">${cell(previous, 'Last week')}${cell(current, 'This week')}</div>`;
}

// ============================================================
// Photo timeline
// ============================================================
async function renderPhotoTimeline() {
  revokePhotoUrls();
  const photos = await getAllPhotos();
  const grid = document.getElementById('photo-timeline-grid');
  if (!photos.length) { grid.innerHTML = '<p class="hint-small">No photos yet - log one from Weekly Check-In.</p>'; return; }
  grid.innerHTML = photos.slice().reverse().map(p => {
    const url = URL.createObjectURL(p.blob);
    photoObjectUrls.push(url);
    return `<div class="photo-cell"><img src="${url}" alt="${p.date}"><span class="hint-small">${p.date}</span></div>`;
  }).join('');
}

// ============================================================
// Progress (graphs + PR)
// ============================================================
function renderProgress() {
  const bwPoints = DATA.bodyWeightLog.map(e => ({ value: e.weight, label: e.date.slice(5) }));
  drawLineChart(document.getElementById('bodyweight-chart'), bwPoints, { color: '#60a5fa' });

  const select = document.getElementById('progress-exercise-select');
  const exercises = allExercises(buildPersonalizedWorkoutPlan(DATA.profile)).filter(ex => !ex.timed);
  const prevValue = select.value;
  select.innerHTML = exercises.map(ex => `<option value="${ex.id}">${ex.name}</option>`).join('');
  if (prevValue && exercises.some(ex => ex.id === prevValue)) select.value = prevValue;
  select.onchange = renderExerciseChart;
  renderExerciseChart();
}
function renderExerciseChart() {
  const select = document.getElementById('progress-exercise-select');
  const exId = select.value;
  if (!exId) return;
  const history = exerciseHistory(DATA, exId);
  drawLineChart(document.getElementById('exercise-chart'), history.map(h => ({ value: h.weight, label: h.date.slice(5) })), { color: '#4ade80' });
  const best = history.reduce((m, h) => Math.max(m, h.weight), 0);
  document.getElementById('progress-pr-badge').innerHTML = best ? `<p class="pill">🏆 Personal best: ${best}kg</p>` : '';
  document.getElementById('progress-mini-history').innerHTML = renderMiniHistory(exId);
}

// ============================================================
// Monthly summary
// ============================================================
async function renderMonthly() {
  const now = new Date();
  const monthPrefix = todayKey().slice(0, 7); // "2026-08"
  let workoutsCompleted = 0;
  Object.keys(DATA.exerciseLogs).forEach(dateKeyVal => {
    if (!dateKeyVal.startsWith(monthPrefix)) return;
    const day = new Date(dateKeyVal + 'T00:00:00').getDay();
    const plan = WORKOUT_PLAN[day];
    if (!plan || plan.type !== 'training') return;
    const log = DATA.exerciseLogs[dateKeyVal];
    if (plan.exercises.every(ex => log[ex.id] && (log[ex.id].done || log[ex.id].couldntFinish))) workoutsCompleted++;
  });
  const monthWeights = DATA.bodyWeightLog.filter(e => e.date.startsWith(monthPrefix));

  const photos = await getAllPhotos();
  const monthPhotos = photos.filter(p => p.date.startsWith(monthPrefix));
  revokePhotoUrls();
  const photoCell = (photo, label) => {
    if (!photo) return `<div class="photo-cell photo-cell-empty">${label}<br>No photo</div>`;
    const url = URL.createObjectURL(photo.blob);
    photoObjectUrls.push(url);
    return `<div class="photo-cell">${label}<br><img src="${url}" alt="${label}"></div>`;
  };

  document.getElementById('monthly-summary-content').innerHTML = `
    <div class="card"><h2>${now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
      <p class="pill">${workoutsCompleted} workout${workoutsCompleted === 1 ? '' : 's'} completed</p>
    </div>
    <div class="card"><h2>Body Weight</h2><canvas id="monthly-bw-chart" width="320" height="160"></canvas></div>
    <div class="card"><h2>Photo Comparison</h2>
      <div class="photo-compare-grid">${photoCell(monthPhotos[0], 'Start of month')}${photoCell(monthPhotos[monthPhotos.length - 1], 'End of month')}</div>
    </div>`;
  drawLineChart(document.getElementById('monthly-bw-chart'), monthWeights.map(e => ({ value: e.weight, label: e.date.slice(8) })), { color: '#60a5fa' });
}

// ============================================================
// Settings
// ============================================================
function renderSettings() {
  document.getElementById('settings-theme-toggle').checked = DATA.settings.theme === 'dark';
  document.getElementById('settings-theme-toggle').onchange = (e) => {
    DATA.settings.theme = e.target.checked ? 'dark' : 'light';
    saveData(DATA);
    applyTheme();
  };

  const notifStatus = document.getElementById('notifications-status');
  notifStatus.textContent = !('Notification' in window) ? 'Not supported in this browser.'
    : Notification.permission === 'granted' ? (DATA.settings.notificationsEnabled ? 'Enabled.' : 'Permission granted, but currently turned off.')
    : Notification.permission === 'denied' ? 'Blocked - re-enable in your browser/site settings.'
    : 'Not yet enabled.';
  document.getElementById('btn-enable-notifications').onclick = async () => {
    const result = await requestNotificationPermission();
    DATA.settings.notificationsEnabled = result === 'granted';
    saveData(DATA);
    if (result === 'granted') registerPeriodicSyncIfAvailable();
    renderSettings();
  };

  const timesEl = document.getElementById('settings-workout-times');
  const plan = buildPersonalizedWorkoutPlan(DATA.profile);
  timesEl.innerHTML = Object.keys(plan).filter(d => plan[d].type === 'training').map(d => `
    <label>${DAY_NAMES[d]}<input type="time" class="workout-time-input" data-day="${d}" value="${(DATA.settings.workoutTimes && DATA.settings.workoutTimes[d]) || '18:30'}"></label>
  `).join('');
  timesEl.querySelectorAll('.workout-time-input').forEach(input => {
    input.addEventListener('change', () => {
      DATA.settings.workoutTimes[input.dataset.day] = input.value;
      saveData(DATA);
    });
  });

  document.getElementById('btn-rebuild-plan').onclick = startOnboardingFlow;

  document.getElementById('btn-export-data').onclick = async () => {
    const bundle = await exportAllData();
    const blob = new Blob([JSON.stringify(bundle)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout-assistant-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    DATA.settings.lastBackup = new Date().toISOString();
    saveData(DATA);
    renderSettings();
  };
  document.getElementById('import-data-input').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const bundle = JSON.parse(await file.text());
      await importAllData(bundle);
      showToast('Backup restored');
      DATA = loadData();
      showView('today');
    } catch (err) {
      showToast('Could not read that backup file');
    }
    e.target.value = '';
  };
  document.getElementById('backup-status').textContent = DATA.settings.lastBackup
    ? `Last backed up on ${new Date(DATA.settings.lastBackup).toLocaleDateString()}`
    : 'Never backed up yet - consider downloading a copy of your data.';
}

// ============================================================
// Theme
// ============================================================
function applyTheme() { document.documentElement.setAttribute('data-theme', DATA.settings.theme); }

// ============================================================
// Home screen widget feasibility
// ============================================================
// A true home-screen WIDGET (a live-updating tile showing "today's focus"
// without opening the app) is NOT achievable with standard web/PWA APIs on
// either platform:
//   - iOS: WidgetKit widgets are a native app-extension feature (Swift,
//     part of a real App Store app) - there is no web equivalent at all,
//     installed PWA or not.
//   - Android: native "App Widgets" are also a platform feature for real
//     installed APKs (including a Trusted Web Activity wrapper), not
//     something a page opened via Chrome's "Add to Home Screen" can expose.
// The closest STANDARD substitute is the Badging API (navigator.setAppBadge),
// which can put a small number/dot on the already-installed app icon - not
// a widget, but it's the one home-screen-visible signal actually available
// without leaving the web platform. Used here to badge "1" when today's
// workout isn't finished yet, or a weekly check-in is due.
async function updateAppBadge() {
  if (!('setAppBadge' in navigator)) return;
  const day = new Date().getDay();
  const plan = WORKOUT_PLAN[day];
  const dateKeyVal = todayKey();
  let due = 0;
  if (plan && plan.type === 'training') {
    const log = DATA.exerciseLogs[dateKeyVal] || {};
    if (!plan.exercises.every(ex => log[ex.id] && (log[ex.id].done || log[ex.id].couldntFinish))) due++;
  }
  if (day === 0) {
    const checkIn = getWeeklyCheckIn(DATA, currentWeekOfKey());
    if (!(checkIn.weightLogged && checkIn.photoLogged)) due++;
  }
  try { if (due > 0) await navigator.setAppBadge(due); else await navigator.clearAppBadge(); } catch (e) { /* not supported */ }
}

// ============================================================
// Midnight reset (checkmarks only - logged weight history is untouched)
// ============================================================
// There's nothing to actively "reset" - done/couldntFinish are already
// stored per-date (see exerciseLogs), so a new date key naturally starts
// with no entries. This just re-renders around actual midnight so the UI
// updates automatically if the app is left open overnight.
function scheduleMidnightRefresh() {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1, 0);
  setTimeout(() => {
    if (document.getElementById('view-today') && !document.getElementById('view-today').classList.contains('hidden')) renderToday();
    scheduleMidnightRefresh();
  }, nextMidnight - now);
}

// ============================================================
// Init
// ============================================================
function init() {
  applyTheme();
  initOnboarding();

  if (isOnboarded(DATA)) {
    document.getElementById('app-shell').classList.remove('hidden');
    showView('today');
  } else {
    startOnboardingFlow();
  }

  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
  document.getElementById('btn-header-home').addEventListener('click', () => showView('today'));
  document.getElementById('btn-rest-skip').addEventListener('click', () => endRestTimer(false));
  document.getElementById('btn-goto-checkin').addEventListener('click', () => showView('checkin'));
  document.getElementById('btn-checkin-back').addEventListener('click', () => showView('weekly'));
  document.getElementById('btn-goto-monthly').addEventListener('click', () => showView('monthly'));
  document.getElementById('btn-monthly-back').addEventListener('click', () => showView('progress'));

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support just won't be available */ });
  }

  checkScheduledNotifications(DATA);
  updateAppBadge();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { checkScheduledNotifications(DATA); updateAppBadge(); } });
  window.addEventListener('focus', () => { checkScheduledNotifications(DATA); updateAppBadge(); });
  setInterval(() => checkScheduledNotifications(DATA), 5 * 60 * 1000); // while the app IS open, catches the window even if focus/visibility events don't fire

  scheduleMidnightRefresh();
}

document.addEventListener('DOMContentLoaded', init);
