import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

// ===== BIODATA FAIRUZ =====
const BIO = {
  name: 'Muhammad Fairuz Triharyadi',
  nim: '240511102',
  university: 'Universitas Muhammadiyah Cirebon (UMC)',
  major: 'Teknik Informatika',
  semester: 5,
  skills: ['React', 'JavaScript', 'Python', 'UI/UX Design', 'Database', 'Three.js'],
  interests: ['Web Development', 'Machine Learning', 'Design Systems', '3D Animation', 'Video Editing'],
  contact: {
    email: 'fairuztriharyadi@gmail.com',
    linkedin: 'https://www.linkedin.com/in/muhammad-fairuz-triharyadi-93a541369',
    instagram: 'https://www.instagram.com/pailatte1',
    tiktok: 'https://www.tiktok.com/@payaruz',
  },
  projects: [
    { name: 'PayFlow', desc: 'Sistem pengumpulan tugas dengan MongoDB, fitur comment & smart profanity filter' },
    { name: 'Portfolio Website', desc: 'Portfolio interaktif dengan 3D shader effects pakai Three.js' },
    { name: 'Map Roblox', desc: 'Bikin Map Roblox sendirian walaupun sempat sakit' },
    { name: 'AI Cuaca', desc: 'Aplikasi AI untuk prediksi cuaca' },
    { name: 'Software Editing Mobile', desc: 'Sedang develop software editing mobile untuk MotionGraphic & 3D (komunitas Visual Seven)' },
  ],
};

// ===== SYSTEM PROMPT =====
const SYSTEM_PROMPT = `Kamu adalah AI assistant untuk portfolio ${BIO.name}.

BIODATA LENGKAP:
- Nama: ${BIO.name}
- NIM: ${BIO.nim}
- Kuliah: ${BIO.university}, ${BIO.major} semester ${BIO.semester}
- Skills: ${BIO.skills.join(', ')}
- Minat: ${BIO.interests.join(', ')}
- Email: ${BIO.contact.email}
- Projects: ${BIO.projects.map(p => `${p.name} (${p.desc})`).join('; ')}

INSTRUKSI:
1. Jawab pertanyaan tentang Fairuz dengan ramah, natural, dan informatif
2. Gunakan bahasa Indonesia casual tapi sopan
3. Boleh pakai emoji untuk friendly vibes
4. Kalau ditanya di luar scope biodata, bilang "Untuk hal itu lebih baik tanya langsung ke Fairuz ya!"
5. Jawab singkat tapi jelas (2-4 kalimat, max 5 bullet points)
6. Jangan bilang kamu AI buatan OpenAI/Claude, cukup bilang "AIpay"

FORMAT JAWABAN YANG WAJIB DIPAKAI:
PENTING: Gunakan line break (\n) untuk memisahkan setiap item list!

Contoh BENAR untuk list projects:
Fairuz punya beberapa project keren:
• **PayFlow** - sistem pengumpulan tugas
• **Portfolio Website** - portfolio dengan 3D effects
• **Map Roblox** - bikin map sendirian
• **AI Cuaca** - aplikasi prediksi cuaca
• **Software Editing Mobile** - lagi develop (komunitas Visual Seven)

Contoh BENAR untuk paragraf:
Fairuz kuliah di **UMC** jurusan **Teknik Informatika** semester 5.

Dia punya skill utama di **React, JavaScript, Python**, dan **UI/UX Design**. 

Sekarang tertarik banget sama **Web Development, 3D Animation**, sama **Video Editing**.

ATURAN FORMATTING:
- Setiap item list HARUS di baris baru (pakai \n)
- Gunakan • untuk bullet points
- Gunakan **bold** untuk nama project/skill penting
- Pisahkan paragraf dengan double line break (\n\n)
- JANGAN gabung semua list dalam 1 baris panjang!

Sekarang jawab pertanyaan user dengan format yang RAPI!`;

