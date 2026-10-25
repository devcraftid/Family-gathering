/**
 * Admin Portal Controller — Family Gathering Kampoeng Waringin
 * Handles authentication, dashboard stats, participant CRUD, QR scanner,
 * attendance sessions, seat manager, payment tracking, reports, backup & settings.
 */

let adminUser = null;
let adminData = [];
let adminAttendance = [];
let adminAttendanceSessions = [];
let activeAdminSession = null;
let adminPaymentData = [];
let adminRundown = [];
let adminSelectedSeat = 1;
let adminHighlightQuery = '';
let adminScanner = null;
let adminScanActive = false;
let adminBookingEligible = false;
let adminBookingEditSeat = null;
let paymentEditingId = null;
const lockedSeats = new Set();

let adminEventSettings = {
  id: 1,
  event_name: 'Family Gathering Kampoeng Waringin',
  event_date: '2026-11-01',
  destination: 'Kawah Putih, Bandung, Jawa Barat',
  gather_time: '06.00 WIB',
  meeting_point: 'Kantor Kampoeng Waringin',
  description: 'Wisata satu hari bersama keluarga besar Kampoeng Waringin.'
};

// --------------------------------------------------------------------------
// 1. Authentication & Session
// --------------------------------------------------------------------------
async function checkAdminAuth() {
  const { data: s } = await db.auth.getSession();
  adminUser = s.session?.user || null;

  if (!adminUser) {
    $('loginPanel').classList.remove('hidden');
    $('adminPanel').classList.add('hidden');
    $('sidebar').classList.add('hidden');
    return;
  }

  if (adminUser.app_metadata?.role !== 'admin') {
    await db.auth.signOut();
    adminUser = null;
    $('loginPanel').classList.remove('hidden');
    $('adminPanel').classList.add('hidden');
    $('sidebar').classList.add('hidden');
    $('loginMsg').textContent = 'Akun ini belum memiliki role admin di Supabase.';
    return;
  }

  // Authenticated as Admin
  $('loginPanel').classList.add('hidden');
  $('adminPanel').classList.remove('hidden');
  $('sidebar').classList.remove('hidden');
  $('adminEmail').textContent = adminUser.email || 'Panitia';

  await Promise.allSettled([
    loadAdminSeats(),
    loadAdminAttendance(),
    loadAdminEventSettings(),
    loadAdminRundown(),
    loadAdminHighlights()
  ]);

  const savedPage = localStorage.getItem('kpw_admin_page_checkpoint') || 'dashboard';
  goAdminPage(savedPage);
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const btn = $('loginBtn');
  const msg = $('loginMsg');
  btn.disabled = true;
  msg.textContent = 'Memeriksa kredensial…';

  const { error } = await db.auth.signInWithPassword({
    email: $('email').value.trim(),
    password: $('password').value
  });

  btn.disabled = false;
  if (error) {
    msg.textContent = 'Login gagal: ' + error.message;
    return;
  }

  toast('Login admin berhasil!');
  await checkAdminAuth();
}

async function handleAdminLogout() {
  if (adminScanner && adminScanActive) {
    try { await adminScanner.stop(); } catch (_e) {}
  }
  await db.auth.signOut();
  adminUser = null;
  $('loginPanel').classList.remove('hidden');
  $('adminPanel').classList.add('hidden');
  $('sidebar').classList.add('hidden');
  toast('Berhasil logout.');
}

// --------------------------------------------------------------------------
// 2. Navigation
// --------------------------------------------------------------------------
function goAdminPage(page) {
  const validPages = ['dashboard', 'participants', 'attendance', 'seats', 'rundown', 'highlights', 'reports', 'settings'];
  const target = validPages.includes(page) ? page : 'dashboard';

  try { localStorage.setItem('kpw_admin_page_checkpoint', target); } catch (_e) {}

  document.querySelectorAll('.adminpage').forEach(sec => {
    sec.classList.toggle('hidden', sec.id !== 'page-' + target);
  });

  document.querySelectorAll('.sidebtn[data-page]').forEach(b => {
    b.classList.toggle('active', b.dataset.page === target);
  });

  if (target === 'seats') renderAdminSeatMaps();
  if (target === 'participants') renderParticipantRows();
  if (target === 'attendance') updateAdminAttendanceTable();
  if (target === 'settings') loadAdminEventSettings();
  if (target === 'rundown') loadAdminRundown();
  if (target === 'highlights') loadAdminHighlights();
}

// --------------------------------------------------------------------------
// 3. Data Loading
// --------------------------------------------------------------------------
async function loadAdminSeats() {
  try {
    const { data: rows, error } = await db.from('kursi_bus')
      .select('*')
      .order('nomor_kursi', { ascending: true });
    if (error) throw error;
    adminData = rows || [];
    renderAdminSeatMaps();
    updateAdminStats();
    updateAdminBookingUI();
    setAdminConnection(true);
  } catch (err) {
    console.error('loadAdminSeats:', err);
    setAdminConnection(false, err.message);
  }
}

