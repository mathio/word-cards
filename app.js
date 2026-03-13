const CONFIG = {
  sessionSize: 20,
  quizOptions: 10,
  maxQuizOptions: 15,
  masteryMinCorrect: 5,
  masteryMinAccuracy: 0.8,
  swipeThreshold: 95,
};

const STORAGE_KEY = 'wordcards_state_v1';
const SHARE_PREFIX = 'WC1';

const app = {
  categories: [],
  wordsByCategory: new Map(),
  state: loadState(),
  selectedCategoryId: null,
  session: null,
  drag: {
    active: false,
    startX: 0,
    deltaX: 0,
  },
};

const els = {
  homeView: document.getElementById('view-home'),
  sessionView: document.getElementById('view-session'),
  categoryGrid: document.getElementById('category-grid'),
  startSessionBtn: document.getElementById('start-session'),
  resetBtn: document.getElementById('reset-progress'),
  message: document.getElementById('message'),
  copyCodeBtn: document.getElementById('copy-code'),
  importToggleBtn: document.getElementById('import-toggle'),
  importBox: document.getElementById('import-box'),
  importText: document.getElementById('import-text'),
  importCodeBtn: document.getElementById('import-code'),
  sessionTitle: document.getElementById('session-title'),
  learnPhase: document.getElementById('learn-phase'),
  quizPhase: document.getElementById('quiz-phase'),
  summaryPhase: document.getElementById('summary-phase'),
  learnProgress: document.getElementById('learn-progress'),
  cardStage: document.getElementById('card-stage'),
  dontKnowBtn: document.getElementById('dont-know'),
  startQuizManualBtn: document.getElementById('start-quiz-manual'),
  knowBtn: document.getElementById('know'),
  quizProgress: document.getElementById('quiz-progress'),
  quizPrompt: document.getElementById('quiz-prompt'),
  quizOptions: document.getElementById('quiz-options'),
  quizFeedback: document.getElementById('quiz-feedback'),
  summaryStats: document.getElementById('summary-stats'),
  backHomeBtn: document.getElementById('back-home'),
  exitSessionBtn: document.getElementById('exit-session'),
};

init();

async function init() {
  wireEvents();
  registerServiceWorker();

  try {
    app.categories = await loadCategories();
    renderCategoryGrid();
    setMessage('');
  } catch (err) {
    setMessage(`Failed to load data files: ${err.message}`);
  }
}

function wireEvents() {
  els.startSessionBtn.addEventListener('click', startSession);
  els.resetBtn.addEventListener('click', resetProgress);
  els.copyCodeBtn.addEventListener('click', copyProgressCode);
  els.importToggleBtn.addEventListener('click', () => {
    els.importBox.classList.toggle('hidden');
  });
  els.importCodeBtn.addEventListener('click', importProgressCode);

  els.knowBtn.addEventListener('click', () => handleLearnChoice(true));
  els.dontKnowBtn.addEventListener('click', () => handleLearnChoice(false));
  els.startQuizManualBtn.addEventListener('click', () => {
    if (!app.session || !app.session.quizAvailable || app.session.animating) return;
    startQuizPhase();
    renderSession();
  });

  els.backHomeBtn.addEventListener('click', goHome);
  els.exitSessionBtn.addEventListener('click', () => {
    if (window.confirm('Exit the session? Progress in this session will be lost.')) {
      goHome();
    }
  });
}

async function startSession() {
  if (!app.selectedCategoryId) return;

  const category = app.categories.find((cat) => cat.id === app.selectedCategoryId);
  if (!category) return;

  if (!app.wordsByCategory.has(category.id)) {
    const words = await loadWordsFile(category.file);
    app.wordsByCategory.set(category.id, words);
  }

  const words = app.wordsByCategory.get(category.id);
  const sessionWordIds = pickSessionWords(words, category.id, CONFIG.sessionSize);

  app.session = {
    categoryId: category.id,
    categoryName: category.name,
    sessionWordIds,
    learnDeck: shuffle(sessionWordIds),
    phase: 'learn',
    learnIndex: 0,
    quizAvailable: false,
    revealUnknown: false,
    animating: false,
    swipeDir: null,
    quizQueue: [],
    quizActiveWordId: null,
    quizOptions: [],
    quizLock: false,
    lastQuizFeedback: { type: 'idle', text: 'Select an answer', html: false },
    firstAttemptByWord: {},
    quizCorrect: 0,
    quizWrong: 0,
    learnedKnown: 0,
    learnedUnknown: 0,
    startedAt: Date.now(),
  };

  switchView('session');
  renderSession();
}

