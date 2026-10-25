/**
 * Mobile Bottom Navigation & "Lainnya" (More Menu) Drawer Modal
 * Provides 4 bottom items on mobile (3 main + 1 "Lainnya")
 * and an interactive bottom sheet drawer displaying all menus with descriptions.
 */

// All Public Menus with Descriptions (Keterangan)
const PUBLIC_MENUS = [
  {
    id: 'home',
    title: 'Beranda',
    subtitle: 'Halaman utama, sambutan & rangkuman acara ke Kawah Putih',
    icon: 'home',
    color: '#0b6048',
    bg: '#e8f5f1'
  },
  {
    id: 'booking',
    title: 'Pilih Kursi Bus',
    subtitle: 'Pilih nomor kursi bus pariwisata 59 seat dan konfirmasi',
    icon: 'bus',
    color: '#1d4ed8',
    bg: '#eff6ff'
  },
  {
    id: 'attendance',
    title: 'Absensi QR Peserta',
    subtitle: 'Catat kehadiran mandiri atau scan QR saat keberangkatan',
    icon: 'qr',
    color: '#059669',
    bg: '#ecfdf5'
  },
  {
    id: 'find',
    title: 'Denah & Cari Peserta',
    subtitle: 'Cek denah posisi duduk bus dan cari nama peserta terdaftar',
    icon: 'search',
    color: '#7c3aed',
    bg: '#f5f3ff'
  },
  {
    id: 'rundown',
    title: 'Rundown Acara',
    subtitle: 'Jadwal lengkap kegiatan dari titik kumpul hingga pulang',
    icon: 'calendar',
    color: '#d97706',
    bg: '#fffbeb'
  },
  {
    id: 'info',
    title: 'Panduan Informasi',
    subtitle: 'Peta rute Kawah Putih, titik kumpul kantor & panduan rombongan',
    icon: 'info',
    color: '#4f46e5',
    bg: '#eef2ff'
  },
  {
    id: 'community',
    title: 'Galeri Foto',
    subtitle: 'Dokumentasi foto, ucapan kesan peserta & kontak panitia',
    icon: 'gallery',
    color: '#e11d48',
    bg: '#fff1f2'
  },
  {
    id: 'cs-help',
    title: 'Hubungi Admin',
    subtitle: 'Bantuan via WhatsApp langsung ke panitia untuk kendala & pertanyaan',
    icon: 'cs',
    color: '#059669',
    bg: '#ecfdf5',
    isCsAction: true
  },
  {
    id: 'admin',
    title: 'Profil Admin',
    subtitle: 'Khusus panitia untuk manajemen peserta, scanner QR & pengaturan',
    icon: 'profile',
    color: '#0f172a',
    bg: '#f1f5f9',
    isAdminLink: true
  }
];

