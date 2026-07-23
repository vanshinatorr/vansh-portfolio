"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePortfolioTracker } from "@/hooks/usePortfolioTracker";
import { fetchGithubContributions } from "@/app/actions";

gsap.registerPlugin(ScrollTrigger);

// ── Audio Engine (HTML5 Background Music & Fades) ──────────────────────────────
let bgAudio = null;
let fadeInterval = null;

const startAmbientDrone = () => {
  try {
    if (typeof window === 'undefined') return;
    if (!bgAudio) {
      bgAudio = new Audio('/intro.mp3');
      bgAudio.loop = true;
      bgAudio.volume = 0;
    }
    
    if (fadeInterval) clearInterval(fadeInterval);
    
    bgAudio.play().then(() => {
      // Fade in to 0.28 volume over 1.5 seconds
      const targetVol = 0.28;
      const step = targetVol / 15;
      fadeInterval = setInterval(() => {
        if (bgAudio.volume < targetVol) {
          bgAudio.volume = Math.min(targetVol, bgAudio.volume + step);
        } else {
          clearInterval(fadeInterval);
        }
      }, 100);
    }).catch(e => {
      console.warn("Autoplay blocked or play error:", e);
    });
  } catch (e) {
    console.warn("Audio start error:", e);
  }
};

const stopAmbientDrone = () => {
  try {
    if (!bgAudio) return;
    if (fadeInterval) clearInterval(fadeInterval);
    
    // Fade out to 0 volume over 800ms
    const step = bgAudio.volume / 8;
    fadeInterval = setInterval(() => {
      if (bgAudio.volume > 0.04) {
        bgAudio.volume = Math.max(0, bgAudio.volume - step);
      } else {
        bgAudio.pause();
        bgAudio.volume = 0;
        clearInterval(fadeInterval);
      }
    }, 100);
  } catch (e) {
    console.warn("Audio stop error:", e);
  }
};


const playSynthSFX = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = audioCtx && audioCtx.state === 'running' ? audioCtx : new AudioContext();
    
    if (type === 'laser') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);
      
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    }
    
    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    }
    
    if (type === 'impact') {
      const osc = ctx.createOscillator();
      const oscSub = ctx.createOscillator();
      const gain = ctx.createGain();
      const gainSub = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(100, ctx.currentTime);
      oscSub.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.45);
      gainSub.gain.setValueAtTime(0.18, ctx.currentTime);
      gainSub.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
      oscSub.connect(gainSub);
      gainSub.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
      oscSub.start();
      oscSub.stop(ctx.currentTime + 0.5);
    }

    if (type === 'chess_move') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    }
    
    if (type === 'chess_capture') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.setValueAtTime(120, ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    }

    if (type === 'chess_check') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(780, ctx.currentTime);
      osc.frequency.setValueAtTime(620, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    }

    if (type === 'chess_mate') {
      const chord = [261.63, 329.63, 392.00, 523.25];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.05 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + idx * 0.05 + 0.55);
      });
    }
  } catch (e) {
    // Fail silently
  }
};

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
        ctx.fillStyle = `rgba(255,107,0,${p.alpha})`;
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
            ctx.strokeStyle = `rgba(255,107,0,${(1 - dist / 120) * 0.25})`;
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

// ── Magnetic Button DOM Utility ────────────────────────────────────────────────
const makeMagnetic = (el, strength = 0.38) => {
  if (!el) return;
  const onMouseMove = (e) => {
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) * strength;
    const dy = (e.clientY - rect.top - rect.height / 2) * strength;
    el.style.transform = `translate(${dx}px,${dy}px)`;
  };
  const onMouseLeave = () => {
    el.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)";
    el.style.transform = "translate(0,0)";
    setTimeout(() => { 
      if (el) el.style.transition = ""; 
    }, 500);
  };
  el.addEventListener('mousemove', onMouseMove);
  el.addEventListener('mouseleave', onMouseLeave);
  return () => {
    el.removeEventListener('mousemove', onMouseMove);
    el.removeEventListener('mouseleave', onMouseLeave);
  };
};

