/* ============================================
   GRAFIDE — Main JavaScript
   Handles: Auth modal, nav, course page,
            lesson gating, progress tracking
   ============================================ */

const API = 'http://localhost:8080/api';

/* ---- TOKEN HELPERS ---- */
const getToken  = () => localStorage.getItem('grafide_token');
const getUser   = () => JSON.parse(localStorage.getItem('grafide_user') || 'null');
const setSession = (token, user) => {
  localStorage.setItem('grafide_token', token);
  localStorage.setItem('grafide_user', JSON.stringify(user));
};
const clearSession = () => {
  localStorage.removeItem('grafide_token');
  localStorage.removeItem('grafide_user');
};

/* ---- AUTH STATE UI ---- */
function updateAuthUI() {
  const user    = getUser();
  const navAuth = document.getElementById('navAuth');
  const navUser = document.getElementById('navUser');
  const userName = document.getElementById('userName');

  if (user && getToken()) {
    navAuth?.classList.add('hidden');
    navUser?.classList.remove('hidden');
    if (userName) userName.textContent = user.name.split(' ')[0];
  } else {
    navAuth?.classList.remove('hidden');
    navUser?.classList.add('hidden');
  }
}

/* ---- MODAL ---- */
function openModal(panel = 'login') {
  const overlay = document.getElementById('authModal');
  overlay?.classList.add('active');
  switchPanel(panel);
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('authModal');
  overlay?.classList.remove('active');
  document.body.style.overflow = '';
}

function switchPanel(panel) {
  document.getElementById('loginPanel')?.classList.toggle('hidden', panel !== 'login');
  document.getElementById('signupPanel')?.classList.toggle('hidden', panel !== 'signup');
}

/* ---- LOGIN ---- */
async function handleLogin() {
  const email    = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  const errEl    = document.getElementById('loginError');

  if (!email || !password) {
    errEl.textContent = 'Please fill in all fields.'; return;
  }

  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) { errEl.textContent = data.message || 'Login failed.'; return; }

    setSession(data.token, data.user);
    updateAuthUI();
    closeModal();
    onAuthSuccess();
  } catch {
    errEl.textContent = 'Network error. Please try again.';
  }
}

/* ---- SIGNUP ---- */
async function handleSignup() {
  const name     = document.getElementById('signupName')?.value.trim();
  const email    = document.getElementById('signupEmail')?.value.trim();
  const password = document.getElementById('signupPassword')?.value;
  const errEl    = document.getElementById('signupError');

  if (!name || !email || !password) {
    errEl.textContent = 'Please fill in all fields.'; return;
  }
  if (password.length < 8) {
    errEl.textContent = 'Password must be at least 8 characters.'; return;
  }

  try {
    const res  = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'STUDENT' })
    });
    const data = await res.json();

    if (!res.ok) { errEl.textContent = data.message || 'Signup failed.'; return; }

    setSession(data.token, data.user);
    updateAuthUI();
    closeModal();
    onAuthSuccess();
  } catch {
    errEl.textContent = 'Network error. Please try again.';
  }
}

/* ---- LOGOUT ---- */
function logout() {
  clearSession();
  updateAuthUI();
  window.location.href = '/index.html';
}

/* Called after successful auth — used by course page to unlock lesson */
function onAuthSuccess() {
  if (typeof afterAuth === 'function') afterAuth();
}

/* ---- NAV BURGER ---- */
function initBurger() {
  const burger = document.getElementById('navBurger');
  const mobile = document.getElementById('navMobile');
  burger?.addEventListener('click', () => mobile?.classList.toggle('open'));
}

