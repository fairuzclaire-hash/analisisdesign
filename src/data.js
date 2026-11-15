export const KANJI = ['壱','弐','参','四','伍','六','七','八','九','十'];

export const CATS = ['Semua','Web Development','UI/UX Design','Data Analysis','Desktop Application','Game Development','Python Programming','Multimedia & Motion Graphics','Graphic Design'];

export const PROJECTS = [
  { t:'Personal Portfolio Website', c:'Web Development', d:'Website portofolio pribadi dengan shader WebGL dan transisi halaman.', k:['React','Three.js','Tailwind CSS'], s:'Dalam pengembangan', img:'/foto.webp' },
  { t:'Sistem Informasi Jasa Editing Video Online', c:'Web Development', d:'Sistem pemesanan jasa editing video berbasis web.', k:['PHP','MySQL'], s:'Tugas kuliah', img:'/foto.webp' },
  { t:'Java Top Up Game Demo', c:'Desktop Application', d:'Simulasi top-up game dengan riwayat transaksi di MySQL.', k:['Java','MySQL'], s:'Demo', img:'/foto.webp' },
  { t:'Map Roblox', c:'Game Development', d:'Mini-game demonstrasi. Sesuaikan teknologi dengan implementasi aktual.', k:['Java','JavaScript'], s:'Demo', img:'/MapRoblox.jpg' },
  { t:'Minecraft Inventory System', c:'Python Programming', d:'Implementasi array, stack, dan graph untuk sistem inventaris.', k:['Python','Struktur Data'], s:'Tugas kuliah', img:'/foto.webp' },
  { t:'UMC Informatics Website', c:'UI/UX Design', d:'Website program studi dengan desain UI/UX modern.', k:['Figma','HTML','CSS'], s:'Prototype', img:'/foto.webp' },
  { t:'Data Analysis Dashboard', c:'Data Analysis', d:'Dashboard visualisasi dan analisis data.', k:['Python','Pandas'], s:'Prototype', img:'/foto.webp' },
  { t:'Motion Graphics Showcase', c:'Multimedia & Motion Graphics', d:'Kumpulan video editing, animasi teks, dan motion graphics.', k:['Editing','Motion'], s:'Kumpulan karya', img:'/foto.webp' },
];

export const SEMESTERS = [
  { y:'Tahun 1 · Ganjil', st:'Completed', sum:'Fondasi logika, algoritma, dan pengantar teknologi informasi.', c:['Algoritma dan Pemrograman','Matematika','Pengantar Teknologi Informasi','Logika Informatika','Pendidikan Agama Islam','Mata kuliah umum lainnya'], p:'Belum ada project.' },
  { y:'Tahun 1 · Genap', st:'Completed', sum:'Struktur data, OOP, dan basis data.', c:['Struktur Data','Pemrograman Berorientasi Objek','Sistem Digital','Matematika Diskrit','Basis Data','Mata kuliah umum lainnya'], p:'Minecraft Inventory System' },
  { y:'Tahun 2 · Ganjil', st:'Completed', sum:'Web, sistem operasi, jaringan, dan perancangan sistem.', c:['Pemrograman Web','Sistem Operasi','Jaringan Komputer','Analisis dan Perancangan Sistem','Interaksi Manusia dan Komputer','Mata kuliah lainnya'], p:'Sistem Informasi Jasa Editing Video Online' },
  { y:'Tahun 2 · Genap', st:'Completed', sum:'Rekayasa perangkat lunak dan pemrograman lanjut.', c:['Rekayasa Perangkat Lunak','Pemrograman Lanjut','Sistem Informasi','Statistika atau Probabilitas','Mata kuliah lainnya'], p:'Java Top-Up Game Demo' },
  { y:'Tahun 3 · Ganjil', st:'In Progress', sum:'AI, analisis data, pengembangan aplikasi, keamanan.', c:['Manajemen Proyek','Analisis dan Design','Pemrograman Berbasis Platform','AIK 4','Cara Jago Main Roblox'], p:'Data Analysis Dashboard' },
  { y:'Tahun 3 · Genap', st:'Upcoming', sum:'Machine learning, sistem lanjut, dan manajemen proyek TI.', c:['Machine Learning atau pilihan terkait','Pengembangan Sistem Lanjut','Manajemen Proyek TI','Mata kuliah pilihan lainnya'], p:'Belum ada project.' },
  { y:'Tahun 4 · Ganjil', st:'Upcoming', sum:'Kerja praktik, penelitian, dan proyek sistem.', c:['Kerja Praktik atau Magang','Penelitian','Proyek pengembangan sistem','Mata kuliah pilihan'], p:'Belum ada project.' },
  { y:'Tahun 4 · Genap', st:'Upcoming', sum:'Penyelesaian studi dan tugas akhir.', c:['Skripsi atau Tugas Akhir','Sidang atau penyelesaian studi','Dokumentasi proyek akhir'], p:'Belum ada project.' },
];

export const SKILLS = [
  { g:'Frontend', jp:'フロントエンド', i:[['HTML & CSS',80],['JavaScript',65],['UI/UX (Figma)',70]] },
  { g:'Backend & Data', jp:'データ', i:[['PHP & MySQL',65],['Python',65],['Analisis Data',55]] },
  { g:'Lainnya', jp:'その他', i:[['Java',55],['Video Editing',70],['Motion Graphics',55]] },
];

export const CAREER = [
  ['Sekarang','Mahasiswa Informatika','Membangun fondasi dan portofolio lewat tugas serta project.'],
  ['Target awal','Junior Web Developer / Magang','Pengalaman tim, version control, dan alur kerja produk.'],
  ['Menengah','Fullstack Web Developer','Merancang dan membangun fitur dari antarmuka sampai database.'],
  ['Spesialisasi','UI/UX Designer atau Data Analyst','Mendalami riset pengguna atau analisis dan visualisasi data.'],
  ['Jangka panjang','Lead / Product Engineer','Memimpin tim kecil dan mengambil keputusan teknis.'],
];

export const TAG = { 4:'Hasil project', 8:'UTS', 16:'UAS / Project akhir' };

export const COURSE = {};

export const meets = (si, ci) => Array.from({ length: 16 }, (_, n) => ({
  t: `Topik pertemuan ${n + 1} (isi di sini)`,
  m: 'Ringkasan materi (isi di sini)',
  r: TAG[n + 1] ? 'Hasil atau project pertemuan ini (isi di sini)' : '',
  ...(COURSE[`${si}-${ci}`]?.[n] || {}),
}));
