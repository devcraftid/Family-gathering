/**
 * Shared configuration & Supabase client for Family Gathering Kampoeng Waringin
 */
const SUPABASE_URL = 'https://igkpoynvmiveyavkcfuz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_tS4N5yNN1PMmqCkwDg_SCg_fV5JLeAI';

const db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
}) : null;

const $ = id => document.getElementById(id);

// Bus seating arrangement: 2 left seats + aisle + 3 right seats, rear seats 59-54
const rowSets = [
  [1, 2, null, 3, 4, 5],
  [6, 7, null, 8, 9, 10],
  [11, 12, null, 13, 14, 15],
  [16, 17, null, 18, 19, 20],
  [21, 22, null, 23, 24, 25],
  [26, 27, null, 28, 29, 30],
  [31, 32, null, 33, 34, 35],
  [36, 37, null, 38, 39, 40],
  [41, 42, null, 43, 44, 45],
  [46, 47, null, 48, 49, 50],
  [null, null, null, 53, 52, 51]
];
const rear = [59, 58, 57, 56, 55, 54];

// Utility: HTML Escaping
function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

// Utility: Toast Notification
function toast(msg) {
  let toastEl = $('toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toastEl.classList.remove('show'), 2800);
}

// Utility: Indonesian Currency Formatter
const moneyID = n => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
}).format(Number(n) || 0);

// Utility: Indonesian Date Formatter
function formatEventDate(value) {
  if (!value) return 'Tanggal belum diatur';
  const d = new Date(value + 'T00:00:00');
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Utility: Sanitize and strip any 'Ciwidey' mentions
function stripCiwidey(str) {
  if (!str) return '';
  return String(str)
    .replace(/\bciwidey\b,?\s*/gi, '')
    .replace(/,\s*,/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/,\s*$/, '');
}