async function loadAdminAttendance() {
  try {
    const { data: sessions, error: sessErr } = await db.from('attendance_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!sessErr && sessions) {
      adminAttendanceSessions = sessions;
      activeAdminSession = sessions.find(s => s.is_active) || null;
      renderAdminAttendanceSessionInfo();
      updateAdminSessionFilterOptions();
    }

    const { data: rows, error } = await db.from('absensi')
      .select('*')
      .order('waktu_absen', { ascending: false });
    if (!error && rows) {
      adminAttendance = rows.map(r => ({
        ...r,
        session_name: adminAttendanceSessions.find(s => String(s.id) === String(r.session_id))?.name || 'Sesi Acara'
      }));
      updateAdminStats();
      renderAdminRecentRows();
      updateAdminAttendanceTable();
    }
  } catch (err) {
    console.error('loadAdminAttendance:', err);
  }
}

function setAdminConnection(ok, msg = '') {
  const el = $('connectionStatus');
  if (!el) return;
  if (ok) {
    el.textContent = 'Terhubung ke Supabase';
    el.className = 'connection-ok';
  } else {
    el.textContent = 'Koneksi error: ' + msg;
    el.className = 'connection-error';
  }
}

// --------------------------------------------------------------------------
// 4. Dashboard Stats & Charts
// --------------------------------------------------------------------------
function updateAdminStats() {
  const taken = adminData.filter(r => r.nama && Number(r.nomor_kursi) >= 1 && Number(r.nomor_kursi) <= 59).length;
  const free = 59 - taken;
  const present = activeAdminSession
    ? adminAttendance.filter(r => String(r.session_id) === String(activeAdminSession.id)).length
    : adminAttendance.length;
  const totalRegistered = new Set(adminData.filter(r => r.nama).map(r => r.nama.trim().toLowerCase())).size;
  const absent = Math.max(0, totalRegistered - present);

  if ($('statParticipants')) $('statParticipants').textContent = totalRegistered;
  if ($('statPresent')) $('statPresent').textContent = present;
  if ($('statAbsent')) $('statAbsent').textContent = absent;
  if ($('statTaken')) $('statTaken').textContent = `${taken}/59`;
  if ($('legendTaken')) $('legendTaken').textContent = taken;
  if ($('legendFree')) $('legendFree').textContent = free;
  if ($('legendLocked')) $('legendLocked').textContent = lockedSeats.size;
  if ($('donutNumber')) $('donutNumber').innerHTML = `${taken}<small>Kursi terisi</small>`;

  if ($('seatDonut')) {
    const pct = (taken / 59) * 100;
    $('seatDonut').style.background = `conic-gradient(#10a45a 0 ${pct}%, #e8424f ${pct}% 100%)`;
  }

  if ($('attendanceBars')) {
    const presentPct = totalRegistered ? Math.max(4, (present / totalRegistered) * 100) : 0;
    const absentPct = totalRegistered ? Math.max(4, (absent / totalRegistered) * 100) : 0;
    $('attendanceBars').innerHTML = `
      <div class="barpair">
        <i class="bar" style="height:${presentPct}%"></i>
        <i class="bar redbar" style="height:${absentPct}%"></i>
      </div>
    `;
  }
}

function renderAdminRecentRows() {
  const body = $('recentRows');
  if (!body) return;
  if (!adminAttendance.length) {
    body.innerHTML = '<tr><td colspan="4" class="empty">Belum ada aktivitas kehadiran.</td></tr>';
    return;
  }
  body.innerHTML = adminAttendance.slice(0, 6).map(r => `
    <tr>
      <td>${r.waktu_absen ? new Date(r.waktu_absen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
      <td><span class="connection-ok">Absensi</span></td>
      <td><b>${esc(r.nama)}</b></td>
      <td>${esc(r.sumber || 'Manual')}</td>
    </tr>
  `).join('');
}

// --------------------------------------------------------------------------
// 5. Seat Maps (Admin)
// --------------------------------------------------------------------------
function recordAdminSeat(n) {
  return adminData.find(r => Number(r.nomor_kursi) === Number(n));
}

function createAdminSeatBtn(n) {
  if (!n) {
    const aisle = document.createElement('div');
    aisle.className = 'aisle';
    return aisle;
  }
  const r = recordAdminSeat(n);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'seat';
  if (r?.nama) btn.classList.add('taken');
  if (lockedSeats.has(n)) btn.classList.add('locked');
  if (adminSelectedSeat === n) btn.classList.add('selected');
  if (adminHighlightQuery && (String(n) === adminHighlightQuery || (r?.nama || '').toLowerCase().includes(adminHighlightQuery))) {
    btn.classList.add('searchhit');
  }

  btn.innerHTML = `<span class="num">${n}</span><span class="name">${r?.nama ? esc(r.nama) : 'Kosong'}</span>`;
  btn.title = `Kursi ${n}${r?.nama ? ' — ' + r.nama : ' — Kosong'}`;

  btn.addEventListener('click', () => {
    adminSelectedSeat = n;
    showAdminSeatDetails(n);
    renderAdminSeatMaps();
  });

  return btn;
}

