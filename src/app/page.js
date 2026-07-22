"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePortfolioTracker } from "@/hooks/usePortfolioTracker";
import { fetchGithubContributions } from "@/app/actions";

gsap.registerPlugin(ScrollTrigger);

// ── Counter ───────────────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let v = 0; 
        const step = Math.ceil(to / 50);
        const t = setInterval(() => { 
          v += step; 
          if (v >= to) { 
            setVal(to); 
            clearInterval(t); 
          } else {
            setVal(v); 
          }
        }, 28);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Typewriter ────────────────────────────────────────────────────────────────
function Typewriter({ lines }) {
  const [li, setLi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const cur = lines[li];
    let delay = del ? 38 : 75;
    if (!del && ci === cur.length) delay = 2200;
    if (del && ci === 0) delay = 500;
    const t = setTimeout(() => {
      if (!del && ci < cur.length) setCi(c => c + 1);
      else if (!del && ci === cur.length) setDel(true);
      else if (del && ci > 0) setCi(c => c - 1);
      else { 
        setDel(false); 
        setLi(i => (i + 1) % lines.length); 
      }
    }, delay);
    return () => clearTimeout(t);
  }, [ci, del, li, lines]);

  return (
    <span>
      {lines[li].substring(0, ci)}
      <span style={{ animation: "blink 1s infinite", color: "var(--accent2)" }}>|</span>
    </span>
  );
}

// ── Text Scramble ─────────────────────────────────────────────────────────────
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
function ScrambleText({ text, delay = 0 }) {
  const [display, setDisplay] = useState(text);
  const done = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      let iteration = 0;
      const total = text.length * 5;
      const interval = setInterval(() => {
        setDisplay(
          text.split("").map((char, i) => {
            if (char === " ") return " ";
            if (i < Math.floor(iteration / 5)) return text[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join("")
        );
        iteration++;
        if (iteration >= total) {
          clearInterval(interval);
          setDisplay(text);
          done.current = true;
        }
      }, 40);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  return <>{display}</>;
}

// ── Particle Canvas ───────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const N = Math.min(80, Math.floor((canvas.width * canvas.height) / 14000));

    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        // Mouse repel
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.8;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Damping
        p.vx *= 0.98; 
        p.vy *= 0.98;
        // Speed cap
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 2) { 
          p.vx = (p.vx / spd) * 2; 
          p.vy = (p.vy / spd) * 2; 
        }

        p.x += p.vx; 
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${p.alpha})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124,58,237,${(1 - dist / 120) * 0.25})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0, opacity: 0.7,
      }}
    />
  );
}

// ── 3D Tilt Card ──────────────────────────────────────────────────────────────
function TiltCard({ children, className = "", style = {} }) {
  const ref = useRef(null);

  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transition = "box-shadow .3s, border-color .3s";
    el.style.transform = `perspective(600px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`;
    // Move sheen
    const sheen = el.querySelector(".ach-card-sheen, .about-card-sheen");
    if (sheen) {
      sheen.style.backgroundPosition = `${(x + 0.5) * 100}% ${(y + 0.5) * 100}%`;
      sheen.style.opacity = "1";
    }
  }, []);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform .6s cubic-bezier(.22,1,.36,1), box-shadow .3s, border-color .3s";
    el.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
    const sheen = el.querySelector(".ach-card-sheen, .about-card-sheen");
    if (sheen) sheen.style.opacity = "0";
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}

// ── Magnetic Button Hook ──────────────────────────────────────────────────────
function useMagnetic(strength = 0.38) {
  const ref = useRef(null);
  
  const handleMouseMove = useCallback((e) => {
    const el = ref.current; 
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) * strength;
    const dy = (e.clientY - rect.top - rect.height / 2) * strength;
    el.style.transform = `translate(${dx}px,${dy}px)`;
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current; 
    if (!el) return;
    el.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)";
    el.style.transform = "translate(0,0)";
    setTimeout(() => { 
      if (el) el.style.transition = ""; 
    }, 500);
  }, []);

  return { ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}