function goHome() {
  app.session = null;
  switchView('home');
  renderCategoryGrid();
}

function switchView(name) {
  const isHome = name === 'home';
  els.homeView.classList.toggle('active', isHome);
  els.sessionView.classList.toggle('active', !isHome);
  document.body.classList.toggle('session-mode', !isHome);
}

function renderCategoryGrid() {
  els.categoryGrid.innerHTML = '';

  for (const category of app.categories) {
    const progress = getCategoryProgress(category.id, category.total_words);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `category ${app.selectedCategoryId === category.id ? 'active' : ''}`;
    button.innerHTML = `
      <p class="name">${escapeHtml(category.name)}</p>
      <p class="meta">${progress.mastered}/${category.total_words} mastered</p>
      <p class="meta">${progress.percent}% lifetime progress</p>
    `;
    button.addEventListener('click', () => {
      app.selectedCategoryId = category.id;
      els.startSessionBtn.disabled = false;
      renderCategoryGrid();
    });
    els.categoryGrid.appendChild(button);
  }
}

function renderSession() {
  const session = app.session;
  if (!session) return;

  els.sessionTitle.textContent = session.categoryName;

  els.learnPhase.classList.toggle('active', session.phase === 'learn');
  els.quizPhase.classList.toggle('active', session.phase === 'quiz');
  els.summaryPhase.classList.toggle('active', session.phase === 'summary');

  if (session.phase === 'learn') {
    renderLearnPhase();
  } else if (session.phase === 'quiz') {
    renderQuizPhase();
  } else {
    renderSummary();
  }
}

function renderLearnPhase() {
  const session = app.session;
  const current = getCurrentLearnWord();

  els.learnProgress.textContent = `Card ${Math.min(session.learnIndex + 1, session.learnDeck.length)} / ${session.learnDeck.length}`;
  els.cardStage.innerHTML = '';

  if (!current) {
    prepareNextLearnCycle();
    return;
  }

  const showRevealBehind = session.animating && session.swipeDir === 'left' && !session.revealUnknown;
  if (showRevealBehind) {
    const backCard = document.createElement('article');
    backCard.className = 'word-card back-card';
    backCard.innerHTML = `
      <p class="es">${escapeHtml(current.spanish)}</p>
      <p class="en">${escapeHtml(current.english)}</p>
    `;
    els.cardStage.appendChild(backCard);
  }

  const card = document.createElement('article');
  card.className = `word-card ${session.revealUnknown ? 'revealed' : ''}`.trim();
  if (session.swipeDir === 'right') card.classList.add('swipe-right');
  if (session.swipeDir === 'left') card.classList.add('swipe-left');

  if (app.drag.active) {
    card.classList.add('dragging');
    const rotate = app.drag.deltaX / 16;
    card.style.transform = `translateX(${app.drag.deltaX}px) rotate(${rotate}deg)`;
  }

  const showEnglish = session.revealUnknown;
  card.innerHTML = `
    <p class="es">${escapeHtml(current.spanish)}</p>
    ${showEnglish ? `<p class="en">${escapeHtml(current.english)}</p>` : ''}
  `;

  card.addEventListener('pointerdown', onCardPointerDown);
  card.addEventListener('pointermove', onCardPointerMove);
  card.addEventListener('pointerup', onCardPointerUp);
  card.addEventListener('pointercancel', onCardPointerUp);

  els.cardStage.appendChild(card);

  const disabled = session.animating;
  els.knowBtn.disabled = disabled;
  els.dontKnowBtn.disabled = disabled;
  els.startQuizManualBtn.disabled = disabled;
  const showNextOnly = session.revealUnknown;
  els.startQuizManualBtn.classList.toggle('hidden', !session.quizAvailable || showNextOnly);
  els.knowBtn.classList.toggle('hidden', false);
  els.dontKnowBtn.classList.toggle('hidden', showNextOnly);
  els.knowBtn.classList.toggle('neutral', showNextOnly);
  els.knowBtn.textContent = showNextOnly ? 'Next' : 'Know';
  els.dontKnowBtn.textContent = "Don't Know";

  els.knowBtn.classList.toggle('highlight', false);
  els.dontKnowBtn.classList.toggle('highlight', false);
  if (app.drag.active && !showNextOnly) {
    const threshold = 12;
    if (app.drag.deltaX > threshold) {
      els.knowBtn.classList.add('highlight');
    } else if (app.drag.deltaX < -threshold) {
      els.dontKnowBtn.classList.add('highlight');
    }
  }
}