function renderAdminSeatMaps() {
  ['admSeats', 'dashSeats'].forEach(id => {
    const host = $(id);
    if (!host) return;
    host.replaceChildren();
    rowSets.forEach(nums => {
      const row = document.createElement('div');
      row.className = 'seatrow';
      nums.forEach(n => row.append(createAdminSeatBtn(n)));
      host.append(row);
    });
  });

  ['admRear', 'dashRear'].forEach(id => {
    const tail = $(id);
    if (!tail) return;
    tail.replaceChildren();
    rear.forEach(n => tail.append(createAdminSeatBtn(n)));
  });
}

function showAdminSeatDetails(n) {
  const r = recordAdminSeat(n);
  const infoEl = $('seatDetails');
  if (infoEl) {
    infoEl.innerHTML = `
      Nomor Kursi <strong>${n}</strong><br>
      Nama Peserta: <strong>${esc(r?.nama || 'Kosong')}</strong><br>
      Nomor HP: <strong>${esc(r?.no_hp || '—')}</strong><br>
      Status: <strong>${lockedSeats.has(n) ? 'Terkunci' : (r?.nama ? 'Terisi' : 'Kosong')}</strong>
    `;
  }
  if ($('seatNo')) $('seatNo').value = n;
  if ($('seatName')) $('seatName').value = r?.nama || '';
  if ($('seatPhone')) $('seatPhone').value = r?.no_hp || '';
}

// --------------------------------------------------------------------------
// 6. Participants CRUD
// --------------------------------------------------------------------------
function renderParticipantRows() {
  const q = ($('participantSearch')?.value || '').trim().toLowerCase();
  const body = $('participantRows');
  if (!body) return;

  const rows = adminData.filter(r =>
    [r.nama, r.no_hp, String(r.nomor_kursi)].some(v => String(v || '').toLowerCase().includes(q))
  );

  if ($('participantCount')) $('participantCount').textContent = `${rows.length} peserta`;

  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="5" class="empty">Tidak ada peserta yang cocok.</td></tr>';
    return;
  }

  body.innerHTML = rows.map(r => `
    <tr>
      <td><b>Kursi ${r.nomor_kursi}</b></td>
      <td>${esc(r.nama || '—')}</td>
      <td>${esc(r.no_hp || '—')}</td>
      <td>
        <span class="${r.nama ? 'connection-ok' : 'connection-error'}">
          ${r.nama ? 'TERISI' : 'KOSONG'}
        </span>
      </td>
      <td>
        <button class="btn ghost" type="button" data-edit-seat="${r.nomor_kursi}">Edit</button>
        <button class="btn red" type="button" data-release-seat="${r.nomor_kursi}">Kosongkan</button>
      </td>
    </tr>
  `).join('');

  body.querySelectorAll('[data-edit-seat]').forEach(b => {
    b.onclick = () => {
      const n = Number(b.dataset.editSeat);
      adminSelectedSeat = n;
      showAdminSeatDetails(n);
      $('seatName').focus();
    };
  });

  body.querySelectorAll('[data-release-seat]').forEach(b => {
    b.onclick = () => releaseAdminSeat(Number(b.dataset.releaseSeat));
  });
}

async function saveAdminParticipant(e) {
  e.preventDefault();
  const n = Number($('seatNo').value);
  const nama = $('seatName').value.trim();
  const phone = $('seatPhone').value.trim();
  const msg = $('seatMsg');

  if (!Number.isInteger(n) || n < 1 || n > 59) {
    msg.textContent = 'Nomor kursi harus 1 sampai 59.';
    return;
  }
  if (nama.length < 2) {
    msg.textContent = 'Nama minimal 2 karakter.';
    return;
  }

  const btn = $('saveSeat');
  btn.disabled = true;
  btn.textContent = 'Menyimpan…';

  try {
    const { error } = await db.from('kursi_bus').upsert({
      nomor_kursi: n,
      nama,
      no_hp: phone || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'nomor_kursi' });

    if (error) throw error;
    msg.textContent = `Peserta berhasil disimpan pada Kursi ${n}.`;
    toast(`Peserta disimpan pada Kursi ${n}`);
    await loadAdminSeats();
  } catch (err) {
    msg.textContent = 'Gagal menyimpan: ' + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Simpan Peserta';
  }
}

