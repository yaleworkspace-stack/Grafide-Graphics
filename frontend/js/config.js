/* ============================================
   GRAFIDE — Frontend Config
   Place this at: frontend/js/config.js
   Load it FIRST in every HTML page,
   before main.js and all other scripts.

   For local dev:   API_BASE_URL points to localhost
   For production:  API_BASE_URL points to Render backend

   Only ONE of the two API_BASE_URL lines below should
   be uncommented at a time.
   ============================================ */

window.GRAFIDE_CONFIG = {

  /* ---- LOCAL DEV (uncomment this one while developing locally) ---- */
  API_BASE_URL: 'https://grafide-graphics-backend.onrender.com/api',

  /* ---- PRODUCTION (uncomment this one before deploying, comment out local) ---- */
  // API_BASE_URL: 'https://grafide-graphics-backend.onrender.com/api',http://localhost:8080/api

  APP_NAME:    'Grafide',
  APP_VERSION: '1.0.0',
};

/* Shorthand used across all JS files — reads from GRAFIDE_CONFIG above.
   Do NOT hardcode a URL here. This must always reference
   window.GRAFIDE_CONFIG.API_BASE_URL so the switch above works. */
window.API = window.GRAFIDE_CONFIG.API_BASE_URL;