function onCardPointerDown(evt) {
  if (!app.session || app.session.phase !== 'learn' || app.session.animating) return;
  app.drag.active = true;
  app.drag.startX = evt.clientX;
  app.drag.deltaX = 0;
  evt.currentTarget.setPointerCapture(evt.pointerId);
}

function onCardPointerMove(evt) {
  if (!app.drag.active) return;
  app.drag.deltaX = evt.clientX - app.drag.startX;
  renderLearnPhase();
}

function onCardPointerUp(evt) {
  if (!app.drag.active) return;
  evt.currentTarget.releasePointerCapture(evt.pointerId);
  const dx = app.drag.deltaX;
  app.drag.active = false;
  app.drag.deltaX = 0;

  if (dx > CONFIG.swipeThreshold) {
    handleLearnChoice(true);
    return;
  }
  if (dx < -CONFIG.swipeThreshold) {
    handleLearnChoice(false);
    return;
  }

  renderLearnPhase();
}

function getCurrentLearnWord() {
  const session = app.session;
  if (!session || session.phase !== 'learn') return null;
  const id = session.learnDeck[session.learnIndex];
  if (!id) return null;
  const words = app.wordsByCategory.get(session.categoryId) || [];
  return words.find((word) => word.id === id) || null;
}

function handleLearnChoice(known) {
  const session = app.session;
  if (!session || session.phase !== 'learn' || session.animating) return;

  const currentWord = getCurrentLearnWord();
  if (!currentWord) return;

  if (session.revealUnknown) {
    session.swipeDir = known ? 'right' : 'left';
    session.animating = true;
    renderSession();

    window.setTimeout(() => {
      session.learnIndex += 1;
      session.revealUnknown = false;
      session.animating = false;
      session.swipeDir = null;

      prepareNextLearnCycle();
    }, 220);
    return;
  }

  const finalize = () => {
    session.animating = false;
    session.swipeDir = null;
  };

  if (!known) {
    applyLearnResult(session.categoryId, currentWord.id, false);
    session.learnedUnknown += 1;
    session.swipeDir = 'left';
    session.animating = true;
    renderSession();

    window.setTimeout(() => {
      finalize();
      session.revealUnknown = true;
      renderSession();
    }, 220);
    return;
  }

  applyLearnResult(session.categoryId, currentWord.id, true);
  session.learnedKnown += 1;
  session.swipeDir = 'right';
  session.animating = true;
  renderSession();
  window.setTimeout(() => {
    finalize();
    session.learnIndex += 1;
    prepareNextLearnCycle();
  }, 220);
}

function prepareNextLearnCycle() {
  const session = app.session;
  if (!session || session.phase !== 'learn') return;
  if (session.learnIndex < session.learnDeck.length) {
    renderSession();
    return;
  }

  session.quizAvailable = true;
  session.learnDeck = shuffle(session.sessionWordIds);
  session.learnIndex = 0;
  renderSession();
}

function startQuizPhase() {
  const session = app.session;
  if (!session) return;

  session.phase = 'quiz';
  session.quizQueue = [...session.sessionWordIds];
  session.quizActiveWordId = session.quizQueue[0] || null;
  session.firstAttemptByWord = {};
  session.quizCorrect = 0;
  session.quizWrong = 0;

  updateQuizQuestion();
  renderSession();
}