// ── Native Sound Synthesizer (Web Audio API) ─────────────────────────────────
const playSynthSFX = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'laser') {
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(250, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(7500, ctx.currentTime + 0.38);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.045, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.42);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    }
    
    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.038);
      gain.gain.setValueAtTime(0.012, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.038);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    }
    
    if (type === 'impact') {
      const oscSub = ctx.createOscillator();
      const oscPing = ctx.createOscillator();
      const gainSub = ctx.createGain();
      const gainPing = ctx.createGain();
      
      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(80, ctx.currentTime);
      oscSub.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.85);
      gainSub.gain.setValueAtTime(0.24, ctx.currentTime);
      gainSub.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
      oscSub.connect(gainSub);
      gainSub.connect(ctx.destination);
      
      oscPing.type = 'triangle';
      oscPing.frequency.setValueAtTime(780, ctx.currentTime);
      oscPing.frequency.exponentialRampToValueAtTime(390, ctx.currentTime + 0.35);
      gainPing.gain.setValueAtTime(0.045, ctx.currentTime);
      gainPing.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      oscPing.connect(gainPing);
      gainPing.connect(ctx.destination);
      
      oscSub.start();
      oscSub.stop(ctx.currentTime + 0.95);
      oscPing.start();
      oscPing.stop(ctx.currentTime + 0.55);
    }
  } catch (e) {
    // Fail silently
  }
};

const INTRO_LETTERS = "Vanshh".split("");

// ── GSAP Cinematic Intro ──────────────────────────────────────────────────────
function IntroScreen({ onDone }) {
  const screenRef = useRef(null);
  const topRef = useRef(null);
  const botRef = useRef(null);
  const ruleRef = useRef(null);
  const nameRef = useRef(null);
  const charsRef = useRef([]);
  const subRef = useRef(null);
  const shockwaveRef = useRef(null);

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;

    // Set initial states for rack focus & hidden state
    gsap.set(ruleRef.current, { scaleX: 0 });
    gsap.set(subRef.current, { opacity: 0, y: 12 });
    gsap.set(nameRef.current, { letterSpacing: '0.04em' });
    gsap.set(shockwaveRef.current, { xPercent: -50, yPercent: -50, scale: 0.1, opacity: 0, display: 'none' });
    
    // Alternating vertical entrance offsets (odd letters high, even letters low)
    charsRef.current.forEach((char, i) => {
      if (char) {
        gsap.set(char, {
          y: i % 2 === 0 ? -36 : 36,
          scale: 1.45,
          filter: 'blur(16px)',
          opacity: 0,
          backgroundPosition: '180% 0%'
        });
      }
    });

    const tl = gsap.timeline({
      delay: 0.4,
      onComplete: () => {
        onDone();
        gsap.set(el, { display: 'none' });
      }
    });

    tl
      // 1. Center laser line sweeps out (slow and majestic)
      .to(ruleRef.current, { 
        scaleX: 1, duration: 0.88, ease: 'power4.inOut',
        onStart: () => playSynthSFX('laser')
      })
      // 2. Alternate assembly
      .to(charsRef.current, {
        y: 0, scale: 1, filter: 'blur(0px)', opacity: 1,
        stagger: 0.15, duration: 1.45, ease: 'power3.out'
      }, '+=0.2');

    // 2.5. Sliding Decryption Scramble effect
    INTRO_LETTERS.forEach((finalChar, index) => {
      const charEl = charsRef.current[index];
      if (!charEl) return;
      const scrambleChars = "VASH01";
      tl.to({ val: 0 }, {
        val: 1,
        duration: 0.38,
        ease: 'none',
        onUpdate: function() {
          if (this.progress() < 0.82) {
            const tick = Math.floor(this.progress() * 8);
            charEl.innerText = scrambleChars[(tick + index) % scrambleChars.length];
          } else {
            charEl.innerText = finalChar;
          }
        },
        onComplete: () => {
          charEl.innerText = finalChar;
          playSynthSFX('tick');
        }
      }, `-=${1.45 - index * 0.15}`);
    });

    tl
      // 3. Hollow-to-Solid Liquid Chrome Reflection Sweep
      .to(charsRef.current.slice(0, INTRO_LETTERS.length), {
        backgroundPosition: '0% 0%', webkitTextStroke: '0px transparent',
        scale: 1.1, stagger: 0.08, duration: 0.95, ease: 'power3.out'
      }, '-=0.25')
      .to(charsRef.current.slice(0, INTRO_LETTERS.length), {
        scale: 1, stagger: 0.08, duration: 0.72, ease: 'power3.inOut'
      }, '-=0.88')
      
      // Pop the final dot with a clean subtle glow
      .to(charsRef.current[INTRO_LETTERS.length], {
        boxShadow: '0 0 12px rgba(167,139,250,0.7)',
        scale: 1.2, duration: 0.42, ease: 'power3.out',
        onStart: () => playSynthSFX('impact')
      }, '<')
      // Trigger a quick, sharp target ring that scales up fast and dissipates
      .fromTo(shockwaveRef.current, 
        { display: 'block', scale: 0.6, opacity: 0.8 },
        { scale: 4.8, opacity: 0, duration: 0.72, ease: 'power2.out' },
        '<'
      )
      .to(charsRef.current[INTRO_LETTERS.length], {
        scale: 1, duration: 0.35, ease: 'power3.inOut'
      }, '-=0.22')
      
      // 4. Subtitle fades up
      .to(subRef.current, {
        opacity: 1, y: 0, duration: 0.88, ease: 'power3.out'
      }, '-=0.38')
      // 5. Hold for reading
      .to({}, { duration: 1.2 })
      // 6. IMPLOSION
      .to(nameRef.current, {
        letterSpacing: '-1.15em',
        scale: 0.22,
        filter: 'blur(14px)',
        opacity: 0,
        duration: 1.15,
        ease: 'power4.inOut'
      })
      // 7. Laser line and subtitle collapse simultaneously
      .to(ruleRef.current, {
        scaleX: 0, opacity: 0, duration: 0.95, ease: 'power4.inOut'
      }, '<')
      .to(subRef.current, {
        y: 18, opacity: 0, filter: 'blur(8px)', duration: 0.95, ease: 'power4.inOut'
      }, '<')
      // 8. SKEWED DIAGONAL CURTAIN WIPE
      .to(topRef.current, { y: '-101%', skewY: -4.5, duration: 1.35, ease: 'power4.inOut' }, '-=0.45')
      .to(botRef.current, { y: '101%',  skewY: -4.5, duration: 1.35, ease: 'power4.inOut' }, '<');

    return () => tl.kill();
  }, [onDone]);

  return (
    <div ref={screenRef} id="intro-screen">
      <div ref={topRef} className="intro-panel intro-panel-top" />
      <div ref={botRef} className="intro-panel intro-panel-bottom" />
      <div className="intro-content">
        <div ref={ruleRef} className="intro-rule" />
        <div ref={nameRef} className="intro-name" style={{ display: 'flex', alignItems: 'baseline' }}>
          {INTRO_LETTERS.map((char, i) => (
            <span key={i} className={`intro-mask${char.toLowerCase() === 'n' ? ' mirror-n' : ''}`}>
              <span ref={el => { charsRef.current[i] = el; }} className="intro-char">{char}</span>
            </span>
          ))}
          <span className="intro-mask" style={{ overflow: 'visible', position: 'relative' }}>
            <span ref={el => { charsRef.current[INTRO_LETTERS.length] = el; }} className="intro-char dot" />
            <div ref={shockwaveRef} className="intro-shockwave" />
          </span>
        </div>
        <p ref={subRef} className="intro-sub">full stack developer</p>
      </div>
    </div>
  );
}

