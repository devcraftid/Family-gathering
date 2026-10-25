/**
 * Public Page Controller — Family Gathering Kampoeng Waringin
 * Handles public seat map, booking, search, attendance, rundown, community & gallery.
 */

let publicData = [];
let publicAttendanceData = [];
let publicAttendanceSessions = [];
let activeAttendanceSession = null;
let publicSelectedSeat = null;
let publicHighlightQuery = '';
let publicBookingEligible = false;
let publicEventSettings = {
  event_name: 'Family Gathering Kampoeng Waringin',
  event_date: '2026-11-01',
  destination: 'Kawah Putih, Bandung, Jawa Barat',
  gather_time: '06.00 WIB',
  meeting_point: 'Kantor Kampoeng Waringin',
  description: 'Wisata satu hari bersama keluarga besar Kampoeng Waringin menuju Kawah Putih.'
};
let publicRundownItems = [];

// --------------------------------------------------------------------------
// 1. Data Loading
// --------------------------------------------------------------------------
async function loadPublicData() {
  try {
    const { data: rows, error } = await db.from('kursi_bus')
      .select('nomor_kursi,nama,no_hp,updated_at')
      .order('nomor_kursi', { ascending: true });
    if (error) throw error;
    publicData = Array.isArray(rows) ? rows : [];
    renderPublicSeatMaps();
    updatePublicStats();
    updatePublicBookingDropdown();
    return publicData;
  } catch (err) {
    console.error('loadPublicData:', err);
    publicData = [];
    renderPublicSeatMaps();
    updatePublicStats();
    return [];
  }
}

async function loadPublicAttendance() {
  try {
    const { data: sessions, error: sessErr } = await db.from('attendance_sessions')
      .select('id,name,is_active,created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!sessErr && sessions) {
      publicAttendanceSessions = sessions;
      activeAttendanceSession = sessions.find(s => s.is_active) || null;
      renderPublicAttendanceSessionInfo();
      updatePublicAttendanceFilterOptions();
    }

    const { data: rows, error } = await db.from('absensi')
      .select('id,nama,nomor_kursi,waktu_absen,sumber,session_id')
      .order('waktu_absen', { ascending: false })
      .limit(1000);
    if (!error && rows) {
      publicAttendanceData = rows.map(r => ({
        ...r,
        session_name: publicAttendanceSessions.find(s => String(s.id) === String(r.session_id))?.name || 'Sesi Acara'
      }));
      renderPublicAttendanceList();
    }
  } catch (err) {
    console.warn('loadPublicAttendance:', err);
  }
}

async function loadPublicEventSettings() {
  try {
    const { data: row, error } = await db.from('event_settings').select('*').eq('id', 1).maybeSingle();
    if (!error && row) {
      if (row.destination) row.destination = stripCiwidey(row.destination);
      publicEventSettings = { ...publicEventSettings, ...row };
    }
    applyPublicEventSettings();
  } catch (err) {
    console.warn('loadPublicEventSettings:', err);
    applyPublicEventSettings();
  }
}

