/* ============================================
   GRAFIDE — Course Page Logic
   Full lesson experience, quiz, certificate
   ============================================ */

let _course   = null;
let _progress = { completedLessons: [] };
let _quizAnswers = [];

/* ============================================
   INIT
   ============================================ */
async function initCoursePage() {
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('tool') || 'photoshop';

  try {
    const res = await fetch(`${API}/courses/${slug}`, {
      headers: authHeaders()
    });

    if (!res.ok) {
      renderError('Course not found.');
      return;
    }

    _course = await res.json();

    // Load server-side progress if logged in
    if (getToken()) {
      await syncProgress(_course.id);
    }

    document.title = `${_course.name} — Grafide`;
    renderSidebar();

    // Resume where they left off, or start from beginning
    const { li, lsi } = getResumePoint();
    selectLesson(li, lsi);
  } catch (err) {
    renderError('Failed to load course. Make sure the backend is running.');
    console.error(err);
  }
}

/* ============================================
   PROGRESS SYNC
   ============================================ */
async function syncProgress(courseId) {
  try {
    const res  = await fetch(`${API}/progress/${courseId}`, { headers: authHeaders() });
    const data = await res.json();
    if (data.completedLessons) {
      _progress = data;
      localStorage.setItem(`grafide_progress_${courseId}`, JSON.stringify(_progress));
    }
  } catch { /* use local */ }

  // Also check localStorage
  const local = JSON.parse(localStorage.getItem(`grafide_progress_${courseId}`) || '{}');
  if ((local.completedLessons?.length || 0) > (_progress.completedLessons?.length || 0)) {
    _progress = local;
  }
}

function getResumePoint() {
  if (!_progress.completedLessons?.length) return { li: 0, lsi: 0 };
  // Find first incomplete lesson
  for (let li = 0; li < _course.levels.length; li++) {
    for (let lsi = 0; lsi < _course.levels[li].lessons.length; lsi++) {
      if (!isLessonComplete(li, lsi)) return { li, lsi };
    }
  }
  return { li: 0, lsi: 0 };
}

function isLessonComplete(li, lsi) {
  return _progress.completedLessons?.includes(`${li}-${lsi}`);
}

function isLevelUnlocked(li) {
  if (li === 0) return true;
  const prev = _course.levels[li - 1];
  return prev.lessons.every((_, lsi) => isLessonComplete(li - 1, lsi));
}

