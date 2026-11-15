const KEY = 'tugasku-v4';
const P = 16; // Jumlah pertemuan
const CL = ['#4f46e5', '#0d9488', '#e8590c', '#d6336c', '#1c7ed6', '#b7791f']; // Warna mata kuliah
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

/* Penyimpanan berkas (IndexedDB) */
const DBP = new Promise((ok, no) => {
  try {
    const r = indexedDB.open('tugasku', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('f');
    r.onsuccess = () => ok(r.result);
    r.onerror = () => no(r.error);
  } catch (e) {
    no(e);
  }
});
DBP.catch(() => {});

const idb = async (m, fn) => {
  const d = await DBP;
  return new Promise((ok, no) => {
    const t = d.transaction('f', m);
    const r = fn(t.objectStore('f'));
    t.oncomplete = () => ok(r.result);
    t.onerror = () => no(t.error);
  });
};

const fput = (k, b) => idb('readwrite', s => s.put(b, k));
const fget = k => idb('readonly', s => s.get(k));
const fdel = k => idb('readwrite', s => s.delete(k));

/* AKUN MAHASISWA - Ganti kredensial di sini */
const AKUN = {
  nim: '240511102',
  name: 'Fairuz Triharyadi',
  pw: 'Papoi123'
};

let S = null;
try {
  S = JSON.parse(localStorage.getItem(KEY));
} catch (e) {}

if (!S) {
  S = {
    session: null,
    mk: [
      { id: 1, s: 1, n: 'Pengantar Teknologi Informasi', c: 0 },
      { id: 2, s: 1, n: 'Matematika Dasar', c: 1 },
      { id: 3, s: 1, n: 'Bahasa Inggris', c: 2 },
      { id: 4, s: 2, n: 'Algoritma dan Pemrograman', c: 3 },
      { id: 5, s: 2, n: 'Basis Data', c: 4 }
    ],
    subs: []
  };
}

const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {}
};

let lr = null;
let sem = 1;
let cur = null;
let files = []; // Array untuk multiple files
let pend = null;