function initMobileBottomNav() {
  // If already rendered, skip
  if ($('mobileBottomNav')) return;

  // 1. Create Bottom Navigation Bar (4 items: 3 primary + 1 Lainnya)
  const nav = document.createElement('nav');
  nav.id = 'mobileBottomNav';
  nav.className = 'mobile-bottom-nav';
  nav.setAttribute('aria-label', 'Navigasi Bawah Mobile');

  nav.innerHTML = `
    <div class="bottom-nav-inner">
      <button type="button" class="bottom-nav-item active" data-bottom-page="home" aria-label="Beranda: Halaman Utama">
        <span class="bottom-nav-icon">${getIcon('home')}</span>
        <span class="bottom-nav-label">Beranda</span>
        <span class="bottom-nav-sub">Utama</span>
      </button>

      <button type="button" class="bottom-nav-item" data-bottom-page="booking" aria-label="Kursi Bus: Denah & Booking">
        <span class="bottom-nav-icon">${getIcon('bus')}</span>
        <span class="bottom-nav-label">Kursi Bus</span>
        <span class="bottom-nav-sub">59 Seat HD</span>
      </button>

      <button type="button" class="bottom-nav-item" data-bottom-page="attendance" aria-label="Absensi: Scan & Kehadiran">
        <span class="bottom-nav-icon">${getIcon('qr')}</span>
        <span class="bottom-nav-label">Absensi</span>
        <span class="bottom-nav-sub">Kehadiran</span>
      </button>

      <button type="button" class="bottom-nav-item" id="bottomNavMoreBtn" aria-label="Lainnya: Lihat Semua Menu" aria-haspopup="dialog" aria-expanded="false">
        <span class="bottom-nav-icon">${getIcon('more')}</span>
        <span class="bottom-nav-label">Lainnya</span>
        <span class="bottom-nav-sub">Semua Menu</span>
      </button>
    </div>
  `;

  document.body.appendChild(nav);

  // 2. Create "Lainnya" Drawer Bottom Sheet Modal
  const drawer = document.createElement('div');
  drawer.id = 'mobileMenuDrawer';
  drawer.className = 'mobile-menu-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', 'Semua Menu Acara Family Gathering');

  drawer.innerHTML = `
    <div class="drawer-backdrop" id="drawerBackdrop"></div>
    <div class="drawer-panel" id="drawerPanel">
      <div class="drawer-handle-bar">
        <div class="drawer-handle"></div>
      </div>
      <div class="drawer-header">
        <div class="drawer-header-text">
          <h3>Semua Menu Acara</h3>
          <p>Pilih menu untuk membuka halaman acara</p>
        </div>
        <button type="button" class="drawer-close-btn" id="drawerCloseBtn" aria-label="Tutup Menu">
          ${getIcon('close')}
        </button>
      </div>
      
      <div class="drawer-body">
        <div class="drawer-menu-list" id="drawerMenuList">
          ${PUBLIC_MENUS.map(m => `
            <button type="button" class="drawer-menu-item" data-drawer-page="${m.id}" ${m.isAdminLink ? 'data-is-admin="true"' : ''} ${m.isCsAction ? 'data-is-cs="true"' : ''}>
              <div class="drawer-menu-icon" style="background:${m.bg}; color:${m.color}">
                ${getIcon(m.icon)}
              </div>
              <div class="drawer-menu-info">
                <span class="drawer-menu-title">${m.title}</span>
                <span class="drawer-menu-desc">${m.subtitle}</span>
              </div>
              <div class="drawer-menu-arrow">
                ${getIcon('chevronRight')}
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(drawer);

  // Bind Events
  // Bottom Bar buttons
  nav.querySelectorAll('[data-bottom-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.bottomPage;
      if (typeof showPublicPage === 'function') {
        showPublicPage(page);
      }
      closeMenuDrawer();
      updateBottomNavActive(page);
    });
  });

  // More Button
  const moreBtn = $('bottomNavMoreBtn');
  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      toggleMenuDrawer();
    });
  }

  // Close Drawer Button & Backdrop
  $('drawerCloseBtn')?.addEventListener('click', closeMenuDrawer);
  $('drawerBackdrop')?.addEventListener('click', closeMenuDrawer);

  // Drawer Menu Items
  drawer.querySelectorAll('[data-drawer-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.drawerPage;
      const isAdminLink = btn.dataset.isAdmin === 'true';
      const isCsAction = btn.dataset.isCs === 'true';

      if (isCsAction) {
        const phone = '62895329043389';
        const msg = encodeURIComponent('Halo Panitia Family Gathering Kampoeng Waringin, saya ingin bertanya tentang acara ke Kawah Putih.');
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener');
        closeMenuDrawer();
        return;
      }

      if (isAdminLink) {
        window.location.href = 'admin.html';
        return;
      }

      if (typeof showPublicPage === 'function') {
        showPublicPage(page);
      }
      closeMenuDrawer();
      updateBottomNavActive(page);
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeMenuDrawer();
    }
  });
}

function openMenuDrawer() {
  const drawer = $('mobileMenuDrawer');
  const moreBtn = $('bottomNavMoreBtn');
  if (!drawer) return;
  drawer.classList.add('open');
  document.body.classList.add('drawer-open');
  if (moreBtn) {
    moreBtn.classList.add('active');
    moreBtn.setAttribute('aria-expanded', 'true');
  }
}

function closeMenuDrawer() {
  const drawer = $('mobileMenuDrawer');
  const moreBtn = $('bottomNavMoreBtn');
  if (!drawer) return;
  drawer.classList.remove('open');
  document.body.classList.remove('drawer-open');
  if (moreBtn) {
    moreBtn.setAttribute('aria-expanded', 'false');
    // Only keep active if current active page is not one of the bottom 3
    const activeBottom = document.querySelector('.bottom-nav-item.active:not(#bottomNavMoreBtn)');
    if (activeBottom) {
      moreBtn.classList.remove('active');
    }
  }
}

function toggleMenuDrawer() {
  const drawer = $('mobileMenuDrawer');
  if (!drawer) return;
  if (drawer.classList.contains('open')) {
    closeMenuDrawer();
  } else {
    openMenuDrawer();
  }
}

function updateBottomNavActive(page) {
  const nav = $('mobileBottomNav');
  if (!nav) return;

  nav.querySelectorAll('.bottom-nav-item').forEach(btn => {
    btn.classList.remove('active');
  });

  const matchingBottom = nav.querySelector(`[data-bottom-page="${page}"]`);
  if (matchingBottom) {
    matchingBottom.classList.add('active');
  } else {
    // If current page is one of the hidden menus (e.g. find, rundown, info, community),
    // highlight the "Lainnya" button!
    const moreBtn = $('bottomNavMoreBtn');
    if (moreBtn) {
      moreBtn.classList.add('active');
    }
  }

  // Also update active in drawer items
  const drawer = $('mobileMenuDrawer');
  if (drawer) {
    drawer.querySelectorAll('.drawer-menu-item').forEach(item => {
      const isMatch = item.dataset.drawerPage === page;
      item.classList.toggle('active', isMatch);
    });
  }
}

document.addEventListener('DOMContentLoaded', initMobileBottomNav);