function getProgressStats() {
  const total = _course.levels.reduce((a, l) => a + l.lessons.length, 0);
  const done  = _progress.completedLessons?.length || 0;
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

/* ============================================
   SIDEBAR
   ============================================ */
function renderSidebar() {
  document.getElementById('sidebarToolName').textContent = _course.name;

  const { total, done, pct } = getProgressStats();
  document.getElementById('sidebarProgressFill').style.width = `${pct}%`;
  document.getElementById('sidebarProgressText').textContent = `${done} of ${total} complete`;

  const container = document.getElementById('sidebarLevels');
  container.innerHTML = '';

  _course.levels.forEach((level, li) => {
    const unlocked  = isLevelUnlocked(li);
    const levelDone = level.lessons.every((_, lsi) => isLessonComplete(li, lsi));

    const levelEl = document.createElement('div');
    levelEl.className = 'sidebar-level';
    levelEl.innerHTML = `
      <div class="sidebar-level-header">
        <span class="sidebar-level-label">${level.name}</span>
        ${!unlocked ? '<i class="fa-solid fa-lock sidebar-level-lock"></i>'
          : levelDone ? '<i class="fa-solid fa-circle-check" style="color:var(--cyan);font-size:0.8rem;"></i>' : ''}
      </div>
      <div class="sidebar-lessons">
        ${level.lessons.map((lesson, lsi) => {
          const done   = isLessonComplete(li, lsi);
          const locked = !unlocked;
          const isFirst = li === 0 && lsi === 0;
          const accessible = !locked || isFirst;
          return `
            <div class="sidebar-lesson ${locked && !isFirst ? 'locked' : ''} ${done ? 'completed' : ''}"
                 id="sidebar-lesson-${li}-${lsi}"
                 onclick="${accessible ? `selectLesson(${li}, ${lsi})` : ''}">
              <i class="fa-solid ${done ? 'fa-circle-check' : 'fa-circle'} lesson-check"></i>
              <span class="lesson-title-sidebar">${lesson.title}</span>
            </div>`;
        }).join('')}
        ${unlocked && !levelDone ? '' : unlocked && levelDone ? `
          <div class="sidebar-lesson quiz-entry" onclick="openQuiz(${li})">
            <i class="fa-solid fa-circle-question lesson-check" style="color:var(--cyan)"></i>
            <span class="lesson-title-sidebar" style="color:var(--cyan);font-weight:600;">Level Assessment</span>
          </div>` : ''}
      </div>`;
    container.appendChild(levelEl);
  });
}

function setActiveSidebarLesson(li, lsi) {
  document.querySelectorAll('.sidebar-lesson').forEach(el => el.classList.remove('active'));
  document.getElementById(`sidebar-lesson-${li}-${lsi}`)?.classList.add('active');
}

/* ============================================
   LESSON DISPLAY
   ============================================ */
function selectLesson(li, lsi) {
  if (!_course) return;

  const level  = _course.levels[li];
  const lesson = level?.lessons[lsi];
  if (!lesson) return;

  const isFirstLesson = li === 0 && lsi === 0;
  const isAuth        = !!getUser();

  if (!isAuth && !isFirstLesson) {
    renderAuthWall(li, lsi);
    return;
  }

  setActiveSidebarLesson(li, lsi);
  renderLesson(level, lesson, li, lsi);
}

function renderLesson(level, lesson, li, lsi) {
  const isLastInLevel = lsi === _course.levels[li].lessons.length - 1;
  const hasNext       = !isLastInLevel || li < _course.levels.length - 1;
  const hasPrev       = li > 0 || lsi > 0;

  const prevLi  = lsi > 0 ? li : li - 1;
  const prevLsi = lsi > 0 ? lsi - 1 : (_course.levels[li - 1]?.lessons.length - 1 || 0);
  const nextLi  = isLastInLevel ? li + 1 : li;
  const nextLsi = isLastInLevel ? 0 : lsi + 1;

  document.getElementById('courseMain').innerHTML = `
    <p class="lesson-eyebrow">${level.name} — Lesson ${lsi + 1} of ${level.lessons.length}</p>
    <h2 class="lesson-title">${lesson.title}</h2>

    ${lesson.videoUrl ? `
    <div class="lesson-video">
      <iframe src="${toEmbedUrl(lesson.videoUrl)}"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen loading="lazy"></iframe>
    </div>` : ''}

    <div class="lesson-body">${lesson.content || '<p>Content coming soon.</p>'}</div>

    ${lesson.resources?.length ? `
    <div class="lesson-resources">
      <h4>Further Reading & Resources</h4>
      ${lesson.resources.map(r => `
        <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="resource-link">
          <i class="fa-solid ${
            r.type === 'video'     ? 'fa-play-circle'   :
            r.type === 'tool'      ? 'fa-wrench'        :
            r.type === 'reference' ? 'fa-book'          :
            'fa-arrow-up-right-from-square'
          }"></i>
          <span>${r.title}</span>
          <i class="fa-solid fa-arrow-up-right-from-square" style="margin-left:auto;font-size:0.7rem;color:var(--text-light)"></i>
        </a>`).join('')}
    </div>` : ''}

    <div class="lesson-nav">
      ${hasPrev
        ? `<button class="btn-ghost" onclick="selectLesson(${prevLi}, ${prevLsi})">
             <i class="fa-solid fa-arrow-left"></i> Previous
           </button>`
        : '<span></span>'}

      <button class="btn-primary" id="completeLessonBtn"
              onclick="completeAndAdvance(${li}, ${lsi}, ${isLastInLevel})">
        ${isLastInLevel ? 'Complete & Take Assessment <i class="fa-solid fa-circle-question"></i>'
                        : 'Next Lesson <i class="fa-solid fa-arrow-right"></i>'}
      </button>
    </div>`;
}

function renderAuthWall(li, lsi) {
  document.getElementById('courseMain').innerHTML = `
    <div class="auth-wall">
      <div style="font-size:2.5rem;margin-bottom:1rem;">🔒</div>
      <h3>Create a free account to continue</h3>
      <p>You've completed the preview. Sign up to unlock all lessons, track your progress, and earn a verified certificate.</p>
      <div class="auth-wall-actions">
        <button class="btn-primary" onclick="openModal('signup'); window._pendingLesson={li:${li},lsi:${lsi}}">
          Create free account
        </button>
        <button class="btn-ghost" onclick="openModal('login'); window._pendingLesson={li:${li},lsi:${lsi}}">
          Sign in
        </button>
      </div>
    </div>`;
}

function renderError(msg) {
  document.getElementById('courseMain').innerHTML = `
    <div class="auth-wall">
      <div style="font-size:2.5rem;margin-bottom:1rem;">⚠️</div>
      <h3>Something went wrong</h3>
      <p>${msg}</p>
      <div class="auth-wall-actions">
        <a href="../index.html" class="btn-primary">Back to Home</a>
      </div>
    </div>`;
}

/* ============================================
   COMPLETE LESSON + ADVANCE
   ============================================ */
async function completeAndAdvance(li, lsi, isLastInLevel) {
  const btn = document.getElementById('completeLessonBtn');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }

  // Mark complete
  const key = `${li}-${lsi}`;
  if (!_progress.completedLessons?.includes(key)) {
    if (!_progress.completedLessons) _progress.completedLessons = [];
    _progress.completedLessons.push(key);
    localStorage.setItem(`grafide_progress_${_course.id}`, JSON.stringify(_progress));

    if (getToken()) {
      fetch(`${API}/progress/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ courseId: _course.id, levelIndex: li, lessonIndex: lsi })
      }).catch(() => {});
    }
  }

  renderSidebar();

  if (isLastInLevel) {
    // Check if all lessons in this level are done
    const allDone = _course.levels[li].lessons.every((_, idx) => isLessonComplete(li, idx));
    if (allDone) openQuiz(li);
  } else {
    selectLesson(li, lsi + 1);
  }
}

/* ============================================
   QUIZ
   ============================================ */
async function openQuiz(li) {
  _quizAnswers = [];
  document.getElementById('quizModalTitle').textContent =
    `${_course.levels[li].name} — Level Assessment`;
  document.getElementById('quizBody').innerHTML = `
    <div style="text-align:center;padding:2rem;color:var(--text-light);">
      <div class="loading-spinner" style="margin:0 auto;"></div>
    </div>`;
  document.getElementById('quizResult').classList.add('hidden');
  document.getElementById('quizModal').classList.add('active');

  try {
    const res  = await fetch(`${API}/quizzes/course/${_course.id}/level/${li}`, {
      headers: authHeaders()
    });

    if (!res.ok) {
      // No quiz for this level — skip straight to completion
      document.getElementById('quizModal').classList.remove('active');
      handleLevelComplete(li);
      return;
    }

    const quiz = await res.json();
    renderQuiz(quiz, li);
  } catch {
    document.getElementById('quizModal').classList.remove('active');
    handleLevelComplete(li);
  }
}

function renderQuiz(quiz, li) {
  _quizAnswers = new Array(quiz.questions.length).fill(-1);

  document.getElementById('quizBody').innerHTML = `
    <div>
      ${quiz.questions.map((q, qi) => `
        <div class="quiz-question">
          <p class="quiz-question-text">${qi + 1}. ${q.text}</p>
          <div class="quiz-options">
            ${q.options.map((opt, oi) => `
              <label class="quiz-option" id="opt-${qi}-${oi}">
                <input type="radio" name="q${qi}" value="${oi}"
                       onchange="selectAnswer(${qi}, ${oi})" />
                ${opt}
              </label>`).join('')}
          </div>
        </div>`).join('')}
    </div>
    <div class="quiz-actions">
      <button class="btn-ghost" onclick="document.getElementById('quizModal').classList.remove('active')">
        Back to Lessons
      </button>
      <button class="btn-primary" onclick="submitQuiz('${quiz.id}', ${li})">
        Submit Assessment
      </button>
    </div>`;
}

function selectAnswer(qi, oi) {
  _quizAnswers[qi] = oi;
  // Highlight selected
  document.querySelectorAll(`[id^="opt-${qi}-"]`).forEach(el => el.classList.remove('selected'));
  document.getElementById(`opt-${qi}-${oi}`)?.classList.add('selected');
}

async function submitQuiz(quizId, li) {
  if (_quizAnswers.includes(-1)) {
    alert('Please answer all questions before submitting.'); return;
  }

  try {
    const res  = await fetch(`${API}/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ answers: _quizAnswers })
    });
    const data = await res.json();
    renderQuizResult(data, li);
  } catch {
    alert('Failed to submit quiz. Please try again.');
  }
}