function updateQuizQuestion() {
  const session = app.session;
  if (!session || session.phase !== 'quiz') return;

  if (!session.quizQueue.length) {
    finishSession();
    return;
  }

  session.quizActiveWordId = session.quizQueue[0];
  const words = app.wordsByCategory.get(session.categoryId) || [];
  session.quizOptions = buildQuizOptions(words, session.quizActiveWordId, CONFIG.quizOptions);
}

function renderQuizPhase() {
  const session = app.session;
  const words = app.wordsByCategory.get(session.categoryId) || [];
  const currentWord = words.find((word) => word.id === session.quizActiveWordId);

  if (!currentWord) {
    finishSession();
    return;
  }

  els.quizProgress.textContent = `${session.quizQueue.length} remaining`;
  els.quizPrompt.textContent = currentWord.english;
  els.quizOptions.innerHTML = '';

  for (const option of session.quizOptions) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = option;
    btn.disabled = session.quizLock;
    btn.addEventListener('click', () => submitQuizAnswer(option));
    els.quizOptions.appendChild(btn);
  }

  applyQuizFeedback(session.lastQuizFeedback);
}

function submitQuizAnswer(selectedSpanish) {
  const session = app.session;
  if (!session || session.phase !== 'quiz' || session.quizLock) return;
  session.quizLock = true;

  const words = app.wordsByCategory.get(session.categoryId) || [];
  const currentWord = words.find((word) => word.id === session.quizActiveWordId);
  if (!currentWord) return;

  const isCorrect = selectedSpanish === currentWord.spanish;
  const stat = ensureWordStat(session.categoryId, currentWord.id);

  const firstSeen = session.firstAttemptByWord[currentWord.id] === undefined;
  if (firstSeen) session.firstAttemptByWord[currentWord.id] = isCorrect;

  if (isCorrect) {
    stat.quizCorrect += 1;
    stat.lastResult = 'correct';
    stat.lastSeenAt = Date.now();
    session.quizCorrect += 1;
    session.quizQueue.shift();
    session.lastQuizFeedback = { type: 'correct', text: 'Correct', html: false };
  } else {
    stat.quizWrong += 1;
    stat.lastResult = 'wrong';
    stat.lastSeenAt = Date.now();
    session.quizWrong += 1;
    session.quizQueue.push(session.quizQueue.shift());
    session.lastQuizFeedback = {
      type: 'wrong',
      text: `
        <span>Incorrect</span>
        <span class="quiz-answer">${escapeHtml(currentWord.english)} = ${escapeHtml(currentWord.spanish)}</span>
      `,
      html: true,
    };
  }

  for (const btn of els.quizOptions.querySelectorAll('button')) {
    if (isCorrect && btn.textContent === currentWord.spanish) {
      btn.classList.add('correct');
    } else if (!isCorrect && btn.textContent === selectedSpanish) {
      btn.classList.add('wrong');
    }
  }

  applyQuizFeedback(session.lastQuizFeedback);

  saveState(app.state);
  window.setTimeout(() => {
    updateQuizQuestion();
    session.quizLock = false;
    renderSession();
  }, 350);
}

function applyQuizFeedback(feedback) {
  const data = feedback || { type: 'idle', text: 'Select an answer', html: false };
  els.quizFeedback.classList.remove('correct', 'wrong', 'idle');
  els.quizFeedback.classList.add(data.type);
  if (data.html) {
    els.quizFeedback.innerHTML = data.text;
  } else {
    els.quizFeedback.textContent = data.text;
  }
}

