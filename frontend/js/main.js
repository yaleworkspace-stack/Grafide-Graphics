/* ============================================
   GRAFIDE — Main JavaScript v5
   Fixed: null-reference crash on admin page
   (handleSignup was called via Enter key on gate
   inputs that aren't inside #loginPanel or #signupPanel)
   ============================================ */

const API = window.API || 'http://localhost:8080/api';

/* ============================================
   TOKEN / SESSION
   ============================================ */
const getToken = () => localStorage.getItem('grafide_token');
const getUser  = () => JSON.parse(localStorage.getItem('grafide_user') || 'null');

const setSession = (token, user) => {
  localStorage.setItem('grafide_token', token);
  localStorage.setItem('grafide_user', JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem('grafide_token');
  localStorage.removeItem('grafide_user');
};

/* ============================================
   NAV AUTH STATE
   ============================================ */
function updateAuthUI() {
  const user  = getUser();
  const token = getToken();

  const navLinks = document.getElementById('navLinks');
  const navAuth  = document.getElementById('navAuth');
  const navUser  = document.getElementById('navUser');
  const userName = document.getElementById('userName');

  if (user && token) {
    navLinks?.classList.add('hidden');
    navAuth?.classList.add('hidden');
    navUser?.classList.remove('hidden');
    if (userName) userName.textContent = user.name.split(' ')[0];
  } else {
    navLinks?.classList.remove('hidden');
    navAuth?.classList.remove('hidden');
    navUser?.classList.add('hidden');
  }
}

/* ============================================
   AUTH MODAL
   ============================================ */
function openModal(panel = 'login') {
  const overlay = document.getElementById('authModal');
  if (!overlay) return;
  overlay.classList.add('active');
  switchPanel(panel);
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('authModal');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function switchPanel(panel) {
  document.getElementById('loginPanel')?.classList.toggle('hidden', panel !== 'login');
  document.getElementById('signupPanel')?.classList.toggle('hidden', panel !== 'signup');
  const loginErr  = document.getElementById('loginError');
  const signupErr = document.getElementById('signupError');
  if (loginErr)  loginErr.textContent  = '';
  if (signupErr) signupErr.textContent = '';
}

/* ============================================
   LOGIN — null-guarded
   ============================================ */
async function handleLogin() {
  const emailEl    = document.getElementById('loginEmail');
  const passwordEl = document.getElementById('loginPassword');
  const errEl      = document.getElementById('loginError');
  const btn        = document.getElementById('loginBtn');

  // If the login form isn't on this page, do nothing
  if (!emailEl || !passwordEl) return;

  const email    = emailEl.value.trim();
  const password = passwordEl.value;

  if (!email || !password) {
    if (errEl) errEl.textContent = 'Please fill in all fields.';
    return;
  }

  if (btn) { btn.textContent = 'Signing in...'; btn.disabled = true; }

  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      if (errEl) errEl.textContent = data.message || 'Login failed.';
      return;
    }

    setSession(data.token, data.user);
    updateAuthUI();
    closeModal();
    showToast(`Welcome back, ${data.user.name.split(' ')[0]}!`, 'success');
    if (typeof onAuthSuccess === 'function') onAuthSuccess(data.user);
  } catch {
    if (errEl) errEl.textContent = 'Network error. Is the backend running?';
  } finally {
    if (btn) { btn.textContent = 'Sign In'; btn.disabled = false; }
  }
}

/* ============================================
   SIGNUP — null-guarded
   ============================================ */
