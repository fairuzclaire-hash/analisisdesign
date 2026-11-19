import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowUpRight, ChevronRight, Menu, X, Send, CheckCircle2 } from 'lucide-react';
import Transition from './Transition.jsx';
import Content, { watch } from './Content.jsx';
import AIChatBot from './AIChatBot.jsx';

const NAV = ['About', 'Projects', 'Skills', 'Career', 'Contact'];
const LABELS = {
  hero: { k: '家', t: 'Home' }, about: { k: '概要', t: '01 — About' }, projects: { k: '制作実績', t: '02 — Projects' },
  skills: { k: '技術', t: '03 — Skills' }, career: { k: '進路', t: '04 — Career' }, contact: { k: '連絡', t: '05 — Contact' },
};

export default function App() {
  const [cursorHovered, setCursorHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const heroCanvasRef = useRef(null);
  const tr = useRef(null);
  const go = (fn, label) => (tr.current ? tr.current.run(fn, label) : fn());
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const velocityRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 });
  useEffect(() => {
    let animationFrameId;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      const vx = e.clientX - velocityRef.current.lastX;
      const vy = e.clientY - velocityRef.current.lastY;
      velocityRef.current.x = vx;
      velocityRef.current.y = vy;
      velocityRef.current.lastX = e.clientX;
      velocityRef.current.lastY = e.clientY;
    };

    const renderCursor = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;

      velocityRef.current.x *= 0.9;
      velocityRef.current.y *= 0.9;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(renderCursor);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameId = requestAnimationFrame(renderCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  useEffect(() => {
    const container = heroCanvasRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      varying vec2 vUv;

      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0) );
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / uResolution.xy;
        st.x *= uResolution.x / uResolution.y;

        float noiseVal = snoise(st * 1.8 + uTime * 0.15);
        float mouseDist = distance(vUv, uMouse);
        float ripple = sin(12.0 * (mouseDist - uTime * 0.4)) * exp(-4.0 * mouseDist);

        vec3 bgColor = vec3(0.07, 0.075, 0.086); 
        vec3 waveColor = vec3(0.55, 0.58, 0.65);
        vec3 accentColor = vec3(0.2, 0.22, 0.26);

        float finalIntensity = smoothstep(0.1, 0.9, noiseVal * 0.5 + 0.5 + ripple * 0.15);
        vec3 color = mix(bgColor, mix(accentColor, waveColor, finalIntensity), finalIntensity * 0.35);

        float gridX = step(0.992, fract(vUv.x * 24.0));
        float gridY = step(0.992, fract(vUv.y * 14.0));
        color += vec3(gridX + gridY) * 0.03;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let targetMouseX = 0.5;
    let targetMouseY = 0.5;

    const handleWindowMouseMove = (e) => {
      targetMouseX = e.clientX / window.innerWidth;
      targetMouseY = 1.0 - (e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleWindowMouseMove);

    const handleResize = () => {
      if (!container) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId;
    const animate = (time) => {
      uniforms.uTime.value = time * 0.001;
      uniforms.uMouse.value.x += (targetMouseX - uniforms.uMouse.value.x) * 0.05;
      uniforms.uMouse.value.y += (targetMouseY - uniforms.uMouse.value.y) * 0.05;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
    };
  }, []);
  useEffect(() => {
    const onClick = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      go(() => { setMobileMenuOpen(false); el.scrollIntoView({ behavior: 'instant', block: 'start' }); }, LABELS[id] || { k: '', t: id });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const offs = [...document.querySelectorAll('#contact .rv')].map((el) => watch(el, 0.88, () => el.classList.add('in')));
    return () => offs.forEach((f) => f());
  }, []);

  const onEnterHover = () => setCursorHovered(true);
  const onLeaveHover = () => setCursorHovered(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setFormSubmitted(true);
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' });
        setFormSubmitted(false);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#121316] text-[#e2e4e9] font-sans antialiased selection:bg-[#e2e4e9] selection:text-[#121316] relative overflow-x-hidden">
      <div ref={cursorRef} className="hidden md:block fixed top-0 left-0 w-8 h-8 -mt-4 -ml-4 pointer-events-none z-[100]">
        <div className={`w-full h-full rounded-full border transition-all duration-200 ${cursorHovered ? 'scale-150 bg-[#e2e4e9]/10 border-[#e2e4e9]' : 'scale-100 border-[#8e95a5]/50'}`} />
      </div>
      <div ref={cursorDotRef} className="hidden md:block fixed top-0 left-0 pointer-events-none z-[100]" style={{ marginTop: -3, marginLeft: -3 }}>
        <div className="w-1.5 h-1.5 rounded-full bg-[#e2e4e9]" />
      </div>
      <header className="fixed top-0 left-0 w-full z-40 px-6 md:px-12 py-6 flex items-center justify-between backdrop-blur-md bg-[#121316]/75 border-b border-[#252830]">
        <a 
          href="#hero" 
          onMouseEnter={onEnterHover}
          onMouseLeave={onLeaveHover}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 border border-[#8e95a5] flex items-center justify-center font-serif text-sm tracking-widest text-[#e2e4e9] group-hover:bg-[#e2e4e9] group-hover:text-[#121316] transition-all duration-300 relative overflow-hidden">
            <span className="relative z-10">平</span>
            <div className="absolute inset-0 bg-[#8e95a5] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-xs uppercase text-[#e2e4e9]">Fairuz Triharyadi</span>
            <span className="text-[10px] text-[#8e95a5] tracking-widest font-mono">開発者 — CREATIVE ENGINEER</span>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-[#8e95a5]">
          {NAV.map((item, idx) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onMouseEnter={onEnterHover}
              onMouseLeave={onLeaveHover}
              className="hover:text-[#e2e4e9] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#e2e4e9] hover:after:w-full after:transition-all after:duration-300 flex items-center gap-1.5"
            >
              <span className="text-[9px] font-mono text-[#8e95a5]/60">0{idx + 1}.</span>
              {item}
            </a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-[#8e95a5] tracking-widest font-mono border-l border-[#252830] pl-6">
          <span>INDONESIA / TOKYO</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#e2e4e9] p-2 border border-[#252830] focus:outline-none"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#121316] z-30 flex flex-col justify-center px-8 py-12 md:hidden border-b border-[#252830]">
          <div className="text-xs text-[#8e95a5] tracking-widest font-mono mb-8 border-b border-[#252830] pb-2">
            目次 — NAVIGATION
          </div>
          <div className="flex flex-col gap-6 text-2xl font-serif">
            {NAV.map((item, idx) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-[#e2e4e9] hover:text-[#8e95a5] py-2 border-b border-[#252830]/50"
              >
                <span>{item}</span>
                <span className="text-sm font-mono text-[#8e95a5]">0{idx + 1}</span>
              </a>
            ))}
          </div>
        </div>
      )}
      <section id="hero" className="relative min-h-screen flex items-center pt-24 pb-16 px-6 md:px-16 overflow-hidden border-b border-[#252830]">
        
        <div ref={heroCanvasRef} className="absolute inset-0 pointer-events-auto z-0" />
        <div className="absolute inset-0 pointer-events-none flex justify-between max-w-7xl mx-auto px-6 opacity-20 z-0">
          <div className="w-[1px] h-full bg-[#8e95a5]"></div>
          <div className="w-[1px] h-full bg-[#8e95a5]"></div>
          <div className="w-[1px] h-full bg-[#8e95a5]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-9 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 border border-[#252830] bg-[#121316]/80 backdrop-blur-sm text-xs tracking-widest uppercase text-[#8e95a5] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e2e4e9]"></span>
              <span>Available for WebGL & Systems Architecture</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#e2e4e9] leading-[1.05] font-sans">
              FAIRUZ <br />
              <span className="text-[#8e95a5] font-light italic font-serif">TRIHARYADI</span>
            </h1>
            <div className="max-w-xl text-sm md:text-base text-[#8e95a5] font-light leading-relaxed tracking-wide border-l-2 border-[#8e95a5]/40 pl-5 my-2">
              Saya Muhammad Fairuz Triharyadi udah gitu aja dlu
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="#projects"
                onMouseEnter={onEnterHover}
                onMouseLeave={onLeaveHover}
                className="px-7 py-3.5 bg-[#e2e4e9] text-[#121316] text-xs uppercase font-semibold tracking-widest flex items-center gap-3 hover:bg-[#8e95a5] transition-colors duration-300"
              >
                <span>View Selected Works</span>
                <ChevronRight size={14} />
              </a>

              <a
                href="#contact"
                onMouseEnter={onEnterHover}
                onMouseLeave={onLeaveHover}
                className="px-7 py-3.5 border border-[#252830] text-[#e2e4e9] text-xs uppercase tracking-widest hover:border-[#8e95a5] transition-colors duration-300"
              >
                Initiate Dialogue
              </a>
            </div>

          </div>
          <div className="hidden lg:flex lg:col-span-3 flex-col items-end justify-between h-full py-6 border-l border-[#252830]/60 pl-8">
            <div className="writing-vertical text-xl font-serif text-[#8e95a5] tracking-[0.4em] opacity-80 flex items-center gap-6">
              <span>デジタル体験</span>
              <span className="w-[1px] h-12 bg-[#252830]"></span>
              <span>三次元シェーダー</span>
            </div>

            <div className="text-right text-[11px] text-[#8e95a5]/70 tracking-widest flex flex-col gap-1 font-mono">
              <span>LAT: 35.6762° N</span>
              <span>LON: 139.6503° E</span>
              <span>THREE.JS SHADER WAVE</span>
            </div>
          </div>

        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <span className="text-[10px] tracking-widest uppercase font-mono text-[#8e95a5]">Scroll</span>
          <div className="w-4 h-7 border border-[#8e95a5] rounded-full p-1 flex justify-center">
            <div className="w-1 h-1.5 bg-[#e2e4e9] rounded-full animate-bounce"></div>
          </div>
        </div>

      </section>

      <Content go={go} onEnter={onEnterHover} onLeave={onLeaveHover} velocityRef={velocityRef} />
      <section id="contact" className="scroll-mt-20 py-28 px-6 md:px-16 max-w-7xl mx-auto relative">
        <div className="rv flex items-center justify-between border-b border-[#252830] pb-6 mb-16">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-[#8e95a5]">06 //</span>
            <h2 className="text-xs tracking-[0.3em] uppercase text-[#e2e4e9] font-semibold">Initiate Dialogue</h2>
          </div>
          <span className="text-xs font-serif text-[#8e95a5]">お問い合わせ</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="rv lg:col-span-5 flex flex-col justify-between space-y-8">
            <div>
              <h3 className="text-3xl sm:text-4xl font-serif text-[#e2e4e9] mb-4">
                Let's build something deliberate.
              </h3>
              <p className="text-sm text-[#8e95a5] font-light leading-relaxed">
                Butuh bantuan membangun web, desain UI/UX, atau sekadar ingin berdiskusi? Kirim pesan, saya senang mengobrol.
              </p>
            </div>
            <div className="space-y-4 border-y border-[#252830] py-6 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8e95a5]">Direct Email</span>
                <a
                  href="mailto:fairuztriharyadi@gmail.com"
                  onMouseEnter={onEnterHover}
                  onMouseLeave={onLeaveHover}
                  className="text-[#e2e4e9] hover:underline flex items-center gap-1"
                >
                  fairuztriharyadi@gmail.com
                  <ArrowUpRight size={12} />
                </a>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8e95a5]">Location</span>
                <span className="text-[#e2e4e9]">Indonesia</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8e95a5]">Availability</span>
                <span className="text-emerald-400">Terbuka untuk magang</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {[
                { label: 'GitHub', href: 'https://github.com' },
                { label: 'LinkedIn', href: 'https://linkedin.com' },
                { label: 'Twitter / X', href: 'https://x.com' }
              ].map((soc) => (
                <a
                  key={soc.label}
                  href={soc.href}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={onEnterHover}
                  onMouseLeave={onLeaveHover}
                  className="text-xs text-[#8e95a5] hover:text-[#e2e4e9] tracking-wider uppercase relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#e2e4e9] hover:after:w-full after:transition-all after:duration-300 font-mono"
                >
                  {soc.label}
                </a>
              ))}
            </div>

          </div>
          <div className="rv lg:col-span-7 bg-[#15171d] border border-[#252830] p-8 md:p-10" style={{ '--d': '200ms' }}>
            {formSubmitted ? (
              <div className="py-16 text-center flex flex-col items-center justify-center space-y-4">
                <CheckCircle2 size={40} className="text-emerald-400" />
                <h4 className="text-xl font-serif text-[#e2e4e9]">Message Dispatched</h4>
                <p className="text-xs text-[#8e95a5] max-w-xs font-mono">
                  Thank you for reaching out. I will respond to your inquiry within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#8e95a5] mb-2 font-mono">
                    01 // Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Kenji Sato"
                    className="w-full bg-[#121316] border border-[#252830] px-4 py-3 text-sm text-[#e2e4e9] focus:outline-none focus:border-[#8e95a5] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#8e95a5] mb-2 font-mono">
                    02 // Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="kenji@studio.jp"
                    className="w-full bg-[#121316] border border-[#252830] px-4 py-3 text-sm text-[#e2e4e9] focus:outline-none focus:border-[#8e95a5] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#8e95a5] mb-2 font-mono">
                    03 // Project Scope & Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Ceritakan kebutuhan atau ide kamu..."
                    className="w-full bg-[#121316] border border-[#252830] px-4 py-3 text-sm text-[#e2e4e9] focus:outline-none focus:border-[#8e95a5] transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  onMouseEnter={onEnterHover}
                  onMouseLeave={onLeaveHover}
                  className="w-full py-4 bg-[#e2e4e9] text-[#121316] text-xs font-semibold uppercase tracking-widest hover:bg-[#8e95a5] transition-colors flex items-center justify-center gap-2 font-mono"
                >
                  <span>Send Message (送信)</span>
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>

        </div>
        <div className="rv mt-28 pt-8 border-t border-[#252830] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8e95a5]/60">
          <div>
            © {new Date().getFullYear()} FAIRUZ TRIHARYADI. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <span>GLSL SHADER DISPLACEMENT ENGINE</span>
            <span>THREE.JS + REACT</span>
          </div>
        </div>

      </section>

      <Transition ref={tr} />
      <AIChatBot onEnter={onEnterHover} onLeave={onLeaveHover} />

    </div>
  );
}