function finishSession() {
  const session = app.session;
  if (!session) return;

  session.phase = 'summary';
  const categoryState = ensureCategoryState(session.categoryId);
  categoryState.sessionsCompleted += 1;

  const totalWords = session.sessionWordIds.length;
  let firstAttemptCorrect = 0;
  for (const id of session.sessionWordIds) {
    if (session.firstAttemptByWord[id]) firstAttemptCorrect += 1;
  }

  app.state.history.unshift({
    at: Date.now(),
    categoryId: session.categoryId,
    categoryName: session.categoryName,
    sessionSize: totalWords,
    learnedKnown: session.learnedKnown,
    learnedUnknown: session.learnedUnknown,
    quizCorrect: session.quizCorrect,
    quizWrong: session.quizWrong,
    firstAttemptCorrect,
  });

  app.state.history = app.state.history.slice(0, 120);
  saveState(app.state);

  renderSession();
}

function renderSummary() {
  const session = app.session;
  if (!session) return;

  const total = session.sessionWordIds.length;
  let firstPass = 0;
  for (const id of session.sessionWordIds) {
    if (session.firstAttemptByWord[id]) firstPass += 1;
  }

  const rows = [
    ['Cards in session', String(total)],
    ['Learn phase known', String(session.learnedKnown)],
    ['Learn phase unknown', String(session.learnedUnknown)],
    ['Quiz correct taps', String(session.quizCorrect)],
    ['Quiz wrong taps', String(session.quizWrong)],
    ['First-pass quiz score', `${Math.round((firstPass / total) * 100)}%`],
  ];

  els.summaryStats.innerHTML = '';
  for (const [label, value] of rows) {
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    els.summaryStats.appendChild(row);
  }
}

function applyLearnResult(categoryId, wordId, known) {
  const stat = ensureWordStat(categoryId, wordId);
  stat.seenCount += 1;
  stat.lastSeenAt = Date.now();
  if (known) {
    stat.knownCount += 1;
    stat.lastResult = 'known';
  } else {
    stat.unknownCount += 1;
    stat.lastResult = 'unknown';
  }
  saveState(app.state);
}

function pickSessionWords(words, categoryId, count) {
  const weighted = words.map((word) => {
    const stat = ensureWordStat(categoryId, word.id);
    const attempts = stat.quizCorrect + stat.quizWrong;
    const accuracy = attempts > 0 ? stat.quizCorrect / attempts : 0;
    const mastered = isMastered(stat);
    const daysSince = stat.lastSeenAt ? (Date.now() - stat.lastSeenAt) / 86400000 : 120;

    let weight = 0.35;
    weight += mastered ? 0.2 : 1.3;
    weight += Math.max(0, 1.2 - accuracy);
    weight += Math.min(daysSince / 20, 1.3);
    weight += stat.unknownCount * 0.08;
    weight -= stat.knownCount * 0.03;

    return {
      word,
      weight: Math.max(0.05, weight),
    };
  });

  const selected = [];
  const pool = [...weighted];
  const target = Math.min(count, pool.length);

  while (selected.length < target && pool.length) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let r = Math.random() * totalWeight;
    let idx = 0;

    for (; idx < pool.length; idx += 1) {
      r -= pool[idx].weight;
      if (r <= 0) break;
    }

    const pick = pool.splice(Math.min(idx, pool.length - 1), 1)[0];
    selected.push(pick.word.id);
  }

  return selected;
}

function buildQuizOptions(words, activeWordId, baseCount) {
  const active = words.find((word) => word.id === activeWordId);
  if (!active) return [];

  const maxOptions = Math.min(CONFIG.maxQuizOptions, words.length);
  const optionCount = Math.min(baseCount, maxOptions);
  const options = new Set([active.spanish]);
  const candidates = shuffle(words.filter((word) => word.id !== activeWordId));

  for (const candidate of candidates) {
    if (options.size >= optionCount) break;
    options.add(candidate.spanish);
  }

  return shuffle(Array.from(options));
}

function isMastered(stat) {
  const attempts = stat.quizCorrect + stat.quizWrong;
  if (attempts === 0) return false;
  const accuracy = stat.quizCorrect / attempts;
  return stat.quizCorrect >= CONFIG.masteryMinCorrect && accuracy >= CONFIG.masteryMinAccuracy;
}

function getCategoryProgress(categoryId, totalWords) {
  const catState = ensureCategoryState(categoryId);
  const entries = Object.values(catState.words || {});
  let mastered = 0;

  for (const stat of entries) {
    if (isMastered(stat)) mastered += 1;
  }

  const percent = totalWords > 0 ? Math.round((mastered / totalWords) * 100) : 0;
  return { mastered, percent };
}

