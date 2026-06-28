// ════════════════════════════════
// DATA MENU
// ════════════════════════════════
let menu = [
  { id:1, nama:'Nasi Timbel',  jenis:'makanan', harga:22000, emoji:'🍱', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt_DDW_b6JxphVST9M6-PCR3c39ci4Br2_-whLrFciiw&s=10', desc:'Nasi bungkus daun pisang dengan lauk khas Sunda' },
  { id:2, nama:'Soto Bandung', jenis:'makanan', harga:18000, emoji:'🍲', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBJX5tEDPYqSgNRGLQX4unidjQB9M08j6-rPrrgevOvw&s=10', desc:'Soto kuah bening dengan daging sapi dan lobak' },
  { id:3, nama:'Batagor',      jenis:'makanan', harga:15000, emoji:'🥟', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLnASZCEiFYlWad-5dkI5gDb5v_8FDqYqpCaxadGSlEw&s=10', desc:'Bakso tahu goreng dengan bumbu kacang pedas' },
  { id:4, nama:'Karedok',      jenis:'makanan', harga:14000, emoji:'🥗', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMt39h4TXGnUvq2BSysVXOYtJLBn9D0qtBnJDGcEumzw&s=10', desc:'Sayuran segar dengan saus kacang kencur' },
  { id:5, nama:'Seblak',       jenis:'makanan', harga:16000, emoji:'🍜', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUIFq-gxwFln1tbLKw9eTFnt67GZ1gPdeWOq_ie01bYQ&s=10', desc:'Kerupuk pedas bumbu kencur khas Bandung' },
  { id:6, nama:'Nasi Liwet',   jenis:'makanan', harga:20000, emoji:'🍚', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZe0INo74Jvv7zkadt0zQIfrlIYD_BRkwbP6-oIa5XLw&s=10', desc:'Nasi gurih dimasak dengan santan dan rempah' },
  { id:7, nama:'Bajigur',      jenis:'minuman', harga:8000,  emoji:'☕', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCLaB0rFBTk2T4WxhaB9hRtLAHTU5HWYf7ZOS1XaKrFQ&s=10', desc:'Minuman hangat santan gula aren khas Sunda' },
  { id:8, nama:'Es Cendol',    jenis:'minuman', harga:9000,  emoji:'🧉', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsMNlAJ1elTaN49B8tR8eL9ID1ONo4aBOC2GKIzxYVmw&s=10', desc:'Minuman segar cendol hijau dengan gula aren' },
  { id:9, nama:'Bandrek',      jenis:'minuman', harga:8000,  emoji:'🫗', foto:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfWYzefGvFL_iMbeJ9TkU2RbBmOWEG02lKdbrbDvxJXg&s=10', desc:'Minuman rempah jahe serai yang menghangatkan' },
];

// ════════════════════════════════
// STATE
// ════════════════════════════════
let pesanan      = [];   // semua order masuk
let keranjang    = [];
let nextMenuId   = 10;
let nextOrderId  = 1;
let roleAktif    = 'kasir'; // 'kasir' | 'admin'
let loginRole    = null;
let filterAktif  = 'semua';
let metodeBayar  = 'cash';
let editMenuId   = null;
let orderTracked = null;  // id pesanan aktif pembeli

// ════════════════════════════════
// NAVIGASI
// ════════════════════════════════
function buka(nama) {
  document.querySelectorAll('.halaman').forEach(h => h.classList.remove('aktif'));
  document.getElementById('hal-' + nama).classList.add('aktif');
  window.scrollTo(0, 0);
  if (nama === 'home')  renderHome();
  if (nama === 'menu')  renderMenu();
  if (nama === 'pesan') { renderPesanGrid(); updateTracker(); }
  if (nama === 'kasir') renderKasir();
  if (nama === 'admin') renderAdmin();
}

// ════════════════════════════════
// RENDER KARTU MENU
// ════════════════════════════════
function buatKartu(item, mode) {
  const tombol = mode === 'pesan'
    ? `<button class="btn-keranjang" onclick="tambahKeranjang(${item.id})">+ Tambah ke Keranjang</button>`
    : `<button class="btn-keranjang" onclick="buka('pesan')">Pesan Sekarang</button>`;
  const gambar = item.foto
    ? `<img src="${item.foto}" alt="${item.nama}"/>`
    : item.emoji;
  return `
    <div class="kartu">
      <div class="kartu-emoji">${gambar}</div>
      <div class="kartu-body">
        <span class="badge ${item.jenis==='makanan'?'badge-makan':'badge-minum'}">${item.jenis}</span>
        <div class="kartu-nama">${item.nama}</div>
        <div class="kartu-desc">${item.desc}</div>
        <div class="kartu-harga">Rp ${item.harga.toLocaleString('id-ID')}</div>
        ${tombol}
      </div>
    </div>`;
}

function renderHome() {
  document.getElementById('home-grid').innerHTML = menu.slice(0,3).map(m => buatKartu(m,'home')).join('');
}
function renderMenu() {
  const data = filterAktif==='semua' ? menu : menu.filter(m => m.jenis===filterAktif);
  document.getElementById('menu-grid').innerHTML = data.length
    ? data.map(m => buatKartu(m,'menu')).join('')
    : '<p style="color:var(--abu);padding:20px;">Menu tidak ditemukan.</p>';
}
function filterMenu(j) { filterAktif=j; renderMenu(); }
function renderPesanGrid() {
  document.getElementById('pesan-grid').innerHTML = menu.map(m => buatKartu(m,'pesan')).join('');
}

// ════════════════════════════════
// KERANJANG
// ════════════════════════════════
function tambahKeranjang(id) {
  const item = menu.find(m => m.id===id);
  if (!item) return;
  const ada = keranjang.find(k => k.id===id);
  ada ? ada.qty++ : keranjang.push({...item, qty:1});
  renderKeranjang();
  toast('✅ ' + item.nama + ' ditambahkan!');
}
function hapusKeranjang(id) {
  keranjang = keranjang.filter(k => k.id!==id);
  renderKeranjang();
}
function renderKeranjang() {
  const list   = document.getElementById('list-keranjang');
  const kosong = document.getElementById('keranjang-kosong');
  const total  = document.getElementById('total-harga');
  if (!keranjang.length) {
    list.innerHTML = ''; kosong.style.display='block'; total.style.display='none';
    updateQRNominal(0); return;
  }
  kosong.style.display = 'none';
  list.innerHTML = keranjang.map(k => `
    <li>
      <span>${k.emoji} ${k.nama} x${k.qty}</span>
      <span style="display:flex;gap:8px;align-items:center;">
        <span>Rp ${(k.harga*k.qty).toLocaleString('id-ID')}</span>
        <button class="hapus-item" onclick="hapusKeranjang(${k.id})">✕</button>
      </span>
    </li>`).join('');
  const jumlah = keranjang.reduce((s,k) => s+k.harga*k.qty, 0);
  total.style.display='block';
  total.textContent = 'Total: Rp ' + jumlah.toLocaleString('id-ID');
  updateQRNominal(jumlah);
}
function updateQRNominal(nominal) {
  const el = document.getElementById('qr-nominal');
  if (el) el.textContent = 'Rp ' + nominal.toLocaleString('id-ID');
}

// ════════════════════════════════
// METODE BAYAR
// ════════════════════════════════
function pilihBayar(m) {
  metodeBayar = m;
  document.getElementById('opsi-cash').classList.toggle('aktif', m==='cash');
  document.getElementById('opsi-qr').classList.toggle('aktif', m==='qr');
  document.getElementById('qr-box').classList.toggle('tampil', m==='qr');
}

// ════════════════════════════════
// TOGGLE MEJA
// ════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('inp-jenis').addEventListener('change', function() {
    document.getElementById('grup-meja').style.display =
      this.value==='Makan di Tempat' ? 'block' : 'none';
  });
  renderHome();
});

// ════════════════════════════════
// KIRIM PESANAN
// ════════════════════════════════
function kirimPesanan() {
  const nama    = document.getElementById('inp-nama').value.trim();
  const jenis   = document.getElementById('inp-jenis').value;
  const meja    = document.getElementById('inp-meja').value;
  const catatan = document.getElementById('inp-catatan').value.trim();
  if (!nama)            { toast('❗ Isi nama kamu dulu!'); return; }
  if (!keranjang.length){ toast('❗ Keranjang masih kosong!'); return; }

  const order = {
    id:      'ORD-' + String(nextOrderId++).padStart(3,'0'),
    nama, jenis,
    meja:    jenis==='Makan di Tempat' ? 'Meja '+meja : 'Take Away',
    catatan: catatan||'-',
    items:   [...keranjang],
    total:   keranjang.reduce((s,k) => s+k.harga*k.qty, 0),
    status:  'Baru',
    metode:  metodeBayar,
    waktu:   new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}),
    tanggal: new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'}),
  };
  pesanan.push(order);
  orderTracked = order.id;
  keranjang = [];
  renderKeranjang();
  document.getElementById('inp-nama').value = '';
  document.getElementById('inp-catatan').value = '';
  toast('🎉 Pesanan berhasil dikirim! ID: ' + order.id);
  updateTracker();
}

// ════════════════════════════════
// TRACKER STATUS (pembeli)
// ════════════════════════════════
function updateTracker() {
  const tracker = document.getElementById('status-tracker');
  const notifSiap = document.getElementById('notif-siap');
  if (!orderTracked) { tracker.classList.remove('tampil'); return; }
  const o = pesanan.find(p => p.id===orderTracked);
  if (!o) return;
  tracker.classList.add('tampil');
  document.getElementById('tracker-order-id').textContent = 'ID: ' + o.id + ' · ' + o.nama;

  const steps  = ['Baru','Diproses','Siap','Selesai'];
  const curIdx = steps.indexOf(o.status);
  [1,2,3,4].forEach(n => {
    const c = document.getElementById('trk-c'+n);
    c.classList.remove('aktif','done');
    if (n-1 < curIdx)  c.classList.add('done');
    if (n-1 === curIdx) c.classList.add('aktif');
  });

  // Notif siap
  if (o.status === 'Siap') {
    notifSiap.style.display = 'block';
  } else {
    notifSiap.style.display = 'none';
  }
}

// ════════════════════════════════
// LOGIN
// ════════════════════════════════
const AKUN = {
  kasir: { pass:'sunda123', role:'kasir' },
  admin: { pass:'admin123', role:'admin' },
};

function pilihRole(r) {
  roleAktif = r;
  document.getElementById('tab-role-kasir').classList.toggle('aktif', r==='kasir');
  document.getElementById('tab-role-admin').classList.toggle('aktif', r==='admin');
}

function login() {
  const u   = document.getElementById('inp-user').value.trim();
  const p   = document.getElementById('inp-pass').value;
  const err = document.getElementById('login-err');
  const akun = AKUN[u];
  if (akun && akun.pass===p && akun.role===roleAktif) {
    loginRole = akun.role;
    err.style.display = 'none';
    document.getElementById('nav-login-btn').style.display  = 'none';
    document.getElementById('nav-keluar-btn').style.display = '';
    if (loginRole==='kasir') {
      document.getElementById('nav-kasir-link').style.display = '';
      buka('kasir');
    } else {
      document.getElementById('nav-admin-link').style.display = '';
      buka('admin');
    }
    toast('Selamat datang, ' + loginRole + '! 👋');
  } else {
    err.style.display = 'block';
  }
}

function keluar() {
  loginRole = null;
  document.getElementById('nav-login-btn').style.display  = '';
  document.getElementById('nav-keluar-btn').style.display = 'none';
  document.getElementById('nav-kasir-link').style.display = 'none';
  document.getElementById('nav-admin-link').style.display = 'none';
  document.getElementById('inp-user').value = '';
  document.getElementById('inp-pass').value = '';
  buka('home');
  toast('Berhasil keluar.');
}

// ════════════════════════════════
// DASHBOARD KASIR
// ════════════════════════════════
function renderKasir() {
  const aktif    = pesanan.filter(o => !['Selesai','Dibayar'].includes(o.status));
  const riwayat  = pesanan.filter(o =>  ['Selesai','Dibayar'].includes(o.status));

  document.getElementById('stat-order').textContent   = pesanan.length;
  document.getElementById('stat-baru').textContent    = pesanan.filter(o=>o.status==='Baru').length;
  document.getElementById('stat-siap').textContent    = pesanan.filter(o=>o.status==='Siap').length;
  document.getElementById('stat-selesai').textContent = riwayat.length;

  // Pesanan aktif
  const grid = document.getElementById('order-grid');
  grid.innerHTML = aktif.length
    ? [...aktif].reverse().map(o => buatOrderKartu(o, false)).join('')
    : '<p style="color:var(--abu);grid-column:1/-1;text-align:center;padding:40px 0;">Belum ada pesanan aktif.</p>';

  // Riwayat
  const rwGrid = document.getElementById('riwayat-grid');
  rwGrid.innerHTML = riwayat.length
    ? [...riwayat].reverse().map(o => buatOrderKartu(o, true)).join('')
    : '<p style="color:var(--abu);grid-column:1/-1;text-align:center;padding:40px 0;">Belum ada riwayat.</p>';
}

function buatOrderKartu(o, isRiwayat) {
  const stMap = {
    'Baru':'status-baru','Diproses':'status-proses',
    'Siap':'status-siap','Selesai':'status-selesai','Dibayar':'status-dibayar'
  };
  const metBadge = o.metode==='cash'
    ? '<span class="badge badge-cash">💵 Cash</span>'
    : '<span class="badge badge-qr">📱 QR/QRIS</span>';

  let tombol = '';
  if (!isRiwayat) {
    const nextLabel = {
      'Baru':'▶ Mulai Proses','Diproses':'🔔 Tandai Siap','Siap':'✅ Selesai & Bayar'
    }[o.status]||'';
    if (nextLabel) tombol += `<button class="btn-status" onclick="gantiStatus('${o.id}')">${nextLabel}</button>`;
  }
  if (isRiwayat || o.status==='Selesai'||o.status==='Dibayar') {
    tombol += `<button class="btn-kwitansi" onclick="bukakwitansi('${o.id}')">🧾 Cetak Kwitansi</button>`;
  }

  return `
    <div class="order-kartu">
      <div class="order-id">${o.id}</div>
      <span class="status ${stMap[o.status]||''}">${o.status}</span>
      ${metBadge}
      <div class="order-info">👤 ${o.nama}</div>
      <div class="order-info">📍 ${o.meja}</div>
      <div class="order-info">🕐 ${o.waktu}</div>
      <div class="order-items">${o.items.map(i=>`${i.emoji} ${i.nama} x${i.qty}`).join('<br/>')}</div>
      <div class="order-info">📝 ${o.catatan}</div>
      <div class="order-total">Rp ${o.total.toLocaleString('id-ID')}</div>
      ${tombol}
    </div>`;
}

function gantiStatus(id) {
  const o = pesanan.find(p => p.id===id);
  if (!o) return;
  const flow = ['Baru','Diproses','Siap','Selesai'];
  const idx = flow.indexOf(o.status);
  if (idx < flow.length-1) o.status = flow[idx+1];
  // kalau QR & selesai, langsung Dibayar
  if (o.status==='Selesai' && o.metode==='qr') o.status='Dibayar';
  renderKasir();
  updateTracker();
  if (o.status==='Siap') toast('🔔 ' + o.id + ' siap disajikan! Notifikasi dikirim ke pembeli.');
  else toast('Status ' + o.id + ' → ' + o.status);
}

// ════════════════════════════════
// KWITANSI
// ════════════════════════════════
function bukakwitansi(id) {
  const o = pesanan.find(p => p.id===id);
  if (!o) return;
  document.getElementById('kwt-id').textContent    = o.id;
  document.getElementById('kwt-nama').textContent  = o.nama;
  document.getElementById('kwt-jenis').textContent = o.jenis;
  document.getElementById('kwt-meja').textContent  = o.meja;
  document.getElementById('kwt-bayar').textContent = o.metode==='cash' ? 'Cash / Bayar di Kasir' : 'Scan QR / QRIS';
  document.getElementById('kwt-waktu').textContent = o.tanggal + ' · ' + o.waktu;
  document.getElementById('kwt-total').textContent = 'Rp ' + o.total.toLocaleString('id-ID');
  document.getElementById('kwt-items').innerHTML   = o.items.map(i => `
    <div class="kwitansi-row">
      <span>${i.emoji} ${i.nama} x${i.qty}</span>
      <span>Rp ${(i.harga*i.qty).toLocaleString('id-ID')}</span>
    </div>`).join('');
  document.getElementById('kwitansi-overlay').classList.add('tampil');
}
function tutupKwitansi() {
  document.getElementById('kwitansi-overlay').classList.remove('tampil');
}

// ════════════════════════════════
// DASHBOARD ADMIN
// ════════════════════════════════
function renderAdmin() {
  renderTabelMenu();
  renderLaporan();
  document.getElementById('lap-menu').textContent = menu.length;
}

function renderTabelMenu() {
  document.getElementById('tabel-menu').innerHTML = menu.map(m => {
    const preview = m.foto
      ? `<img src="${m.foto}" alt="${m.nama}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid var(--border);"/>`
      : `<span style="font-size:1.4rem;">${m.emoji}</span>`;
    return `<tr>
      <td><b>${m.nama}</b><br><small style="color:var(--abu)">${m.desc}</small></td>
      <td><span class="badge ${m.jenis==='makanan'?'badge-makan':'badge-minum'}">${m.jenis}</span></td>
      <td>Rp ${m.harga.toLocaleString('id-ID')}</td>
      <td>${preview}</td>
      <td><button class="btn-tbl btn-edit"  onclick="bukaEdit(${m.id})">✏️ Edit</button></td>
      <td><button class="btn-tbl btn-hapus" onclick="hapusMenu(${m.id})">Hapus</button></td>
    </tr>`;
  }).join('');
}

function renderLaporan() {
  const selesai  = pesanan.filter(o => ['Selesai','Dibayar'].includes(o.status));
  const masuk    = selesai.reduce((s,o) => s+o.total, 0);
  const keluar   = Math.round(masuk * 0.4);
  const laba     = masuk - keluar;
  document.getElementById('lap-masuk').textContent        = 'Rp ' + masuk.toLocaleString('id-ID');
  document.getElementById('lap-masuk-detail').textContent = 'dari ' + selesai.length + ' transaksi selesai';
  document.getElementById('lap-keluar').textContent       = 'Rp ' + keluar.toLocaleString('id-ID');
  document.getElementById('lap-laba').textContent         = 'Rp ' + laba.toLocaleString('id-ID');
  document.getElementById('lap-menu').textContent         = menu.length;

  document.getElementById('tabel-transaksi').innerHTML = selesai.length
    ? [...selesai].reverse().map(o => `<tr>
        <td>${o.id}</td>
        <td>${o.nama}</td>
        <td>${o.items.map(i=>i.nama+' x'+i.qty).join(', ')}</td>
        <td>${o.metode==='cash'?'💵 Cash':'📱 QR'}</td>
        <td><b>Rp ${o.total.toLocaleString('id-ID')}</b></td>
        <td>${o.waktu}</td>
      </tr>`).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--abu);padding:20px;">Belum ada transaksi selesai.</td></tr>';
}

// ════════════════════════════════
// KELOLA MENU (ADMIN)
// ════════════════════════════════
function tambahMenu() {
  const nama  = document.getElementById('f-nama').value.trim();
  const jenis = document.getElementById('f-jenis').value;
  const harga = parseInt(document.getElementById('f-harga').value);
  const emoji = document.getElementById('f-emoji').value.trim() || (jenis==='minuman'?'🥤':'🍽️');
  const foto  = document.getElementById('f-foto').value.trim();
  const desc  = document.getElementById('f-desc').value.trim() || '-';
  if (!nama||!harga) { toast('❗ Nama dan harga wajib diisi!'); return; }
  menu.push({ id:nextMenuId++, nama, jenis, harga, emoji, foto, desc });
  ['f-nama','f-harga','f-emoji','f-foto','f-desc'].forEach(id => document.getElementById(id).value='');
  document.getElementById('f-foto-preview').style.display='none';
  renderAdmin();
  toast('✅ Menu ' + nama + ' ditambahkan!');
}

function hapusMenu(id) {
  if (!confirm('Hapus menu ini?')) return;
  menu = menu.filter(m => m.id!==id);
  renderAdmin();
  toast('Menu berhasil dihapus.');
}

function bukaEdit(id) {
  const m = menu.find(x => x.id===id);
  if (!m) return;
  editMenuId = id;
  document.getElementById('edit-id').value    = id;
  document.getElementById('edit-nama').value  = m.nama;
  document.getElementById('edit-jenis').value = m.jenis;
  document.getElementById('edit-harga').value = m.harga;
  document.getElementById('edit-emoji').value = m.emoji;
  document.getElementById('edit-foto').value  = m.foto;
  document.getElementById('edit-desc').value  = m.desc;
  document.getElementById('modal-edit').classList.add('tampil');
}

function simpanEdit() {
  const m = menu.find(x => x.id===editMenuId);
  if (!m) return;
  m.nama  = document.getElementById('edit-nama').value.trim() || m.nama;
  m.jenis = document.getElementById('edit-jenis').value;
  m.harga = parseInt(document.getElementById('edit-harga').value) || m.harga;
  m.emoji = document.getElementById('edit-emoji').value.trim() || m.emoji;
  m.foto  = document.getElementById('edit-foto').value.trim();
  m.desc  = document.getElementById('edit-desc').value.trim() || m.desc;
  tutupModal();
  renderAdmin();
  toast('✅ Menu berhasil diperbarui!');
}

function tutupModal() {
  document.getElementById('modal-edit').classList.remove('tampil');
  editMenuId = null;
}

function previewFoto(url) {
  const img = document.getElementById('f-foto-preview');
  if (!img) return;
  if (url) { img.src=url; img.style.display='block'; img.onerror=()=>{img.style.display='none'}; }
  else { img.style.display='none'; img.src=''; }
}

// ════════════════════════════════
// TAB NAVIGATOR
// ════════════════════════════════
function gantiTab(nama, el) {
  const parent = el.closest('.kasir-wrap, .admin-wrap');
  parent.querySelectorAll('.tab').forEach(t => t.classList.remove('aktif-tab'));
  parent.querySelectorAll('.konten-tab').forEach(c => c.classList.remove('aktif'));
  el.classList.add('aktif-tab');
  document.getElementById('tab-' + nama).classList.add('aktif');
  if (nama==='laporan') renderLaporan();
}

// ════════════════════════════════
// TOAST
// ════════════════════════════════
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('tampil');
  setTimeout(() => t.classList.remove('tampil'), 3000);
}

// Init
renderHome();