// ── GSAP Cinematic Intro ──────────────────────────────────────────────────────
const INTRO_LETTERS = "Vanshh".split("");

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

    gsap.set(ruleRef.current, { scaleX: 0 });
    gsap.set(subRef.current, { opacity: 0, y: 12 });
    gsap.set(nameRef.current, { letterSpacing: '0.04em' });
    gsap.set(shockwaveRef.current, { xPercent: -50, yPercent: -50, scale: 0.1, opacity: 0, display: 'none' });
    
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
      .to(ruleRef.current, { 
        scaleX: 1, duration: 0.88, ease: 'power4.inOut',
        onStart: () => playSynthSFX('laser')
      })
      .to(charsRef.current, {
        y: 0, scale: 1, filter: 'blur(0px)', opacity: 1,
        stagger: 0.15, duration: 1.45, ease: 'power3.out'
      }, '+=0.2');

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
      .to(charsRef.current.slice(0, INTRO_LETTERS.length), {
        backgroundPosition: '0% 0%', webkitTextStroke: '0px transparent',
        scale: 1.1, stagger: 0.08, duration: 0.95, ease: 'power3.out'
      }, '-=0.25')
      .to(charsRef.current.slice(0, INTRO_LETTERS.length), {
        scale: 1, stagger: 0.08, duration: 0.72, ease: 'power3.inOut'
      }, '-=0.88')
      .to(charsRef.current[INTRO_LETTERS.length], {
        boxShadow: '0 0 12px rgba(240,194,123,0.7)',
        scale: 1.2, duration: 0.42, ease: 'power3.out',
        onStart: () => playSynthSFX('impact')
      }, '<')
      .fromTo(shockwaveRef.current, 
        { display: 'block', scale: 0.6, opacity: 0.8 },
        { scale: 4.8, opacity: 0, duration: 0.72, ease: 'power2.out' },
        '<'
      )
      .to(charsRef.current[INTRO_LETTERS.length], {
        scale: 1, duration: 0.35, ease: 'power3.inOut'
      }, '-=0.22')
      .to(subRef.current, {
        opacity: 1, y: 0, duration: 0.88, ease: 'power3.out'
      }, '-=0.38')
      .to({}, { duration: 1.2 })
      .to(nameRef.current, {
        letterSpacing: '-1.15em',
        scale: 0.22,
        filter: 'blur(14px)',
        opacity: 0,
        duration: 1.15,
        ease: 'power4.inOut'
      })
      .to(ruleRef.current, {
        scaleX: 0, opacity: 0, duration: 0.95, ease: 'power4.inOut'
      }, '<')
      .to(subRef.current, {
        y: 18, opacity: 0, filter: 'blur(8px)', duration: 0.95, ease: 'power4.inOut'
      }, '<')
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
  return (
    <li>
      <a 
        href={href} 
        className={`magnetic ${active ? 'active' : ''}`} 
        data-strength="0.28"
        style={{ display: 'inline-block' }}
      >
        {label}
      </a>
    </li>
  );
}

// ── BENTO: Chess Puzzle Widget (Multi-Puzzle Campaign) ─────────────────────────
const CHESS_PUZZLES = [
  {
    name: "Scholar's Mate Threat",
    instructions: "White to play: Find Mate in 1 (defended capture)",
    eloGain: 15,
    board: [
      [null, null, null, null, null, null, null, { type: 'k', color: 'b', label: '♚' }],
      [null, null, null, null, null, null, { type: 'p', color: 'b', label: '♟' }, { type: 'p', color: 'b', label: '♟' }],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, { type: 'q', color: 'w', label: '♛' }],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, { type: 'b', color: 'w', label: '♝' }, null, null, null, null, null],
      [null, null, null, null, null, null, { type: 'k', color: 'w', label: '♚' }, null]
    ],
    solution: { fromR: 3, fromC: 7, toR: 1, toC: 7 }
  },
  {
    name: "Arabian Mate",
    instructions: "White to play: Deliver Arabian Mate (Rook & Knight)",
    eloGain: 20,
    board: [
      [null, null, null, null, null, null, null, { type: 'k', color: 'b', label: '♚' }],
      [null, null, null, null, null, { type: 'p', color: 'b', label: '♟' }, null, null],
      [null, null, null, null, null, { type: 'n', color: 'w', label: '♞' }, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, { type: 'k', color: 'w', label: '♚' }, { type: 'r', color: 'w', label: '♜' }]
    ],
    solution: { fromR: 7, fromC: 7, toR: 1, toC: 7 }
  },
  {
    name: "Philidor's Sacrifice",
    instructions: "White to play: Solve the legendary smothered mate (Mate in 2)",
    eloGain: 25,
    board: [
      [null, null, null, null, null, { type: 'r', color: 'b', label: '♜' }, null, { type: 'k', color: 'b', label: '♚' }],
      [null, null, null, null, null, null, { type: 'p', color: 'b', label: '♟' }, { type: 'p', color: 'b', label: '♟' }],
      [null, null, null, null, null, null, null, { type: 'n', color: 'w', label: '♞' }],
      [null, null, null, null, null, null, null, null],
      [null, null, { type: 'q', color: 'w', label: '♛' }, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, { type: 'k', color: 'w', label: '♚' }, null]
    ],
    solution: { fromR: 2, fromC: 7, toR: 1, toC: 5 } // Final Knight checkmate move coordinates
  }
];