async function releaseAdminSeat(n) {
  if (!confirm(`Kosongkan Kursi ${n}? Data nama dan HP akan dihapus.`)) return;
  try {
    const { error } = await db.from('kursi_bus').update({
      nama: null,
      no_hp: null,
      updated_at: new Date().toISOString()
    }).eq('nomor_kursi', n);

    if (error) throw error;
    toast(`Kursi ${n} dikosongkan`);
    await loadAdminSeats();
  } catch (err) {
    alert('Gagal mengosongkan kursi: ' + err.message);
  }
}

// --------------------------------------------------------------------------
// 7. Attendance Sessions & QR Scanner
// --------------------------------------------------------------------------
function renderAdminAttendanceSessionInfo() {
  const active = !!activeAdminSession;
  const title = active ? activeAdminSession.name : 'Tidak ada sesi aktif';

  if ($('adminAttendanceSessionStatus')) {
    $('adminAttendanceSessionStatus').textContent = active
      ? `AKTIF: Sesi "${title}" (Dibuka ${new Date(activeAdminSession.created_at).toLocaleTimeString('id-ID')})`
      : 'Sesi sedang ditutup. Klik "Buka Sesi Absensi" agar peserta bisa check-in.';
  }
  if ($('closeAttendanceSession')) $('closeAttendanceSession').disabled = !active;
}

function updateAdminSessionFilterOptions() {
  const sel = $('attendanceSessionFilter');
  if (!sel) return;
  sel.replaceChildren(new Option('Semua sesi', 'all'));
  adminAttendanceSessions.forEach(s => {
    sel.add(new Option(s.name + (s.is_active ? ' (Aktif)' : ''), String(s.id)));
  });
}

async function createAdminAttendanceSession() {
  const name = ($('attendanceSessionName')?.value || '').trim();
  if (name.length < 2) {
    alert('Nama sesi minimal 2 karakter.');
    return;
  }
  const btn = $('startAttendanceSession');
  btn.disabled = true;

  try {
    // Deactivate previous active sessions
    await db.from('attendance_sessions').update({
      is_active: false,
      closed_at: new Date().toISOString()
    }).eq('is_active', true);

    const { data: row, error } = await db.from('attendance_sessions').insert({
      name,
      is_active: true
    }).select().single();

    if (error) throw error;
    activeAdminSession = row;
    toast(`Sesi "${name}" berhasil dibuka!`);
    await loadAdminAttendance();
  } catch (err) {
    alert('Gagal membuka sesi: ' + err.message);
  } finally {
    btn.disabled = false;
  }
}

async function closeAdminAttendanceSession() {
  if (!activeAdminSession) return;
  if (!confirm(`Tutup sesi "${activeAdminSession.name}"? Peserta tidak akan bisa absen sampai sesi baru dibuka.`)) return;

  try {
    const { error } = await db.from('attendance_sessions').update({
      is_active: false,
      closed_at: new Date().toISOString()
    }).eq('id', activeAdminSession.id);

    if (error) throw error;
    activeAdminSession = null;
    toast('Sesi absensi ditutup.');
    await loadAdminAttendance();
  } catch (err) {
    alert('Gagal menutup sesi: ' + err.message);
  }
}

function updateAdminAttendanceTable() {
  const q = ($('attendanceFilter')?.value || '').toLowerCase().trim();
  const sessionFilter = $('attendanceSessionFilter')?.value || 'all';
  const body = $('adminAttendanceRows');
  if (!body) return;

  const rows = adminAttendance.filter(r =>
    (sessionFilter === 'all' || String(r.session_id) === sessionFilter) &&
    (r.nama || '').toLowerCase().includes(q)
  );

  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="7" class="empty">Tidak ada data absensi untuk filter ini.</td></tr>';
    return;
  }

  body.innerHTML = rows.map(r => `
    <tr>
      <td>${r.waktu_absen ? new Date(r.waktu_absen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
      <td>${esc(r.session_name || 'Sesi Acara')}</td>
      <td><b>${esc(r.nama)}</b></td>
      <td>Kursi ${esc(r.nomor_kursi || '—')}</td>
      <td>${esc(r.nomor_wa || '—')}</td>
      <td>${esc(r.sumber || 'Manual')}</td>
      <td>
        <button class="btn red" type="button" data-del-att="${r.id}">Hapus</button>
      </td>
    </tr>
  `).join('');

  body.querySelectorAll('[data-del-att]').forEach(b => {
    b.onclick = () => deleteAdminAttendance(Number(b.dataset.delAtt));
  });
}

async function deleteAdminAttendance(id) {
  if (!confirm('Hapus catatan absensi ini?')) return;
  try {
    const { error } = await db.from('absensi').delete().eq('id', id);
    if (error) throw error;
    toast('Catatan absensi dihapus.');
    await loadAdminAttendance();
  } catch (err) {
    alert('Gagal menghapus: ' + err.message);
  }
}