function renderQuizResult(result, li) {
  document.getElementById('quizBody').classList.add('hidden');
  const resultEl = document.getElementById('quizResult');
  resultEl.classList.remove('hidden');

  const pass = result.passed;

  resultEl.innerHTML = `
    <div class="quiz-result">
      <div class="quiz-score-circle ${pass ? 'pass' : 'fail'}">
        <span class="quiz-score-num">${result.score}%</span>
        <span class="quiz-score-label">Score</span>
      </div>
      <h3 style="color:var(--navy);margin-bottom:0.5rem;">
        ${pass ? '🎉 You passed!' : '📚 Not quite yet'}
      </h3>
      <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:1.5rem;">
        ${result.correct} of ${result.total} correct — pass mark is ${result.passMark}%
        ${pass ? '' : '<br/>Review the lessons and try again when ready.'}
      </p>
      <div style="display:flex;gap:0.75rem;justify-content:center;">
        ${pass
          ? `<button class="btn-primary" onclick="onQuizPass(${li})">
               ${li === _course.levels.length - 1 ? 'Get My Certificate 🏆' : 'Continue to Next Level →'}
             </button>`
          : `<button class="btn-ghost" onclick="document.getElementById('quizModal').classList.remove('active');document.getElementById('quizBody').classList.remove('hidden');document.getElementById('quizResult').classList.add('hidden');">
               Try Again
             </button>
             <button class="btn-primary" onclick="document.getElementById('quizModal').classList.remove('active')">
               Review Lessons
             </button>`
        }
      </div>
    </div>`;
}