/* ---- NEWSLETTER ---- */
async function subscribeNewsletter() {
  const input = document.getElementById('newsletterEmail');
  const email = input?.value.trim();
  if (!email) return;

  try {
    await fetch(`${API}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    input.value = '';
    input.placeholder = 'You\'re subscribed!';
  } catch {
    console.warn('Newsletter subscribe failed.');
  }
}

/* ---- COURSE PAGE ---- */
function initCoursePage() {
  const params  = new URLSearchParams(window.location.search);
  const tool    = params.get('tool') || 'photoshop';

  loadCourseData(tool);
}

async function loadCourseData(tool) {
  try {
    const res  = await fetch(`${API}/courses/${tool}`, {
      headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
    });
    const data = await res.json();
    renderSidebar(data);
    loadLesson(data, 0, 0); // first lesson by default
  } catch (err) {
    console.error('Failed to load course:', err);
  }
}

function renderSidebar(course) {
  const sidebar = document.getElementById('courseSidebar');
  if (!sidebar) return;

  const toolHeader = document.getElementById('sidebarToolName');
  if (toolHeader) toolHeader.textContent = course.name;

  const levelContainer = document.getElementById('sidebarLevels');
  if (!levelContainer) return;
  levelContainer.innerHTML = '';

  const progress = getUserProgress(course.id);
  const total    = course.levels.reduce((a, l) => a + l.lessons.length, 0);
  const done     = progress.completedLessons?.length || 0;
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0;

  const fill = document.getElementById('sidebarProgressFill');
  const text = document.getElementById('sidebarProgressText');
  if (fill) fill.style.width = `${pct}%`;
  if (text) text.textContent = `${done} of ${total} lessons complete`;

  course.levels.forEach((level, li) => {
    const isLocked = li > 0 && !isLevelUnlocked(course, li, progress);

    const levelEl = document.createElement('div');
    levelEl.className = 'sidebar-level';
    levelEl.innerHTML = `
      <div class="sidebar-level-header">
        <span class="sidebar-level-label">${level.name}</span>
        ${isLocked ? '<i class="fa-solid fa-lock sidebar-level-lock"></i>' : ''}
      </div>
      <div class="sidebar-lessons" id="level-${li}-lessons">
        ${level.lessons.map((lesson, lsi) => {
          const completed = progress.completedLessons?.includes(`${li}-${lsi}`);
          const locked    = isLocked;
          return `
            <div class="sidebar-lesson ${locked ? 'locked' : ''} ${completed ? 'completed' : ''}"
                 data-level="${li}" data-lesson="${lsi}"
                 onclick="${locked ? '' : `selectLesson(${li}, ${lsi})`}">
              <i class="fa-solid ${completed ? 'fa-circle-check' : 'fa-circle'} lesson-check"></i>
              <span class="lesson-title-sidebar">${lesson.title}</span>
            </div>`;
        }).join('')}
      </div>`;
    levelContainer.appendChild(levelEl);
  });

  window._courseData = course;
}

function selectLesson(levelIdx, lessonIdx) {
  if (!window._courseData) return;

  document.querySelectorAll('.sidebar-lesson').forEach(el => el.classList.remove('active'));
  const el = document.querySelector(`[data-level="${levelIdx}"][data-lesson="${lessonIdx}"]`);
  el?.classList.add('active');

  loadLesson(window._courseData, levelIdx, lessonIdx);
}

function loadLesson(course, levelIdx, lessonIdx) {
  const level  = course.levels[levelIdx];
  const lesson = level?.lessons[lessonIdx];
  if (!lesson) return;

  const main = document.getElementById('courseMain');
  if (!main) return;

  const isAuth    = !!getUser();
  const isFirstLesson = levelIdx === 0 && lessonIdx === 0;

  if (!isAuth && !isFirstLesson) {
    renderAuthWall(main, course, levelIdx, lessonIdx);
    return;
  }

  main.innerHTML = `
    <p class="lesson-eyebrow">${level.name} — Lesson ${lessonIdx + 1}</p>
    <h2 class="lesson-title">${lesson.title}</h2>

    ${lesson.videoUrl ? `
    <div class="lesson-video">
      <iframe src="${toEmbedUrl(lesson.videoUrl)}"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen></iframe>
    </div>` : ''}

    <div class="lesson-body">${lesson.content}</div>

    ${lesson.resources?.length ? `
    <div class="lesson-resources">
      <h4>Further Reading</h4>
      ${lesson.resources.map(r => `
        <a href="${r.url}" target="_blank" rel="noopener" class="resource-link">
          <i class="fa-solid ${r.type === 'video' ? 'fa-play-circle' : 'fa-arrow-up-right-from-square'}"></i>
          <span>${r.title}</span>
        </a>`).join('')}
    </div>` : ''}

    <div class="lesson-nav">
      ${lessonIdx > 0 || levelIdx > 0 ? `<button class="btn-ghost" onclick="selectLesson(${lessonIdx > 0 ? levelIdx : levelIdx - 1}, ${lessonIdx > 0 ? lessonIdx - 1 : course.levels[levelIdx-1]?.lessons.length - 1})">← Previous</button>` : '<span></span>'}
      <button class="btn-primary" onclick="completeLesson('${course.id}', ${levelIdx}, ${lessonIdx}, ${course.levels[levelIdx].lessons.length - 1 === lessonIdx})">
        ${course.levels[levelIdx].lessons.length - 1 === lessonIdx ? 'Complete Level' : 'Next Lesson →'}
      </button>
    </div>`;
}

function renderAuthWall(container, course, levelIdx, lessonIdx) {
  container.innerHTML = `
    <div class="auth-wall">
      <h3>Sign in to continue</h3>
      <p>Create a free account to access all lessons, track your progress, and earn certificates.</p>
      <div class="auth-wall-actions">
        <button class="btn-primary" onclick="openModal('signup'); window._pendingLesson = {li: ${levelIdx}, lsi: ${lessonIdx}}">
          Create free account
        </button>
        <button class="btn-ghost" onclick="openModal('login'); window._pendingLesson = {li: ${levelIdx}, lsi: ${lessonIdx}}">
          Sign in
        </button>
      </div>
    </div>`;
}

/* After auth, resume the lesson they tried to open */
function afterAuth() {
  if (window._pendingLesson && window._courseData) {
    const { li, lsi } = window._pendingLesson;
    selectLesson(li, lsi);
    window._pendingLesson = null;
  }
}

async function completeLesson(courseId, levelIdx, lessonIdx, isLastInLevel) {
  const lessonKey = `${levelIdx}-${lessonIdx}`;
  const progress  = getUserProgress(courseId);

  if (!progress.completedLessons) progress.completedLessons = [];
  if (!progress.completedLessons.includes(lessonKey)) {
    progress.completedLessons.push(lessonKey);
    saveUserProgress(courseId, progress);
  }

  if (getToken()) {
    try {
      await fetch(`${API}/progress/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ courseId, levelIndex: levelIdx, lessonIndex: lessonIdx })
      });
    } catch { /* sync later */ }
  }

  const course = window._courseData;
  renderSidebar(course);

  if (isLastInLevel) {
    checkLevelCompletion(course, levelIdx);
  } else {
    selectLesson(levelIdx, lessonIdx + 1);
  }
}