function MagneticNavLink({ href, label, active }) {
  const m = useMagnetic(0.28);
  return (
    <li>
      <a href={href} className={active ? 'active' : ''} ref={m.ref} onMouseMove={m.onMouseMove} onMouseLeave={m.onMouseLeave} style={{ display: 'inline-block' }}>
        {label}
      </a>
    </li>
  );
}

export default function Home() {
  usePortfolioTracker();
  const [introDone, setIntroDone] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredProject, setHoveredProject] = useState(null);
  const [githubContributions, setGithubContributions] = useState(204);
  
  const m1 = useMagnetic(0.4);
  const m2 = useMagnetic(0.4);
  const portalRef = useRef(null);
  const lastMouse = useRef({ x: 0, y: 0 });

  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    fetchGithubContributions()
      .then(total => {
        if (total > 0) {
          setGithubContributions(total);
        }
      })
      .catch(err => console.warn("Failed to fetch Github contributions via Server Action:", err));
  }, []);

  const handleProjectMouseMove = useCallback((e) => {
    if (portalRef.current) {
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };

      const rotX = gsap.utils.clamp(-12, 12, -dy * 0.45);
      const rotY = gsap.utils.clamp(-12, 12, dx * 0.45);

      gsap.to(portalRef.current, {
        x: e.clientX + 22,
        y: e.clientY + 22,
        rotateX: rotX,
        rotateY: rotY,
        duration: 0.42,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    }
  }, []);

  // Dynamic scale/opacity transitions for the project preview portal
  useEffect(() => {
    if (portalRef.current) {
      if (hoveredProject !== null) {
        gsap.to(portalRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.38,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      } else {
        gsap.to(portalRef.current, {
          opacity: 0,
          scale: 0.82,
          duration: 0.28,
          ease: 'power3.inOut',
          overwrite: 'auto'
        });
      }
    }
  }, [hoveredProject]);

  // Disable native scroll restoration & reset scroll position on mount
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1.18,
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => { 
      lenis.load ? null : lenis.raf(time); 
      requestAnimationFrame(raf); 
    };
    const rafId = requestAnimationFrame(raf);
    lenis.scrollTo(0, { immediate: true });
    return () => { 
      lenis.destroy(); 
      cancelAnimationFrame(rafId); 
    };
  }, []);

  // Scroll Progress
  useEffect(() => {
    const bar = document.getElementById("scroll-progress");
    const ids = ["hero", "about", "projects", "skills", "achievements", "contact"];
    const fn = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (bar) bar.style.width = `${(y / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%`;
      for (const id of [...ids].reverse()) {
        const el = document.getElementById(id);
        if (el && y >= el.offsetTop - 200) { 
          setActiveSection(id); 
          break; 
        }
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // GSAP ScrollTrigger Reveal Animations
  useEffect(() => {
    if (!introDone) return;

    const els = document.querySelectorAll(".reveal");
    els.forEach((el) => {
      gsap.fromTo(el,
        { y: 18, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.52,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 94%",
            toggleActions: "play none none none"
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [introDone]);

  const projects = [
    { idx: "01", name: "ConsistPay", desc: "A real coding accountability platform — not a tutorial project. Students deposit money, submit daily proof, and earn it back. Built full-stack: JWT auth, Razorpay payments, Gemini AI insights, streak engine, and GitHub-style analytics.", tags: ["Node.js", "Express", "MongoDB", "JWT", "Razorpay", "Gemini AI", "React"], live: "https://daily-coding-habit-tracker.vercel.app", repo: "https://github.com/vanshinatorr/Daily-coding-habit-tracker", badge: "60+ users" },
    { idx: "02", name: "Chess Multiplayer", desc: "Real-time multiplayer chess platform. Room-based matchmaking, live move sync across clients, turn management, and game timers — all over WebSockets.", tags: ["Socket.IO", "Node.js", "WebSockets", "JavaScript"], live: "https://chess-multiplayer-y54n.onrender.com", repo: "https://github.com/vanshinatorr/chess-multiplayer", badge: "Live" },
    { idx: "03", name: "Hotel Landing Page", desc: "Modern responsive hotel booking website with room showcase and booking form. Focused on clean UI, responsive layouts, and visual design — demonstrating frontend fundamentals done right.", tags: ["HTML", "CSS", "Responsive Design", "UI/UX"], repo: "https://github.com/vanshinatorr/hotel-landing-page-01", badge: "Frontend" },
  ];

  const skills = [
    { title: "Backend", items: ["Node.js", "Express.js", "REST APIs", "JWT Auth", "Socket.IO", "Razorpay", "Gemini AI"], primary: true },
    { title: "Frontend", items: ["React.js", "JavaScript", "Tailwind CSS", "HTML / CSS"] },
    { title: "Database & Tools", items: ["MongoDB", "Mongoose", "Postman", "Git", "Vercel", "Render", "VS Code"] },
    { title: "CS Fundamentals", items: ["DSA — 300+ problems", "OOPs", "DBMS", "Operating Systems"] },
  ];

  const achievements = [
    { icon: "🥇", title: "Top 50 on Codolio", sub: "Ranked among top 50 coding profiles out of 2000+ students at JECRC University" },
    { icon: "♟️", title: "District Chess Champion", sub: "District-level winner & college Runner-Up. 1500+ ELO on Chess.com — strategic thinker on and off the board." },
    { icon: "🧩", title: "300+ DSA Problems", sub: "Solved across LeetCode & GFG — arrays, trees, DP, hashing, recursion, graphs." },
    { icon: "💼", title: "Full Stack Intern", sub: "Plasmid Innovation — Jul to Sep 2025. Real-world MERN development." },
  ];

  const aboutCards = [
    { label: "Currently Building", val: "ConsistPay", sub: "60+ users · Live payments · AI insights" },
    { label: "University", val: "JECRC, Jaipur", sub: "B.Tech CSE · 2023–2027" },
    { label: "Experience", val: "Plasmid Innovation", sub: "Full Stack Intern · Jul–Sep 2025" },
    { label: "Chess", val: "District Champion", sub: "1500+ ELO · College Runner-Up" },
  ];

  return (
    <>
      <IntroScreen onDone={handleIntroDone} />

      <div id="scroll-progress" />

      {/* ── NAV ── */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href="#hero" className="nav-logo">
          Vansh<span>.</span>V
        </a>
        <ul className="nav-links">
          {["About", "Projects", "Skills", "Contact"].map(l => (
            <MagneticNavLink 
              key={l}
              href={`#${l.toLowerCase()}`} 
              label={l} 
              active={activeSection === l.toLowerCase()} 
            />
          ))}
        </ul>
        <div className="nav-right">
          <a href="mailto:vanshvijay9784@gmail.com" className="nav-cta" ref={m2.ref} onMouseMove={m2.onMouseMove} onMouseLeave={m2.onMouseLeave} data-track="Hire Me Clicked">Hire Me</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="noise" style={{ position: "relative" }}>
        <div className="hero-bg-wrapper">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <ParticleCanvas />
        </div>

        <p className="hero-eyebrow" style={{ position: "relative", zIndex: 1 }}>vansh vijay — full stack developer</p>
        <h1 className="hero-name" style={{ position: "relative", zIndex: 1 }}>
          <ScrambleText text="Building" delay={100} /><br />
          <span className="accent-line"><ScrambleText text="products," delay={400} /></span>
          <ScrambleText text=" not projects." delay={700} />
        </h1>
        <p className="hero-statement" style={{ position: "relative", zIndex: 1 }}>
          <strong>MERN stack developer & founder of ConsistPay</strong> — a real platform used by 60+ students with live Razorpay payments and Gemini AI.{" "}
          <Typewriter lines={["Final year CSE @ JECRC.", "Open to SDE internships.", "Shipping real things."]} />
        </p>
        <div className="hero-actions" style={{ position: "relative", zIndex: 1 }}>
          <a href="#projects" className="btn-primary" ref={m1.ref} onMouseMove={m1.onMouseMove} onMouseLeave={m1.onMouseLeave}>View Projects ↓</a>
          <a href="https://github.com/vanshinatorr" target="_blank" rel="noreferrer" className="btn-ghost" data-track="GitHub (Hero)">GitHub →</a>
        </div>
        <div className="hero-stats" style={{ position: "relative", zIndex: 1 }}>
          {[{ to: 60, suffix: "+", label: "ConsistPay Users" }, { to: 300, suffix: "+", label: "DSA Problems" }, { to: 1500, suffix: "+", label: "Chess ELO" }, { to: githubContributions, suffix: "", label: "GitHub Contributions" }].map(s => (
            <div className="stat-item" key={s.label}>
              <span className="stat-num"><Counter to={s.to} suffix={s.suffix} /></span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── ABOUT ── */}
      <section id="about">
        <p className="section-label reveal">About</p>
        <div className="about-grid">
          <div className="reveal">
            <h2 className="about-headline">CSE student.<br /><span className="line2">Product founder.</span><br />Backend engineer.</h2>
            <div className="about-body">
              <p>I'm a final year Computer Science student at JECRC University, Jaipur. I build full-stack products with the MERN stack — from REST APIs and JWT authentication to real-time WebSocket systems and payment integrations.</p>
              <p><strong>ConsistPay</strong> is my flagship product — a coding accountability platform where students put real money on the line for daily consistency. It has 60+ active users, live Razorpay transactions, and Gemini AI-powered insights. I built and deployed every part of it.</p>
              <p>I also interned at <strong>Plasmid Innovation</strong> where I worked on real MERN projects. Currently solving DSA daily and prepping for SDE placements.</p>
            </div>
          </div>
          <div className="about-cards reveal">
            {aboutCards.map(({ label, val, sub }) => (
              <TiltCard key={label} className="about-card">
                <div className="about-card-sheen" />
                <div className="about-card-label">{label}</div>
                <div className="about-card-val">{val}</div>
                <div className="about-card-sub">{sub}</div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── PROJECTS ── */}
      <section id="projects">
        <p className="section-label reveal">Projects</p>
        <div className="projects-list">
          {projects.map((p, i) => (
            <div 
              className={`project-row reveal`} 
              key={p.idx} 
              style={{ transitionDelay: `${i * 0.08}s` }}
              onMouseEnter={() => setHoveredProject(p.idx)}
              onMouseLeave={() => setHoveredProject(null)}
              onMouseMove={handleProjectMouseMove}
            >
              <div>
                <div className="project-index">{p.idx}</div>
                <div className="project-name">{p.name}</div>
                <div className="project-desc">{p.desc}</div>
                <div className="project-tags" style={{ marginTop: "1rem" }}>
                  {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
              <div />
              <div className="project-links">
                <span className="proj-live-badge">
                  <span className="live-dot" />
                  {p.badge}
                </span>
                {p.live && (
                  <a href={p.live} target="_blank" rel="noreferrer" className="proj-link" data-track={`Live Demo: ${p.name}`}>Live Demo ↗</a>
                )}
                {p.repo && (
                  <a href={p.repo} target="_blank" rel="noreferrer" className="proj-link" data-track={`GitHub Repo: ${p.name}`}>GitHub ↗</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── SKILLS ── */}
      <section id="skills">
        <p className="section-label reveal">Skills</p>
        <div className="skills-grid">
          {skills.map((g, i) => (
            <div key={g.title} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="skill-group-title">{g.title}</div>
              <div className="skill-chips">
                {g.items.map(s => (
                  <span 
                    key={s} 
                    className={`skill-chip${g.primary ? " primary" : ""}`}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                      e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── ACHIEVEMENTS ── */}
      <section id="achievements">
        <p className="section-label reveal">Achievements</p>
        <div className="ach-grid">
          {achievements.map((a, i) => (
            <TiltCard key={a.title} className="ach-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="ach-card-sheen" />
              <div className="ach-icon">{a.icon}</div>
              <div className="ach-title">{a.title}</div>
              <div className="ach-sub">{a.sub}</div>
            </TiltCard>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── CONTACT ── */}
      <section id="contact">
        <p className="section-label reveal">Contact</p>
        <div className="contact-wrap">
          <div className="reveal">
            <h2 className="contact-headline">Let's build<br />something real.</h2>
            <p className="contact-sub">Open to SDE internships, full-stack roles, and startup opportunities. If you're building something interesting, I want to hear about it.</p>
            <div className="contact-links">
              {[
                { icon: "✉️", label: "vanshvijay9784@gmail.com", href: "mailto:vanshvijay9784@gmail.com" },
                { icon: "💼", label: "linkedin.com/in/vansh-vijay", href: "https://www.linkedin.com/in/vansh-vijay/" },
                { icon: "🐙", label: "github.com/vanshinatorr", href: "https://github.com/vanshinatorr" },
                { icon: "🐦", label: "x.com/vanshvijay9", href: "https://x.com/vanshvijay9" },
                { icon: "🪐", label: "instagram.com/vansh_vj", href: "https://instagram.com/vansh_vj" },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="contact-link" data-track={`Contact: ${l.label}`}>
                  <span className="contact-link-icon">{l.icon}</span>{l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <p className="footer-copy">Built by <span>Vansh Vijay</span> · 2026</p>
        <a href="#hero" className="footer-back">Back to top ↑</a>
      </footer>

      {/* ── PROJECTS HOVER PORTAL ── */}
      <div 
        ref={portalRef} 
        className="project-preview-portal" 
        style={{ 
          opacity: 0,
          position: 'fixed',
          top: 0, left: 0,
          pointerEvents: 'none',
          zIndex: 1000,
          transform: 'scale(0.82) translate3d(0px, 0px, 0)'
        }}
      >
        <div className='portal-inner' style={{ padding: 0 }}>
          {hoveredProject === '01' && (
            <img src='/consistpay-preview.png' alt='ConsistPay Mockup' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {hoveredProject === '02' && (
            <img src='/chess-preview.png' alt='Chess Multiplayer Mockup' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {hoveredProject === '03' && (
            <img src='/hotel-preview.png' alt='Hotel Landing Page Mockup' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
      </div>
    </>
  );
}