// --------------------------------------------------------------------------
// 8. Booking & Payments (Admin)
// --------------------------------------------------------------------------
function updateAdminBookingUI() {
  const occupied = adminData.filter(r => r.nama && String(r.nama).trim());
  const free = Array.from({ length: 59 }, (_, i) => i + 1).filter(n => !recordAdminSeat(n)?.nama);

  if ($('bookingTaken')) $('bookingTaken').textContent = occupied.length;
  if ($('bookingFree')) $('bookingFree').textContent = free.length;

  const sel = $('adminBookingSeat');
  if (sel) {
    sel.replaceChildren(new Option('Pilih kursi kosong…', ''));
    free.forEach(n => sel.add(new Option(`Kursi ${n}`, n)));
  }

  const body = $('bookingRows');
  if (body) {
    if (!occupied.length) {
      body.innerHTML = '<tr><td colspan="5" class="empty">Belum ada booking kursi.</td></tr>';
      return;
    }
    body.innerHTML = occupied.map(r => `
      <tr>
        <td><b>Kursi ${r.nomor_kursi}</b></td>
        <td>${esc(r.nama)}</td>
        <td>${esc(r.no_hp || '—')}</td>
        <td><span class="connection-ok">TERISI</span></td>
        <td>
          <button class="btn red" type="button" data-release-book="${r.nomor_kursi}">Kosongkan</button>
        </td>
      </tr>
    `).join('');

    body.querySelectorAll('[data-release-book]').forEach(b => {
      b.onclick = () => releaseAdminSeat(Number(b.dataset.releaseBook));
    });
  }
}

async function loadAdminPaymentData() {
  const body = $('paymentRows');
  if (body) body.innerHTML = '<tr><td colspan="4" class="empty">Memuat data pembayaran…</td></tr>';

  try {
    const { data: rows, error } = await db.from('participant_payments')
      .select('*')
      .order('nama', { ascending: true });
    if (error) throw error;
    adminPaymentData = rows || [];
    renderAdminPaymentRows();
  } catch (err) {
    console.warn('loadPaymentData:', err);
    if (body) body.innerHTML = '<tr><td colspan="4" class="empty">Belum ada data pembayaran atau tabel belum siap.</td></tr>';
  }
}

function renderAdminPaymentRows() {
  const body = $('paymentRows');
  if (!body) return;

  if (!adminPaymentData.length) {
    body.innerHTML = '<tr><td colspan="4" class="empty">Belum ada data pembayaran peserta.</td></tr>';
    return;
  }

  body.innerHTML = adminPaymentData.map(r => `
    <tr>
      <td><b>${esc(r.nama)}</b></td>
      <td>${esc(r.no_hp || '—')}</td>
      <td>
        <span class="${r.status_pembayaran === 'lunas' ? 'connection-ok' : 'connection-error'}">
          ${r.status_pembayaran === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
        </span>
      </td>
      <td>
        <button class="btn ghost" type="button" data-toggle-payment="${r.id}">
          ${r.status_pembayaran === 'lunas' ? 'Ubah Belum Lunas' : 'Tandai LUNAS'}
        </button>
        <button class="btn red" type="button" data-del-payment="${r.id}">Hapus</button>
      </td>
    </tr>
  `).join('');

  body.querySelectorAll('[data-toggle-payment]').forEach(b => {
    b.onclick = () => togglePaymentStatus(b.dataset.togglePayment);
  });
  body.querySelectorAll('[data-del-payment]').forEach(b => {
    b.onclick = () => deletePaymentParticipant(b.dataset.delPayment);
  });
}