function checkLevelCompletion(course, levelIdx) {
  const isLastLevel = levelIdx === course.levels.length - 1;

  if (isLastLevel) {
    showCertificateFlow(course);
  } else {
    const main = document.getElementById('courseMain');
    main.innerHTML = `
      <div class="auth-wall" style="border-color: var(--cyan);">
        <div style="font-size: 2.5rem; margin-bottom: 1rem;">🎯</div>
        <h3>Level ${levelIdx + 1} Complete!</h3>
        <p>You've unlocked the next level. Keep going.</p>
        <div class="auth-wall-actions">
          <button class="btn-primary" onclick="selectLesson(${levelIdx + 1}, 0)">Start Level ${levelIdx + 2}</button>
        </div>
      </div>`;
  }
}

async function showCertificateFlow(course) {
  const user   = getUser();
  let certId   = `GRF-${course.id.toUpperCase()}-${Date.now()}`;
  let certDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  if (getToken()) {
    try {
      const res  = await fetch(`${API}/certificates/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ courseId: course.id })
      });
      const data = await res.json();
      if (data.certificateId) certId = data.certificateId;
    } catch { /* use local fallback */ }
  }

  const main = document.getElementById('courseMain');
  main.innerHTML = `
    <div style="text-align:center; margin-bottom: 2rem;">
      <div style="font-size: 3rem; margin-bottom: 0.5rem;">🏆</div>
      <h2 style="color: var(--navy);">Course Complete!</h2>
      <p>Your certificate has been issued and is verifiable below.</p>
    </div>
    <div class="cert-card">
      <div class="cert-logo">◆◆ Grafide</div>
      <p class="cert-title-text">This certifies that</p>
      <h3 class="cert-name">${user?.name || 'Student'}</h3>
      <p class="cert-course">has successfully completed</p>
      <h3 style="color: var(--navy); font-family: var(--font-display); margin-bottom: 0.5rem;">${course.name}</h3>
      <p style="font-size: 0.85rem; color: var(--text-muted);">Issued on ${certDate}</p>
      <p class="cert-id">Certificate ID: ${certId}<br/>
        Verify at: grafide.com/verify/${certId}
      </p>
    </div>
    <div style="text-align:center; margin-top: 1.5rem;">
      <button class="btn-primary" onclick="window.print()">Download Certificate</button>
    </div>`;
}

/* ---- PROGRESS (localStorage, synced to backend) ---- */
function getUserProgress(courseId) {
  const key  = `grafide_progress_${courseId}`;
  return JSON.parse(localStorage.getItem(key) || '{}');
}
function saveUserProgress(courseId, progress) {
  localStorage.setItem(`grafide_progress_${courseId}`, JSON.stringify(progress));
}

function isLevelUnlocked(course, levelIdx, progress) {
  if (levelIdx === 0) return true;
  const prevLevel   = course.levels[levelIdx - 1];
  const prevLessons = prevLevel.lessons.map((_, i) => `${levelIdx - 1}-${i}`);
  return prevLessons.every(k => progress.completedLessons?.includes(k));
}

/* ---- UTILS ---- */
function toEmbedUrl(url) {
  // Convert YouTube watch URL to embed
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  initBurger();

  // Modal close handlers
  document.getElementById('closeModal')?.addEventListener('click', closeModal);
  document.getElementById('authModal')?.addEventListener('click', e => {
    if (e.target.id === 'authModal') closeModal();
  });

  // Auth buttons
  document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
  document.getElementById('signupBtn')?.addEventListener('click', handleSignup);

  // Enter key on inputs
  document.querySelectorAll('.auth-field input').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const panel = input.closest('#loginPanel') ? 'login' : 'signup';
      panel === 'login' ? handleLogin() : handleSignup();
    });
  });

  // Course page init
  if (document.getElementById('courseSidebar')) {
    initCoursePage();
  }
});