async function handleSignup() {
  const nameEl     = document.getElementById('signupName');
  const emailEl    = document.getElementById('signupEmail');
  const passwordEl = document.getElementById('signupPassword');
  const errEl      = document.getElementById('signupError');
  const btn        = document.getElementById('signupBtn');

  // If the signup form isn't on this page, do nothing
  if (!nameEl || !emailEl || !passwordEl) return;

  const name     = nameEl.value.trim();
  const email    = emailEl.value.trim();
  const password = passwordEl.value;

  if (!name || !email || !password) {
    if (errEl) errEl.textContent = 'Please fill in all fields.';
    return;
  }
  if (password.length < 8) {
    if (errEl) errEl.textContent = 'Password must be at least 8 characters.';
    return;
  }

  if (btn) { btn.textContent = 'Creating account...'; btn.disabled = true; }

  try {
    const res  = await fetch(`${API}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password, termsAccepted: true, role: 'STUDENT' })
    });
    const data = await res.json();

    if (!res.ok) {
      if (errEl) errEl.textContent = data.message || 'Signup failed.';
      return;
    }

    setSession(data.token, data.user);
    updateAuthUI();
    closeModal();
    showToast(`Welcome to Grafide, ${data.user.name.split(' ')[0]}!`, 'success');
    if (typeof onAuthSuccess === 'function') onAuthSuccess(data.user);
  } catch {
    if (errEl) errEl.textContent = 'Network error. Is the backend running?';
  } finally {
    if (btn) { btn.textContent = 'Create Account'; btn.disabled = false; }
  }
}

/* ============================================
   LOGOUT
   ============================================ */
function logout() {
  clearSession();
  updateAuthUI();
  showToast('Signed out.', 'success');
  const protectedPages = ['dashboard.html'];
  const onProtected = protectedPages.some(p => window.location.pathname.includes(p));
  if (onProtected) {
    setTimeout(() => { window.location.href = '../index.html'; }, 800);
  }
}

/* ============================================
   TOAST
   ============================================ */
function showToast(msg, type = 'success') {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className   = `toast ${type}`;
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ============================================
   BURGER NAV
   ============================================ */
function initBurger() {
  const burger = document.getElementById('navBurger');
  const mobile = document.getElementById('navMobile');
  if (!burger || !mobile) return;
  burger.addEventListener('click', () => {
    mobile.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!burger.contains(e.target) && !mobile.contains(e.target)) {
      mobile.classList.remove('open');
    }
  });
}

/* ============================================
   NEWSLETTER
   ============================================ */
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
  } catch { /* silent */ }
  input.value       = '';
  input.placeholder = "You're subscribed!";
  showToast('Subscribed!', 'success');
}

/* ============================================
   SEO HELPERS
   ============================================ */
function setSEOMeta({ title, description, url, type = 'website' } = {}) {
  if (title) {
    document.title = `${title} — Grafide`;
    setMeta('og:title', `${title} — Grafide`);
    setMeta('twitter:title', `${title} — Grafide`);
  }
  if (description) {
    setMeta('description', description);
    setMeta('og:description', description);
    setMeta('twitter:description', description);
  }
  if (url) {
    setMeta('og:url', url);
    setLinkCanonical(url);
  }
  setMeta('og:type', type);
  setMeta('og:site_name', 'Grafide');
  setMeta('twitter:card', 'summary_large_image');
}

function setMeta(nameOrProp, content) {
  let el = document.querySelector(`meta[name="${nameOrProp}"]`)
        || document.querySelector(`meta[property="${nameOrProp}"]`);
  if (!el) {
    el = document.createElement('meta');
    if (nameOrProp.startsWith('og:') || nameOrProp.startsWith('twitter:')) {
      el.setAttribute('property', nameOrProp);
    } else {
      el.setAttribute('name', nameOrProp);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) { el = document.createElement('link'); el.rel = 'canonical'; document.head.appendChild(el); }
  el.href = url;
}

/* ============================================
   SKELETON LOADERS
   ============================================ */
function skeletonCards(container, count = 3) {
  if (!container) return;
  container.innerHTML = Array.from({ length: count }, () => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-line short"></div>
      <div class="skeleton skeleton-line title"></div>
      <div class="skeleton skeleton-line full"></div>
      <div class="skeleton skeleton-line medium"></div>
      <div class="skeleton skeleton-line short"></div>
    </div>`).join('');
}

/* ============================================
   CONTACT ENDPOINT
   ============================================ */
async function submitContactForm({ name, email, subject, message }) {
  const res = await fetch(`${API}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, subject, message })
  });
  return res.ok;
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  initBurger();

  document.getElementById('closeModal')?.addEventListener('click', closeModal);
  document.getElementById('authModal')?.addEventListener('click', e => {
    if (e.target.id === 'authModal') closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
  document.getElementById('signupBtn')?.addEventListener('click', handleSignup);

  /* ---- FIXED: Enter key routing ----
     Only call handleLogin/handleSignup if the input is
     ACTUALLY inside #loginPanel or #signupPanel.
     If it's inside neither (e.g. admin gate inputs with
     class="auth-field" but no panel ancestor), do nothing —
     let that page's own Enter-key handler deal with it.
  */
  document.querySelectorAll('.auth-field input').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      if (input.closest('#loginPanel')) {
        handleLogin();
      } else if (input.closest('#signupPanel')) {
        handleSignup();
      }
      // else: belongs to another form (e.g. admin gate) —
      // that page handles its own Enter key separately.
    });
  });

  // Page-specific SEO
  const path = window.location.pathname;
  if (path.includes('about'))          setSEOMeta({ title: 'About', description: 'Learn about Grafide — the graphics design learning platform.' });
  if (path.includes('contact'))        setSEOMeta({ title: 'Contact', description: 'Get in touch with the Grafide team.' });
  if (path.includes('dashboard'))      setSEOMeta({ title: 'My Dashboard', description: 'Track your learning progress and certificates on Grafide.' });
  if (path.includes('course'))         setSEOMeta({ title: 'Course', description: 'Learn graphics design with structured lessons and verified certificates.' });
  if (path.includes('verify'))         setSEOMeta({ title: 'Verify Certificate', description: 'Verify the authenticity of a Grafide certificate.' });
  if (path.includes('forgot-password'))setSEOMeta({ title: 'Forgot Password', description: 'Reset your Grafide account password.' });
  if (path.includes('reset-password')) setSEOMeta({ title: 'Reset Password', description: 'Set a new password for your Grafide account.' });
  if (path.includes('work-with-us'))   setSEOMeta({ title: 'Work With Us', description: 'Partner with Grafide, become a tutor, or get in touch.' });
  if (path.includes('terms'))          setSEOMeta({ title: 'Terms of Use', description: 'Grafide terms of use and platform rules.' });
  if (path.includes('privacy'))        setSEOMeta({ title: 'Privacy Policy', description: 'How Grafide handles your personal data.' });
  if (path.includes('cookies'))        setSEOMeta({ title: 'Cookie Policy', description: 'How Grafide uses cookies and browser storage.' });
});