import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

// ===== BIODATA FAIRUZ =====
const BIO = {
  name: 'Muhammad Fairuz Triharyadi',
  nim: '240511102',
  university: 'Universitas Nusa Putra',
  major: 'Sistem Informasi',
  semester: 5,
  skills: ['React', 'JavaScript', 'Python', 'UI/UX Design', 'Database', 'Three.js'],
  interests: ['Web Development', 'Machine Learning', 'Design Systems'],
  contact: {
    linkedin: 'https://www.linkedin.com/in/muhammad-fairuz-triharyadi-93a541369',
    instagram: 'https://www.instagram.com/pailatte1',
    tiktok: 'https://www.tiktok.com/@payaruz',
  },
  projects: [
    { name: 'PayFlow - Task Submission System', tech: ['React', 'MongoDB', 'Vercel'], desc: 'Sistem pengumpulan tugas mahasiswa dengan fitur multi-user, comment, dan profanity filter' },
    { name: 'Portfolio Website', tech: ['React', 'Three.js', 'Tailwind'], desc: 'Portfolio interaktif dengan 3D effects dan academic tracker' },
  ],
  personality: 'Saya ramah, suka belajar hal baru, dan passionate tentang web development. Suka ngoding sambil dengerin musik!',
};

// ===== SYSTEM PROMPT =====
const SYSTEM_PROMPT = `Kamu adalah AI assistant untuk website portfolio ${BIO.name}. 

BIODATA:
- Nama: ${BIO.name}
- NIM: ${BIO.nim}
- Universitas: ${BIO.university}
- Jurusan: ${BIO.major}, Semester ${BIO.semester}
- Skills: ${BIO.skills.join(', ')}
- Interests: ${BIO.interests.join(', ')}
- Projects: ${BIO.projects.map(p => p.name).join(', ')}
- Personality: ${BIO.personality}

TUGAS KAMU:
1. Jawab pertanyaan tentang Fairuz dengan ramah dan natural
2. Jelaskan project-project yang dikerjakan
3. Bantu visitor yang ingin tahu lebih tentang background, skill, atau pengalaman Fairuz
4. Berikan informasi kontak jika diminta
5. Gunakan bahasa Indonesia casual tapi sopan (boleh campur Inggris sedikit)

ATURAN:
- Jangan berpura-pura jadi Fairuz, tapi jelaskan sebagai AI assistant-nya
- Kalau ditanya hal di luar biodata, bilang "Saya hanya tau tentang Fairuz, untuk hal lain sebaiknya tanya langsung ke dia!"
- Jaga percakapan tetap friendly dan engaging
- Jawab singkat tapi informatif (max 3-4 kalimat)

Sekarang, jawab pertanyaan visitor dengan natural!`;

// ===== SIMPLE AI CHATBOT - NO API NEEDED =====
// Chatbot sederhana dengan pattern matching
// Bisa diupgrade ke real AI nanti

