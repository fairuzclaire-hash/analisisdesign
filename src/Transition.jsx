import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`;
const FRAG = `
uniform float uIn; uniform float uOut; uniform float uTime; uniform vec2 uRes;
varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1.0,0.0)), f.x), mix(h(i+vec2(0.0,1.0)), h(i+vec2(1.0,1.0)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.5, s = 0.0; for(int i = 0; i < 4; i++){ s += a*vn(p); p *= 2.02; a *= 0.5; } return s; }
void main(){
  vec2 uv = vUv; float asp = uRes.x / uRes.y;
  float n = fbm(vec2(uv.x * asp, uv.y) * 2.5 + uTime * 0.15);
  float c = uv.y * 0.62 + n * 0.38;
  float a = uIn * 1.3 - 0.15;
  float b = uOut * 1.3 - 0.15;
  float cover = smoothstep(c - 0.02, c + 0.02, a) * (1.0 - smoothstep(c - 0.02, c + 0.02, b));
  float e1 = smoothstep(0.0, 0.05, a - c) * (1.0 - smoothstep(0.05, 0.11, a - c)) * (1.0 - step(0.001, uOut));
  float e2 = smoothstep(0.0, 0.05, b - c) * (1.0 - smoothstep(0.05, 0.11, b - c));
  float grid = step(0.992, fract(uv.x * 24.0)) + step(0.992, fract(uv.y * 14.0));
  vec3 col = vec3(0.07, 0.075, 0.086) + vec3(grid) * 0.04 + vec3(n * 0.05);
  col += vec3(0.55, 0.58, 0.65) * (e1 + e2) * 0.9;
  gl_FragColor = vec4(col, clamp(max(cover, e2 * 0.9), 0.0, 1.0));
}`;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const tween = (g, key, ms) => new Promise((res) => {
  const t0 = performance.now();
  const tick = (now) => {
    const p = Math.min((now - t0) / ms, 1);
    g.u[key].value = ease(p);
    g.u.uTime.value = now * 0.001;
    g.renderer.render(g.scene, g.cam);
    p < 1 ? requestAnimationFrame(tick) : res();
  };
  requestAnimationFrame(tick);
});

const Transition = forwardRef(function Transition(_, ref) {
  const wrap = useRef(null), label = useRef(null), gl = useRef(null), busy = useRef(false);
  const [text, setText] = useState({ k: '', t: '' });

  useEffect(() => {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    wrap.current.prepend(renderer.domElement);
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const u = { uIn: { value: 0 }, uOut: { value: 0 }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) } };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: u, transparent: true });
    const geo = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geo, mat));
    const onResize = () => { renderer.setSize(window.innerWidth, window.innerHeight); u.uRes.value.set(window.innerWidth, window.innerHeight); };
    window.addEventListener('resize', onResize);
    gl.current = { renderer, scene, cam, u };
    return () => {
      window.removeEventListener('resize', onResize);
      geo.dispose(); mat.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    async run(mid, lab) {
      const g = gl.current, w = wrap.current;
      if (!g || busy.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { mid(); return; }
      busy.current = true;
      setText(lab || { k: '', t: '' });
      g.u.uIn.value = 0; g.u.uOut.value = 0;
      w.style.display = 'block';
      await tween(g, 'uIn', 900);
      label.current.style.opacity = 1;
      mid();
      await wait(700);
      label.current.style.opacity = 0;
      await wait(300);
      await tween(g, 'uOut', 900);
      w.style.display = 'none';
      busy.current = false;
    },
  }), []);

  return (
    <div ref={wrap} className="fixed inset-0 z-[90] hidden">
      <div ref={label} className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center opacity-0 transition-opacity duration-300 pointer-events-none">
        <span className="font-serif text-7xl md:text-9xl text-[#e2e4e9]">{text.k}</span>
        <span className="font-mono text-xs tracking-[0.4em] uppercase text-[#8e95a5]">{text.t}</span>
      </div>
    </div>
  );
});

export default Transition;