async function loadPublicRundown() {
  const pubBody = $('publicRundownRows');
  if (pubBody) pubBody.innerHTML = '<tr><td colspan="3" class="empty">Memuat jadwal kegiatan…</td></tr>';
  try {
    const { data: rows, error } = await db.from('rundown_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('start_time', { ascending: true });
    if (error) throw error;
    publicRundownItems = rows || [];
    renderPublicRundown();
  } catch (err) {
    console.warn('loadPublicRundown:', err);
    if (pubBody) pubBody.innerHTML = '<tr><td colspan="3" class="empty">Jadwal rundown belum tersedia. Hubungi panitia.</td></tr>';
  }
}

// --------------------------------------------------------------------------
// 2. Settings & Stats Application
// --------------------------------------------------------------------------
function applyPublicEventSettings() {
  const dateFormatted = formatEventDate(publicEventSettings.event_date);
  const loc = stripCiwidey(publicEventSettings.destination || 'Kawah Putih, Bandung, Jawa Barat');
  const gather = publicEventSettings.gather_time || '06.00 WIB';
  const meeting = publicEventSettings.meeting_point || 'Kantor Kampoeng Waringin';
  const name = publicEventSettings.event_name || 'Family Gathering Kampoeng Waringin';

  // Hero & Floating Travezia Widget elements
  if ($('landingDateText')) $('landingDateText').textContent = dateFormatted;
  if ($('landingDestText')) $('landingDestText').textContent = loc;
  if ($('landingGatherText')) $('landingGatherText').textContent = 'Berangkat ' + gather;
  if ($('landingCaptionDestination')) $('landingCaptionDestination').textContent = loc.split(',')[0].trim();
  if ($('travelStripFrom')) $('travelStripFrom').textContent = meeting;
  if ($('travelStripTo')) $('travelStripTo').textContent = loc;
  if ($('travelStripDate')) $('travelStripDate').textContent = dateFormatted;
  if ($('travelStripTime')) $('travelStripTime').textContent = gather;
  if ($('landingFooterName')) $('landingFooterName').textContent = name;
  if ($('landingFooterDestination')) $('landingFooterDestination').textContent = '© 2026 Kampoeng Waringin · ' + loc;

  // Premium App Footer elements
  if ($('footerDest')) $('footerDest').textContent = loc;
  if ($('footerDate')) $('footerDate').textContent = dateFormatted;
  if ($('footerMeeting')) $('footerMeeting').textContent = meeting;
  if ($('footerGather')) $('footerGather').textContent = 'Pukul ' + gather;
  if ($('footerCopy')) $('footerCopy').textContent = '© 2026 ' + name + ' · Hak Cipta Dilindungi';

  // Information page
  if ($('publicInfoDate')) $('publicInfoDate').textContent = dateFormatted;
  if ($('publicInfoDestination')) $('publicInfoDestination').textContent = loc;
  if ($('publicInfoGather')) $('publicInfoGather').textContent = gather;
  if ($('publicInfoMeeting')) $('publicInfoMeeting').textContent = meeting;
  if ($('publicInfoTitle')) $('publicInfoTitle').textContent = 'Informasi ' + name;
  if ($('publicInfoDescription')) $('publicInfoDescription').textContent = publicEventSettings.description || '';

  // Rundown page header
  if ($('publicRundownMeta')) $('publicRundownMeta').textContent = dateFormatted + ' · ' + loc;

  // Dynamic Popular Highlights Rendering (Uploaded / Configured by Admin)
  renderPublicPopularHighlights();
}

// --------------------------------------------------------------------------
// 2b. Dynamic Popular Highlights (Configurable by Admin)
// --------------------------------------------------------------------------
const DEFAULT_HIGHLIGHTS = [
  {
    image: 'img/banner-kawah-putih.jpg',
    badge: 'Top Rated',
    badgeClass: 'badge-top',
    title: 'Kawah Putih, Bandung',
    category: 'Wisata Alam · Kawah Vulkanik',
    metaLeft: 'Danau Belerang Eksotis',
    metaRight: 'Bandung, Jawa Barat',
    link: 'info'
  },
  {
    image: 'img/highlight-bus.jpg',
    badge: 'Fasilitas Utama',
    badgeClass: 'badge-popular',
    title: 'Bus Pariwisata HD 59 Seat',
    category: 'Armada Sewa Khusus · AC Dingin',
    metaLeft: 'Konfigurasi 2–3 Kursi',
    metaRight: 'Pilih Kursi ↗',
    link: 'booking'
  },
  {
    image: 'img/highlight-gather.jpg',
    badge: 'Trending',
    badgeClass: 'badge-trending',
    title: 'Kebersamaan Rombongan',
    category: 'Makan Siang · Ramah Tamah',
    metaLeft: 'Doorprize & Games',
    metaRight: 'Galeri & Ucapan ↗',
    link: 'community'
  },
  {
    image: 'img/highlight-date.jpg',
    badge: 'Keberangkatan',
    badgeClass: 'badge-seller',
    title: 'Kantor KP Waringin',
    category: 'Titik Kumpul · Pkl 06.00 WIB',
    metaLeft: '1 November 2026',
    metaRight: 'Lihat Rundown ↗',
    link: 'rundown'
  }
];

function getPublicHighlights() {
  let list = null;
  if (publicEventSettings.popular_highlights) {
    try {
      list = typeof publicEventSettings.popular_highlights === 'string'
        ? JSON.parse(publicEventSettings.popular_highlights)
        : publicEventSettings.popular_highlights;
    } catch (_e) {}
  }
  if (!list || !Array.isArray(list) || list.length === 0) {
    try {
      const stored = localStorage.getItem('kw_popular_highlights');
      if (stored) list = JSON.parse(stored);
    } catch (_e) {}
  }
  return (Array.isArray(list) && list.length === 4) ? list : DEFAULT_HIGHLIGHTS;
}

function renderPublicPopularHighlights() {
  const container = $('popularDestinationsGrid');
  if (!container) return;

  const items = getPublicHighlights();
  container.innerHTML = items.map((item, idx) => {
    const badgeClass = item.badgeClass || (['badge-top', 'badge-popular', 'badge-trending', 'badge-seller'][idx] || 'badge-top');
    const targetLink = item.link || 'info';
    return `
      <article class="popular-card" onclick="showPublicPage('${esc(targetLink)}')">
        <div class="popular-card-image">
          <img src="${esc(item.image)}" alt="${esc(item.title)}">
          <span class="popular-badge ${esc(badgeClass)}">${esc(item.badge || 'Highlight')}</span>
          <div class="popular-card-gradient"></div>
          <div class="popular-card-overlay">
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.category || '')}</p>
            <div class="popular-card-meta">
              <b>${esc(item.metaLeft || '')}</b>
              <span>${esc(item.metaRight || 'Lihat Detail ↗')}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function updatePublicStats() {
  const taken = publicData.filter(r => r.nama && Number(r.nomor_kursi) >= 1 && Number(r.nomor_kursi) <= 59).length;
  const free = 59 - taken;
  if ($('pubTaken')) $('pubTaken').textContent = `${taken}/59`;
  if ($('pubFree')) $('pubFree').textContent = free;
}

// --------------------------------------------------------------------------
// 3. Seat Map Renderer
// --------------------------------------------------------------------------
function recordSeat(n) {
  return publicData.find(r => Number(r.nomor_kursi) === Number(n));
}

function createSeatElement(n) {
  if (!n) {
    const aisle = document.createElement('div');
    aisle.className = 'aisle';
    return aisle;
  }

  const r = recordSeat(n);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'seat';

  if (r?.nama) btn.classList.add('taken');
  if (publicSelectedSeat === n) btn.classList.add('selected');
  if (publicHighlightQuery && (String(n) === publicHighlightQuery || (r?.nama || '').toLowerCase().includes(publicHighlightQuery))) {
    btn.classList.add('searchhit');
  }

  btn.innerHTML = `<span class="num">${n}</span><span class="name">${r?.nama ? esc(r.nama) : 'Kosong'}</span>`;
  btn.title = `Kursi ${n}${r?.nama ? ' — ' + r.nama : ' — Kosong'}`;

  btn.addEventListener('click', () => {
    publicSelectedSeat = n;
    showPublicSeatDetails(n);
    renderPublicSeatMaps();
  });

  return btn;
}

function renderPublicSeatMaps() {
  ['pubSeats', 'publicFindSeats'].forEach(id => {
    const host = $(id);
    if (!host) return;
    host.replaceChildren();
    rowSets.forEach(nums => {
      const row = document.createElement('div');
      row.className = 'seatrow';
      nums.forEach(n => row.append(createSeatElement(n)));
      host.append(row);
    });
  });

  ['pubRear', 'publicFindRear'].forEach(id => {
    const tail = $(id);
    if (!tail) return;
    tail.replaceChildren();
    rear.forEach(n => tail.append(createSeatElement(n)));
  });
}

function showPublicSeatDetails(n) {
  const r = recordSeat(n);
  const infoEl = $('publicSeatInfo');
  if (infoEl) {
    infoEl.innerHTML = `
      <div style="font-size:13px; font-weight:800; color:#123e31">Kursi Nomor ${n}</div>
      <div style="font-size:12px; margin-top:4px">Status: <strong style="color:${r?.nama ? '#16a34a' : '#dc2626'}">${r?.nama ? 'TERISI' : 'TERSEDIA (KOSONG)'}</strong></div>
      ${r?.nama ? `<div style="font-size:11px; color:#50655c; margin-top:2px">Nama Peserta: <b>${esc(r.nama)}</b></div>` : ''}
    `;
  }
}

// --------------------------------------------------------------------------
// 4. Booking System (Public)
// --------------------------------------------------------------------------
function updatePublicBookingDropdown() {
  const sel = $('publicBookingSeat');
  if (!sel) return;

  const previous = sel.value;
  const free = Array.from({ length: 59 }, (_, i) => i + 1).filter(n => !recordSeat(n)?.nama);

  sel.replaceChildren(new Option('Pilih kursi tersedia…', ''));
  free.forEach(n => sel.add(new Option(`Kursi ${n}`, n)));

  if (free.includes(Number(previous))) sel.value = previous;
  sel.disabled = free.length === 0 || !publicBookingEligible;
}

async function checkPublicBookingPayment() {
  const name = ($('publicBookingName')?.value || '').trim();
  const statusEl = $('publicBookingPaymentStatus');
  publicBookingEligible = false;
  if ($('publicBookingSeat')) $('publicBookingSeat').disabled = true;

  if (!name) {
    if (statusEl) statusEl.textContent = 'Masukkan nama peserta yang sudah terdaftar dan lunas untuk membuka pilihan kursi.';
    return;
  }

  // Check if name is already booked
  const booked = publicData.find(r => r.nama && (r.nama || '').trim().toLowerCase() === name.toLowerCase());
  if (booked) {
    if (statusEl) statusEl.textContent = `Nama "${name}" sudah terdaftar pada Kursi ${booked.nomor_kursi}. Hubungi panitia jika perlu mengubah kursi.`;
    return;
  }

  if (statusEl) statusEl.textContent = 'Memeriksa status pembayaran…';

  try {
    const { data: rows, error } = await db.from('participant_paid_roster')
      .select('nama,status_pembayaran')
      .ilike('nama', name)
      .limit(10);

    const payment = (!error && rows) ? rows.find(r => (r.nama || '').trim().toLowerCase() === name.toLowerCase()) : null;

    if (payment && payment.status_pembayaran === 'lunas') {
      publicBookingEligible = true;
      if (statusEl) statusEl.innerHTML = `<span style="color:#16a34a; font-weight:750">✓ Pembayaran LUNAS terverifikasi. Silakan pilih nomor kursi kosong di bawah.</span>`;
    } else {
      if (statusEl) statusEl.innerHTML = `<span style="color:#dc2626; font-weight:700">⚠ Pembayaran belum lunas atau nama belum terdaftar. Hubungi panitia untuk verifikasi pembayaran.</span>`;
    }
  } catch (err) {
    console.warn('checkPayment:', err);
    if (statusEl) statusEl.textContent = 'Gagal memeriksa pembayaran. Pastikan koneksi internet stabil.';
  }

  updatePublicBookingDropdown();
}

async function submitPublicBooking(e) {
  e.preventDefault();
  const name = $('publicBookingName').value.trim();
  const seat = Number($('publicBookingSeat').value);
  const phone = $('publicBookingPhone').value.trim();
  const msgEl = $('publicBookingMsg');
  const btn = $('publicBookingSubmit');

  if (name.length < 2) {
    msgEl.textContent = 'Nama minimal 2 karakter.';
    return;
  }
  if (!Number.isInteger(seat) || seat < 1 || seat > 59) {
    msgEl.textContent = 'Pilih nomor kursi yang tersedia.';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Menyimpan Booking…';
  msgEl.textContent = 'Menghubungkan ke database…';

  try {
    // Atomic update only if seat is still empty
    const { data: updated, error } = await db.from('kursi_bus')
      .update({ nama: name, no_hp: phone || null, updated_at: new Date().toISOString() })
      .eq('nomor_kursi', seat)
      .is('nama', null)
      .select('nomor_kursi,nama');

    if (error) throw error;
    if (!updated || updated.length === 0) {
      await loadPublicData();
      msgEl.textContent = `Maaf, Kursi ${seat} baru saja dipesan peserta lain. Silakan pilih kursi lain.`;
      return;
    }

    msgEl.innerHTML = `<span style="color:#16a34a; font-weight:750">✓ Booking Berhasil! Kursi ${seat} atas nama ${esc(name)}.</span>`;
    toast(`Booking Kursi ${seat} berhasil disimpan!`);

    $('publicBookingForm').reset();
    publicBookingEligible = false;
    await loadPublicData();
  } catch (err) {
    msgEl.textContent = 'Booking gagal: ' + (err.message || 'Periksa koneksi internet.');
    console.error('submitPublicBooking:', err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Konfirmasi Booking';
  }
}

// --------------------------------------------------------------------------
// 5. Attendance (Public)
// --------------------------------------------------------------------------
function renderPublicAttendanceSessionInfo() {
  const active = !!activeAttendanceSession;
  const title = active ? activeAttendanceSession.name : 'Sesi absensi belum dibuka';
  if ($('publicAttendanceSessionTitle')) $('publicAttendanceSessionTitle').textContent = active ? `Sesi Aktif: ${title}` : 'Sesi Absensi Belum Dibuka';
  if ($('publicAttendanceSessionStatus')) {
    $('publicAttendanceSessionStatus').textContent = active
      ? `Sesi "${title}" sedang dibuka. Masukkan nama dan nomor kursi Anda untuk mencatat kehadiran.`
      : 'Absensi saat ini sedang ditutup oleh panitia. Anda dapat melihat riwayat absensi di bawah.';
  }
  if ($('manualAttend')) $('manualAttend').disabled = !active;
}

function updatePublicAttendanceFilterOptions() {
  const sel = $('publicAttendanceSessionFilter');
  if (!sel) return;
  sel.replaceChildren(new Option('Semua sesi', 'all'));
  publicAttendanceSessions.forEach(s => {
    sel.add(new Option(s.name + (s.is_active ? ' (Aktif)' : ''), String(s.id)));
  });
}

function renderPublicAttendanceList() {
  const body = $('publicAttendanceRows');
  if (!body) return;
  const filter = $('publicAttendanceSessionFilter')?.value || 'all';
  const rows = publicAttendanceData.filter(r => filter === 'all' || String(r.session_id) === filter);

  if ($('publicAttendanceCount')) {
    $('publicAttendanceCount').textContent = `${rows.length} catatan kehadiran tercatat.`;
  }

  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="5" class="empty">Belum ada riwayat absensi untuk sesi ini.</td></tr>';
    return;
  }

  body.innerHTML = rows.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><span class="connection-ok">${esc(r.session_name || 'Sesi Acara')}</span></td>
      <td><b>${esc(r.nama || '—')}</b></td>
      <td>Kursi ${esc(r.nomor_kursi || '—')}</td>
      <td>${r.waktu_absen ? new Date(r.waktu_absen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '—'}</td>
    </tr>
  `).join('');
}

async function submitPublicAttendance(e) {
  e.preventDefault();
  if (!activeAttendanceSession) {
    toast('Sesi absensi belum dibuka oleh panitia.');
    return;
  }

  const name = $('manualAttendName').value.trim();
  const seat = Number($('manualAttendSeat').value);
  const phone = $('manualAttendPhone').value.trim();
  const msgEl = $('qrMsg');
  const btn = $('manualAttend');

  if (name.length < 2) {
    msgEl.textContent = 'Nama minimal 2 karakter.';
    return;
  }

  // Validate that name and seat match
  const person = publicData.find(r => (r.nama || '').trim().toLowerCase() === name.toLowerCase());
  if (!person) {
    msgEl.textContent = `Nama "${name}" tidak ditemukan di daftar kursi. Pastikan Anda sudah memesan kursi terlebih dahulu.`;
    return;
  }
  if (Number(person.nomor_kursi) !== seat) {
    msgEl.textContent = `Nomor kursi salah. Berdasarkan data panitia, ${person.nama} berada di Kursi ${person.nomor_kursi}.`;
    return;
  }

  // Check if already checked in for this session
  const alreadyCheckedIn = publicAttendanceData.some(r =>
    String(r.session_id) === String(activeAttendanceSession.id) &&
    (r.nama || '').trim().toLowerCase() === name.toLowerCase()
  );
  if (alreadyCheckedIn) {
    msgEl.textContent = `Anda sudah melakukan absensi untuk sesi "${activeAttendanceSession.name}".`;
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Mengirim Absensi…';

  try {
    const payload = {
      nama: person.nama,
      nomor_kursi: seat,
      nomor_wa: phone || null,
      session_id: activeAttendanceSession.id,
      sumber: 'Mandiri (Web)',
      waktu_absen: new Date().toISOString()
    };

    const { error } = await db.from('absensi').insert(payload);
    if (error) throw error;

    msgEl.innerHTML = `<span style="color:#16a34a; font-weight:750">✓ Absensi Berhasil dicatat untuk ${esc(person.nama)} (Kursi ${seat}). Terima kasih!</span>`;
    toast(`Absensi berhasil: ${person.nama}`);
    $('publicAttendForm').reset();
    await loadPublicAttendance();
  } catch (err) {
    msgEl.textContent = 'Gagal menyimpan absensi: ' + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Kirim Absensi';
  }
}

// --------------------------------------------------------------------------
// 6. Public Search
// --------------------------------------------------------------------------
function publicSearch() {
  const q = ($('publicSearch')?.value || '').trim().toLowerCase();
  const box = $('publicSearchResults');
  if (!box) return;

  publicHighlightQuery = q;
  renderPublicSeatMaps();

  if (!q) {
    box.replaceChildren();
    return;
  }

  const results = publicData.filter(r =>
    String(r.nomor_kursi) === q ||
    (r.nama || '').toLowerCase().includes(q) ||
    (r.no_hp || '').toLowerCase().includes(q)
  );

  if (!results.length) {
    box.innerHTML = '<p class="status">Peserta tidak ditemukan. Periksa ejaan atau hubungi panitia.</p>';
    return;
  }

  box.innerHTML = results.map(r => `
    <div class="infobox" style="margin-bottom:8px">
      <b>${esc(r.nama || 'Kosong')}</b>
      <div class="status" style="font-size:12px; margin-top:2px">Bus 1 · Kursi <strong>${r.nomor_kursi}</strong></div>
      <span class="status" style="color:${r.nama ? '#16a34a' : '#dc2626'}">${r.nama ? 'Kursi sudah terisi' : 'Kursi kosong'}</span>
    </div>
  `).join('');
}

// --------------------------------------------------------------------------
// 7. Rundown & WhatsApp Copy
// --------------------------------------------------------------------------
function renderPublicRundown() {
  const body = $('publicRundownRows');
  if (!body) return;
  if (!publicRundownItems.length) {
    body.innerHTML = '<tr><td colspan="3" class="empty">Rundown sedang disiapkan oleh panitia.</td></tr>';
    return;
  }

  body.innerHTML = publicRundownItems.map(r => `
    <tr>
      <td style="padding:12px; white-space:nowrap; font-weight:750; color:var(--kw-primary)">
        ${esc((r.start_time || '').slice(0, 5))} – ${esc((r.end_time || '').slice(0, 5))}
      </td>
      <td style="padding:12px">
        <b>${esc(r.title)}</b>
      </td>
      <td style="padding:12px; color:#50655c">
        ${esc(r.description || '—')}
      </td>
    </tr>
  `).join('');
}

function copyRundownWhatsApp() {
  const name = publicEventSettings.event_name || 'Family Gathering Kampoeng Waringin';
  const date = formatEventDate(publicEventSettings.event_date);
  const loc = stripCiwidey(publicEventSettings.destination || 'Kawah Putih, Bandung');

  let text = `*RUNDOWN ${name.toUpperCase()}*\n📅 Tanggal: ${date}\n📍 Tujuan: ${loc}\n\n`;
  if (publicRundownItems.length) {
    publicRundownItems.forEach((r, i) => {
      text += `${i + 1}. *${(r.start_time || '').slice(0, 5)}–${(r.end_time || '').slice(0, 5)} | ${r.title}*\n`;
      if (r.description) text += `   ${r.description}\n`;
    });
  } else {
    text += 'Jadwal rundown belum tersedia.\n';
  }
  text += '\nMohon perhatikan waktu dan arahan panitia rombongan Kampoeng Waringin.';

  navigator.clipboard.writeText(text).then(() => {
    toast('Rundown berhasil disalin untuk WhatsApp!');
  }).catch(() => {
    toast('Gagal menyalin. Silakan salin manual.');
  });
}

// --------------------------------------------------------------------------
// 8. Navigation & Page Controller
// --------------------------------------------------------------------------
function showPublicPage(page, options = {}) {
  const valid = ['home', 'find', 'booking', 'payment-extra', 'info', 'attendance', 'rundown', 'community'].includes(page) ? page : 'home';

  // Update browser URL
  if (!options.skipUrlSync) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('absen');
      if (valid === 'home') url.searchParams.delete('page');
      else url.searchParams.set('page', valid);
      history.pushState({ publicPage: valid }, '', url.pathname + url.search + url.hash);
    } catch (_e) {}
  }

  // Toggle sections
  document.querySelectorAll('.public-view-section').forEach(el => {
    el.classList.toggle('hidden', el.id !== 'publicPage-' + valid);
  });

  // Toggle active desktop nav buttons
  document.querySelectorAll('.public-nav-btn[data-public-page]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.publicPage === valid);
  });

  // Update mobile bottom nav active state!
  if (typeof updateBottomNavActive === 'function') {
    updateBottomNavActive(valid);
  }

  if (valid === 'find') {
    setTimeout(() => $('publicSearch')?.focus(), 60);
    renderPublicSeatMaps();
  }
  if (valid === 'booking') {
    updatePublicBookingDropdown();
  }
  if (valid === 'attendance') {
    setTimeout(() => $('manualAttendName')?.focus(), 60);
  }

  if (valid === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    $('publicView')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// --------------------------------------------------------------------------
// 9. Event Listeners Initialization
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Desktop Nav Buttons
  document.querySelectorAll('[data-public-page]').forEach(btn => {
    btn.addEventListener('click', () => showPublicPage(btn.dataset.publicPage));
  });

  // Back Buttons
  document.querySelectorAll('[data-public-back]').forEach(btn => {
    btn.addEventListener('click', () => showPublicPage('home'));
  });

  // Booking Form
  $('publicBookingForm')?.addEventListener('submit', submitPublicBooking);
  let checkTimer;
  $('publicBookingName')?.addEventListener('input', () => {
    clearTimeout(checkTimer);
    checkTimer = setTimeout(checkPublicBookingPayment, 350);
  });

  // Attendance Form
  $('publicAttendForm')?.addEventListener('submit', submitPublicAttendance);
  $('publicAttendanceSessionFilter')?.addEventListener('change', renderPublicAttendanceList);

  // Search
  $('publicSearchBtn')?.addEventListener('click', publicSearch);
  $('publicSearch')?.addEventListener('input', publicSearch);

  // Copy Rundown
  $('copyPublicRundownBtn')?.addEventListener('click', copyRundownWhatsApp);

  // Hubungi Admin WhatsApp Button Handlers
  const openCsWhatsApp = () => {
    const phone = '62895329043389';
    const msg = encodeURIComponent('Halo Panitia Family Gathering Kampoeng Waringin, saya ingin bertanya tentang acara ke Kawah Putih.');
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener');
  };
  $('quickWhatsAppBtn')?.addEventListener('click', openCsWhatsApp);
  $('headerCsBtn')?.addEventListener('click', openCsWhatsApp);

  // Gallery Lightbox Handlers
  window.openLightbox = function(src) {
    const modal = $('galleryLightbox');
    const img = $('galleryLightboxImage');
    if (modal && img) {
      img.src = src;
      modal.classList.add('open');
    }
  };
  window.closeLightbox = function() {
    const modal = $('galleryLightbox');
    if (modal) modal.classList.remove('open');
  };
  $('closeGalleryLightbox')?.addEventListener('click', window.closeLightbox);
  $('galleryLightbox')?.addEventListener('click', (e) => {
    if (e.target === $('galleryLightbox')) window.closeLightbox();
  });

  // Initial Route Check
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  const absenParam = urlParams.get('absen');

  if (absenParam === '1') {
    showPublicPage('attendance', { skipUrlSync: true });
  } else if (pageParam) {
    showPublicPage(pageParam, { skipUrlSync: true });
  } else {
    showPublicPage('home', { skipUrlSync: true });
  }

  // Fetch all initial data
  Promise.allSettled([
    loadPublicData(),
    loadPublicAttendance(),
    loadPublicEventSettings(),
    loadPublicRundown()
  ]);
});