// ===== OPENROUTER API - REAL AI =====
// Support both VITE_ (local .env) and non-VITE_ (Vercel production)
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function chatWithRealAI(messages) {
  // DEBUG: Log API key status
  console.log('🔑 API Key check:', {
    vite: import.meta.env.VITE_OPENROUTER_API_KEY ? 'ADA' : 'KOSONG',
    regular: import.meta.env.OPENROUTER_API_KEY ? 'ADA' : 'KOSONG',
    final: API_KEY ? API_KEY.substring(0, 15) + '...' : 'UNDEFINED'
  });
  
  // Cek API key
  if (!API_KEY || API_KEY.includes('xxx')) {
    return {
      success: false,
      message: '⚠️ API key belum diisi! Buka file .env dan paste API key dari OpenRouter.'
    };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Portfolio Fairuz Triharyadi',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini', // GPT-4o Mini - murah, cepat, pintar!
        // Alternatif model lain yang GRATIS & BAGUS:
        // model: 'meta-llama/llama-3.1-8b-instruct:free', // Llama 3.1 - 100% GRATIS unlimited!
        // model: 'google/gemini-flash-1.5', // Gemini Flash - cepat & murah
        // model: 'anthropic/claude-3-haiku', // Claude 3 Haiku - pintar & cepat
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.choices[0].message.content
    };

  } catch (error) {
    console.error('Chat error:', error);
    return {
      success: false,
      message: `Error: ${error.message}. Cek console untuk detail.`
    };
  }
}

// ===== MESSAGE FORMATTER - Support Bold, Lists, Line Breaks =====
function MessageContent({ content }) {
  // STRATEGY: Split by numbered patterns (1., 2., 3.) or bullet patterns (• - *)
  // This forces proper list rendering even if AI doesn't use newlines
  
  const result = [];
  let text = content;
  
  // Detect if text contains numbered list pattern: "1. **Text** 2. **Text**"
  const hasNumberedList = /\d+\.\s+\*\*[^*]+\*\*/.test(text);
  
  if (hasNumberedList) {
    // Split by number patterns: "1. ", "2. ", "3. ", etc
    const parts = text.split(/(?=\d+\.\s+)/);
    
    const listItems = [];
    let intro = '';
    
    parts.forEach((part, idx) => {
      const trimmed = part.trim();
      if (!trimmed) return;
      
      // Check if starts with number
      const match = trimmed.match(/^(\d+)\.\s+(.+)/);
      if (match) {
        const itemText = match[2];
        listItems.push(itemText);
      } else {
        // It's intro text before list
        intro = trimmed;
      }
    });
    
    // Render intro + list
    if (intro) {
      result.push(
        <p key="intro" className="leading-relaxed mb-2">
          {formatInline(intro)}
        </p>
      );
    }
    
    if (listItems.length > 0) {
      result.push(
        <ul key="list" className="space-y-2 my-2">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="text-[#8e95a5] mt-0.5 flex-shrink-0">•</span>
              <span className="flex-1">{formatInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    }
    
  } else {
    // No numbered list detected - split by \n normally
    const lines = text.split('\n').filter(line => line.trim());
    
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      // Check for bullet points
      const isBullet = /^[•\-\*]\s+/.test(trimmed);
      
      if (isBullet) {
        const cleanItem = trimmed.replace(/^[•\-\*]\s*/, '');
        result.push(
          <div key={idx} className="flex gap-2 items-start my-1">
            <span className="text-[#8e95a5] mt-0.5 flex-shrink-0">•</span>
            <span className="flex-1">{formatInline(cleanItem)}</span>
          </div>
        );
      } else {
        result.push(
          <p key={idx} className="leading-relaxed my-1">
            {formatInline(trimmed)}
          </p>
        );
      }
    });
  }
  
  return <div className="space-y-1">{result}</div>;
}

// Format inline text (bold, etc)
function formatInline(text) {
  // Handle **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ===== CHAT COMPONENT =====
export default function AIChatBot({ onEnter, onLeave }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Halo! 👋 Saya AI assistant Fairuz. Ada yang ingin ditanyakan tentang skill, project, atau kontaknya?` }
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
    const result = await chatWithRealAI(newMessages);
    
    setMessages([...newMessages, { 
      role: 'assistant', 
      content: result.success ? result.message : result.message 
    }]);
    setLoading(false);
  };

  const quickQuestions = [
    'Skill apa aja yang dikuasai?',
    'Project apa yang pernah dibuat?',
    'Kuliah dimana?',
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
                <h3 className="text-sm font-semibold text-[#e2e4e9]">Real AI Assistant</h3>
                <p className="text-xs text-[#8e95a5]">Powered by ChatGPT 🤖</p>
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
                  <MessageContent content={msg.content} />
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
