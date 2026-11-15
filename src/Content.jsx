import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowUpRight, ChevronLeft, ChevronRight, Download, Pencil, Plus, Trash2, X } from 'lucide-react';
import { KANJI, CATS, PROJECTS, SEMESTERS, SKILLS, CAREER, TAG, meets } from './data.js';
import { uploadFile, deleteFile } from './supabaseClient.js';

const tagBox = 'text-[10px] uppercase font-mono px-2.5 py-1 border border-[#252830] text-[#8e95a5]';
const stColor = { Completed: 'text-emerald-400', 'In Progress': 'text-amber-300', Upcoming: 'text-[#8e95a5]' };

const watchers = new Set();
let ticking = false, bound = false;
const check = () => {
  ticking = false;
  const vh = window.innerHeight;
  watchers.forEach((w) => { const r = w.el.getBoundingClientRect(); if (r.top < vh * w.at && r.bottom > 0) { watchers.delete(w); w.cb(); } });
};
const kick = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
export function watch(el, at, cb) {
  if (!bound) { bound = true; window.addEventListener('scroll', kick, { passive: true }); window.addEventListener('resize', kick); }
  const w = { el, at, cb };
  watchers.add(w);
  kick();
  return () => watchers.delete(w);
}

function useInView(th = 0.25) {
  const r = useRef(null), [v, setV] = useState(false);
  useEffect(() => (r.current ? watch(r.current, 0.92 - th * 0.3, () => setV(true)) : undefined), []);
  return [r, v];
}

function Rv({ d = 0, className = '', children, as: Tag = 'div', ...p }) {
  const [r, v] = useInView(0.12);
  return <Tag ref={r} style={{ '--d': `${d}ms` }} className={`rv ${v ? 'in' : ''} ${className}`} {...p}>{children}</Tag>;
}
function Mask({ children, className = '', tag: Tag = 'h3' }) {
  const [r, v] = useInView(0.3);
  return <Tag ref={r} className={`overflow-hidden ${className}`}><span className="block transition-transform duration-[1300ms]" style={{ transform: v ? 'none' : 'translateY(105%)', transitionTimingFunction: 'var(--e)' }}>{children}</span></Tag>;
}
function Count({ to }) {
  const [r, v] = useInView(0.5), [n, setN] = useState(0);
  useEffect(() => {
    if (!v) return undefined;
    let id, t0;
    const tick = (t) => { t0 = t0 || t; const p = Math.min((t - t0) / 1400, 1); setN(Math.round(to * (1 - Math.pow(1 - p, 4)))); if (p < 1) id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [v, to]);
  return <span ref={r}>{n}</span>;
}
function useScrollFx() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const hero = document.querySelector('#hero > div.z-10');
    let queued = false;
    const run = () => {
      queued = false;
      const vh = window.innerHeight, y = window.scrollY;
      const bar = document.querySelector('[data-bar]');
      if (bar) bar.style.transform = `scaleX(${y / Math.max(1, document.documentElement.scrollHeight - vh)})`;
      if (hero) { const p = Math.min(1, y / (vh * 0.8)); hero.style.transform = `translate3d(0, ${p * 70}px, 0)`; hero.style.opacity = String(1 - p * 0.85); }
      document.querySelectorAll('[data-par]').forEach((el) => { const r = el.parentElement.getBoundingClientRect(); el.style.transform = `translate3d(0, ${-(r.top + r.height / 2 - vh / 2) * el.dataset.par}px, 0)`; });
      document.querySelectorAll('[data-prog]').forEach((el) => { const r = el.getBoundingClientRect(), ln = el.querySelector('[data-line]'); if (ln) ln.style.transform = `scaleY(${Math.max(0, Math.min(1, (vh * 0.75 - r.top) / r.height))})`; });
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(run); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    run();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (hero) { hero.style.transform = ''; hero.style.opacity = ''; } };
  }, []);
}

