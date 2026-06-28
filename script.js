// ============================================================
//  FIREBASE CONFIG
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD7WByWwZt_wwyUqyuQu0UOeJMY1fc7Y2U",
  authDomain: "saung-kuring.firebaseapp.com",
  projectId: "saung-kuring",
  storageBucket: "saung-kuring.firebasestorage.app",
  messagingSenderId: "578579117702",
  appId: "1:578579117702:web:12ab67456c239a3bf00307",
  measurementId: "G-STVKTN532R",
  databaseURL: "https://saung-kuring-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ============================================================
//  DATA MENU (lokal, bisa di-manage admin)
// ============================================================
let menu = [
  { id:1,  nama:'Nasi Timbel',  jenis:'makanan', harga:22000, emoji:'🍱', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-3JNj1UHggfyqcqxP5WZdvkFnzaUW6S4ba9GYIreh6Q&s=10', desc:'Nasi bungkus daun pisang dengan lauk khas Sunda' },
  { id:2,  nama:'Soto Bandung', jenis:'makanan', harga:18000, emoji:'🍲', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCmEs0Q8xjo23rvL0dTo2DQQDf5_HNmUxxSVUfEya7WQ&s=10', desc:'Soto kuah bening dengan daging sapi dan lobak' },
  { id:3,  nama:'Batagor',      jenis:'makanan', harga:15000, emoji:'🥟', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShueDudO7UY-pLRvT0INulyWUf9oObhvjTpb52CeCguA&s=10', desc:'Bakso tahu goreng dengan bumbu kacang pedas' },
  { id:4,  nama:'Karedok',      jenis:'makanan', harga:14000, emoji:'🥗', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2wfgDLQnDUnTIfmOO9jK3lXLPIlBnD2YPtV4uVypeQw&s=10', desc:'Sayuran segar dengan saus kacang kencur' },
  { id:5,  nama:'Seblak',       jenis:'makanan', harga:16000, emoji:'🍜', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHT1FquY0gHE0tgxXDTdob0KdGtvrBnUHebDyRocvuUQ&s=10', desc:'Kerupuk pedas bumbu kencur khas Bandung' },
  { id:6,  nama:'Nasi Liwet',   jenis:'makanan', harga:20000, emoji:'🍚', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTArgfwIU_x9QTkKZluwqOyuYYapBhFZc6NPTmCKB6V2w&s=10', desc:'Nasi gurih dimasak dengan santan dan rempah' },
  { id:7,  nama:'Bajigur',      jenis:'minuman', harga:8000,  emoji:'☕', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSc7_rJ7fJLHZ9jn7Jc6fqBCWdpGr2UF-W8DnSrohHxOA&s=10', desc:'Minuman hangat santan gula aren khas Sunda' },
  { id:8,  nama:'Es Cendol',    jenis:'minuman', harga:9000,  emoji:'🧉', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5yTV9W-gRAox9V0zROrsCq_W4Xdaff2K5dHCn9Ee0Yg&s=10', desc:'Minuman segar cendol hijau dengan gula aren' },
  { id:9,  nama:'Bandrek',      jenis:'minuman', harga:8000,  emoji:'🫗', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfWYzefGvFL_iMbeJ9TkU2RbBmOWEG02lKdbrbDvxJXg&s=10', desc:'Minuman rempah jahe serai yang menghangatkan' },
];

// ============================================================
//  STATE
// ============================================================
let pesanan      = {};   // data dari Firebase { firebaseKey: orderObj }
let keranjang    = [];
let nextMenuId   = 10;
let peranLogin   = null;
let filterAktif  = 'semua';
let idPesananSaya = [];  // firebase keys milik pembeli sesi ini

// ============================================================
//  FIREBASE — LISTEN PESANAN REAL-TIME
// ============================================================
const pesananRef = ref(db, 'pesanan');

onValue(pesananRef, (snapshot) => {
  pesanan = snapshot.val() || {};
  // Re-render halaman yang sedang aktif
  const aktif = document.querySelector('.halaman.aktif');
  if (!aktif) return;
  const id = aktif.id;
  if (id === 'hal-kasir')         renderKasir();
  if (id === 'hal-status-pesanan') renderStatusPesanan();
  if (id === 'hal-admin')         renderAdmin();
});

// ============================================================
//  FIREBASE — LISTEN MENU REAL-TIME
// ============================================================
const menuRef = ref(db, 'menu');

onValue(menuRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    // Konversi object Firebase ke array
    menu = Object.entries(data).map(([key, val]) => ({ ...val, fbKey: key }));
    nextMenuId = menu.length ? Math.max(...menu.map(m => m.id)) + 1 : 1;
  }
  const aktif = document.querySelector('.halaman.aktif');
  if (!aktif) return;
  const id = aktif.id;
  if (id === 'hal-home')  renderHome();
  if (id === 'hal-menu')  renderMenu();
  if (id === 'hal-pesan') renderPesanGrid();
  if (id === 'hal-admin') renderAdmin();
});

// Inisialisasi menu ke Firebase kalau belum ada
function initMenuFirebase() {
  const r = ref(db, 'menu');
  onValue(r, (snap) => {
    if (!snap.exists()) {
      // Push semua menu default ke Firebase
      menu.forEach(m => push(ref(db, 'menu'), m));
    }
  }, { onlyOnce: true });
}

// ============================================================
//  NAVIGASI
// ============================================================
function buka(nama) {
  document.querySelectorAll('.halaman').forEach(h => h.classList.remove('aktif'));
  document.getElementById('hal-' + nama).classList.add('aktif');
  window.scrollTo(0, 0);

  if (nama === 'home')           renderHome();
  if (nama === 'menu')           renderMenu();
  if (nama === 'pesan')          renderPesanGrid();
  if (nama === 'status-pesanan') renderStatusPesanan();
  if (nama === 'kasir')          renderKasir();
  if (nama === 'admin')          renderAdmin();
  if (nama === 'qr-page')        setTimeout(buatSemuaQR, 300);
}

// ============================================================
//  RENDER KARTU MENU
// ============================================================
function buatKartu(item, mode) {
  const gambar = item.foto
    ? `<img src="${item.foto}" alt="${item.nama}" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=font-size:3.5rem>${item.emoji}</span>';"/>`
    : `<span style="font-size:3.5rem;">${item.emoji}</span>`;

  const tombol = mode === 'pesan'
    ? `<button class="btn-keranjang" onclick="tambahKeranjang(${item.id})">+ Tambah ke Keranjang</button>`
    : `<button class="btn-keranjang" onclick="buka('pesan')">Pesan Sekarang</button>`;

  return `
    <div class="kartu">
      <div class="kartu-emoji">${gambar}</div>
      <div class="kartu-body">
        <span class="badge ${item.jenis === 'makanan' ? 'badge-makan' : 'badge-minum'}">${item.jenis}</span>
        <div class="kartu-nama">${item.nama}</div>
        <div class="kartu-desc">${item.desc}</div>
        <div class="kartu-harga">Rp ${item.harga.toLocaleString('id-ID')}</div>
        ${tombol}
      </div>
    </div>`;
}

function renderHome() {
  const el = document.getElementById('home-grid');
  if (el) el.innerHTML = menu.slice(0, 3).map(m => buatKartu(m, 'home')).join('');
}

function renderMenu() {
  const data = filterAktif === 'semua' ? menu : menu.filter(m => m.jenis === filterAktif);
  const el = document.getElementById('menu-grid');
  if (el) el.innerHTML = data.length
    ? data.map(m => buatKartu(m, 'menu')).join('')
    : '<p style="color:var(--abu);padding:20px;">Menu tidak ditemukan.</p>';
}

function filterMenu(jenis, el) {
  filterAktif = jenis;
  document.querySelectorAll('.pill-filter, #pill-semua').forEach(p => p.classList.remove('pill-aktif'));
  el.classList.add('pill-aktif');
  renderMenu();
}

function renderPesanGrid() {
  const el = document.getElementById('pesan-grid');
  if (el) el.innerHTML = menu.map(m => buatKartu(m, 'pesan')).join('');
}

// ============================================================
//  KERANJANG
// ============================================================
function tambahKeranjang(id) {
  const item = menu.find(m => m.id === id);
  if (!item) return;
  const ada = keranjang.find(k => k.id === id);
  if (ada) { ada.qty++; } else { keranjang.push({ ...item, qty: 1 }); }
  renderKeranjang();
  toast('✅ ' + item.nama + ' ditambahkan!');
}

function hapusKeranjang(id) {
  keranjang = keranjang.filter(k => k.id !== id);
  renderKeranjang();
}

function renderKeranjang() {
  const list   = document.getElementById('list-keranjang');
  const kosong = document.getElementById('keranjang-kosong');
  const total  = document.getElementById('total-harga');
  if (!list) return;

  if (!keranjang.length) {
    list.innerHTML = '';
    kosong.style.display = 'block';
    total.style.display  = 'none';
    return;
  }

  kosong.style.display = 'none';
  list.innerHTML = keranjang.map(k => `
    <li>
      <span>${k.emoji} ${k.nama} x${k.qty}</span>
      <span style="display:flex;gap:8px;align-items:center;">
        <span>Rp ${(k.harga * k.qty).toLocaleString('id-ID')}</span>
        <button class="hapus-item" onclick="hapusKeranjang(${k.id})">✕</button>
      </span>
    </li>`).join('');

  const jumlah = keranjang.reduce((s, k) => s + k.harga * k.qty, 0);
  total.style.display = 'block';
  total.textContent = 'Total: Rp ' + jumlah.toLocaleString('id-ID');
}

// ============================================================
//  METODE BAYAR
// ============================================================
function pilihBayar(el) {
  const wrap = document.getElementById('qr-bayar-wrap');
  if (el.value === 'Scan QR') {
    const total = keranjang.reduce((s, k) => s + k.harga * k.qty, 0);
    wrap.style.display = 'block';
    wrap.innerHTML = `
      <div class="qr-dana-box">
        <div class="qr-dana-header">
          <span class="qr-dana-logo">💙 DANA</span>
          <span class="qr-dana-label">Scan untuk membayar</span>
        </div>
        <img src="qr-dana.webp" alt="QR DANA" class="qr-dana-img"/>
        <div class="qr-dana-total">Total: <b>Rp ${total.toLocaleString('id-ID')}</b></div>
        <div class="qr-dana-note">📱 Buka aplikasi DANA → Scan QR di atas → Bayar</div>
        <div class="qr-dana-note" style="margin-top:4px;color:#c0392b;">⚠️ Tunjukkan bukti pembayaran ke kasir</div>
      </div>`;
  } else {
    wrap.style.display = 'none';
    wrap.innerHTML = '';
  }
}

// Toggle nomor meja
document.addEventListener('DOMContentLoaded', () => {
  initMenuFirebase();
  document.getElementById('inp-jenis').addEventListener('change', function () {
    document.getElementById('grup-meja').style.display = this.value === 'Makan di Tempat' ? 'block' : 'none';
  });
  renderHome();

  // Auto-buka halaman dari URL parameter (untuk QR scan)
  const params = new URLSearchParams(window.location.search);
  const hal    = params.get('halaman');
  const meja   = params.get('meja');
  if (hal) {
    buka(hal);
    if (meja) {
      setTimeout(() => {
        const selMeja = document.getElementById('inp-meja');
        if (selMeja) selMeja.value = meja;
      }, 300);
    }
  }
});

// ============================================================
//  KIRIM PESANAN → FIREBASE
// ============================================================
function kirimPesanan() {
  const nama    = document.getElementById('inp-nama').value.trim();
  const jenis   = document.getElementById('inp-jenis').value;
  const meja    = document.getElementById('inp-meja').value;
  const catatan = document.getElementById('inp-catatan').value.trim();
  const bayar   = document.querySelector('input[name="bayar"]:checked')?.value || 'Cash';

  if (!nama)             { toast('❗ Isi nama kamu dulu!'); return; }
  if (!keranjang.length) { toast('❗ Keranjang masih kosong!'); return; }

  const order = {
    nama,
    jenis,
    meja:    jenis === 'Makan di Tempat' ? 'Meja ' + meja : 'Take Away',
    catatan: catatan || '-',
    items:   keranjang.map(k => ({ id: k.id, nama: k.nama, emoji: k.emoji, harga: k.harga, qty: k.qty })),
    total:   keranjang.reduce((s, k) => s + k.harga * k.qty, 0),
    bayar,
    status:  'Baru',
    waktu:   new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
    timestamp: Date.now()
  };

  // Push ke Firebase → dapat key otomatis
  push(pesananRef, order).then((snap) => {
    const fbKey = snap.key;
    idPesananSaya.push(fbKey);
    keranjang = [];
    renderKeranjang();
    document.getElementById('inp-nama').value    = '';
    document.getElementById('inp-catatan').value = '';
    document.getElementById('nav-status-btn').style.display = '';
    toast('🎉 Pesanan berhasil dikirim!');
    setTimeout(() => buka('status-pesanan'), 1200);
  }).catch(() => toast('❌ Gagal kirim pesanan, cek koneksi!'));
}

// ============================================================
//  STATUS PESANAN (PEMBELI) — dari Firebase
// ============================================================
function renderStatusPesanan() {
  const container = document.getElementById('status-pesanan-list');
  if (!container) return;

  const milikSaya = idPesananSaya
    .map(key => pesanan[key] ? { ...pesanan[key], fbKey: key } : null)
    .filter(Boolean)
    .sort((a, b) => b.timestamp - a.timestamp);

  if (!milikSaya.length) {
    container.innerHTML = `<p style="color:var(--abu);text-align:center;padding:40px 0;">Belum ada pesanan. <a href="#" onclick="buka('pesan');return false;" style="color:var(--coklat2);">Pesan sekarang →</a></p>`;
    return;
  }

  container.innerHTML = milikSaya.map(o => {
    const statusClass = o.status === 'Baru' ? 'status-baru' : o.status === 'Diproses' ? 'status-proses' : o.status === 'Siap' ? 'status-siap' : 'status-selesai';
    const statusIcon  = o.status === 'Baru' ? '🕐' : o.status === 'Diproses' ? '👨‍🍳' : o.status === 'Siap' ? '✅' : '🏁';
    const pesanSiap   = o.status === 'Siap' || o.status === 'Selesai';

    return `
      <div class="status-kartu ${pesanSiap ? 'status-kartu-siap' : ''}">
        <div class="status-kartu-head">
          <div>
            <div class="status-order-id">${o.fbKey}</div>
            <div style="font-size:0.82rem;color:var(--abu);">${o.tanggal} · ${o.waktu}</div>
          </div>
          <span class="status-badge ${statusClass}">${statusIcon} ${o.status}</span>
        </div>
        <div class="status-detail">
          <div>📍 <b>${o.meja}</b></div>
          <div>💳 ${o.bayar}</div>
        </div>
        <div class="status-items">${o.items.map(i => `${i.emoji} ${i.nama} x${i.qty}`).join(' · ')}</div>
        ${pesanSiap ? `<div class="notif-siap">🔔 Pesanan kamu sudah siap! Silakan ambil di kasir.</div>` : ''}
        <div style="font-weight:800;font-size:0.9rem;margin-top:8px;">Total: Rp ${o.total.toLocaleString('id-ID')}</div>
      </div>`;
  }).join('');
}

// ============================================================
//  LOGIN
// ============================================================
function login() {
  const u   = document.getElementById('inp-user').value.trim();
  const p   = document.getElementById('inp-pass').value;
  const err = document.getElementById('login-err');

  if (u === 'kasir' && p === 'sunda123') {
    peranLogin = 'kasir';
    err.style.display = 'none';
    document.getElementById('nav-login-btn').style.display  = 'none';
    document.getElementById('nav-keluar-btn').style.display = '';
    document.getElementById('nav-kasir-btn').style.display  = '';
    buka('kasir');
    toast('Selamat datang, Kasir! 👋');

  } else if (u === 'admin' && p === 'admin123') {
    peranLogin = 'admin';
    err.style.display = 'none';
    document.getElementById('nav-login-btn').style.display  = 'none';
    document.getElementById('nav-keluar-btn').style.display = '';
    document.getElementById('nav-admin-btn').style.display  = '';
    document.getElementById('nav-qr-btn').style.display     = '';
    buka('admin');
    toast('Selamat datang, Admin! 👑');

  } else {
    err.style.display = 'block';
  }
}

function keluar() {
  peranLogin = null;
  document.getElementById('nav-login-btn').style.display  = '';
  ['nav-keluar-btn','nav-kasir-btn','nav-admin-btn','nav-qr-btn'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
  document.getElementById('inp-user').value = '';
  document.getElementById('inp-pass').value = '';
  buka('home');
  toast('Berhasil keluar.');
}

// ============================================================
//  KASIR — RENDER PESANAN DARI FIREBASE
// ============================================================
function renderKasir() {
  const arr = Object.entries(pesanan).map(([key, val]) => ({ ...val, fbKey: key }));
  arr.sort((a, b) => b.timestamp - a.timestamp);

  document.getElementById('k-stat-order').textContent   = arr.length;
  document.getElementById('k-stat-baru').textContent    = arr.filter(o => o.status === 'Baru').length;
  document.getElementById('k-stat-selesai').textContent = arr.filter(o => o.status === 'Selesai').length;

  const grid = document.getElementById('kasir-order-grid');
  if (!grid) return;

  if (!arr.length) {
    grid.innerHTML = '<p style="color:var(--abu);grid-column:1/-1;text-align:center;padding:40px 0;">Belum ada pesanan masuk.</p>';
    return;
  }

  grid.innerHTML = arr.map(o => {
    const statusClass = o.status === 'Baru' ? 'status-baru' : o.status === 'Diproses' ? 'status-proses' : o.status === 'Siap' ? 'status-siap' : 'status-selesai';
    const btnLabel    = o.status === 'Baru' ? '▶ Proses' : o.status === 'Diproses' ? '🔔 Tandai Siap' : o.status === 'Siap' ? '✅ Selesai' : '✔ Selesai';
    const btnDisabled = o.status === 'Selesai' ? 'disabled' : '';
    const bayarBadge  = o.bayar === 'Scan QR' ? '<span class="badge-qr">📱 QR</span>' : '<span class="badge-cash">💵 Cash</span>';

    return `
      <div class="order-kartu">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <div class="order-id" style="font-size:0.78rem;word-break:break-all;">${o.fbKey.slice(-6).toUpperCase()}</div>
          <span class="status ${statusClass}">${o.status}</span>
        </div>
        <div class="order-info">👤 <b>${o.nama}</b></div>
        <div class="order-info">📍 ${o.meja}</div>
        <div class="order-info">🕐 ${o.waktu} &nbsp;${bayarBadge}</div>
        <div class="order-items">${o.items.map(i => `${i.emoji} ${i.nama} x${i.qty}`).join('<br/>')}</div>
        <div class="order-info" style="font-size:0.78rem;">📝 ${o.catatan}</div>
        <div class="order-total">Rp ${o.total.toLocaleString('id-ID')}</div>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="btn-status" onclick="gantiStatus('${o.fbKey}')" ${btnDisabled} style="flex:1;">${btnLabel}</button>
          ${o.status === 'Selesai' ? `<button class="btn-kwitansi" onclick="tampilKwitansi('${o.fbKey}')">🧾</button>` : ''}
        </div>
      </div>`;
  }).join('');
}

function gantiStatus(fbKey) {
  const o = pesanan[fbKey];
  if (!o || o.status === 'Selesai') return;
  const next = { 'Baru': 'Diproses', 'Diproses': 'Siap', 'Siap': 'Selesai' };
  const newStatus = next[o.status] || o.status;
  update(ref(db, 'pesanan/' + fbKey), { status: newStatus }).then(() => {
    const pesan = newStatus === 'Siap' ? `🔔 Pesanan SIAP diambil!` : `Status → ${newStatus}`;
    toast(pesan);
  });
}

// ============================================================
//  KWITANSI
// ============================================================
function tampilKwitansi(fbKey) {
  const o = pesanan[fbKey];
  if (!o) return;

  document.getElementById('kwit-info').innerHTML = `
    <div class="kwit-row"><span>No. Pesanan</span><span><b>${fbKey.slice(-6).toUpperCase()}</b></span></div>
    <div class="kwit-row"><span>Tanggal</span><span>${o.tanggal}</span></div>
    <div class="kwit-row"><span>Waktu</span><span>${o.waktu}</span></div>
    <div class="kwit-row"><span>Nama</span><span>${o.nama}</span></div>
    <div class="kwit-row"><span>Meja / Jenis</span><span>${o.meja}</span></div>`;

  document.getElementById('kwit-items').innerHTML = `
    <div style="font-size:0.72rem;font-weight:800;letter-spacing:1px;margin-bottom:8px;color:var(--abu);">ITEM PESANAN</div>
    ${o.items.map(i => `
      <div class="kwit-row">
        <span>${i.emoji} ${i.nama} x${i.qty}</span>
        <span>Rp ${(i.harga * i.qty).toLocaleString('id-ID')}</span>
      </div>`).join('')}`;

  document.getElementById('kwit-total').innerHTML = `
    <div class="kwit-row kwit-total-row">
      <span>TOTAL</span>
      <span>Rp ${o.total.toLocaleString('id-ID')}</span>
    </div>`;

  document.getElementById('kwit-bayar').innerHTML = `
    <div class="kwit-row" style="margin-top:8px;">
      <span>Metode Bayar</span><span>${o.bayar === 'Scan QR' ? '📱 Scan QR Code' : '💵 Cash / Kasir'}</span>
    </div>
    <div class="kwit-row"><span>Status</span><span style="color:var(--hijau);font-weight:800;">✅ ${o.status}</span></div>`;

  document.getElementById('modal-kwitansi').style.display = 'flex';
}

function tutupModalKwitansi(e) {
  if (e.target === document.getElementById('modal-kwitansi')) {
    document.getElementById('modal-kwitansi').style.display = 'none';
  }
}

function printKwitansi() { window.print(); }

// ============================================================
//  ADMIN — KELOLA MENU (Firebase)
// ============================================================
function renderAdmin() {
  const arr     = Object.entries(pesanan).map(([k, v]) => ({ ...v, fbKey: k }));
  const selesai = arr.filter(p => p.status === 'Selesai');
  const totalMasuk = selesai.reduce((s, p) => s + p.total, 0);

  document.getElementById('a-stat-menu').textContent      = menu.length;
  document.getElementById('a-stat-pemasukan').textContent = 'Rp ' + totalMasuk.toLocaleString('id-ID');
  document.getElementById('a-stat-order').textContent     = selesai.length;

  renderAdminTabelMenu();
  renderAdminLaporan();
}

function renderAdminTabelMenu() {
  const tbody = document.getElementById('admin-tabel-menu');
  if (!tbody) return;
  tbody.innerHTML = menu.map(m => {
    const preview = m.foto
      ? `<img src="${m.foto}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;" onerror="this.style.display='none'"/>`
      : `<span style="font-size:1.4rem;">${m.emoji}</span>`;
    return `
      <tr>
        <td>${preview}</td>
        <td><b>${m.nama}</b></td>
        <td><span class="badge ${m.jenis === 'makanan' ? 'badge-makan' : 'badge-minum'}">${m.jenis}</span></td>
        <td>Rp ${m.harga.toLocaleString('id-ID')}</td>
        <td style="max-width:180px;font-size:0.78rem;color:var(--abu);">${m.desc}</td>
        <td><button class="btn-tbl btn-edit-menu" onclick="bukaEditMenu('${m.fbKey}')">✏️ Edit</button></td>
        <td><button class="btn-tbl btn-hapus" onclick="hapusMenu('${m.fbKey}')">🗑️ Hapus</button></td>
      </tr>`;
  }).join('');
}

function bukaEditMenu(fbKey) {
  const m = menu.find(x => x.fbKey === fbKey);
  if (!m) return;
  document.getElementById('edit-menu-id').value = fbKey;
  document.getElementById('f-nama').value  = m.nama;
  document.getElementById('f-jenis').value = m.jenis;
  document.getElementById('f-harga').value = m.harga;
  document.getElementById('f-desc').value  = m.desc;
  document.getElementById('f-foto').value  = m.foto || '';
  previewFoto(m.foto || '');
  document.getElementById('form-menu-title').textContent  = '✏️ Edit Menu: ' + m.nama;
  document.getElementById('btn-simpan-menu').textContent  = '💾 Simpan Perubahan';
  document.getElementById('btn-batal-edit').style.display = '';
  document.querySelector('.form-tambah').scrollIntoView({ behavior: 'smooth' });
}

function batalEdit() {
  document.getElementById('edit-menu-id').value = '';
  ['f-nama','f-harga','f-foto','f-desc'].forEach(id => document.getElementById(id).value = '');
  const prev = document.getElementById('f-foto-preview');
  if (prev) prev.style.display = 'none';
  document.getElementById('form-menu-title').textContent  = '+ Tambah Menu Baru';
  document.getElementById('btn-simpan-menu').textContent  = '+ Tambah';
  document.getElementById('btn-batal-edit').style.display = 'none';
}

function simpanMenu() {
  const fbKey  = document.getElementById('edit-menu-id').value;
  const nama   = document.getElementById('f-nama').value.trim();
  const jenis  = document.getElementById('f-jenis').value;
  const harga  = parseInt(document.getElementById('f-harga').value);
  const foto   = document.getElementById('f-foto').value.trim();
  const desc   = document.getElementById('f-desc').value.trim() || '-';
  const emoji  = jenis === 'minuman' ? '🥤' : '🍽️';

  if (!nama || !harga) { toast('❗ Nama dan harga wajib diisi!'); return; }

  if (fbKey) {
    update(ref(db, 'menu/' + fbKey), { nama, jenis, harga, foto, desc })
      .then(() => { toast('✅ Menu ' + nama + ' diperbarui!'); batalEdit(); });
  } else {
    push(ref(db, 'menu'), { id: nextMenuId++, nama, jenis, harga, emoji, foto, desc })
      .then(() => { toast('✅ Menu ' + nama + ' ditambahkan!'); batalEdit(); });
  }
}

function hapusMenu(fbKey) {
  const m = menu.find(x => x.fbKey === fbKey);
  if (!m) return;
  if (!confirm('Hapus menu "' + m.nama + '"?')) return;
  remove(ref(db, 'menu/' + fbKey)).then(() => toast('Menu berhasil dihapus.'));
}

// ============================================================
//  ADMIN — LAPORAN KEUANGAN
// ============================================================
function renderAdminLaporan() {
  const arr     = Object.entries(pesanan).map(([k, v]) => ({ ...v, fbKey: k }));
  const selesai = arr.filter(p => p.status === 'Selesai');
  const totalMasuk = selesai.reduce((s, p) => s + p.total, 0);
  const avg        = selesai.length ? Math.round(totalMasuk / selesai.length) : 0;

  const elMasuk = document.getElementById('lap-total-masuk');
  const elOrder = document.getElementById('lap-total-order');
  const elAvg   = document.getElementById('lap-avg');
  if (elMasuk) elMasuk.textContent = 'Rp ' + totalMasuk.toLocaleString('id-ID');
  if (elOrder) elOrder.textContent = selesai.length + ' Pesanan';
  if (elAvg)   elAvg.textContent   = 'Rp ' + avg.toLocaleString('id-ID');

  const tbody = document.getElementById('admin-tabel-laporan');
  if (!tbody) return;

  arr.sort((a, b) => b.timestamp - a.timestamp);
  if (!arr.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--abu);padding:20px;">Belum ada data pesanan.</td></tr>';
    return;
  }

  tbody.innerHTML = arr.map(o => {
    const sc = o.status === 'Selesai' ? 'status-selesai' : o.status === 'Siap' ? 'status-siap' : o.status === 'Diproses' ? 'status-proses' : 'status-baru';
    return `
      <tr>
        <td><b>${o.fbKey.slice(-6).toUpperCase()}</b></td>
        <td>${o.nama}</td>
        <td>${o.waktu}</td>
        <td style="font-size:0.78rem;">${o.items.map(i => `${i.nama} x${i.qty}`).join(', ')}</td>
        <td><b>Rp ${o.total.toLocaleString('id-ID')}</b></td>
        <td>${o.bayar}</td>
        <td><span class="status ${sc}" style="font-size:0.68rem;">${o.status}</span></td>
      </tr>`;
  }).join('');
}

// ============================================================
//  TAB ADMIN
// ============================================================
function gantiTabAdmin(nama, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('aktif-tab'));
  document.querySelectorAll('.konten-tab').forEach(c => c.classList.remove('aktif'));
  el.classList.add('aktif-tab');
  document.getElementById('atab-' + nama).classList.add('aktif');
  if (nama === 'laporan') renderAdminLaporan();
}

// ============================================================
//  QR CODE
// ============================================================
function buatSemuaQR() {
  const baseUrl = window.location.href.split('?')[0].replace(/\/$/, '');
  const urlPesan = baseUrl + '?halaman=pesan';
  const c1 = document.getElementById('qr-pesan-canvas');
  if (c1) {
    QRCode.toCanvas(c1, urlPesan, { width: 200, margin: 2, color: { dark: '#3e2a0f', light: '#fef9c3' } }, () => {});
    const el = document.getElementById('qr-pesan-url');
    if (el) el.textContent = urlPesan;
  }
  buatQrMeja();
}

function buatQrMeja() {
  const baseUrl = window.location.href.split('?')[0].replace(/\/$/, '');
  const meja    = document.getElementById('sel-meja-qr')?.value || '1';
  const urlMeja = baseUrl + '?halaman=pesan&meja=' + meja;
  const c2 = document.getElementById('qr-meja-canvas');
  if (c2) {
    QRCode.toCanvas(c2, urlMeja, { width: 200, margin: 2, color: { dark: '#3e2a0f', light: '#fef9c3' } }, () => {});
    const el2 = document.getElementById('qr-meja-url');
    if (el2) el2.textContent = urlMeja;
  }
}

function printQRCard() { window.print(); }

// ============================================================
//  PREVIEW FOTO
// ============================================================
function previewFoto(url) {
  const img = document.getElementById('f-foto-preview');
  if (!img) return;
  if (url) { img.src = url; img.style.display = 'block'; img.onerror = () => { img.style.display = 'none'; }; }
  else { img.style.display = 'none'; img.src = ''; }
}

// ============================================================
//  TOAST
// ============================================================
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('tampil');
  setTimeout(() => t.classList.remove('tampil'), 3000);
}