function ChessPuzzle() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [board, setBoard] = useState(CHESS_PUZZLES[0].board);
  const [selected, setSelected] = useState(null);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState(CHESS_PUZZLES[0].instructions);
  const [elo, setElo] = useState(1500);
  const [shake, setShake] = useState(false);
  const [puzzleStep, setPuzzleStep] = useState(0);

  const handleClick = (r, c) => {
    if (solved) return;
    const piece = board[r][c];
    const currentPuzzle = CHESS_PUZZLES[puzzleIndex];

    // Selecting own piece
    if (piece && piece.color === 'w') {
      if (puzzleIndex === 2) {
        if (puzzleStep === 0 && piece.type !== 'q') {
          setFeedback("Find the Queen sacrifice check first! ♕");
          return;
        }
        if (puzzleStep === 1 && piece.type !== 'n') {
          setFeedback("Deliver smothered checkmate with your Knight! ♞");
          return;
        }
      }
      setSelected({ r, c });
      setFeedback(`Selected white piece. Find the correct square!`);
      playSynthSFX('chess_move');
      return;
    }

    if (selected) {
      const { r: sr, c: sc } = selected;
      
      if (puzzleIndex === 2) {
        // Hard Puzzle 3: 2-step solution
        if (puzzleStep === 0) {
          // Move 1: Queen moves from (4,2) to (0,6) [g8]
          if (sr === 4 && sc === 2 && r === 0 && c === 6) {
            const newBoard = board.map(row => [...row]);
            newBoard[r][c] = board[sr][sc];
            newBoard[sr][sc] = null;
            setBoard(newBoard);
            setSelected(null);
            playSynthSFX('chess_move');
            setFeedback("Check! Wait for Black's forced capture...");
            setPuzzleStep(1);

            // Computer forced response: Rook (0,5) captures Queen (0,6) after 800ms
            setTimeout(() => {
              const replyBoard = newBoard.map(row => [...row]);
              replyBoard[0][6] = replyBoard[0][5];
              replyBoard[0][5] = null;
              setBoard(replyBoard);
              playSynthSFX('chess_capture');
              setFeedback("Black Rook captured the Queen! Deliver smothered mate with your Knight.");
            }, 850);
          } else {
            triggerIncorrect();
          }
        } else if (puzzleStep === 1) {
          // Move 2: Knight moves from (2,7) to (1,5) [f7]
          if (sr === 2 && sc === 7 && r === 1 && c === 5) {
            const newBoard = board.map(row => [...row]);
            newBoard[r][c] = board[sr][sc];
            newBoard[sr][sc] = null;
            setBoard(newBoard);
            setSolved(true);
            setElo(elo + currentPuzzle.eloGain);
            playSynthSFX('chess_move');
            setTimeout(() => playSynthSFX('chess_mate'), 120);
            setFeedback(`Correct! Smothered Mate solved! (+${currentPuzzle.eloGain} ELO)`);
          } else {
            triggerIncorrect();
          }
        }
      } else {
        // Puzzle 1 & 2: 1-step solutions
        if (
          sr === currentPuzzle.solution.fromR &&
          sc === currentPuzzle.solution.fromC &&
          r === currentPuzzle.solution.toR &&
          c === currentPuzzle.solution.toC
        ) {
          const isCapture = board[r][c] !== null;
          const newBoard = board.map(row => [...row]);
          newBoard[r][c] = board[sr][sc];
          newBoard[sr][sc] = null;
          setBoard(newBoard);
          setSolved(true);
          
          const newElo = elo + currentPuzzle.eloGain;
          setElo(newElo);
          
          if (isCapture) {
            playSynthSFX('chess_capture');
          } else {
            playSynthSFX('chess_move');
          }
          
          setTimeout(() => {
            playSynthSFX('chess_mate');
          }, 120);

          setFeedback(`Correct! ${currentPuzzle.name} solved! (+${currentPuzzle.eloGain} ELO)`);
        } else {
          triggerIncorrect();
        }
      }
    }
  };

  const triggerIncorrect = () => {
    setShake(true);
    setFeedback("Incorrect move. Try again! 🤔");
    playSynthSFX('tick');
    setTimeout(() => setShake(false), 500);
    setSelected(null);
  };

  const handleNext = () => {
    const nextIdx = puzzleIndex + 1;
    setPuzzleIndex(nextIdx);
    setBoard(CHESS_PUZZLES[nextIdx].board);
    setSelected(null);
    setSolved(false);
    setPuzzleStep(0);
    setFeedback(CHESS_PUZZLES[nextIdx].instructions);
  };

  const handleReset = () => {
    setPuzzleIndex(0);
    setBoard(CHESS_PUZZLES[0].board);
    setSelected(null);
    setSolved(false);
    setPuzzleStep(0);
    setElo(1500);
    setFeedback(CHESS_PUZZLES[0].instructions);
  };

  const currentPuzzle = CHESS_PUZZLES[puzzleIndex];

  return (
    <div className={`chess-widget ${shake ? 'shake' : ''}`}>
      <div className="chess-widget-header">
        <span>🧩 Chess Puzzle ({puzzleIndex + 1}/3)</span>
        <span className={`chess-elo-badge ${solved ? 'glow-green' : ''}`}>
          {elo} ELO
        </span>
      </div>
      <div className="chess-puzzle-name">{currentPuzzle.name}</div>
      <div className="chess-grid-container">
        <div className="chess-board-grid" style={{ position: 'relative' }}>
          {board.map((row, rIdx) => 
            row.map((cell, cIdx) => {
              const isDark = (rIdx + cIdx) % 2 === 1;
              const isSelected = selected && selected.r === rIdx && selected.c === cIdx;
              
              // Target hint highlight coordinates based on puzzle state
              const isTargetHint = selected && (
                puzzleIndex === 2
                  ? (puzzleStep === 0
                      ? (selected.r === 4 && selected.c === 2 && rIdx === 0 && cIdx === 6)
                      : (selected.r === 2 && selected.c === 7 && rIdx === 1 && cIdx === 5))
                  : (selected.r === currentPuzzle.solution.fromR && selected.c === currentPuzzle.solution.fromC && rIdx === currentPuzzle.solution.toR && cIdx === currentPuzzle.solution.toC)
              );
              
              return (
                <div 
                  key={`${rIdx}-${cIdx}`}
                  className={`chess-square ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''} ${isTargetHint && !solved ? 'target-hint' : ''}`}
                  onClick={() => handleClick(rIdx, cIdx)}
                >
                  {cell && (
                    <img 
                      src={`https://upload.wikimedia.org/wikipedia/commons/${
                        cell.color === 'w' 
                          ? (cell.type === 'k' ? '4/42/Chess_klt45.svg' : cell.type === 'q' ? '1/15/Chess_qlt45.svg' : cell.type === 'r' ? '7/72/Chess_rlt45.svg' : cell.type === 'b' ? 'b/b1/Chess_blt45.svg' : cell.type === 'n' ? '7/70/Chess_nlt45.svg' : '4/45/Chess_plt45.svg')
                          : (cell.type === 'k' ? 'f/f0/Chess_kdt45.svg' : cell.type === 'q' ? '4/47/Chess_qdt45.svg' : cell.type === 'r' ? 'f/ff/Chess_rdt45.svg' : cell.type === 'b' ? '9/98/Chess_bdt45.svg' : cell.type === 'n' ? 'e/ef/Chess_ndt45.svg' : 'c/c7/Chess_pdt45.svg')
                      }`}
                      alt={`${cell.color === 'w' ? 'White' : 'Black'} ${cell.type}`}
                      className="chess-piece-img"
                    />
                  )}
                </div>
              );
            })
          )}
          
          {/* CHECKMATE POPUP OVERLAY */}
          {solved && (
            <div className="chess-board-overlay">
              <div className="checkmate-banner">CHECKMATE</div>
              <div className="confetti-container">
                {Array.from({ length: 32 }).map((_, idx) => {
                  const size = Math.random() * 8 + 4;
                  const delay = Math.random() * 0.4;
                  const x = Math.random() * 100;
                  const color = ['#c084fc', '#f43f5e', '#bbcb2b', '#60a5fa', '#f59e0b'][Math.floor(Math.random() * 5)];
                  return (
                    <div 
                      key={idx}
                      className="confetti-particle"
                      style={{
                        left: `${x}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        background: color,
                        animationDelay: `${delay}s`,
                        '--dx': `${(Math.random() - 0.5) * 160}px`,
                        '--dy': `${-Math.random() * 180 - 80}px`,
                        '--rot': `${Math.random() * 360}deg`
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="chess-feedback">{feedback}</div>
      {solved && (
        <div className="chess-actions-row">
          {puzzleIndex < CHESS_PUZZLES.length - 1 ? (
            <button onClick={handleNext} className="chess-reset-btn">Next Puzzle ➔</button>
          ) : (
            <button onClick={handleReset} className="chess-reset-btn">🏆 Restart Campaign</button>
          )}
        </div>
      )}
    </div>
  );
}

// ── BENTO: Matrix rain for CLI hacking sequence ──────────────────────────────
function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight || 180;

    const chars = "0101ABCDEFHIJKLMNOPQRSTUVWXYZ&%$@#*";
    const fontSize = 11;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#a78bfa'; // Purple matrix rain
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight || 180;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-canvas" />;
}

// ── BENTO: CLI Developer Terminal ────────────────────────────────────────────
function CliTerminal() {
  const [history, setHistory] = useState([
    { type: 'output', text: 'VanshOS v1.2.0 (Type "help" for a list of commands)' }
  ]);
  const [input, setInput] = useState('');
  const [isHacking, setIsHacking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();
      if (cmd) {
        handleCommand(cmd);
      }
    }
  };

  const handleCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    let response = [];
    
    if (trimmed === 'help') {
      response = [
        { type: 'input', text: cmd },
        { type: 'output', text: 'Available commands:' },
        { type: 'output', text: '  about      - Biographical summary' },
        { type: 'output', text: '  projects   - Show key portfolio projects' },
        { type: 'output', text: '  skills     - View active tech stack' },
        { type: 'output', text: '  hack       - Initiate matrix server breach' },
        { type: 'output', text: '  clear      - Clear console history' }
      ];
    } else if (trimmed === 'about') {
      response = [
        { type: 'input', text: cmd },
        { type: 'output', text: 'Vansh Vijay — Developer & Founder' },
        { type: 'output', text: '  Education: B.Tech CSE @ JECRC, Jaipur (2023-2027)' },
        { type: 'output', text: '  Experience: Full Stack Intern @ Plasmid Innovation' },
        { type: 'output', text: '  Strengths: REST APIs, Socket.IO, Streaks Engine, Payments' }
      ];
    } else if (trimmed === 'projects') {
      response = [
        { type: 'input', text: cmd },
        { type: 'output', text: '🚀 Active Projects:' },
        { type: 'output', text: '  • ConsistPay: Coding Accountability System (Live)' },
        { type: 'output', text: '  • Chess Multiplayer: WebSockets Boardgame Room Sync' },
        { type: 'output', text: '  • Speaking Solver: Real-Time Audio Transcription STT+TTS' }
      ];
    } else if (trimmed === 'skills') {
      response = [
        { type: 'input', text: cmd },
        { type: 'output', text: '🛠️ Core Tech Stack:' },
        { type: 'output', text: '  • Backend: Node.js, Express.js, MongoDB, WebSockets' },
        { type: 'output', text: '  • Frontend: React.js, TailwindCSS, Next.js, GSAP' },
        { type: 'output', text: '  • Programming: C++, JavaScript, HTML/CSS' }
      ];
    } else if (trimmed === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (trimmed === 'hack') {
      setIsHacking(true);
      playSynthSFX('laser');
      setTimeout(() => {
        setIsHacking(false);
        setHistory(prev => [
          ...prev,
          { type: 'output', text: '🔓 Mainframe breached successfully. ELO boosted to 1600+!' }
        ]);
        playSynthSFX('impact');
      }, 3000);
      response = [
        { type: 'input', text: cmd },
        { type: 'output', text: 'Connecting to server gateway...' },
        { type: 'output', text: 'Decrypting master keys...' }
      ];
    } else {
      response = [
        { type: 'input', text: cmd },
        { type: 'output', text: `Command not found: "${cmd}". Type "help" for help.` }
      ];
    }

    setHistory(prev => [...prev, ...response]);
    setInput('');
  };

  return (
    <div className="terminal-widget">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>
        <span className="terminal-title">guest@vanshos:~$</span>
      </div>
      <div className="terminal-body" ref={scrollRef}>
        {isHacking && <MatrixRain />}
        {!isHacking && (
          <div className="terminal-content">
            {history.map((h, idx) => (
              <div key={idx} className={`terminal-line ${h.type}`}>
                {h.type === 'input' ? (
                  <span><span className="terminal-prompt">guest@vanshos:~$</span> {h.text}</span>
                ) : (
                  <span>{h.text}</span>
                )}
              </div>
            ))}
            <div className="terminal-input-row">
              <span className="terminal-prompt">guest@vanshos:~$</span>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="terminal-input"
                autoFocus
                placeholder="Type 'help'..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── BENTO: ConsistPay Streak Tracker ─────────────────────────────────────────
function StreakTracker() {
  const [contributions, setContributions] = useState(263);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [terminalLines, setTerminalLines] = useState([
    "guest@vanshos:~/consistpay$ git status",
    "On branch main. Your branch is up to date.",
    "nothing to commit, working tree clean",
    "guest@vanshos:~/consistpay$ _"
  ]);
  
  // Create 112 squares (16 weeks x 7 days)
  const [squares, setSquares] = useState(() => {
    const list = [];
    const milestones = {
      14: "Day 14: Integrated Razorpay Payment Webhooks! 💳",
      32: "Day 30: Custom Streak Engine built in Node.js 🔥",
      58: "Day 45: Configured Google Gemini AI suggestions 🤖",
      86: "Day 60: Shipped live: reached 60+ active users! 🚀"
    };

    for (let i = 0; i < 112; i++) {
      let level = 0;
      if (milestones[i]) {
        level = 4;
      } else {
        // Use a deterministic pseudo-random value based on index to prevent SSR hydration errors
        const r = (Math.abs(Math.sin(i + 1)) * 1000) % 1;
        level = r < 0.35 ? 0 : r < 0.65 ? 1 : r < 0.88 ? 2 : 3;
      }

      list.push({
        id: i,
        level,
        message: milestones[i] || `Day ${i + 1}: Committed backend optimizations and DSA updates 💻`,
        isMilestone: !!milestones[i],
        clicked: false
      });
    }
    return list;
  });

  const handleSquareClick = (index) => {
    const next = [...squares];
    if (!next[index].clicked) {
      next[index].level = 4;
      next[index].clicked = true;
      next[index].isClickedGreen = true;
      setSquares(next);
      setContributions(prev => prev + 1);
      
      const hash = Math.random().toString(16).substring(2, 8);
      const dayNum = index + 1;
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setTerminalLines([
        `guest@vanshos:~/consistpay$ git commit -m "commit Day ${dayNum}"`,
        `[main ${hash}] Pushed Day ${dayNum} updates successfully [${timeString}]`,
        ` 1 file changed, 14 insertions(+), 2 deletions(-)`,
        `guest@vanshos:~/consistpay$ _`
      ]);
      
      playSynthSFX('tick');
    }
  };

  return (
    <div className="streak-tracker-widget">
      <div className="streak-header">
        <span>🔥 ConsistPay Streak Tracker</span>
        <span className="streak-counter">{contributions} Contributions</span>
      </div>
      
      <div className="streak-body-split">
        {/* Left Column: Compact Calendar Grid */}
        <div className="streak-grid-panel">
          <div className="streak-months-header">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
          </div>
          <div className="streak-grid-row">
            <div className="streak-days-labels">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>
            <div className="streak-calendar-grid">
              {squares.map((sq, idx) => (
                <div 
                  key={sq.id} 
                  className={`streak-square level-${sq.level} ${sq.isMilestone ? 'milestone-sq' : ''} ${sq.isClickedGreen ? 'clicked-green' : ''}`}
                  onClick={() => handleSquareClick(idx)}
                  onMouseEnter={(e) => {
                    setActiveTooltip({
                      text: sq.message,
                      x: e.currentTarget.offsetLeft,
                      y: e.currentTarget.offsetTop - 45
                    });
                  }}
                  onMouseLeave={() => setActiveTooltip(null)}
                />
              ))}
              {activeTooltip && (
                <div 
                  className="streak-tooltip"
                  style={{ 
                    left: `${activeTooltip.x}px`,
                    top: `${activeTooltip.y}px`
                  }}
                >
                  {activeTooltip.text}
                </div>
              )}
            </div>
          </div>

          <div className="streak-footer-row">
            <div className="streak-footer-hint">Click squares to push live updates.</div>
            <div className="streak-legend">
              <span>Less</span>
              <span className="legend-sq level-0"></span>
              <span className="legend-sq level-1"></span>
              <span className="legend-sq level-2"></span>
              <span className="legend-sq level-3"></span>
              <span className="legend-sq level-4"></span>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Right Column: Mini Terminal & Stats Dashboard */}
        <div className="streak-details-panel">
          <div className="streak-stats-row">
            <div className="streak-stat-card">
              <span className="stat-label">CURRENT STREAK</span>
              <span className="stat-value text-orange">18 Days 🔥</span>
            </div>
            <div className="streak-stat-card">
              <span className="stat-label">COMMIT LEVEL</span>
              <span className="stat-value text-green">Elite Dev 💻</span>
            </div>
          </div>

          <div className="streak-commit-terminal">
            <div className="terminal-header">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
              <span className="terminal-title">consistpay-git-bash</span>
            </div>
            <div className="terminal-body">
              {terminalLines.map((line, idx) => {
                const isPrompt = line.startsWith("guest@vanshos:");
                if (isPrompt) {
                  const parts = line.split("$ ");
                  const commandText = parts[1] || "";
                  const promptPath = parts[0] + "$";
                  return (
                    <div key={idx} className="streak-terminal-line">
                      <span className="text-green">{promptPath}</span>{" "}
                      {commandText === "_" ? (
                        <span className="cursor-blink">_</span>
                      ) : commandText.endsWith("_") ? (
                        <>
                          <span>{commandText.slice(0, -1)}</span>
                          <span className="cursor-blink">_</span>
                        </>
                      ) : (
                        <span>{commandText}</span>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div key={idx} className="streak-terminal-line text-muted">
                      {line}
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  usePortfolioTracker();
  const [introDone, setIntroDone] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredProject, setHoveredProject] = useState(null);
  const [githubContributions, setGithubContributions] = useState(204);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const portalRef = useRef(null);
  const lastMouse = useRef({ x: 0, y: 0 });

  const horizontalSectionRef = useRef(null);
  const scrollTrackRef = useRef(null);

  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  const toggleSound = () => {
    if (soundEnabled) {
      stopAmbientDrone();
      setSoundEnabled(false);
    } else {
      startAmbientDrone();
      setSoundEnabled(true);
      playSynthSFX('impact');
    }
  };

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

  // Project preview scale animations
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
        playSynthSFX('tick');
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

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // Smooth scroll
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

  // Scroll tracking progress & navigation highlights
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

  // GSAP Vertical-to-Horizontal Pinning Scroll Animation (Projects)
  useEffect(() => {
    if (!introDone) return;

    const section = horizontalSectionRef.current;
    const track = scrollTrackRef.current;
    if (!section || !track) return;

    let ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 769px)", () => {
        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth + 240),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 0.8,
            start: "top top",
            end: () => `+=${track.scrollWidth - window.innerWidth + 240}`,
            invalidateOnRefresh: true,
          }
        });
      });
    });

    // Safeguard: Refresh ScrollTrigger after Next.js layout has stabilized
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [introDone]);

  // Attach magnetic animations on mount
  useEffect(() => {
    if (!introDone) return;
    const cleanups = [];
    document.querySelectorAll('.magnetic').forEach(el => {
      const strength = parseFloat(el.getAttribute('data-strength') || '0.38');
      const cleanup = makeMagnetic(el, strength);
      if (cleanup) cleanups.push(cleanup);
    });
    return () => cleanups.forEach(c => c());
  }, [introDone]);

  // Standard vertical stagger reveals on scroll
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
    { idx: "03", name: "Automated Speaking Test Solver", desc: "An intelligent automation engine that solves interactive speaking tests in real-time. Features live speech-to-text (STT) audio transcription, conversational LLM API integration for response generation, and text-to-speech (TTS) voice synthesis.", tags: ["Python", "Speech-to-Text", "Text-to-Speech", "LLM APIs", "Automation"], repo: "https://github.com/vanshinatorr/automated-speaking-test-solver", badge: "Automation" },
    { idx: "04", name: "Hotel Landing Page", desc: "Modern responsive hotel booking website with room showcase and booking form. Focused on clean UI, responsive layouts, and visual design — demonstrating frontend fundamentals done right.", tags: ["HTML", "CSS", "Responsive Design", "UI/UX"], repo: "https://github.com/vanshinatorr/hotel-landing-page-01", badge: "Frontend" },
  ];

  const skills = [
    { title: "Backend", items: ["Node.js", "Express.js", "REST APIs", "JWT Auth", "Socket.IO", "Razorpay", "Gemini AI"], primary: true },
    { title: "Frontend", items: ["React.js", "JavaScript", "Tailwind CSS", "HTML / CSS"] },
    { title: "Database & Tools", items: ["MongoDB", "Mongoose", "Postman", "Git", "Vercel", "Render", "VS Code"] },
    { title: "CS Fundamentals", items: ["DSA — 300+ problems", "OOPs", "DBMS", "Operating Systems"] },
  ];

  const achievements = [
    { icon: "🥇", title: "Top 30 on Codolio", sub: "Ranked among top 30 coding profiles out of 2000+ students at JECRC University" },
    { icon: "♟️", title: "District Chess Champion", sub: "District-level winner & college Runner-Up. 1500+ ELO on Chess.com — strategic thinker on and off the board." },
    { icon: "🧩", title: "300+ DSA Problems", sub: "Solved across LeetCode & GFG — arrays, trees, DP, hashing, recursion, graphs." },
    { icon: "💼", title: "Full Stack Intern", sub: "Plasmid Innovation — Jul to Sep 2025. Real-world MERN development." },
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
          <button onClick={toggleSound} className={`sound-toggle-btn ${soundEnabled ? 'active' : ''}`} title="Toggle ambient music">
            {soundEnabled ? (
              <span className="sound-waves">
                <span className="sound-wave wave-1" />
                <span className="sound-wave wave-2" />
                <span className="sound-wave wave-3" />
              </span>
            ) : (
              <span style={{ marginRight: '4px' }}>🔇</span>
            )}
            Sound
          </button>
          <a href="mailto:vanshvijay9784@gmail.com" className="nav-cta magnetic" data-strength="0.4" data-track="Hire Me Clicked">Hire Me</a>
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
          <a href="#projects" className="btn-primary magnetic" data-strength="0.4">View Projects ↓</a>
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

      {/* ── ABOUT BENTO GRID ── */}
      <section id="about" className="bento-section">
        <p className="section-label reveal">About & OS System</p>
        <div className="bento-grid">
          {/* Box 1: Bio */}
          <div className="bento-card bento-bio reveal">
            <h2 className="bento-headline">Who is Vansh?</h2>
            <div className="bento-body">
              <p>I&apos;m a final year Computer Science student at JECRC University, Jaipur. I specialize in the MERN Stack, focusing on bulletproof REST APIs, WebSockets state sync, and secure payments integration.</p>
              <p>As the founder of <strong>ConsistPay</strong>, I shivered real-world code to 60+ users. Currently solving DSA consistently and searching for a placement/intern role.</p>
            </div>
          </div>

          {/* Box 2: Chess Puzzle */}
          <div className="bento-card bento-chess reveal">
            <ChessPuzzle />
          </div>

          {/* Box 3: Streak Tracker (Spans 2 columns) */}
          <div className="bento-card bento-streak reveal">
            <StreakTracker />
          </div>

          {/* Box 4: Terminal Command Line (Spans 2 columns) */}
          <div className="bento-card bento-terminal reveal">
            <CliTerminal />
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── PROJECTS HORIZONTAL SCROLL ── */}
      <section id="projects" ref={horizontalSectionRef} className="projects-horizontal-section">
        <div className="projects-scroll-track-wrapper">
          <div className="projects-scroll-track" ref={scrollTrackRef}>
            {/* Title Panel */}
            <div className="project-title-card">
              <h2 className="project-title-heading">Selected<br /><span className="text-gradient">Works.</span></h2>
              <p className="project-title-desc">A gallery of full-stack products, real-time WebSockets boardgames, and speech automation engines.</p>
              <div className="project-scroll-guide">
                <span className="scroll-guide-text">Scroll to explore</span>
                <span className="scroll-guide-arrow">➔</span>
              </div>
            </div>
            {projects.map((p, i) => (
              <div 
                className="project-card reveal" 
                key={p.idx}
                onMouseEnter={() => setHoveredProject(p.idx)}
                onMouseLeave={() => setHoveredProject(null)}
                onMouseMove={handleProjectMouseMove}
              >
                <div className="project-card-inner">
                  <div className="project-card-header">
                    <span className="project-card-index">{p.idx}</span>
                    <span className="project-card-badge">{p.badge}</span>
                  </div>
                  <h3 className="project-card-title">{p.name}</h3>
                  <p className="project-card-desc">{p.desc}</p>
                  <div className="project-card-tags">
                    {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                  <div className="project-card-actions">
                    {p.live && (
                      <a href={p.live} target="_blank" rel="noreferrer" className="btn-card-primary" data-track={`Live Demo: ${p.name}`}>Live Demo ↗</a>
                    )}
                    {p.repo && (
                      <a href={p.repo} target="_blank" rel="noreferrer" className="btn-card-ghost" data-track={`GitHub Repo: ${p.name}`}>GitHub ↗</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <h2 className="contact-headline">Let&apos;s build<br />something real.</h2>
            <p className="contact-sub">Open to SDE internships, full-stack roles, and startup opportunities. If you&apos;re building something interesting, I want to hear about it.</p>
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
            <img src='/speaking-solver-preview.png' alt='Speaking Solver Mockup' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {hoveredProject === '04' && (
            <img src='/hotel-preview.png' alt='Hotel Landing Page Mockup' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
      </div>
    </>
  );
}