const ez = { transitionTimingFunction: 'var(--e)' };
const Sec = ({ id, no, title, jp, mark, children }) => {
  const [r, v] = useInView(0.5);
  return (
    <section id={id} className="isolate scroll-mt-20 py-28 px-6 md:px-16 max-w-7xl mx-auto border-b border-[#252830] relative">
      <span aria-hidden data-par="0.12" className="absolute right-0 -top-4 -z-10 font-serif text-[12rem] md:text-[18rem] leading-none text-[#16181d] select-none pointer-events-none">{mark}</span>
      <div ref={r} className="relative flex items-center justify-between pb-6 mb-16">
        <div className="flex items-center gap-4">
          <span className={`text-xs font-mono text-[#8e95a5] transition-all duration-1000 ${v ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={ez}>{no} //</span>
          <span className="block overflow-hidden"><h2 className={`text-xs tracking-[0.3em] uppercase text-[#e2e4e9] font-semibold transition-transform duration-[1200ms] ${v ? 'translate-y-0' : 'translate-y-full'}`} style={ez}>{title}</h2></span>
        </div>
        <span className={`text-xs font-serif text-[#8e95a5] transition-opacity duration-1000 delay-300 ${v ? 'opacity-100' : 'opacity-0'}`}>{jp}</span>
        <div className={`draw ${v ? 'in' : ''} absolute left-0 bottom-0 h-px w-full bg-[#252830]`} />
      </div>
      {children}
    </section>
  );
};

function HoverPreview({ idx, velocityRef }) {
  const box = useRef(null), cv = useRef(null);
  const project = PROJECTS[idx];
  
  useEffect(() => {
    const move = (e) => { if (box.current) box.current.style.transform = `translate(${e.clientX + 40}px, ${e.clientY - 100}px)`; };
    move({ clientX: velocityRef.current.lastX, clientY: velocityRef.current.lastY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  useEffect(() => {
    const c = cv.current;
    if (!c || !c.clientWidth) return;
    const r = new THREE.WebGLRenderer({ antialias: true });
    r.setSize(c.clientWidth, c.clientHeight);
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    c.appendChild(r.domElement);
    const s = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const u = { uTime: { value: 0 }, uSeed: { value: idx + 1 }, uVel: { value: new THREE.Vector2() } };
    const m = new THREE.ShaderMaterial({
      uniforms: u,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }',
      fragmentShader: `uniform float uTime; uniform float uSeed; uniform vec2 uVel; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i), h(i+vec2(1.0,0.0)), f.x), mix(h(i+vec2(0.0,1.0)), h(i+vec2(1.0,1.0)), f.x), f.y); }
        float fbm(vec2 p){ float a = 0.5, s = 0.0; for(int i = 0; i < 4; i++){ s += a*vn(p); p *= 2.02; a *= 0.5; } return s; }
        void main(){
          vec2 uv = vUv + uVel * 0.0015 * sin(vUv.yx * 3.14159);
          float n = fbm(uv * vec2(3.0, 2.0) * (1.0 + uSeed * 0.15) + uTime * 0.12 + uSeed * 7.0);
          float lines = smoothstep(0.42, 0.5, abs(fract(n * 8.0) - 0.5));
          float g = mix(0.10, 0.62, lines * n + n * 0.25);
          float ab = length(uVel) * 0.0004;
          gl_FragColor = vec4(vec3(g + ab, g, g - ab) * vec3(0.9, 0.95, 1.0), 1.0);
        }`,
    });
    const geo = new THREE.PlaneGeometry(2, 2);
    s.add(new THREE.Mesh(geo, m));
    let id;
    const tick = (t) => { u.uTime.value = t * 0.001; u.uVel.value.set(velocityRef.current.x, velocityRef.current.y); r.render(s, cam); id = requestAnimationFrame(tick); };
    tick(0);
    return () => { cancelAnimationFrame(id); geo.dispose(); m.dispose(); r.dispose(); r.forceContextLoss(); r.domElement.remove(); };
  }, [idx]);
  return (
    <div ref={box} className="hidden lg:block fixed top-0 left-0 pointer-events-none z-30 w-80 h-52 border border-[#8e95a5]/40 overflow-hidden shadow-2xl">
      {project.img ? (
        <>
          <img src={project.img} alt={project.t} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-transparent to-transparent opacity-40" />
          <span className="absolute bottom-2 left-3 font-serif text-4xl text-[#e2e4e9] drop-shadow-lg">{KANJI[idx]}</span>
        </>
      ) : (
        <>
          <div ref={cv} className="w-full h-full" />
          <span className="absolute bottom-2 left-3 font-serif text-4xl text-[#e2e4e9]/90">{KANJI[idx]}</span>
        </>
      )}
    </div>
  );
}

const Page = ({ children, onBack, hv }) => (
  <div className="fixed inset-0 z-[60] bg-[#121316] overflow-y-auto">
    <button onClick={onBack} {...hv} className="fixed top-6 right-6 z-[61] p-3 border border-[#252830] bg-[#121316] text-[#8e95a5] hover:text-[#e2e4e9] transition-colors"><X size={18} /></button>
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-24">{children}</div>
  </div>
);

function TugasButton({ hv }) {
  return (
    <a 
      href="/tugas.html" 
      target="_blank" 
      rel="noopener noreferrer"
      {...hv}
      className="fixed bottom-6 right-6 z-50 px-6 py-3 bg-[#4338ca] text-white text-xs font-mono uppercase tracking-widest font-semibold hover:bg-[#352cae] transition-all shadow-lg border border-[#6d65f3] flex items-center gap-2 group"
    >
      <span className="writing-vertical text-sm">課</span>
      <span>Tugas</span>
      <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </a>
  );
}

const KEY = 'portfolio-tugas-v1';
const STATUS = ['Belum', 'Dikerjakan', 'Selesai'];
const stTugas = { Belum: 'text-[#8e95a5]', Dikerjakan: 'text-amber-300', Selesai: 'text-emerald-400' };
const loadTugas = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };

const MAX = 50e6;
const idb = () => new Promise((res, rej) => { const r = indexedDB.open('portfolio-files', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const fx = async (mode, fn) => { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction('f', mode), rq = fn(tx.objectStore('f')); tx.oncomplete = () => { db.close(); res(rq && rq.result); }; tx.onerror = () => rej(tx.error); }); };
const putFile = (k, b) => fx('readwrite', (st) => st.put(b, k));
const getFile = (k) => fx('readonly', (st) => st.get(k));
const delFile = (k) => fx('readwrite', (st) => st.delete(k));
const meta = (f) => ({ name: f.name, type: f.type, size: f.size });
const fmtSize = (n) => (n > 1e6 ? (n / 1e6).toFixed(1) + ' MB' : Math.ceil(n / 1e3) + ' KB');

function useTugas() {
  const [list, setList] = useState(loadTugas);
  const commit = (fn) => setList((p) => { const n = fn(p); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { } return n; });
  return {
    list,
    add: async (t, file) => {
      const x = { ...t, id: Date.now() + Math.random().toString(36).slice(2, 6) };
      if (file) {
        // Upload ke Supabase
        const result = await uploadFile(file, 'tugas');
        if (result.success) {
          x.file = { name: result.name, size: result.size, type: result.type, url: result.url, path: result.path };
        } else {
          alert('Gagal upload file: ' + result.error);
          return;
        }
      }
      commit((p) => [...p, x]);
    },
    upd: async (id, t, file) => {
      const patch = { ...t };
      if (file) {
        // Hapus file lama dari Supabase jika ada
        const oldTask = list.find(x => x.id === id);
        if (oldTask?.file?.path) {
          await deleteFile(oldTask.file.path);
        }
        // Upload file baru
        const result = await uploadFile(file, 'tugas');
        if (result.success) {
          patch.file = { name: result.name, size: result.size, type: result.type, url: result.url, path: result.path };
        } else {
          alert('Gagal upload file: ' + result.error);
          return;
        }
      }
      commit((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    },
    del: (id) => {
      // Hapus file dari Supabase
      const task = list.find(x => x.id === id);
      if (task?.file?.path) {
        deleteFile(task.file.path).catch(console.error);
      }
      commit((p) => p.filter((x) => x.id !== id));
    },
  };
}

function DropZone({ onFiles, hv }) {
  const [over, setOver] = useState(false), ref = useRef(null);
  const take = (fl) => { const a = [...fl]; if (a.length) onFiles(a); };
  return (
    <div {...hv} onClick={() => ref.current.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}
      className={`cursor-pointer border border-dashed p-8 text-center mb-4 transition-colors ${over ? 'border-[#e2e4e9] bg-[#e2e4e9]/5' : 'border-[#8e95a5]/40 hover:border-[#8e95a5]'}`}>
      <input ref={ref} type="file" multiple hidden onChange={(e) => { take(e.target.files); e.target.value = ''; }} />
      <div className="font-serif text-3xl text-[#8e95a5] mb-2">投</div>
      <div className="text-xs font-mono uppercase tracking-widest text-[#e2e4e9]">{over ? 'Lepaskan file di sini' : 'Tarik file tugas ke sini'}</div>
      <div className="text-[11px] text-[#8e95a5] font-light mt-1">atau klik untuk memilih · maks 50 MB per file</div>
    </div>
  );
}

function TugasFile({ t }) {
  if (!t.file) return null;
  const f = t.file;
  const url = f.url; // URL dari Supabase
  
  return (
    <div className="mt-4">
      {url && f.type.startsWith('image/') && <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={f.name} className="max-h-64 border border-[#252830] mb-3" /></a>}
      <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
        <span className="text-[#e2e4e9] break-all">{f.name}</span><span className="text-[#8e95a5]">{fmtSize(f.size)}</span>
        {url ? (<><a href={url} target="_blank" rel="noreferrer" className="text-[#e2e4e9] hover:underline">Buka</a><a href={url} download={f.name} className="text-[#e2e4e9] hover:underline">Unduh</a></>) : <span className="text-[#8e95a5]">file tidak tersedia</span>}
      </div>
    </div>
  );
}

function TugasForm({ init, onSave, onCancel }) {
  const [f, setF] = useState({ judul: '', ket: '', link: '', due: '', status: 'Belum', ...init });
  const [file, setFile] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const inp = 'w-full bg-[#121316] border border-[#252830] px-4 py-3 text-sm text-[#e2e4e9] focus:outline-none focus:border-[#8e95a5] transition-colors';
  const lab = 'block text-[10px] uppercase tracking-widest text-[#8e95a5] mb-2 font-mono';
  const submit = (e) => {
    e.preventDefault();
    const link = f.link.trim();
    if (!f.judul.trim()) return;
    onSave({ ...f, judul: f.judul.trim(), link: link && !/^https?:\/\//i.test(link) ? 'https://' + link : link }, file);
  };
  return (
    <div className="fixed inset-0 z-[70] bg-[#121316]/90 backdrop-blur-md flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-[#181a20] border border-[#252830] w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5">
        <h4 className="font-serif text-2xl text-[#e2e4e9]">{init && init.id ? 'Edit tugas' : 'Tambah tugas'}</h4>
        <div><label className={lab}>Judul tugas *</label><input required value={f.judul} onChange={set('judul')} className={inp} placeholder="mis. Use Case Diagram Sistem Toko" /></div>
        <div><label className={lab}>Keterangan</label><textarea rows={3} value={f.ket} onChange={set('ket')} className={inp + ' resize-none'} placeholder="Deskripsi singkat tugas" /></div>
        <div><label className={lab}>Link hasil (GitHub / Drive / dll)</label><input value={f.link} onChange={set('link')} className={inp} placeholder="https://..." /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={lab}>Tenggat</label><input type="date" value={f.due} onChange={set('due')} className={inp} /></div>
          <div><label className={lab}>Status</label><select value={f.status} onChange={set('status')} className={inp}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select></div>
        </div>
        <div>
          <label className={lab}>File tugas (opsional)</label>
          <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const x = e.dataTransfer.files[0]; if (x) setFile(x); }}
            className="block cursor-pointer border border-dashed border-[#8e95a5]/40 hover:border-[#8e95a5] p-4 text-xs font-mono text-[#8e95a5] text-center transition-colors">
            <input type="file" hidden onChange={(e) => { const x = e.target.files[0]; if (x) setFile(x); }} />
            {file ? `${file.name} (${fmtSize(file.size)})` : f.file ? `${f.file.name} — tarik/klik untuk mengganti` : 'Tarik file ke sini atau klik untuk memilih'}
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 py-3 bg-[#e2e4e9] text-[#121316] text-xs font-mono font-semibold uppercase tracking-widest hover:bg-[#8e95a5] transition-colors">Simpan</button>
          <button type="button" onClick={onCancel} className="px-6 py-3 border border-[#252830] text-[#8e95a5] text-xs font-mono uppercase tracking-widest hover:text-[#e2e4e9] transition-colors">Batal</button>
        </div>
      </form>
    </div>
  );
}

export default function Content({ go, onEnter, onLeave, velocityRef }) {
  const [view, setView] = useState(null);           // null | {t:'p',i} | {t:'c',si,ci} | {t:'m',si,ci,n}
  const [q, setQ] = useState(''), [cat, setCat] = useState('Semua'), [all, setAll] = useState(false), [hov, setHov] = useState(null);
  const [sem, setSem] = useState(4);
  const [skRef, skIn] = useInView();
  const [phRef, phIn] = useInView(0.25);
  useScrollFx();
  const hv = { onMouseEnter: onEnter, onMouseLeave: onLeave };
  const { list: tg, add, upd, del } = useTugas();
  const [edit, setEdit] = useState(() => { try { return localStorage.getItem('portfolio-edit') === '1'; } catch { return false; } });
  const [form, setForm] = useState(null);
  const toggleEdit = () => { const v = !edit; setEdit(v); try { localStorage.setItem('portfolio-edit', v ? '1' : '0'); } catch { } };
  const cn = (si, ci, n) => tg.filter((x) => x.si === si && x.ci === ci && (n === undefined || x.n === n)).length;
  const exportJson = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(tg, null, 2)], { type: 'application/json' })); a.download = 'tugas-backup.json'; a.click(); URL.revokeObjectURL(a.href); };

  useEffect(() => { document.body.style.overflow = view ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [view]);
  const to = (v, l) => go(() => setView(v), l);

  const list = PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => (cat === 'Semua' || p.c === cat) && (p.t + p.k.join() + p.d).toLowerCase().includes(q.toLowerCase()));
  const shown = all ? list : list.slice(0, 6);
  const courses = SEMESTERS.reduce((a, s) => a + s.c.length, 0);
  const S = SEMESTERS[sem];

  const stats = [[PROJECTS.length, 'Total project'], [courses, 'Mata kuliah'], [0, 'Tools'], [0, 'Sertifikat']];

  let page = null;
  if (view && view.t === 'p') {
    const p = PROJECTS[view.i], T = '(isi di sini)';
    const fields = [['Latar belakang masalah', T], ['Tujuan project', T], ['Peran yang dikerjakan', T], ['Tools dan teknologi', p.k.join(', ')], ['Proses pengerjaan', T], ['Tantangan dan solusi', T], ['Screenshot atau video demo', 'Tambahkan gambar atau video'], ['Hasil akhir', T], ['Mata kuliah terkait', T], ['Link', 'GitHub / live demo / prototype (jika tersedia)']];
    page = (
      <Page hv={hv} onBack={() => to(null, { k: '戻', t: 'Projects' })}>
        <div className="text-xs font-mono text-[#8e95a5] uppercase">{p.c} — {p.s}</div>
        <h2 className="text-3xl sm:text-5xl font-serif mt-3 text-[#e2e4e9]">{p.t}</h2>
        <div className="font-serif text-[10rem] leading-none text-[#1d2027] my-6 select-none">{KANJI[view.i]}</div>
        <p className="text-sm text-[#8e95a5] font-light leading-relaxed mb-10 max-w-2xl">{p.d}</p>
        <div className="grid gap-px bg-[#252830] border border-[#252830]">
          {fields.map(([a, b]) => (<div key={a} className="bg-[#15171d] p-5"><div className="text-[10px] font-mono uppercase tracking-widest text-[#8e95a5] mb-1">{a}</div><div className="text-sm text-[#e2e4e9] font-light">{b}</div></div>))}
        </div>
      </Page>);
  } else if (view && view.t === 'c') {
    const s = SEMESTERS[view.si], ms = meets(view.si, view.ci), name = s.c[view.ci];
    page = (
      <Page hv={hv} onBack={() => to(null, { k: '戻', t: 'Academic' })}>
        <div className="text-xs font-mono text-[#8e95a5] uppercase">Semester {view.si + 1} — {s.y}</div>
        <h2 className="text-3xl sm:text-5xl font-serif mt-3 mb-3 text-[#e2e4e9]">{name}</h2>
        <p className="text-sm text-[#8e95a5] font-light mb-10">16 pertemuan. Pilih pertemuan untuk melihat materi dan hasilnya.</p>
        <div className="divide-y divide-[#252830] border-y border-[#252830]">
          {ms.map((m, n) => (
            <button key={n} {...hv} onClick={() => to({ t: 'm', si: view.si, ci: view.ci, n }, { k: String(n + 1).padStart(2, '0'), t: `Pertemuan ${n + 1}` })}
              className="group w-full flex items-center gap-6 py-5 px-3 text-left hover:bg-[#181a20] transition-colors">
              <span className={`font-mono text-sm w-8 ${TAG[n + 1] ? 'text-[#e2e4e9]' : 'text-[#8e95a5]'}`}>{String(n + 1).padStart(2, '0')}</span>
              <span className="flex-1 font-serif text-lg text-[#e2e4e9] group-hover:translate-x-2 transition-transform">{m.t}</span>
              {cn(view.si, view.ci, n) > 0 && <span className={tagBox}>{cn(view.si, view.ci, n)} tugas</span>}
              {TAG[n + 1] && <span className={tagBox}>{TAG[n + 1]}</span>}
              <ChevronRight size={16} className="text-[#8e95a5]" />
            </button>))}
        </div>
      </Page>);
  } else if (view && view.t === 'm') {
    const s = SEMESTERS[view.si], m = meets(view.si, view.ci)[view.n], name = s.c[view.ci];
    const mt = tg.filter((x) => x.si === view.si && x.ci === view.ci && x.n === view.n);
    const dropFiles = async (files) => {
      for (const f of files) {
        if (f.size > MAX) { window.alert(`${f.name} lebih dari 50 MB, dilewati.`); continue; }
        const result = await uploadFile(f, 'tugas');
        if (result.success) {
          await add({ 
            judul: f.name.replace(/\.[^.]+$/, ''), 
            ket: '', 
            link: '', 
            due: '', 
            status: 'Belum', 
            si: view.si, 
            ci: view.ci, 
            n: view.n 
          }, null);
          // Manually update the file info
          const newTask = list[list.length - 1];
          if (newTask) {
            newTask.file = { name: result.name, size: result.size, type: result.type, url: result.url, path: result.path };
          }
        } else {
          window.alert(`Gagal upload ${f.name}: ${result.error}`);
        }
      }
    };
    const hop = (n) => to({ ...view, n }, { k: String(n + 1).padStart(2, '0'), t: `Pertemuan ${n + 1}` });
    page = (
      <Page hv={hv} onBack={() => to({ t: 'c', si: view.si, ci: view.ci }, { k: '戻', t: name })}>
        <div className="text-xs font-mono text-[#8e95a5] uppercase">{name} — Pertemuan {view.n + 1}</div>
        <h2 className="text-3xl sm:text-5xl font-serif mt-3 mb-4 text-[#e2e4e9]">{m.t}</h2>
        {TAG[view.n + 1] && <span className={tagBox}>{TAG[view.n + 1]}</span>}
        <div className="border border-[#252830] bg-[#15171d] p-6 mt-8"><div className="text-[10px] font-mono uppercase tracking-widest text-[#8e95a5] mb-2">Ringkasan materi</div><p className="text-sm text-[#e2e4e9] font-light leading-relaxed">{m.m}</p></div>
        <div className="border border-dashed border-[#8e95a5]/50 p-10 mt-6 text-center">
          <div className="font-serif text-5xl text-[#252830] mb-3">{m.r ? '結果' : '記'}</div>
          <div className="text-xs font-mono uppercase tracking-widest text-[#8e95a5]">{m.r ? TAG[view.n + 1] : 'Catatan'}</div>
          <p className="text-sm text-[#8e95a5] font-light mt-2">{m.r ? `${m.r}. Tambahkan screenshot, video demo, atau link GitHub di sini.` : 'Tambahkan catatan atau tugas pertemuan ini.'}</p>
        </div>
        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252830] pb-4 mb-4">
            <h3 className="font-serif text-2xl text-[#e2e4e9]">Tugas <span className="font-mono text-sm text-[#8e95a5]">({mt.length})</span></h3>
            <div className="flex items-center gap-2">
              {edit && <button {...hv} onClick={() => setForm({ init: {} })} className="px-4 py-2 bg-[#e2e4e9] text-[#121316] text-[10px] font-mono uppercase tracking-widest font-semibold hover:bg-[#8e95a5] transition-colors flex items-center gap-2"><Plus size={12} />Tambah tugas</button>}
              {edit && tg.length > 0 && <button {...hv} onClick={exportJson} title="Unduh cadangan semua tugas" className="px-3 py-2 border border-[#252830] text-[#8e95a5] hover:text-[#e2e4e9] transition-colors"><Download size={12} /></button>}
              <button {...hv} onClick={toggleEdit} className={`px-3 py-2 border text-[10px] font-mono uppercase tracking-widest transition-colors ${edit ? 'border-[#e2e4e9] text-[#e2e4e9]' : 'border-[#252830] text-[#8e95a5]'}`}>Mode edit: {edit ? 'ON' : 'OFF'}</button>
            </div>
          </div>
          {edit && <DropZone hv={hv} onFiles={dropFiles} />}
          {mt.length === 0 && <p className="text-sm text-[#8e95a5] font-light py-6">Belum ada tugas untuk pertemuan ini.{edit ? '' : ' Aktifkan mode edit untuk menambah.'}</p>}
          <div className="space-y-3">
            {mt.map((t) => (
              <div key={t.id} className="border border-[#252830] bg-[#15171d] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-serif text-lg text-[#e2e4e9]">{t.judul}</h4>
                    <div className="text-[10px] font-mono uppercase tracking-widest mt-1 flex flex-wrap gap-x-4 gap-y-1"><span className={stTugas[t.status]}>{t.status}</span>{t.due && <span className="text-[#8e95a5]">Tenggat {t.due}</span>}</div>
                  </div>
                  {edit && (
                    <div className="flex gap-2">
                      <button {...hv} onClick={() => setForm({ init: t })} aria-label="Edit tugas" className="p-2 border border-[#252830] text-[#8e95a5] hover:text-[#e2e4e9] transition-colors"><Pencil size={13} /></button>
                      <button {...hv} onClick={() => { if (window.confirm(`Hapus tugas "${t.judul}"?`)) del(t.id); }} aria-label="Hapus tugas" className="p-2 border border-[#252830] text-[#8e95a5] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                    </div>)}
                </div>
                {t.ket && <p className="text-sm text-[#8e95a5] font-light leading-relaxed mt-3">{t.ket}</p>}
                {t.link && <a href={t.link} target="_blank" rel="noreferrer" {...hv} className="inline-flex items-center gap-1 mt-3 text-xs font-mono text-[#e2e4e9] hover:underline">Buka hasil<ArrowUpRight size={12} /></a>}
                <TugasFile t={t} />
              </div>))}
          </div>
        </div>
        {form && <TugasForm init={form.init} onCancel={() => setForm(null)} onSave={(d, file) => { if (file && file.size > MAX) { window.alert('File lebih dari 50 MB.'); return; } const { id, ...rest } = d; id ? upd(id, rest, file) : add({ ...rest, si: view.si, ci: view.ci, n: view.n }, file); setForm(null); }} />}
        <div className="flex justify-between mt-10">
          {view.n > 0 ? <button {...hv} onClick={() => hop(view.n - 1)} className="px-5 py-3 border border-[#252830] text-xs font-mono uppercase tracking-widest text-[#8e95a5] hover:text-[#e2e4e9] flex items-center gap-2"><ChevronLeft size={14} />Pertemuan {view.n}</button> : <span />}
          {view.n < 15 ? <button {...hv} onClick={() => hop(view.n + 1)} className="px-5 py-3 bg-[#e2e4e9] text-[#121316] text-xs font-mono uppercase tracking-widest font-semibold hover:bg-[#8e95a5] transition-colors flex items-center gap-2">Pertemuan {view.n + 2}<ChevronRight size={14} /></button> : <span />}
        </div>
      </Page>);
  }

  return (
    <>
      <div data-bar aria-hidden className="fixed top-0 left-0 h-[2px] w-full bg-[#e2e4e9] origin-left z-[45] pointer-events-none" style={{ transform: 'scaleX(0)' }} />
      <Sec id="about" no="01" title="About & Philosophy" jp="概要と哲学" mark="概">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 relative">
            <div ref={phRef} className="aspect-[4/5] bg-[#1a1c22] border border-[#252830] overflow-hidden relative flex items-end justify-center" style={{ clipPath: phIn ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)', transition: 'clip-path 1.5s var(--e)' }}>
              <img src="/foto.webp" alt="Muhammad Fairuz Triharyadi" className="h-full w-auto object-contain filter grayscale contrast-125 opacity-90" style={{ transform: phIn ? 'scale(1)' : 'scale(1.25)', transition: 'transform 2s var(--e)' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121316] via-transparent to-transparent opacity-60" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-[#8e95a5]/30 -z-10 pointer-events-none" />
            <div className="absolute bottom-6 left-6 bg-[#121316]/90 border border-[#252830] p-4 flex items-center gap-3">
              <span className="font-serif text-2xl text-[#e2e4e9]">学生</span>
              <div className="text-[10px] text-[#8e95a5] uppercase tracking-widest flex flex-col font-mono"><span>Gakusei (Student)</span><span>Informatics Engineering</span></div>
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <Mask className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#e2e4e9] font-normal leading-tight pb-1">Mahasiswa Informatika yang suka membuat web berfungsi dan enak dipakai.</Mask>
              <div className="w-12 h-[1px] bg-[#8e95a5]/50 my-6" />
              <Rv d={200} className="text-sm md:text-base text-[#8e95a5] font-light leading-relaxed space-y-4">
                <p>Saya Muhammad Fairuz Triharyadi, mahasiswa Teknik Informatika di Universitas Muhammadiyah Cirebon. Minat saya ada di pengembangan web fullstack, desain UI/UX, analisis data, dan multimedia.</p>
                <p>Tujuan saya selama kuliah: membangun fondasi yang kuat dan portofolio nyata sebelum lulus. Prinsip belajar saya sederhana, yaitu belajar sambil membuat. Setiap materi diuji lewat project kecil.</p>
              </Rv>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 mt-12 border-t border-[#252830]">
              {stats.map(([n, l], i) => (<Rv key={l} d={i * 100}><span className="block text-3xl font-serif text-[#e2e4e9]"><Count to={n} /></span><span className="text-[10px] uppercase tracking-widest text-[#8e95a5] mt-1 block font-mono">{l}</span></Rv>))}
            </div>
          </div>
        </div>
      </Sec>

      <Sec id="projects" no="02" title="Selected Artifacts" jp="制作実績" mark="作">
        {hov !== null && <HoverPreview idx={hov} velocityRef={velocityRef} />}
        <Rv className="flex flex-col md:flex-row gap-4 md:items-center mb-8">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari project atau teknologi…" aria-label="Cari project"
            className="w-full md:w-72 bg-[#121316] border border-[#252830] px-4 py-3 text-sm text-[#e2e4e9] focus:outline-none focus:border-[#8e95a5] transition-colors" />
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (<button key={c} {...hv} onClick={() => setCat(c)} className={`text-[10px] uppercase font-mono px-3 py-2 border transition-colors ${cat === c ? 'bg-[#e2e4e9] text-[#121316] border-[#e2e4e9]' : 'border-[#252830] text-[#8e95a5] hover:border-[#8e95a5]/50'}`}>{c}</button>))}
          </div>
        </Rv>
        <div className="divide-y divide-[#252830] border-y border-[#252830]">
          {shown.length === 0 && <p className="py-10 text-sm text-[#8e95a5] font-mono">Tidak ada project yang cocok.</p>}
          {shown.map(({ p, i }, idx) => (
            <Rv key={p.t} d={idx * 80}><div onMouseEnter={() => { setHov(i); onEnter(); }} onMouseLeave={() => { setHov(null); onLeave(); }}
              onClick={() => to({ t: 'p', i }, { k: KANJI[i], t: p.t })}
              className="group py-10 px-4 md:px-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#181a20] transition-colors duration-300">
              <div className="flex items-start md:items-center gap-6 md:gap-10">
                <span className="font-serif text-2xl text-[#8e95a5] group-hover:text-[#e2e4e9] transition-colors">{KANJI[i]}</span>
                <div>
                  <div className="text-[11px] font-mono text-[#8e95a5] uppercase tracking-wider mb-1">{p.c} — {p.s}</div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#e2e4e9] group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-3">{p.t}<ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8e95a5]" /></h3>
                  <p className="text-xs text-[#8e95a5] font-light mt-1 max-w-md hidden sm:block">{p.d}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">{p.k.map((t) => <span key={t} className={tagBox}>{t}</span>)}</div>
            </div></Rv>))}
        </div>
        {list.length > 6 && <div className="mt-8 text-center"><button {...hv} onClick={() => setAll(!all)} className="px-7 py-3.5 border border-[#252830] text-[#e2e4e9] text-xs uppercase tracking-widest hover:border-[#8e95a5] transition-colors font-mono">{all ? 'Show Less' : 'View All Projects'}</button></div>}
      </Sec>

      <Sec id="academic" no="03" title="Academic Journey" jp="学業の軌跡" mark="学">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-px bg-[#252830] border border-[#252830] mb-8">
          {SEMESTERS.map((s, i) => (
            <button key={i} {...hv} onClick={() => setSem(i)} className={`py-4 text-center transition-colors ${sem === i ? 'bg-[#e2e4e9] text-[#121316]' : 'bg-[#15171d] text-[#8e95a5] hover:bg-[#181a20]'}`}>
              <span className="block text-[9px] font-mono uppercase tracking-widest">Sem</span>
              <span className="block font-serif text-2xl">{i + 1}</span>
            </button>))}
        </div>
        <div key={sem} className="slide-in border border-[#252830] bg-[#15171d] p-6 md:p-10">
          <div className="flex flex-wrap justify-between gap-4 mb-8">
            <div>
              <h3 className="text-2xl md:text-4xl font-serif text-[#e2e4e9]">Semester {sem + 1}</h3>
              <p className="text-xs font-mono text-[#8e95a5] uppercase mt-2">{S.y} — {S.c.length} mata kuliah</p>
              <p className="text-sm text-[#8e95a5] font-light mt-3 max-w-xl">{S.sum}</p>
            </div>
            <span className={`self-start text-[10px] font-mono uppercase tracking-widest border border-[#252830] px-3 py-1.5 ${stColor[S.st]}`}>{S.st}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#252830] border border-[#252830]">
            {S.c.map((c, ci) => (
              <Rv key={c} d={ci * 70} className="bg-[#121316]"><button {...hv} onClick={() => to({ t: 'c', si: sem, ci }, { k: '講義', t: c })} className="group w-full h-full block p-5 text-left hover:bg-[#181a20] transition-colors">
                <span className="text-[10px] font-mono text-[#8e95a5]">{String(ci + 1).padStart(2, '0')}</span>
                <span className="block font-serif text-lg text-[#e2e4e9] mt-1 group-hover:translate-x-1 transition-transform">{c}</span>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-[#8e95a5]/70 mt-3">Lihat 16 pertemuan{cn(sem, ci) ? ` · ${cn(sem, ci)} tugas` : ''} →</span>
              </button></Rv>))}
          </div>
          <div className="mt-6 border border-dashed border-[#8e95a5]/40 px-5 py-4 text-xs font-mono text-[#8e95a5]"><span className="text-[#e2e4e9]">Project semester ini:</span> {S.p}</div>
        </div>
      </Sec>

      <Sec id="skills" no="04" title="Technical Expertise" jp="技術スタック" mark="技">
        <div ref={skRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SKILLS.map((g, gi) => (
            <Rv key={g.g} d={gi * 120} className="h-full"><div className="h-full border border-[#252830] p-8 bg-[#15171d] hover:border-[#8e95a5]/40 transition-colors">
              <div className="flex items-center justify-between border-b border-[#252830] pb-4 mb-6"><span className="text-xs font-mono text-[#8e95a5]">0{gi + 1}</span><span className="font-serif text-lg text-[#8e95a5]">{g.jp}</span></div>
              <h3 className="text-lg font-serif text-[#e2e4e9] mb-6">{g.g}</h3>
              <div className="space-y-5">
                {g.i.map(([n, v]) => (
                  <div key={n}>
                    <div className="flex justify-between text-xs text-[#8e95a5] font-light mb-2"><span>{n}</span><span className="font-mono">{v}%</span></div>
                    <div className="h-[2px] bg-[#252830]"><div className="h-full bg-[#e2e4e9] transition-all duration-[1400ms] ease-out" style={{ width: skIn ? `${v}%` : '0%' }} /></div>
                  </div>))}
              </div>
            </div></Rv>))}
        </div>
      </Sec>

      <Sec id="career" no="05" title="Career Roadmap" jp="進路" mark="進">
        <div data-prog className="relative max-w-3xl border-l border-[#252830] ml-2"><span data-line aria-hidden className="absolute -left-px top-0 w-px h-full bg-[#e2e4e9] origin-top" style={{ transform: 'scaleY(0)' }} />
          {CAREER.map(([w, t, d], i) => (
            <Rv key={t} className="relative pl-10 pb-12 last:pb-0">
              <span className={`absolute -left-[5px] top-1.5 w-[9px] h-[9px] border border-[#8e95a5] ${i === 0 ? 'bg-[#e2e4e9]' : 'bg-[#121316]'}`} />
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#8e95a5]">{String(i + 1).padStart(2, '0')} — {w}</div>
              <h3 className="text-xl md:text-2xl font-serif text-[#e2e4e9] mt-1">{t}</h3>
              <p className="text-sm text-[#8e95a5] font-light mt-2 max-w-lg">{d}</p>
            </Rv>))}
        </div>
      </Sec>

      <TugasButton hv={hv} />
      {page}
    </>
  );
}
