// ============================================================
// Workout Assistant - static plan data
// ============================================================
// Everything in this file is fixed reference data (the workout split, the
// exercise how-tos, the meal schedule) - nothing here changes at runtime.
// Actual day-to-day logs (weights, done/not-done, notes, body weight,
// photos) live in storage.js instead, keyed by date.

// JS Date.getDay(): 0 = Sunday, 1 = Monday, ... 6 = Saturday.
const WORKOUT_PLAN = {
  1: { type: 'rest', name: 'Rest Day' },
  5: { type: 'rest', name: 'Rest Day' },
  2: {
    type: 'training',
    name: 'Push Day 1 — Chest, Shoulders, Triceps',
    time: '6:30–7:30 PM',
    exercises: [
      { id: 'tue-pushups', name: 'Push-Ups (or Incline Push-Ups)', sets: 3, reps: '8-12', timed: false,
        howTo: 'Hands slightly wider than shoulders, body straight, lower chest to floor, elbows ~45°, push back up. Do incline version (hands on bench) if too hard.' },
      { id: 'tue-shoulder-press', name: 'Seated/Standing Dumbbell Shoulder Press', sets: 3, reps: '8-10', timed: false,
        howTo: 'Dumbbells at shoulder height, press straight overhead, lower with control.' },
      { id: 'tue-incline-press', name: 'Incline Dumbbell Press (bench or floor)', sets: 3, reps: '10-12', timed: false,
        howTo: 'Press dumbbells up and slightly together above chest, lower to a stretch.' },
      { id: 'tue-dips', name: 'Triceps Dips (bench, feet on floor, knees soft)', sets: 3, reps: '8-12', timed: false,
        howTo: 'Lower body by bending elbows, push back up. Stop if any knee strain.' },
      { id: 'tue-plank', name: 'Plank', sets: 3, reps: '20-30 sec', timed: true,
        howTo: "Straight line head to heels, brace core, don't let hips sag." },
    ],
  },
  3: {
    type: 'training',
    name: 'Pull Day 2 — Back, Biceps',
    time: '6:30–7:30 PM',
    exercises: [
      { id: 'wed-pulldown', name: 'Lat Pulldown or Assisted Pull-Up', sets: 3, reps: '8-10', timed: false,
        howTo: 'Pull bar to upper chest, squeeze back, control the release.' },
      { id: 'wed-row', name: 'Seated Cable Row or Dumbbell Row', sets: 3, reps: '10-12', timed: false,
        howTo: 'Pull handle to torso, squeeze shoulder blades, extend out with control.' },
      { id: 'wed-facepull', name: 'Face Pulls (band or cable)', sets: 3, reps: '12-15', timed: false,
        howTo: 'Pull toward face, elbows high, squeeze rear shoulders.' },
      { id: 'wed-curl', name: 'Dumbbell Bicep Curl', sets: 3, reps: '10-12', timed: false,
        howTo: 'Elbows tucked, curl up, lower slowly, no swinging.' },
      { id: 'wed-deadbug', name: 'Dead Bug (core)', sets: 3, reps: '10 per side', timed: true,
        howTo: 'Lying on back, lower opposite arm/leg without arching lower back.' },
    ],
  },
  4: {
    type: 'training',
    name: 'Legs Day 3 — Low-Impact',
    time: '6:30–7:30 PM',
    exercises: [
      { id: 'thu-legpress', name: 'Leg Press (light-moderate weight)', sets: 3, reps: '10-12', timed: false,
        howTo: 'Controlled path, go light initially, add slowly.' },
      { id: 'thu-legcurl', name: 'Seated or Lying Leg Curl', sets: 3, reps: '10-12', timed: false,
        howTo: 'Curl pad to glutes, lower slowly.' },
      { id: 'thu-calfraise', name: 'Standing or Seated Calf Raise', sets: 3, reps: '12-15', timed: false,
        howTo: 'Rise onto toes, pause, lower for full stretch.' },
      { id: 'thu-hipab', name: 'Hip Abduction Machine', sets: 3, reps: '12-15', timed: false,
        howTo: 'Push legs outward against resistance, control the return.' },
      { id: 'thu-plank', name: 'Plank', sets: 3, reps: '20-30 sec', timed: true,
        howTo: 'Core finisher.' },
    ],
  },
  6: {
    type: 'training',
    name: 'Push Day 4 (Variation)',
    time: '6:30–7:30 PM',
    exercises: [
      { id: 'sat-bench', name: 'Flat Dumbbell Bench Press (or floor press)', sets: 3, reps: '8-10', timed: false,
        howTo: 'Press dumbbells up above chest, lower to just below torso level.' },
      { id: 'sat-arnold', name: 'Arnold Press', sets: 3, reps: '8-10', timed: false,
        howTo: 'Start palms facing you at shoulder height, press overhead while rotating palms forward.' },
      { id: 'sat-pushup-var', name: 'Push-Up Variation', sets: 3, reps: '8-12', timed: false,
        howTo: 'Standard or diamond push-ups.' },
      { id: 'sat-lateral', name: 'Lateral Raise', sets: 3, reps: '12-15', timed: false,
        howTo: 'Raise light dumbbells to shoulder height, lower slowly.' },
      { id: 'sat-plank-tap', name: 'Plank to Shoulder Tap', sets: 3, reps: '10 per side', timed: true,
        howTo: 'From plank, tap opposite shoulder, keep hips still.' },
    ],
  },
  0: {
    type: 'training',
    name: 'Pull Day 5 (Variation)',
    time: '6:30–7:30 PM',
    exercises: [
      { id: 'sun-pullup', name: 'Pull-Up or Band-Assisted Pull-Up', sets: 3, reps: '6-10', timed: false,
        howTo: 'Chin above bar, lower with control.' },
      { id: 'sun-chestrow', name: 'Chest-Supported Row', sets: 3, reps: '10-12', timed: false,
        howTo: 'Lying chest-down on incline bench, row dumbbells to hips.' },
      { id: 'sun-reardelt', name: 'Rear Delt Fly', sets: 3, reps: '12-15', timed: false,
        howTo: 'Hinge forward, raise light dumbbells out to sides.' },
      { id: 'sun-concentration', name: 'Concentration Curl', sets: 3, reps: '10-12 per arm', timed: false,
        howTo: 'Seated, elbow braced on inner thigh, curl up.' },
      { id: 'sun-hollow', name: 'Hollow Body Hold', sets: 3, reps: '15-20 sec', timed: true,
        howTo: 'Lying on back, arms overhead, shoulders and legs lifted slightly, lower back pressed down.' },
    ],
  },
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Rest guidance used by the rest timer (see rest-timer.js) - not tied to any
// one exercise, just a sensible default between sets on a plan like this.
const DEFAULT_REST_SECONDS = 75;

// ---------- Meals ----------
// The base meal SHAPE (which slots exist on a training vs rest day) is
// fixed, but the actual food in each slot is built per-profile - see
// buildPersonalizedMealPlans further down, which is what mealPlanForDay
// actually reads from.
function mealPlanForDay(dayOfWeek, profile) {
  // Reads the PERSONALIZED plan's day type, not the fixed WORKOUT_PLAN,
  // since which days are training vs rest is now profile-driven (see
  // buildPersonalizedWorkoutPlan's trainingDays handling).
  const plan = buildPersonalizedWorkoutPlan(profile)[dayOfWeek];
  const meals = buildPersonalizedMealPlans(profile);
  return plan && plan.type === 'training' ? meals.training : meals.rest;
}

// Every exercise across the whole week, flattened - used by the progress
// graphs/PR logic to look up an exercise's history regardless of which day
// it's scheduled on. Reads from the PERSONALIZED plan (see
// buildPersonalizedWorkoutPlan) when one exists, so history/graphs always
// refer to whatever exercise a person is actually doing.
function allExercises(plan) {
  const list = [];
  Object.values(plan || WORKOUT_PLAN).forEach(day => {
    if (day.exercises) list.push(...day.exercises);
  });
  return list;
}

// ============================================================
// Plan builder - personalizes the template above from a user profile
// ============================================================
// IMPORTANT: this is a simple rules-based substitution tool, not medical or
// professional advice. Real injury history, medical conditions, allergies,
// and dietary needs deserve an actual doctor, physiotherapist, or registered
// dietitian - this just swaps out a handful of obviously-relevant exercises/
// foods based on a few self-reported flags, nothing more sophisticated than
// that. Shown as a disclaimer in the onboarding UI too (see index.html).

// Each entry: { avoidIf: [hindrance tags], alt: {replacement exercise},
// bodyweightAlt: {replacement exercise if equipment is bodyweight-only} }.
// Only exercises with a genuinely relevant swap are listed here - anything
// not in this table just stays as the template default regardless of
// profile (e.g. Face Pulls are already shoulder-friendly, so there's no
// "shoulder" entry for them).
const EXERCISE_ALTERNATES = {
  'tue-pushups': {
    avoidIf: ['wrist'],
    alt: { name: 'Wall Push-Ups', sets: 3, reps: '8-12', timed: false,
      howTo: 'Stand arm\'s length from a wall, hands flat, lower chest toward it and push back - wrists stay neutral instead of extended.' },
  },
  'tue-shoulder-press': {
    avoidIf: ['shoulder'],
    alt: { name: 'Band Pull-Apart + Wall Slide', sets: 3, reps: '12-15', timed: false,
      howTo: 'Pull a light resistance band apart at chest height, then slide arms up a wall keeping them in contact - builds shoulder stability without overhead loading.' },
    bodyweightAlt: { name: 'Pike Push-Ups', sets: 3, reps: '6-10', timed: false,
      howTo: 'Hips high in an inverted-V, lower head toward the floor between your hands, press back up - a bodyweight overhead-press substitute.' },
  },
  'tue-incline-press': {
    avoidIf: ['shoulder'],
    alt: { name: 'Standing Chest Squeeze Press (light, partial range)', sets: 3, reps: '10-12', timed: false,
      howTo: 'Press light dumbbells together in front of your chest, squeezing pecs, small range of motion - avoids the deeper shoulder stretch of an incline press.' },
    bodyweightAlt: { name: 'Decline Push-Ups (feet elevated)', sets: 3, reps: '8-12', timed: false,
      howTo: 'Feet up on a step or chair, hands on the floor, lower and press - shifts more load to the upper chest like an incline press would.' },
  },
  'tue-dips': {
    avoidIf: ['shoulder', 'knee'],
    alt: { name: 'Close-Grip Push-Ups', sets: 3, reps: '8-12', timed: false,
      howTo: 'Hands close together under your chest, elbows tracking back not out, lower and press - triceps focus without a dip\'s shoulder/knee load.' },
  },
  'tue-plank': {
    avoidIf: ['back'],
    alt: { name: 'Bird Dog', sets: 3, reps: '10 per side', timed: false,
      howTo: 'On hands and knees, extend opposite arm and leg straight out, keep hips level, hold briefly, return - core work without a prone spine position.' },
  },
  'wed-row': {
    avoidIf: ['back'],
    alt: { name: 'Chest-Supported Row', sets: 3, reps: '10-12', timed: false,
      howTo: 'Lying chest-down on an incline bench, row dumbbells to your hips - removes the lower-back load of a bent-over row.' },
  },
  'thu-legpress': {
    avoidIf: ['knee'],
    alt: { name: 'Glute Bridge / Hip Thrust', sets: 3, reps: '10-12', timed: false,
      howTo: 'Shoulders on a bench (or flat on the floor), feet flat, drive hips up squeezing glutes, lower with control - minimal knee flexion under load.' },
    bodyweightAlt: { name: 'Bodyweight Squats', sets: 3, reps: '12-15', timed: false,
      howTo: 'Feet shoulder-width, sit back and down keeping chest up, drive back to standing.' },
  },
  'thu-legcurl': {
    avoidIf: ['knee'],
    alt: { name: 'Standing Glute Kickback (band, light)', sets: 3, reps: '12-15', timed: false,
      howTo: 'Light band around the ankle, kick one leg straight back squeezing the glute, control the return - hamstring/glute work without deep knee flexion under load.' },
    bodyweightAlt: { name: 'Glute Bridge Hamstring March', sets: 3, reps: '10 per side', timed: false,
      howTo: 'From a glute bridge hold, lift one heel off the floor and back down without dropping your hips.' },
  },
  'thu-hipab': {
    bodyweightAlt: { name: 'Side-Lying Leg Raises', sets: 3, reps: '12-15 per side', timed: false,
      howTo: 'Lying on your side, top leg straight, raise it toward the ceiling and lower with control.' },
  },
  'thu-plank': {
    avoidIf: ['back'],
    alt: { name: 'Bird Dog', sets: 3, reps: '10 per side', timed: false,
      howTo: 'On hands and knees, extend opposite arm and leg straight out, keep hips level, hold briefly, return.' },
  },
  'sat-bench': {
    avoidIf: ['shoulder'],
    alt: { name: 'Floor Press (light, partial range)', sets: 3, reps: '8-10', timed: false,
      howTo: 'Lying on the floor, press dumbbells up from where your upper arms rest on the ground - the floor naturally limits shoulder range at the bottom.' },
    bodyweightAlt: { name: 'Push-Ups', sets: 3, reps: '8-12', timed: false,
      howTo: 'Hands slightly wider than shoulders, body straight, lower chest to floor, push back up.' },
  },
  'sat-arnold': {
    avoidIf: ['shoulder'],
    alt: { name: 'Incline Neutral-Grip Press (light)', sets: 3, reps: '8-10', timed: false,
      howTo: 'Palms facing each other, press dumbbells up at a shoulder-friendly angle rather than a full overhead rotation.' },
    bodyweightAlt: { name: 'Pike Push-Ups', sets: 3, reps: '6-10', timed: false,
      howTo: 'Hips high in an inverted-V, lower head toward the floor between your hands, press back up.' },
  },
  'sat-pushup-var': {
    avoidIf: ['wrist'],
    alt: { name: 'Wall Push-Ups', sets: 3, reps: '8-12', timed: false,
      howTo: "Stand arm's length from a wall, hands flat, lower chest toward it and push back - wrists stay neutral." },
  },
  'sat-lateral': {
    avoidIf: ['shoulder'],
    alt: { name: 'Front Raise (light, partial range)', sets: 3, reps: '12-15', timed: false,
      howTo: 'Raise a light dumbbell in front of you only to shoulder height, lower slowly - avoids the impingement-prone top position of a lateral raise.' },
  },
  'sat-plank-tap': {
    avoidIf: ['back', 'wrist'],
    alt: { name: 'Bird Dog', sets: 3, reps: '10 per side', timed: false,
      howTo: 'On hands and knees, extend opposite arm and leg straight out, keep hips level, hold briefly, return.' },
  },
  'sun-pullup': {
    avoidIf: ['shoulder'],
    alt: { name: 'Straight-Arm Pulldown (light)', sets: 3, reps: '10-12', timed: false,
      howTo: 'Standing, arms straight, pull a band or cable down from overhead to your thighs - lat work without an overhead pulling position.' },
  },
  'sun-chestrow': {
    bodyweightAlt: { name: 'Inverted Row (table or low bar)', sets: 3, reps: '8-12', timed: false,
      howTo: 'Lying under a sturdy low bar or table edge, body straight, pull your chest up to it, lower with control.' },
  },
  'sun-reardelt': {
    bodyweightAlt: { name: 'Prone Y-Raise', sets: 3, reps: '12-15', timed: false,
      howTo: 'Lying face-down, arms out in a Y shape, lift them slightly off the ground squeezing rear shoulders, lower with control.' },
  },
  'sun-concentration': {
    bodyweightAlt: { name: 'Chin-Up Negative Holds', sets: 3, reps: '5-8', timed: false,
      howTo: 'Jump or step up to a chin-up top position, lower yourself down as slowly as you can control.' },
  },
  'sun-hollow': {
    avoidIf: ['back'],
    alt: { name: 'Dead Bug', sets: 3, reps: '10 per side', timed: false,
      howTo: 'Lying on your back, lower opposite arm/leg without arching your lower back off the floor.' },
  },
};

// The 5 distinct training routines, decoupled from any specific weekday -
// derived from WORKOUT_PLAN's own fixed layout above (sorted Sun->Sat) so
// the original data only has to be authored once. Which weekday each
// routine actually lands on is now driven by the profile's chosen training
// days (see buildPersonalizedWorkoutPlan), not these original weekday keys -
// the exercise ids (e.g. 'tue-pushups') are just legacy identifiers at this
// point, kept as-is so existing logged history/PRs keyed by them still work.
const TRAINING_ROUTINES = Object.keys(WORKOUT_PLAN)
  .map(Number)
  .sort((a, b) => a - b)
  .filter(day => WORKOUT_PLAN[day].type === 'training')
  .map(day => ({ name: WORKOUT_PLAN[day].name, exercises: WORKOUT_PLAN[day].exercises }));

// Matches the app's original fixed schedule (Tue/Wed/Thu/Sat/Sun) - used
// whenever a profile doesn't have its own trainingDays yet.
const DEFAULT_TRAINING_DAYS = [2, 3, 4, 6, 0];

// A simple, transparent experience-level adjustment: more sets and a longer
// rest window as you go up, rather than anything more elaborate (no
// periodization, no auto-deloads) - the sets/reps/exercises themselves are
// unchanged, this just scales volume and recovery a bit.
const EXPERIENCE_ADJUST = {
  beginner: { setsAdd: 0, restSeconds: DEFAULT_REST_SECONDS },
  intermediate: { setsAdd: 1, restSeconds: 90 },
  advanced: { setsAdd: 1, restSeconds: 120 },
};
function restSecondsForProfile(profile) {
  const level = (profile && profile.experienceLevel) || 'beginner';
  return (EXPERIENCE_ADJUST[level] || EXPERIENCE_ADJUST.beginner).restSeconds;
}

// Builds a personalized week plan: assigns TRAINING_ROUTINES to whichever
// days the profile has chosen (cycling through the 5 routines if more or
// fewer than 5 days are picked), then applies exercise substitutions and the
// experience-level sets adjustment on top. Hindrance safety takes priority
// over equipment convenience (a knee-safe swap is picked even if it still
// assumes a resistance band, say); equipment substitution is only applied on
// top for exercises that DIDN'T already get swapped for a hindrance, to
// avoid needing a fully combinatorial "knee-safe AND bodyweight-only"
// alternative for every exercise. That's a real, narrow limitation -
// documented rather than silently pretending full coverage.
function buildPersonalizedWorkoutPlan(profile) {
  const hindrances = (profile && profile.hindrances) || [];
  const bodyweightOnly = profile && profile.equipment === 'bodyweightOnly';
  const setsAdd = (EXPERIENCE_ADJUST[(profile && profile.experienceLevel) || 'beginner'] || EXPERIENCE_ADJUST.beginner).setsAdd;
  const trainingDays = (profile && profile.trainingDays && profile.trainingDays.length) ? profile.trainingDays : DEFAULT_TRAINING_DAYS;
  const orderedDays = [...new Set(trainingDays)].sort((a, b) => a - b);

  const plan = {};
  for (let day = 0; day <= 6; day++) {
    const idx = orderedDays.indexOf(day);
    if (idx === -1) { plan[day] = { type: 'rest', name: 'Rest Day' }; continue; }
    const routine = TRAINING_ROUTINES[idx % TRAINING_ROUTINES.length];
    plan[day] = {
      type: 'training',
      name: routine.name,
      time: '6:30–7:30 PM',
      exercises: routine.exercises.map(ex => {
        const alt = EXERCISE_ALTERNATES[ex.id];
        let result = ex;
        if (alt) {
          const hindranceMatch = alt.avoidIf && alt.avoidIf.some(tag => hindrances.includes(tag));
          if (hindranceMatch && alt.alt) result = Object.assign({ id: ex.id, swappedFor: 'hindrance' }, alt.alt);
          else if (bodyweightOnly && alt.bodyweightAlt) result = Object.assign({ id: ex.id, swappedFor: 'equipment' }, alt.bodyweightAlt);
        }
        return Object.assign({}, result, { sets: result.sets + setsAdd });
      }),
    };
  }
  return plan;
}

// ---------- Diet builder ----------
// Dinner is the one meal the original plan already varies (beef/chicken) -
// generalized here to a few common protein sources, filtered by diet type
// so e.g. a vegetarian profile is never even offered beef/chicken/fish.
const PROTEIN_SOURCES = {
  beef: { label: 'Beef', dinnerFood: 'Beef mince or steak (200-250g)', protein: 50, calories: 450, diets: ['omnivore'] },
  chicken: { label: 'Chicken', dinnerFood: 'Chicken breast or thighs (200-250g)', protein: 55, calories: 350, diets: ['omnivore'] },
  fish: { label: 'Fish', dinnerFood: 'Salmon or white fish (200-250g)', protein: 45, calories: 380, diets: ['omnivore', 'pescatarian'] },
  turkey: { label: 'Turkey', dinnerFood: 'Turkey breast (200-250g)', protein: 55, calories: 330, diets: ['omnivore'] },
  tofu: { label: 'Tofu / Tempeh', dinnerFood: 'Firm tofu or tempeh (250-300g)', protein: 35, calories: 300, diets: ['omnivore', 'pescatarian', 'vegetarian', 'vegan'] },
  lentils: { label: 'Lentils / Legumes', dinnerFood: 'Cooked lentils or chickpeas (1.5 cups)', protein: 27, calories: 350, diets: ['omnivore', 'pescatarian', 'vegetarian', 'vegan'] },
};
function proteinOptionsForDiet(dietType) {
  return Object.keys(PROTEIN_SOURCES).filter(key => PROTEIN_SOURCES[key].diets.includes(dietType || 'omnivore'));
}

// Breakfast/evening snack variants per diet type - the training-day
// pre-workout snack (milk + cheese) only needed a dairy-free vegan variant,
// everything else stays as the original plan's eggs/bacon/cheese for
// omnivore and vegetarian (bacon removed for vegetarian).
const BREAKFAST_VARIANTS = {
  omnivore: { food: '4 eggs any style, 3 strips of bacon, cheese', protein: 40, calories: 520 },
  vegetarian: { food: '4 eggs any style, cheese, grilled tomato', protein: 32, calories: 420 },
  pescatarian: { food: '4 eggs any style, smoked salmon, cheese', protein: 38, calories: 460 },
  vegan: { food: 'Tofu scramble (300g) with nutritional yeast, avocado', protein: 24, calories: 420 },
};
const EVENING_SNACK_VARIANTS = {
  omnivore: { food: 'Cheese and a couple of hard-boiled eggs', protein: 19, calories: 250 },
  vegetarian: { food: 'Cheese and a couple of hard-boiled eggs', protein: 19, calories: 250 },
  pescatarian: { food: 'Cottage cheese with a small tin of tuna', protein: 26, calories: 220 },
  vegan: { food: 'Handful of almonds and a plant-based protein shake', protein: 22, calories: 280 },
};
const PREWORKOUT_VARIANTS = {
  omnivore: { food: 'Glass of whole milk with cheese', protein: 15, calories: 260 },
  vegetarian: { food: 'Glass of whole milk with cheese', protein: 15, calories: 260 },
  pescatarian: { food: 'Glass of whole milk with cheese', protein: 15, calories: 260 },
  vegan: { food: 'Glass of soy milk with a handful of nuts', protein: 12, calories: 240 },
};

// ---------- Calorie/protein targets ----------
// A standard Mifflin-St Jeor BMR estimate -> TDEE using a single fixed
// "moderately active" multiplier (this whole app already assumes you're
// doing its ~5x/week lifting plan, so there's no separate general-activity
// question) -> a goal-based adjustment. This is a starting-point ESTIMATE
// like any online TDEE calculator, not a lab measurement or medical
// calculation - it's what personalizes the meal plan's portions below.
const GOAL_INFO = {
  muscle:   { label: 'Build Muscle', calorieAdjust: 300,  proteinPerKg: 2.0 },
  shredded: { label: 'Get Shredded', calorieAdjust: -750, proteinPerKg: 2.4 },
  lose:     { label: 'Lose Weight',  calorieAdjust: -500, proteinPerKg: 1.8 },
};
const ACTIVITY_MULTIPLIER = 1.55;

function calculateNutritionTargets(profile) {
  if (!profile || !profile.weightKg || !profile.age || !profile.heightCm || !profile.sex) return null;
  const goal = GOAL_INFO[profile.goal] || GOAL_INFO.muscle;
  const bmr = profile.sex === 'female'
    ? 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161
    : 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;
  const tdee = bmr * ACTIVITY_MULTIPLIER;
  const calorieTarget = Math.max(1200, Math.round(tdee + goal.calorieAdjust));
  const proteinTarget = Math.round(profile.weightKg * goal.proteinPerKg);
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), calorieTarget, proteinTarget, goalLabel: goal.label };
}