function chatWithAI(messages) {
  return new Promise((resolve) => {
    // Simulate thinking delay
    setTimeout(() => {
      const lastMessage = messages[messages.length - 1].content.toLowerCase();
      
      // Pattern matching - jawab berdasarkan keyword
      let response = '';
      
      // Salam
      if (lastMessage.match(/halo|hai|hi|hello|hey/i)) {
        response = `Halo juga! 👋 Saya AI assistant Fairuz. Mau tanya apa nih tentang dia?`;
      }
      
      // Skill
      else if (lastMessage.match(/skill|kemampuan|bisa apa/i)) {
        response = `Fairuz punya skill di:\n• React & JavaScript\n• Python\n• UI/UX Design\n• Database (MongoDB)\n• Three.js untuk 3D web\n\nDia suka banget bikin website interaktif!`;
      }
      
      // Project
      else if (lastMessage.match(/project|portfolio|karya|buat apa/i)) {
        response = `Fairuz udah bikin beberapa project keren:\n\n1. **PayFlow** - Sistem pengumpulan tugas dengan MongoDB, fitur comment & profanity filter\n\n2. **Portfolio Website** - Website ini! Pakai React + Three.js buat animasi 3D\n\nSemua project bisa dilihat di section Projects di atas! 🚀`;
      }
      
      // Kuliah/Pendidikan
      else if (lastMessage.match(/kuliah|kampus|universitas|jurusan|semester/i)) {
        response = `Fairuz kuliah di **Universitas Nusa Putra**, jurusan **Sistem Informasi** semester 4. NIM-nya 240511102. Lagi fokus belajar web development sama machine learning!`;
      }
      
      // Tentang diri
      else if (lastMessage.match(/siapa|tentang|cerita|diri/i)) {
        response = `Fairuz itu mahasiswa Sistem Informasi yang passionate banget sama web development! Orangnya ramah, suka ngoding sambil dengerin musik, dan selalu excited belajar teknologi baru. Dia suka bikin website yang interactive dan user-friendly. 🎨💻`;
      }
      
      // Kontak
      else if (lastMessage.match(/kontak|hubungi|email|wa|whatsapp|sosmed|ig|instagram|linkedin/i)) {
        response = `Mau kontak Fairuz? Ini kontaknya:\n\n📧 Email: fairuztriharyadi@gmail.com\n💼 LinkedIn: linkedin.com/in/muhammad-fairuz-triharyadi-93a541369\n📱 Instagram: @pailatte1\n🎵 TikTok: @payaruz\n\nLangsung aja DM atau email! Dia responsif kok 😊`;
      }
      
      // Hobi/Interest
      else if (lastMessage.match(/hobi|suka|interest|senang/i)) {
        response = `Fairuz suka:\n• Web Development (terutama frontend)\n• Design UI/UX\n• Ngoding sambil dengerin musik\n• Eksplor teknologi baru\n• Bikin project side hustle\n\nPokoknya semua yang berhubungan sama creative coding! 🎨`;
      }
      
      // Tech stack
      else if (lastMessage.match(/tech|teknologi|pakai apa|tools/i)) {
        response = `Tech stack yang Fairuz pakai:\n\n**Frontend:** React, JavaScript, Tailwind CSS, Three.js\n**Backend:** Node.js, MongoDB\n**Tools:** Git, Vite, Vercel\n**Design:** Figma\n\nLagi belajar juga: Python, Machine Learning, TypeScript`;
      }
      
      // Lokasi
      else if (lastMessage.match(/dimana|lokasi|tinggal|asal/i)) {
        response = `Fairuz tinggal di Indonesia. Kuliah di Universitas Nusa Putra. Available untuk remote work atau magang! 🌏`;
      }
      
      // Terima kasih
      else if (lastMessage.match(/thanks|terima kasih|makasih|thank you/i)) {
        response = `Sama-sama! Senang bisabantu. Ada yang mau ditanyain lagi? 😊`;
      }
      
      // Default response
      else {
        const responses = [
          `Hmm, saya cuma tau tentang Fairuz nih! Coba tanya tentang skill, project, atau cara kontaknya? 🤔`,
          `Wah, pertanyaan menarik! Tapi saya fokus jawab seputar Fairuz aja ya. Mau tahu tentang project atau skill dia?`,
          `Untuk hal itu, mungkin lebih baik tanya langsung ke Fairuz. Saya bisa jelasin tentang background, skill, atau project dia aja! 📧`,
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
      }
      
      resolve(response);
    }, 800); // Simulate thinking time
  });
}

// ===== CHAT COMPONENT =====
export default function AIChatBot({ onEnter, onLeave }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Halo! 👋 Saya AI assistant Fairuz. Ada yang ingin kamu tanyakan tentang dia? Skill, project, atau apapun!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    // Get AI response
    const aiResponse = await chatWithAI(newMessages);
    
    setMessages([...newMessages, { role: 'assistant', content: aiResponse }]);
    setLoading(false);
  };

  const quickQuestions = [
    'Skill apa aja yang dikuasai?',
    'Project apa yang pernah dibuat?',
    'Ceritain tentang dirimu dong',
    'Gimana cara kontaknya?',
  ];

  const hv = { onMouseEnter: onEnter, onMouseLeave: onLeave };

  return (
    <>
      {/* Floating Chat Button */}
      {!open && (
        <button
          {...hv}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-50 p-4 bg-[#4338ca] text-white rounded-full shadow-2xl hover:bg-[#352cae] transition-all hover:scale-110 border border-[#6d65f3] group"
          aria-label="Buka AI Chat"
        >
          <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 left-6 z-50 w-[90vw] max-w-md h-[600px] bg-[#121316] border border-[#252830] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#252830] bg-[#181a20]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#4338ca] flex items-center justify-center text-white font-bold">
                  AI
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#181a20]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#e2e4e9]">AI Assistant</h3>
                <p className="text-xs text-[#8e95a5]">Online • Tanya tentang Fairuz</p>
              </div>
            </div>
            <button
              {...hv}
              onClick={() => setOpen(false)}
              className="p-2 text-[#8e95a5] hover:text-[#e2e4e9] transition-colors"
              aria-label="Tutup chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-[#4338ca] text-white'
                      : 'bg-[#181a20] text-[#e2e4e9] border border-[#252830]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#181a20] border border-[#252830] px-4 py-3 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#8e95a5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#8e95a5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#8e95a5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 space-y-2">
              <p className="text-xs text-[#8e95a5] font-mono uppercase tracking-wide">Pertanyaan cepat:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    {...hv}
                    onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 100); }}
                    className="text-xs px-3 py-1.5 border border-[#252830] text-[#8e95a5] hover:text-[#e2e4e9] hover:border-[#8e95a5] transition-colors rounded"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-[#252830]">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya sesuatu..."
                disabled={loading}
                className="flex-1 bg-[#181a20] border border-[#252830] px-4 py-2 text-sm text-[#e2e4e9] focus:outline-none focus:border-[#8e95a5] transition-colors rounded disabled:opacity-50"
              />
              <button
                type="submit"
                {...hv}
                disabled={!input.trim() || loading}
                className="p-2 bg-[#4338ca] text-white hover:bg-[#352cae] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
                aria-label="Kirim pesan"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