const fmt = ts => new Date(ts).toLocaleString('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

const sz = b => b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB';

function toast(m) {
  const t = $('#toast');
  t.textContent = m;
  t.classList.add('show');
  clearTimeout(toast.h);
  toast.h = setTimeout(() => t.classList.remove('show'), 2800);
}

const subOf = (m, p) => S.subs.find(s => s.mk == m && s.p == p);
const mkOf = i => S.mk.find(m => m.id == i);

$('#mS').innerHTML = [1, 2, 3, 4, 5, 6, 7, 8].map(k => `<option value="${k}">Semester ${k}</option>`).join('');

function render() {
  const A = $('#app');
  const s = S.session;
  
  if (!s) {
    A.innerHTML = login();
    return;
  }
  
  const stu = s.role == 'mhs';
  const list = S.mk.filter(m => m.s == sem);
  const cnt = k => S.subs.filter(x => {
    const m = mkOf(x.mk);
    return m && m.s == k;
  }).length;
  
  A.innerHTML = `<header><div class="wrap bar"><div class="logo"><b>T</b>Tugasku</div><div class="who"><span>${stu ? esc(AKUN.name) : 'Dosen pengampu'}</span><button class="btn g sm" id="out">Keluar</button></div></div></header>
  <main class="wrap"><div class="top"><h1>${stu ? 'Halo, ' + esc(AKUN.name.split(' ')[0]) : 'Dashboard dosen'}</h1>
  <p>${S.subs.length} tugas sudah dikumpulkan. ${stu ? 'Pilih semester, lalu ketuk nomor pertemuan untuk mengumpulkan tugas. Nomor berwarna berarti sudah terkumpul.' : 'Pilih semester, lalu ketuk nomor pertemuan yang berwarna untuk melihat dan mengunduh tugas.'}</p></div>
  <nav class="sems" aria-label="Semester">${[1, 2, 3, 4, 5, 6, 7, 8].map(k => `<button class="sem" data-sem="${k}" aria-pressed="${k == sem}">Semester ${k}${cnt(k) ? `<em>${cnt(k)}</em>` : ''}</button>`).join('')}</nav>
  <div class="grid">${list.map(m => {
    const n = S.subs.filter(x => x.mk == m.id).length;
    return `<article class="mk" style="--c:${CL[m.c % 6]}"><div class="mh"><div><h3>${esc(m.n)}</h3><span>${n} dari ${P} pertemuan terkumpul</span></div>${stu ? `<button class="x" data-delmk="${m.id}" aria-label="Hapus mata kuliah ${esc(m.n)}">×</button>` : ''}</div>
  <i class="pb"><u style="width:${n / P * 100}%"></u></i><div class="ps">${Array.from({ length: P }, (_, i) => i + 1).map(p => `<button class="p ${subOf(m.id, p) ? 'on' : ''}" data-p="${m.id}-${p}" aria-label="Pertemuan ${p}${subOf(m.id, p) ? ', terkumpul' : ''}">${p}</button>`).join('')}</div></article>`;
  }).join('')}
  ${stu ? '<button class="mk add" id="addMk">+ Tambah mata kuliah</button>' : ''}</div>
  ${!list.length && !stu ? '<div class="empty" style="margin-top:-40px;margin-bottom:60px"><b>Belum ada mata kuliah di semester ini</b>Mata kuliah akan muncul setelah ditambahkan mahasiswa.</div>' : ''}</main>`;
}

function login() {
  return `<div class="lg"><section class="art"><div class="logo"><b>T</b>Tugasku</div><div><h1>Kumpulkan tugas tepat waktu, tanpa ribet.</h1><p>Pilih semester, pilih mata kuliah, ketuk pertemuan, selesai.</p>
  <div class="stack"><div class="sheet s1"><i></i><i></i><i></i></div><div class="sheet s2"><i></i><i></i><i></i></div><div class="sheet s3"><i></i><i></i><i></i><span class="stamp">Terkumpul</span></div></div></div><span></span></section>
  <section class="pn"><h2>Selamat datang</h2><p>Pilih peran untuk melanjutkan.</p>
  <div class="roles"><button class="role" data-role="dsn"><b>Dosen</b><span>Langsung masuk, tanpa kata sandi</span></button>
  <button class="role" data-role="mhs" aria-pressed="${lr == 'mhs'}"><b>Mahasiswa</b><span>Masuk dengan NIM dan kata sandi</span></button></div>
  ${lr == 'mhs' ? `<div class="f"><label for="lN">NIM</label><input id="lN" inputmode="numeric" autocomplete="username"></div><div class="f"><label for="lP">Kata sandi</label><input id="lP" type="password" autocomplete="current-password"></div>
  <div class="err" id="lE" role="alert"></div><button class="btn" id="lGo" style="width:100%">Masuk</button>` : ''}</section></div>`;
}

/* Unduh */
async function dl(id) {
  const s = S.subs.find(x => x.id == id);
  try {
    const b = await fget(id);
    if (!b) throw 0;
    const d = window.claude && await window.claude.use('downloads');
    if (!d) {
      toast('Unduhan tidak tersedia di tampilan ini');
      return;
    }
    await d.save({ filename: s.file, data: b });
    toast('Berkas diunduh');
  } catch (e) {
    if (e && e.code == 'declined') return;
    toast('Berkas tidak dapat diunduh. Format harus PDF, DOCX, PPTX, XLSX, ZIP, gambar, atau TXT.');
  }
}

/* Berkas Multiple */
function addFiles(newFiles) {
  const E = $('#sE');
  E.textContent = '';
  
  for (const f of newFiles) {
    if (f.size > 10485760) {
      E.textContent = `${f.name} melebihi 10 MB. File dilewati.`;
      continue;
    }
    if (!/\.(pdf|docx|pptx|xlsx|zip|jpe?g|png|txt)$/i.test(f.name)) {
      E.textContent = `${f.name} format tidak didukung. File dilewati.`;
      continue;
    }
    // Cek duplikat
    if (!files.find(existing => existing.name === f.name)) {
      files.push(f);
    }
  }
  
  updateFilesDisplay();
}

function removeFile(index) {
  files.splice(index, 1);
  updateFilesDisplay();
}

function updateFilesDisplay() {
  $('#sF').value = '';
  $('#drop').hidden = files.length > 0;
  $('#fInfo').innerHTML = files.map((f, i) => 
    `<div class="file"><span>${esc(f.name)}, ${sz(f.size)}</span><button class="rmF" data-idx="${i}" aria-label="Hapus ${esc(f.name)}">×</button></div>`
  ).join('');
}

function openP(m, p) {
  cur = { m, p };
  const mk = mkOf(m);
  const s = subOf(m, p);
  const stu = S.session.role == 'mhs';
  files = [];
  updateFilesDisplay();
  
  $('#pH').textContent = 'Pertemuan ' + p;
  $('#pP').textContent = mk.n + ', semester ' + mk.s;
  $('#pCur').hidden = !s;
  
  // Tampilkan files yang sudah ada
  if (s && s.files && s.files.length > 0) {
    const fileList = s.files.map((f, i) => 
      `<div class="file-item">
        <span class="file-name">${esc(f.name)} <small>(${sz(f.size)})</small></span>
        ${!stu ? `<div class="file-actions">
          <button class="btn-icon" data-preview="${s.id}-${i}" title="Preview">👁</button>
          <button class="btn-icon" data-download="${s.id}-${i}" title="Download">⬇</button>
        </div>` : ''}
      </div>`
    ).join('');
    $('#pCur').innerHTML = `<b>File terkumpul:</b><br><small>Dikumpulkan ${fmt(s.at)}</small><div class="files-list">${fileList}</div>${s.note ? '<br><b>Catatan:</b> ' + esc(s.note) : ''}`;
  } else if (s) {
    $('#pCur').innerHTML = `<b>${esc(s.file || 'Tidak ada file')}</b><br><small>${s.size ? sz(s.size) + ', ' : ''}dikumpulkan ${fmt(s.at)}</small>${s.note ? '<br>Catatan: ' + esc(s.note) : ''}`;
  }
  
  $('#pNone').hidden = stu || !!s;
  $('#pEdit').hidden = !stu;
  $('#pSave').hidden = !stu;
  $('#pDel').hidden = !(stu && s);
  $('#pL').textContent = s ? 'Tambah/ganti berkas' : 'Berkas tugas';
  $('#sK').value = s ? s.note || '' : '';
  $('#sE').textContent = '';
  $('#dP').showModal();
}

$('#pSave').onclick = async () => {
  const E = $('#sE');
  const ex = subOf(cur.m, cur.p);
  
  if (!ex && files.length === 0) {
    E.textContent = 'Pilih minimal 1 berkas tugas terlebih dahulu.';
    return;
  }
  
  const id = ex ? ex.id : Date.now();
  const o = ex || { id, mk: cur.m, p: cur.p, files: [] };
  if (!ex) S.subs.push(o);
  
  // Simpan multiple files
  if (files.length > 0) {
    o.files = o.files || [];
    for (let i = 0; i < files.length; i++) {
      const fileId = `${id}-${Date.now()}-${i}`;
      try {
        await fput(fileId, files[i]);
        o.files.push({
          id: fileId,
          name: files[i].name,
          size: files[i].size,
          type: files[i].type
        });
      } catch (e) {
        E.textContent = `Gagal menyimpan ${files[i].name}. Coba file yang lebih kecil.`;
        return;
      }
    }
    o.at = Date.now();
    // Backup compatibility dengan format lama
    o.file = o.files[0].name;
    o.size = o.files.reduce((sum, f) => sum + f.size, 0);
  }
  
  o.note = $('#sK').value.trim();
  save();
  $('#dP').close();
  render();
  toast(files.length > 0 ? `${files.length} file berhasil dikumpulkan` : 'Catatan disimpan');
};

// Preview & Download handlers
async function previewFile(subId, fileIdx) {
  const s = S.subs.find(x => x.id == subId);
  if (!s || !s.files || !s.files[fileIdx]) {
    toast('File tidak ditemukan');
    return;
  }
  
  const fileInfo = s.files[fileIdx];
  try {
    const blob = await fget(fileInfo.id);
    if (!blob) throw new Error('Blob not found');
    
    const url = URL.createObjectURL(blob);
    const type = fileInfo.type || '';
    
    // Buka preview di window baru
    if (type.startsWith('image/')) {
      const win = window.open('', '_blank');
      win.document.write(`
        <!DOCTYPE html>
        <html><head><title>${esc(fileInfo.name)}</title>
        <style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#121316;}
        img{max-width:100%;max-height:100vh;object-fit:contain;}</style>
        </head><body><img src="${url}" alt="${esc(fileInfo.name)}"></body></html>
      `);
    } else if (type === 'application/pdf') {
      window.open(url, '_blank');
    } else if (type.startsWith('text/')) {
      const text = await blob.text();
      const win = window.open('', '_blank');
      win.document.write(`
        <!DOCTYPE html>
        <html><head><title>${esc(fileInfo.name)}</title>
        <style>body{font-family:monospace;padding:20px;background:#1e1e1e;color:#d4d4d4;}
        pre{white-space:pre-wrap;word-wrap:break-word;}</style>
        </head><body><pre>${esc(text)}</pre></body></html>
      `);
    } else {
      toast('Preview tidak tersedia untuk tipe file ini. Gunakan tombol download.');
      URL.revokeObjectURL(url);
    }
  } catch (e) {
    console.error(e);
    toast('Gagal membuka preview');
  }
}

async function downloadFile(subId, fileIdx) {
  const s = S.subs.find(x => x.id == subId);
  if (!s || !s.files || !s.files[fileIdx]) {
    toast('File tidak ditemukan');
    return;
  }
  
  const fileInfo = s.files[fileIdx];
  try {
    const blob = await fget(fileInfo.id);
    if (!blob) throw new Error('Blob not found');
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileInfo.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('File diunduh');
  } catch (e) {
    console.error(e);
    toast('Gagal mengunduh file');
  }
}

$('#pDel').onclick = () => {
  const s = subOf(cur.m, cur.p);
  pend = { k: 'sub', id: s.id };
  $('#cP').textContent = `Semua file pada pertemuan ${cur.p} akan dihapus.`;
  $('#dP').close();
  $('#dC').showModal();
};

$('#cGo').onclick = async () => {
  if (pend.k == 'sub') {
    const sub = S.subs.find(s => s.id == pend.id);
    // Hapus semua file dari IndexedDB
    if (sub && sub.files) {
      for (const f of sub.files) {
        try {
          await fdel(f.id);
        } catch (e) {}
      }
    }
    S.subs = S.subs.filter(s => s.id != pend.id);
  } else {
    const ids = S.subs.filter(s => s.mk == pend.id);
    // Hapus semua file dari mata kuliah
    for (const sub of ids) {
      if (sub.files) {
        for (const f of sub.files) {
          try {
            await fdel(f.id);
          } catch (e) {}
        }
      }
    }
    S.subs = S.subs.filter(s => s.mk != pend.id);
    S.mk = S.mk.filter(m => m.id != pend.id);
  }
  save();
  $('#dC').close();
  render();
  toast('Berhasil dihapus');
};

$('#mGo').onclick = () => {
  const n = $('#mN').value.trim();
  const s = +$('#mS').value;
  
  if (!n) {
    $('#mE').textContent = 'Nama mata kuliah wajib diisi.';
    return;
  }
  
  S.mk.push({ id: Date.now(), s, n, c: S.mk.length % 6 });
  sem = s;
  save();
  $('#dM').close();
  render();
  toast('Mata kuliah ditambahkan');
};

function doLogin() {
  const n = $('#lN').value.trim();
  const p = $('#lP').value;
  
  if (n != AKUN.nim || p != AKUN.pw) {
    $('#lE').textContent = 'NIM atau kata sandi salah. Periksa lagi lalu coba masuk kembali.';
    return;
  }
  
  S.session = { role: 'mhs' };
  save();
  render();
}

document.addEventListener('click', e => {
  const g = s => e.target.closest(s);
  const v = (s, k) => g(s) && g(s).dataset[k];
  
  if (g('[data-role]')) {
    if (v('[data-role]', 'role') == 'dsn') {
      S.session = { role: 'dos' };
      save();
      render();
    } else {
      lr = 'mhs';
      render();
      $('#lN').focus();
    }
  } else if (g('#lGo')) {
    doLogin();
  } else if (g('#out')) {
    S.session = null;
    lr = null;
    save();
    render();
  } else if (g('[data-sem]')) {
    sem = +v('[data-sem]', 'sem');
    render();
  } else if (g('[data-p]')) {
    const [m, p] = v('[data-p]', 'p').split('-').map(Number);
    openP(m, p);
  } else if (g('#addMk')) {
    $('#mN').value = '';
    $('#mS').value = sem;
    $('#mE').textContent = '';
    $('#dM').showModal();
  } else if (g('[data-delmk]')) {
    pend = { k: 'mk', id: +v('[data-delmk]', 'delmk') };
    $('#cP').textContent = 'Mata kuliah ' + mkOf(pend.id).n + ' beserta semua tugas di dalamnya akan dihapus.';
    $('#dC').showModal();
  } else if (g('[data-close]')) {
    g('dialog').close();
  } else if (g('#drop')) {
    $('#sF').click();
  } else if (g('.rmF')) {
    const idx = +v('.rmF', 'idx');
    removeFile(idx);
  } else if (g('[data-preview]')) {
    const [subId, fileIdx] = v('[data-preview]', 'preview').split('-').map(Number);
    previewFile(subId, fileIdx);
  } else if (g('[data-download]')) {
    const [subId, fileIdx] = v('[data-download]', 'download').split('-').map(Number);
    downloadFile(subId, fileIdx);
  }
});

document.addEventListener('change', e => {
  if (e.target.id == 'sF') addFiles(Array.from(e.target.files));
});

document.addEventListener('keydown', e => {
  if (e.key == 'Enter' && (e.target.id == 'lN' || e.target.id == 'lP')) {
    doLogin();
  }
  if (e.target.id == 'drop' && (e.key == 'Enter' || e.key == ' ')) {
    e.preventDefault();
    $('#sF').click();
  }
});

['dragover', 'dragenter'].forEach(v => $('#drop').addEventListener(v, e => {
  e.preventDefault();
  $('#drop').classList.add('on');
}));

['dragleave', 'drop'].forEach(v => $('#drop').addEventListener(v, e => {
  e.preventDefault();
  $('#drop').classList.remove('on');
}));

$('#drop').addEventListener('drop', e => addFiles(Array.from(e.dataTransfer.files)));

render();