// Scales a day's meal list so its total calories line up with the profile's
// target, and tags each meal with the scale factor used (so the UI can tell
// you to eat bigger/smaller portions than the base recipe text describes,
// rather than silently showing a calorie number the actual food doesn't
// match). Clamped to 0.5x-2x so an extreme profile input can't suggest a
// silly portion size - if you hit the clamp, the plan can't fully reach your
// target through portion size alone and you'd need to add/remove a meal.
function scaleMealsToTarget(meals, targets) {
  if (!targets) return meals.map(m => Object.assign({ portionScale: 1 }, m));
  const baseCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  if (baseCalories <= 0) return meals.map(m => Object.assign({ portionScale: 1 }, m));
  const scale = Math.min(2, Math.max(0.5, targets.calorieTarget / baseCalories));
  return meals.map(m => Object.assign({}, m, {
    calories: Math.round(m.calories * scale),
    protein: Math.round(m.protein * scale),
    portionScale: scale,
  }));
}

// Builds { training: [...meals], rest: [...meals], targets } from a
// profile's diet type and preferred dinner protein - falls back to
// omnivore/beef if no profile exists yet (e.g. the very first render before
// onboarding finishes), and each meal's calories/protein get scaled to the
// profile's calculated target (see scaleMealsToTarget above).
function buildPersonalizedMealPlans(profile) {
  const dietType = (profile && profile.dietType) || 'omnivore';
  const proteinKey = (profile && profile.proteinPreference) || 'beef';
  const protein = PROTEIN_SOURCES[proteinKey] || PROTEIN_SOURCES.beef;
  const breakfast = BREAKFAST_VARIANTS[dietType] || BREAKFAST_VARIANTS.omnivore;
  const evening = EVENING_SNACK_VARIANTS[dietType] || EVENING_SNACK_VARIANTS.omnivore;
  const pre = PREWORKOUT_VARIANTS[dietType] || PREWORKOUT_VARIANTS.omnivore;
  const buildDinner = (name, timeLabel) => ({
    id: 'dinner', time: timeLabel, name,
    food: `${protein.dinnerFood}, 2 eggs, lettuce side`,
    protein: protein.protein + 12, // +12 for the 2 eggs alongside
    calories: protein.calories + 140,
  });
  const trainingMeals = [
    { id: 'breakfast', time: '7:00 AM', name: 'Breakfast', food: breakfast.food, protein: breakfast.protein, calories: breakfast.calories },
    { id: 'preworkout', time: '5:30 PM', name: 'Pre-Workout Snack', food: pre.food, protein: pre.protein, calories: pre.calories },
    buildDinner('Dinner (post-workout)', '8:00 PM'),
    { id: 'evening', time: '9:15 PM', name: 'Evening Snack', food: evening.food, protein: evening.protein, calories: evening.calories },
  ];
  const restMeals = [
    { id: 'breakfast', time: '7:00 AM', name: 'Breakfast', food: breakfast.food, protein: breakfast.protein, calories: breakfast.calories },
    buildDinner('Dinner', '8:00 PM'),
    { id: 'evening', time: '9:15 PM', name: 'Evening Snack', food: evening.food, protein: evening.protein, calories: evening.calories },
  ];
  const targets = calculateNutritionTargets(profile);
  return {
    training: scaleMealsToTarget(trainingMeals, targets),
    rest: scaleMealsToTarget(restMeals, targets),
    targets,
  };
}

// Per-day quick swap (see storage.js's chickenSwap) - only offered when the
// profile's default dinner protein is actually beef, matching the original
// "swap to chicken for the day's beef meals" request literally. If your
// default is already something else (fish/turkey/tofu/...), that's a
// deliberate choice made during onboarding - change it via Settings >
// Rebuild My Plan rather than a one-off daily toggle meant for "not feeling
// beef tonight."
function canQuickSwapToChicken(profile) {
  return !profile || !profile.proteinPreference || profile.proteinPreference === 'beef';
}
function applyDailyProteinOverride(meal, dateKey, data) {
  if (meal.id !== 'dinner' || !data.chickenSwap[dateKey]) return meal;
  const chicken = PROTEIN_SOURCES.chicken;
  const scale = meal.portionScale || 1; // keep the swapped meal on the same personalized portion size
  return Object.assign({}, meal, {
    food: `${chicken.dinnerFood}, 2 eggs, lettuce side`,
    protein: Math.round((chicken.protein + 12) * scale),
    calories: Math.round((chicken.calories + 140) * scale),
    swappedToChicken: true,
  });
}