async function togglePaymentStatus(id) {
  const row = adminPaymentData.find(r => String(r.id) === String(id));
  if (!row) return;
  const next = row.status_pembayaran === 'lunas' ? 'belum_lunas' : 'lunas';

  try {
    const { error } = await db.from('participant_payments')
      .update({ status_pembayaran: next, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    toast(`Status ${row.nama} diubah menjadi ${next.toUpperCase()}`);
    await loadAdminPaymentData();
  } catch (err) {
    alert('Gagal mengubah status: ' + err.message);
  }
}

async function deletePaymentParticipant(id) {
  if (!confirm('Hapus data pembayaran peserta ini?')) return;
  try {
    const { error } = await db.from('participant_payments').delete().eq('id', id);
    if (error) throw error;
    toast('Data pembayaran dihapus.');
    await loadAdminPaymentData();
  } catch (err) {
    alert('Gagal menghapus: ' + err.message);
  }
}

// --------------------------------------------------------------------------
// 9. Rundown CRUD (Admin)
// --------------------------------------------------------------------------
async function loadAdminRundown() {
  const body = $('adminRundownRows');
  if (body) body.innerHTML = '<tr><td colspan="4" class="empty">Memuat jadwal…</td></tr>';

  try {
    const { data: rows, error } = await db.from('rundown_items')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    adminRundown = rows || [];
    renderAdminRundownRows();
  } catch (err) {
    console.warn('loadAdminRundown:', err);
  }
}

function renderAdminRundownRows() {
  const body = $('adminRundownRows');
  if (!body) return;
  if (!adminRundown.length) {
    body.innerHTML = '<tr><td colspan="4" class="empty">Belum ada kegiatan rundown.</td></tr>';
    return;
  }
  body.innerHTML = adminRundown.map(r => `
    <tr>
      <td>${esc(r.sort_order || 1)}</td>
      <td><b>${esc((r.start_time || '').slice(0, 5))} – ${esc((r.end_time || '').slice(0, 5))}</b></td>
      <td><b>${esc(r.title)}</b><div class="status">${esc(r.description || '')}</div></td>
      <td>
        <button class="btn red" type="button" data-del-rundown="${r.id}">Hapus</button>
      </td>
    </tr>
  `).join('');

  body.querySelectorAll('[data-del-rundown]').forEach(b => {
    b.onclick = () => deleteAdminRundown(b.dataset.delRundown);
  });
}

async function saveAdminRundown(e) {
  e.preventDefault();
  const start = $('rundownStart').value;
  const end = $('rundownEnd').value;
  const title = $('rundownTitle').value.trim();
  const desc = $('rundownDescription').value.trim();
  const order = Number($('rundownOrder').value) || 1;

  if (!start || !end || !title) {
    alert('Lengkapi waktu dan nama kegiatan.');
    return;
  }

  try {
    const { error } = await db.from('rundown_items').insert({
      start_time: start,
      end_time: end,
      title,
      description: desc,
      sort_order: order,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
    toast('Kegiatan rundown berhasil ditambahkan!');
    $('rundownForm').reset();
    await loadAdminRundown();
  } catch (err) {
    alert('Gagal menyimpan: ' + err.message);
  }
}

async function deleteAdminRundown(id) {
  if (!confirm('Hapus kegiatan ini dari rundown?')) return;
  try {
    const { error } = await db.from('rundown_items').delete().eq('id', id);
    if (error) throw error;
    toast('Kegiatan dihapus.');
    await loadAdminRundown();
  } catch (err) {
    alert('Gagal menghapus: ' + err.message);
  }
}

// --------------------------------------------------------------------------
// 10. Event Settings & Backup (Admin)
// --------------------------------------------------------------------------
async function loadAdminEventSettings() {
  try {
    const { data: row, error } = await db.from('event_settings').select('*').eq('id', 1).maybeSingle();
    if (!error && row) {
      if (row.destination) row.destination = stripCiwidey(row.destination);
      adminEventSettings = { ...adminEventSettings, ...row };
    }
    if ($('eventNameInput')) $('eventNameInput').value = adminEventSettings.event_name || '';
    if ($('eventDateInput')) $('eventDateInput').value = adminEventSettings.event_date || '';
    if ($('eventLocationInput')) $('eventLocationInput').value = stripCiwidey(adminEventSettings.destination || '');
    if ($('eventGatherInput')) $('eventGatherInput').value = adminEventSettings.gather_time || '';
    if ($('eventMeetingInput')) $('eventMeetingInput').value = adminEventSettings.meeting_point || '';
    if ($('eventDescriptionInput')) $('eventDescriptionInput').value = adminEventSettings.description || '';
  } catch (err) {
    console.warn('loadAdminEventSettings:', err);
  }
}

async function saveAdminEventSettings(e) {
  e.preventDefault();
  const payload = {
    id: 1,
    event_name: $('eventNameInput').value.trim(),
    event_date: $('eventDateInput').value,
    destination: $('eventLocationInput').value.trim(),
    gather_time: $('eventGatherInput').value.trim(),
    meeting_point: $('eventMeetingInput').value.trim(),
    description: $('eventDescriptionInput').value.trim(),
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await db.from('event_settings').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    toast('Pengaturan acara berhasil disimpan!');
  } catch (err) {
    alert('Gagal menyimpan: ' + err.message);
  }
}

// --------------------------------------------------------------------------
// 11. Reports & CSV Export
// --------------------------------------------------------------------------
function exportAdminCsv(rows, filename) {
  const csv = rows.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportAdminSeats() {
  exportAdminCsv([
    ['Nomor Kursi', 'Nama Peserta', 'No HP', 'Status'],
    ...Array.from({ length: 59 }, (_, i) => {
      const r = recordAdminSeat(i + 1);
      return [i + 1, r?.nama || '', r?.no_hp || '', r?.nama ? 'TERISI' : 'KOSONG'];
    })
  ], 'Data_Kursi_KP_Waringin.csv');
}

function exportAdminAttendance() {
  exportAdminCsv([
    ['Waktu Absensi', 'Sesi', 'Nama Peserta', 'Nomor Kursi', 'WhatsApp', 'Sumber'],
    ...adminAttendance.map(r => [
      r.waktu_absen || '',
      r.session_name || '',
      r.nama || '',
      r.nomor_kursi || '',
      r.nomor_wa || '',
      r.sumber || 'Manual'
    ])
  ], 'Data_Absensi_KP_Waringin.csv');
}

// --------------------------------------------------------------------------
// 11. Popular Highlights & Backup Management
// --------------------------------------------------------------------------
const DEFAULT_ADMIN_HIGHLIGHTS = [
  {
    id: 1,
    title: 'Kawah Putih Utama',
    category: 'Destinasi Utama',
    badge: 'Spot Foto #1',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    metaLeft: 'Danau Belerang',
    metaRight: 'Pukul 09:30 WIB',
    link: 'rundown'
  },
  {
    id: 2,
    title: 'Kebun Teh Rancabali',
    category: 'Panorama Alam',
    badge: 'Sejuk & Asri',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    metaLeft: 'Perkebunan Teh',
    metaRight: 'Pukul 11:30 WIB',
    link: 'rundown'
  },
  {
    id: 3,
    title: 'Makan Siang Bersama',
    category: 'Kuliner Khas Sunda',
    badge: 'Menu Spesial',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    metaLeft: 'Restoran Lokal',
    metaRight: 'Pukul 12:30 WIB',
    link: 'rundown'
  },
  {
    id: 4,
    title: 'Games & Doorprize',
    category: 'Aktivitas Seru',
    badge: 'Hadiah Menarik',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    metaLeft: 'Area Terbuka',
    metaRight: 'Pukul 14:00 WIB',
    link: 'rundown'
  }
];

function getAdminHighlightsData() {
  try {
    const local = localStorage.getItem('kw_popular_highlights');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length === 4) return parsed;
    }
  } catch (_e) {}

  if (adminEventSettings && Array.isArray(adminEventSettings.popular_highlights) && adminEventSettings.popular_highlights.length === 4) {
    return adminEventSettings.popular_highlights;
  }

  return DEFAULT_ADMIN_HIGHLIGHTS;
}

function loadAdminHighlights() {
  const current = getAdminHighlightsData();
  current.forEach((hl, idx) => {
    const preview = $(`hlPreview_${idx}`);
    const badgePreview = $(`hlBadgePreview_${idx}`);
    const heading = $(`hlCardHeading_${idx}`);
    const title = $(`hlTitle_${idx}`);
    const cat = $(`hlCategory_${idx}`);
    const badge = $(`hlBadge_${idx}`);
    const link = $(`hlLink_${idx}`);
    const left = $(`hlMetaLeft_${idx}`);
    const right = $(`hlMetaRight_${idx}`);
    const url = $(`hlUrl_${idx}`);

    if (preview) preview.src = hl.image || '';
    if (badgePreview) badgePreview.textContent = hl.badge || '';
    if (heading) heading.textContent = hl.title ? `Kartu #${idx + 1}: ${hl.title}` : `Kartu Highlight #${idx + 1}`;
    if (title) title.value = hl.title || '';
    if (cat) cat.value = hl.category || '';
    if (badge) badge.value = hl.badge || '';
    if (link) link.value = hl.link || 'rundown';
    if (left) left.value = hl.metaLeft || '';
    if (right) right.value = hl.metaRight || '';
    if (url) {
      url.value = hl.image && !hl.image.startsWith('data:') ? hl.image : '';
      if (hl.image && hl.image.startsWith('data:')) {
        url.dataset.base64 = hl.image;
      } else {
        delete url.dataset.base64;
      }
    }
  });
}

function handleHighlightFileUpload(file, index) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    toast('Harap pilih file foto (JPG, PNG, WebP).');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const maxW = 900;
      const maxH = 600;
      let w = img.width;
      let h = img.height;

      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

      const previewEl = $(`hlPreview_${index}`);
      if (previewEl) previewEl.src = compressedDataUrl;

      const urlInput = $(`hlUrl_${index}`);
      if (urlInput) {
        urlInput.value = '';
        urlInput.dataset.base64 = compressedDataUrl;
      }

      toast(`Foto kartu #${index + 1} berhasil diunggah.`);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function saveAdminHighlights() {
  const btn = $('saveHighlightsBtn');
  const msg = $('highlightsGlobalMsg');
  if (btn) btn.disabled = true;
  if (msg) msg.textContent = 'Menyimpan perubahan highlights beranda…';

  const highlights = [];
  for (let i = 0; i < 4; i++) {
    const urlEl = $(`hlUrl_${i}`);
    let img = urlEl?.dataset.base64 || urlEl?.value.trim() || $(`hlPreview_${i}`)?.src || '';

    highlights.push({
      id: i + 1,
      title: $(`hlTitle_${i}`)?.value.trim() || `Highlight #${i + 1}`,
      category: $(`hlCategory_${i}`)?.value.trim() || '',
      badge: $(`hlBadge_${i}`)?.value.trim() || '',
      image: img,
      metaLeft: $(`hlMetaLeft_${i}`)?.value.trim() || '',
      metaRight: $(`hlMetaRight_${i}`)?.value.trim() || '',
      link: $(`hlLink_${i}`)?.value || 'rundown'
    });
  }

  try {
    localStorage.setItem('kw_popular_highlights', JSON.stringify(highlights));
  } catch (err) {
    console.warn('localStorage error:', err);
  }

  try {
    await db.from('event_settings').update({
      popular_highlights: highlights
    }).eq('id', adminEventSettings?.id || 1);
  } catch (err) {
    console.log('Notice: Supabase event_settings save notice:', err);
  }

  if (btn) btn.disabled = false;
  if (msg) {
    msg.textContent = '✓ 4 Foto & Konten Popular Highlights beranda berhasil disimpan!';
    msg.style.color = '#119c58';
  }
  toast('Highlights beranda berhasil diperbarui!');
  loadAdminHighlights();
}

function resetAdminHighlights() {
  if (!confirm('Kembalikan 4 kartu highlights ke tampilan awal default?')) return;
  localStorage.removeItem('kw_popular_highlights');
  loadAdminHighlights();
  toast('Highlights dikembalikan ke pengaturan default.');
}

function exportAdminBackupJson() {
  const backupData = {
    appName: 'Family Gathering Kampoeng Waringin',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    eventSettings: adminEventSettings,
    popularHighlights: getAdminHighlightsData(),
    rundown: adminRundown,
    participantsAndSeats: adminData,
    attendance: adminAttendance,
    attendanceSessions: adminAttendanceSessions
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `backup_gathering_waringin_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('File backup JSON berhasil diunduh!');
}

// --------------------------------------------------------------------------
// 12. Initialization
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Login & Logout
  $('loginForm')?.addEventListener('submit', handleAdminLogin);
  $('logoutBtn')?.addEventListener('click', handleAdminLogout);

  // Sidebar Page Switcher
  document.querySelectorAll('.sidebtn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => goAdminPage(btn.dataset.page));
  });

  // Quick Action Buttons on Dashboard
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => goAdminPage(btn.dataset.goto));
  });

  // Participant Form
  $('seatForm')?.addEventListener('submit', saveAdminParticipant);
  $('participantSearch')?.addEventListener('input', renderParticipantRows);

  // Attendance Sessions
  $('startAttendanceSession')?.addEventListener('click', createAdminAttendanceSession);
  $('closeAttendanceSession')?.addEventListener('click', closeAdminAttendanceSession);
  $('attendanceFilter')?.addEventListener('input', updateAdminAttendanceTable);
  $('attendanceSessionFilter')?.addEventListener('change', updateAdminAttendanceTable);

  // Settings & Rundown
  $('eventSettingsForm')?.addEventListener('submit', saveAdminEventSettings);
  $('rundownForm')?.addEventListener('submit', saveAdminRundown);

  // Highlights & Backup
  $('saveHighlightsBtn')?.addEventListener('click', saveAdminHighlights);
  $('resetHighlightsBtn')?.addEventListener('click', resetAdminHighlights);
  $('createBackupBtn')?.addEventListener('click', exportAdminBackupJson);

  // Bind Highlights Cards Upload & Live Preview
  for (let i = 0; i < 4; i++) {
    const fileInput = $(`hlFileInput_${i}`);
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleHighlightFileUpload(e.target.files[0], i);
        }
      });
    }

    const urlInput = $(`hlUrl_${i}`);
    if (urlInput) {
      urlInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const prev = $(`hlPreview_${i}`);
        if (val && prev) {
          prev.src = val;
          delete urlInput.dataset.base64;
        }
      });
    }

    const badgeInput = $(`hlBadge_${i}`);
    if (badgeInput) {
      badgeInput.addEventListener('input', (e) => {
        const badgePrev = $(`hlBadgePreview_${i}`);
        if (badgePrev) badgePrev.textContent = e.target.value.trim() || 'Highlight';
      });
    }

    const titleInput = $(`hlTitle_${i}`);
    if (titleInput) {
      titleInput.addEventListener('input', (e) => {
        const heading = $(`hlCardHeading_${i}`);
        if (heading) {
          heading.textContent = e.target.value.trim() ? `Kartu #${i + 1}: ${e.target.value.trim()}` : `Kartu Highlight #${i + 1}`;
        }
      });
    }
  }

  // Reports
  $('exportCsv')?.addEventListener('click', exportAdminSeats);
  $('exportAttendance')?.addEventListener('click', exportAdminAttendance);
  $('printReport')?.addEventListener('click', () => window.print());

  // Check auth session on page load
  checkAdminAuth();
});