async function onQuizPass(li) {
  document.getElementById('quizModal').classList.remove('active');
  document.getElementById('quizBody').classList.remove('hidden');
  document.getElementById('quizResult').classList.add('hidden');
  handleLevelComplete(li);
}

function handleLevelComplete(li) {
  const isLastLevel = li === _course.levels.length - 1;

  if (isLastLevel) {
    issueCertificate();
  } else {
    renderSidebar();
    document.getElementById('courseMain').innerHTML = `
      <div class="auth-wall" style="border-color:var(--cyan);">
        <div style="font-size:3rem;margin-bottom:1rem;">🎯</div>
        <h3>${_course.levels[li].name} Complete!</h3>
        <p>You've unlocked <strong>${_course.levels[li + 1].name}</strong>. Keep going.</p>
        <div class="auth-wall-actions">
          <button class="btn-primary" onclick="selectLesson(${li + 1}, 0)">
            Start ${_course.levels[li + 1].name} <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>`;
  }
}

/* ============================================
   CERTIFICATE
   ============================================ */
async function issueCertificate() {
  const user = getUser();
  let certId   = Certificate.generateFallback(_course.slug);
  let certDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  if (getToken()) {
    try {
      const res  = await fetch(`${API}/certificates/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ courseId: _course.id })
      });
      const data = await res.json();
      if (data.certificateId) certId = data.certificateId;
    } catch { /* use fallback */ }
  }

  document.getElementById('courseMain').innerHTML = `
    <div style="text-align:center;margin-bottom:2rem;">
      <div style="font-size:3.5rem;margin-bottom:0.5rem;">🏆</div>
      <h2 style="color:var(--navy);">Course Complete!</h2>
      <p>Your certificate has been issued and is publicly verifiable.</p>
    </div>
    <div class="cert-card" id="certificateCard">
      <div class="cert-logo"><img src="../images/logo.png" alt="Grafide logo" class="logo-img cert-logo-img" /></div>
      <div class="nav-accent-bars" style="justify-content:center;margin-bottom:1.5rem;">
        <span class="bar bar-white"></span>
        <span class="bar bar-navy"></span>
        <span class="bar bar-cyan"></span>
      </div>
      <p class="cert-title-text">This certifies that</p>
      <h3 class="cert-name">${user?.name || 'Student'}</h3>
      <p class="cert-course">has successfully completed</p>
      <h3 style="font-family:var(--font-display);color:var(--navy);margin-bottom:0.5rem;font-size:1.6rem;">
        ${_course.name}
      </h3>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem;">Issued on ${certDate}</p>
      <p class="cert-id">
        Certificate ID: <strong>${certId}</strong><br/>
        Verify at: <a href="${window.location.origin}/pages/verify.html?id=${certId}"
                      style="color:var(--cyan);">grafide.com/verify/${certId}</a>
      </p>
    </div>
    <div style="display:flex;gap:1rem;justify-content:center;margin-top:1.5rem;flex-wrap:wrap;">
      <button class="btn-primary" onclick="window.print()">
        <i class="fa-solid fa-download"></i> Download Certificate
      </button>
      <a href="../index.html" class="btn-ghost">Back to Courses</a>
    </div>`;
}

const Certificate = {
  generateFallback: (slug) => {
    const uid = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `GRF-${slug.toUpperCase()}-${uid}`;
  }
};

/* ============================================
   UTILS
   ============================================ */
function toEmbedUrl(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* afterAuth hook — resume pending lesson after login */
function afterAuth() {
  if (window._pendingLesson) {
    const { li, lsi } = window._pendingLesson;
    window._pendingLesson = null;
    selectLesson(li, lsi);
  }
}

/* ============================================
   BOOT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('courseSidebar')) {
    initCoursePage();
  }
});