function ensureCategoryState(categoryId) {
  if (!app.state.categories[categoryId]) {
    app.state.categories[categoryId] = {
      sessionsCompleted: 0,
      words: {},
    };
  }
  return app.state.categories[categoryId];
}

function ensureWordStat(categoryId, wordId) {
  const cat = ensureCategoryState(categoryId);
  if (!cat.words[wordId]) {
    cat.words[wordId] = {
      seenCount: 0,
      knownCount: 0,
      unknownCount: 0,
      quizCorrect: 0,
      quizWrong: 0,
      lastSeenAt: null,
      lastResult: null,
    };
  }
  return cat.words[wordId];
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { version: 1, categories: {}, history: [] };
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') throw new Error('bad state');
    parsed.categories = parsed.categories || {};
    parsed.history = Array.isArray(parsed.history) ? parsed.history : [];
    return parsed;
  } catch {
    return { version: 1, categories: {}, history: [] };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function loadCategories() {
  const text = await fetchText('data/categories.csv');
  const rows = parseCsv(text);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    file: `data/${row.file}`,
    total_words: Number(row.total_words),
  }));
}

async function loadWordsFile(filePath) {
  const text = await fetchText(filePath);
  const rows = parseCsv(text);
  return rows.map((row) => ({
    id: row.id,
    spanish: row.spanish,
    english: row.english,
    type: row.type,
  }));
}

async function fetchText(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path} (${response.status})`);
  return response.text();
}

function parseCsv(text) {
  const lines = [];
  let field = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') lines.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  if (field.length || row.length) {
    row.push(field);
    lines.push(row);
  }

  const header = lines.shift() || [];
  return lines.map((cells) => {
    const obj = {};
    for (let i = 0; i < header.length; i += 1) {
      obj[header[i]] = cells[i] ?? '';
    }
    return obj;
  });
}

function shuffle(arr) {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function setMessage(text) {
  els.message.textContent = text;
}

async function copyProgressCode() {
  const payload = JSON.stringify(app.state);
  const encoded = toBase64Url(payload);
  const checksum = fnv1a(encoded).toString(16);
  const code = `${SHARE_PREFIX}.${encoded}.${checksum}`;

  try {
    await navigator.clipboard.writeText(code);
    setMessage('Progress code copied to clipboard.');
  } catch {
    setMessage('Clipboard failed. Copy this code manually from the import box.');
    els.importBox.classList.remove('hidden');
    els.importText.value = code;
  }
}

function importProgressCode() {
  const code = els.importText.value.trim();
  if (!code) {
    setMessage('Paste a progress code first.');
    return;
  }

  const parts = code.split('.');
  if (parts.length !== 3 || parts[0] !== SHARE_PREFIX) {
    setMessage('Invalid code format.');
    return;
  }

  const [_, payload, checksum] = parts;
  const valid = fnv1a(payload).toString(16) === checksum;
  if (!valid) {
    setMessage('Invalid checksum. Code may be corrupted.');
    return;
  }

  try {
    const json = fromBase64Url(payload);
    const nextState = JSON.parse(json);

    if (!nextState || typeof nextState !== 'object') throw new Error('Invalid state');
    nextState.categories = nextState.categories || {};
    nextState.history = Array.isArray(nextState.history) ? nextState.history : [];

    app.state = nextState;
    saveState(app.state);
    setMessage('Progress imported.');
    renderCategoryGrid();
  } catch {
    setMessage('Could not decode this code.');
  }
}

function resetProgress() {
  const confirmed = window.confirm('Reset all saved progress on this device?');
  if (!confirmed) return;

  app.state = { version: 1, categories: {}, history: [] };
  saveState(app.state);
  renderCategoryGrid();
  setMessage('Progress reset.');
}

function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function toBase64Url(input) {
  const utf8 = new TextEncoder().encode(input);
  let binary = '';
  utf8.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + pad);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function escapeHtml(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}
