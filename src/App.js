import { useState, useEffect, useRef } from "react";

// ── Fonts via Google ──────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #080810;
      --bg2:       #0f0f1a;
      --surface:   #13131f;
      --border:    #1e1e30;
      --accent:    #7c3aed;
      --accent2:   #a78bfa;
      --text:      #f0f0f5;
      --muted:     #6b6b80;
      --dim:       #2a2a3d;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
      cursor: none;
    }

    /* ── Custom cursor ── */
    #cursor-dot {
      position: fixed; top: 0; left: 0; z-index: 9999;
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--accent2);
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: transform 0.08s ease, opacity 0.2s;
    }
    #cursor-ring {
      position: fixed; top: 0; left: 0; z-index: 9998;
      width: 32px; height: 32px; border-radius: 50%;
      border: 1.5px solid rgba(167,139,250,0.4);
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: transform 0.18s ease, width 0.2s, height 0.2s, border-color 0.2s;
    }
    body.hovering #cursor-ring {
      width: 48px; height: 48px;
      border-color: rgba(167,139,250,0.8);
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 3px; }

    /* ── Noise overlay ── */
    .noise::before {
      content: ''; position: fixed; inset: 0; z-index: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none; opacity: 0.4;
    }

    /* ── Fade in animation ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes slideRight {
      from { transform: translateX(-100%); }
      to   { transform: translateX(0); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes counterUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .fade-up   { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
    .fade-in   { animation: fadeIn 0.6s ease both; }

    /* ── Nav ── */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.25rem 2.5rem;
      border-bottom: 1px solid transparent;
      transition: border-color 0.3s, background 0.3s, backdrop-filter 0.3s;
    }
    nav.scrolled {
      background: rgba(8,8,16,0.85);
      backdrop-filter: blur(12px);
      border-color: var(--border);
    }
    .nav-logo {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700; font-size: 1.1rem; letter-spacing: -0.02em;
      color: var(--text); text-decoration: none;
    }
    .nav-logo span { color: var(--accent2); }
    .nav-links { display: flex; gap: 2rem; list-style: none; }
    .nav-links a {
      font-size: 0.85rem; font-weight: 500; letter-spacing: 0.04em;
      color: var(--muted); text-decoration: none; text-transform: uppercase;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--text); }
    .nav-cta {
      font-size: 0.8rem; font-weight: 600; letter-spacing: 0.05em;
      padding: 0.5rem 1.25rem; border-radius: 6px;
      background: var(--accent); color: #fff; text-decoration: none;
      text-transform: uppercase; transition: opacity 0.2s;
    }
    .nav-cta:hover { opacity: 0.85; }

    /* ── Section base ── */
    section {
      position: relative; z-index: 1;
      padding: 7rem 2.5rem;
      max-width: 1100px; margin: 0 auto;
    }
    .section-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem; font-weight: 500;
      letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--accent2); margin-bottom: 1.5rem;
      display: flex; align-items: center; gap: 0.75rem;
    }
    .section-label::after {
      content: ''; flex: 1; max-width: 60px;
      height: 1px; background: var(--accent2); opacity: 0.4;
    }

    /* ── Hero ── */
    #hero {
      min-height: 100vh; display: flex; flex-direction: column;
      justify-content: center; padding-top: 8rem; padding-bottom: 4rem;
      max-width: 1100px; margin: 0 auto;
    }
    .hero-eyebrow {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem; letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--accent2); margin-bottom: 1.5rem;
      animation: fadeUp 0.6s 0.1s both;
    }
    .hero-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(3.5rem, 9vw, 7.5rem);
      font-weight: 700; line-height: 0.95;
      letter-spacing: -0.04em; color: var(--text);
      animation: fadeUp 0.7s 0.2s both;
    }
    .hero-name .accent-line {
      display: block; color: transparent;
      -webkit-text-stroke: 1.5px rgba(167,139,250,0.5);
    }
    .hero-statement {
      margin-top: 2.5rem;
      font-size: clamp(1rem, 2vw, 1.25rem);
      font-weight: 400; color: var(--muted); line-height: 1.7;
      max-width: 520px;
      animation: fadeUp 0.7s 0.35s both;
    }
    .hero-statement strong { color: var(--text); font-weight: 500; }
    .hero-actions {
      margin-top: 3rem; display: flex; gap: 1rem; flex-wrap: wrap;
      animation: fadeUp 0.7s 0.45s both;
    }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.85rem 2rem; border-radius: 8px;
      background: var(--accent); color: #fff;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.9rem; font-weight: 600; letter-spacing: 0.01em;
      text-decoration: none; transition: opacity 0.2s, transform 0.2s;
      cursor: none;
    }
    .btn-primary:hover { opacity: 0.88; transform: translateY(-2px); }
    .btn-ghost {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.85rem 2rem; border-radius: 8px;
      border: 1px solid var(--border); color: var(--text);
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.9rem; font-weight: 500;
      text-decoration: none; transition: border-color 0.2s, transform 0.2s;
      cursor: none;
    }
    .btn-ghost:hover { border-color: var(--accent2); transform: translateY(-2px); }

    .hero-stats {
      margin-top: 5rem; display: flex; gap: 3rem; flex-wrap: wrap;
      border-top: 1px solid var(--border); padding-top: 2.5rem;
      animation: fadeUp 0.7s 0.55s both;
    }
    .stat-item { display: flex; flex-direction: column; gap: 0.3rem; }
    .stat-num {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2rem; font-weight: 700; letter-spacing: -0.03em;
      color: var(--text); line-height: 1;
    }
    .stat-num .accent { color: var(--accent2); }
    .stat-label {
      font-size: 0.78rem; color: var(--muted);
      letter-spacing: 0.04em; text-transform: uppercase;
    }

    /* ── Divider ── */
    .divider {
      width: 100%; height: 1px;
      background: var(--border);
      max-width: 1100px; margin: 0 auto;
    }

    /* ── About ── */
    .about-grid {
      display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 5rem;
      align-items: start;
    }
    .about-headline {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700; letter-spacing: -0.03em;
      line-height: 1.15; color: var(--text); margin-bottom: 1.5rem;
    }
    .about-headline .line2 { color: var(--accent2); }
    .about-body {
      font-size: 1rem; line-height: 1.8; color: var(--muted);
    }
    .about-body p + p { margin-top: 1rem; }
    .about-body strong { color: var(--text); font-weight: 500; }
    .about-cards { display: flex; flex-direction: column; gap: 1rem; }
    .about-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px; padding: 1.25rem 1.5rem;
      transition: border-color 0.2s;
    }
    .about-card:hover { border-color: var(--dim); }
    .about-card-label {
      font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--accent2); margin-bottom: 0.4rem;
      font-family: 'JetBrains Mono', monospace;
    }
    .about-card-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.4rem; font-weight: 700; color: var(--text);
      letter-spacing: -0.02em;
    }
    .about-card-sub { font-size: 0.8rem; color: var(--muted); margin-top: 0.2rem; }

    /* ── Projects ── */
    .projects-list { display: flex; flex-direction: column; gap: 1.5px; }
    .project-row {
      display: grid;
      grid-template-columns: 3fr 1fr 1fr;
      align-items: center;
      padding: 2rem 0;
      border-bottom: 1px solid var(--border);
      gap: 2rem;
      transition: background 0.2s;
      cursor: none;
    }
    .project-row:first-child { border-top: 1px solid var(--border); }
    .project-row:hover { background: var(--surface); margin: 0 -2rem; padding: 2rem; border-radius: 8px; border-color: transparent; }
    .project-index {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem; color: var(--muted); margin-bottom: 0.5rem;
    }
    .project-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.4rem; font-weight: 700; letter-spacing: -0.02em;
      color: var(--text); margin-bottom: 0.6rem;
    }
    .project-desc { font-size: 0.88rem; color: var(--muted); line-height: 1.6; }
    .project-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .tag {
      font-size: 0.68rem; font-weight: 500; letter-spacing: 0.06em;
      text-transform: uppercase; padding: 0.3rem 0.7rem;
      border-radius: 4px; background: var(--dim); color: var(--muted);
      font-family: 'JetBrains Mono', monospace;
    }
    .project-links { display: flex; flex-direction: column; gap: 0.6rem; align-items: flex-end; }
    .proj-link {
      font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em;
      text-decoration: none; color: var(--accent2); text-transform: uppercase;
      display: flex; align-items: center; gap: 0.3rem;
      transition: color 0.2s;
    }
    .proj-link:hover { color: var(--text); }
    .proj-live-badge {
      display: inline-flex; align-items: center; gap: 0.4rem;
      font-size: 0.68rem; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; padding: 0.3rem 0.75rem;
      border-radius: 99px; background: rgba(124,58,237,0.15);
      border: 1px solid rgba(124,58,237,0.3); color: var(--accent2);
    }
    .live-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: #22c55e;
      animation: blink 2s infinite;
      display: inline-block;
    }

    /* ── Skills ── */
    .skills-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;
    }
    .skill-group-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--muted); margin-bottom: 1rem;
    }
    .skill-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .skill-chip {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem; padding: 0.45rem 0.9rem;
      border-radius: 6px; border: 1px solid var(--border);
      color: var(--text); background: var(--surface);
      transition: border-color 0.2s, color 0.2s;
    }
    .skill-chip:hover { border-color: var(--accent2); color: var(--accent2); }
    .skill-chip.primary {
      border-color: rgba(124,58,237,0.4);
      color: var(--accent2); background: rgba(124,58,237,0.08);
    }

    /* ── Achievements ── */
    .ach-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;
    }
    .ach-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 12px; padding: 1.75rem;
      transition: border-color 0.25s, transform 0.25s;
    }
    .ach-card:hover { border-color: var(--accent); transform: translateY(-3px); }
    .ach-icon { font-size: 1.5rem; margin-bottom: 0.75rem; }
    .ach-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.05rem; font-weight: 700; color: var(--text);
      margin-bottom: 0.4rem; letter-spacing: -0.01em;
    }
    .ach-sub { font-size: 0.82rem; color: var(--muted); line-height: 1.5; }

    /* ── Contact ── */
    .contact-wrap {
      display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 5rem; align-items: start;
    }
    .contact-headline {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(2rem, 4vw, 3.2rem);
      font-weight: 700; letter-spacing: -0.03em; line-height: 1.1;
      color: var(--text); margin-bottom: 1.25rem;
    }
    .contact-sub { font-size: 0.95rem; color: var(--muted); line-height: 1.7; }
    .contact-links { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; }
    .contact-link {
      display: flex; align-items: center; gap: 0.75rem;
      font-size: 0.88rem; color: var(--muted); text-decoration: none;
      transition: color 0.2s;
    }
    .contact-link:hover { color: var(--text); }
    .contact-link-icon {
      width: 36px; height: 36px; border-radius: 8px;
      background: var(--surface); border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem; flex-shrink: 0;
    }
    .availability-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 12px; padding: 1.75rem;
    }
    .avail-dot-wrap { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; }
    .avail-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
      animation: blink 2s infinite;
    }
    .avail-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
      color: #22c55e;
    }
    .avail-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem;
    }
    .avail-sub { font-size: 0.82rem; color: var(--muted); line-height: 1.6; }
    .avail-types { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 1.25rem; }
    .avail-type {
      font-size: 0.8rem; color: var(--muted);
      display: flex; align-items: center; gap: 0.5rem;
    }
    .avail-type::before { content: '→'; color: var(--accent2); font-size: 0.75rem; }

    /* ── Footer ── */
    footer {
      border-top: 1px solid var(--border);
      padding: 2rem 2.5rem;
      display: flex; align-items: center; justify-content: space-between;
      max-width: 1100px; margin: 0 auto;
    }
    .footer-copy { font-size: 0.78rem; color: var(--muted); }
    .footer-copy span { color: var(--accent2); }
    .footer-back {
      font-size: 0.78rem; color: var(--muted); text-decoration: none;
      letter-spacing: 0.06em; text-transform: uppercase;
      transition: color 0.2s;
    }
    .footer-back:hover { color: var(--text); }

    /* ── Reveal on scroll ── */
    .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1); }
    .reveal.visible { opacity: 1; transform: translateY(0); }

    @media (max-width: 768px) {
      nav { padding: 1rem 1.25rem; }
      .nav-links { display: none; }
      section { padding: 5rem 1.25rem; }
      #hero { padding: 7rem 1.25rem 3rem; }
      .about-grid, .contact-wrap { grid-template-columns: 1fr; gap: 3rem; }
      .skills-grid { grid-template-columns: 1fr; }
      .ach-grid { grid-template-columns: 1fr; }
      .project-row { grid-template-columns: 1fr; }
      .project-links { align-items: flex-start; flex-direction: row; }
      .hero-stats { gap: 2rem; }
      footer { flex-direction: column; gap: 1rem; text-align: center; }
    }
  `}</style>
);

// ── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.ceil(to / 40);
        const t = setInterval(() => {
          start += step;
          if (start >= to) { setVal(to); clearInterval(t); }
          else setVal(start);
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Typewriter ────────────────────────────────────────────────────────────────
function Typewriter({ lines }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = lines[lineIdx];
    let delay = deleting ? 40 : 80;
    if (!deleting && charIdx === current.length) delay = 2000;
    if (deleting && charIdx === 0) delay = 400;

    const t = setTimeout(() => {
      if (!deleting && charIdx < current.length) setCharIdx(c => c + 1);
      else if (!deleting && charIdx === current.length) setDeleting(true);
      else if (deleting && charIdx > 0) setCharIdx(c => c - 1);
      else { setDeleting(false); setLineIdx(i => (i + 1) % lines.length); }
    }, delay);
    return () => clearTimeout(t);
  }, [charIdx, deleting, lineIdx, lines]);

  return (
    <span>
      {lines[lineIdx].substring(0, charIdx)}
      <span style={{ animation: "blink 1s infinite", color: "var(--accent2)" }}>|</span>
    </span>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [scrolled, setScrolled] = useState(false);

  // Custom cursor
  useEffect(() => {
    const dot  = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    let mx = 0, my = 0, rx = 0, ry = 0;

    const move = e => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", move);

    let raf;
    const animate = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (dot)  { dot.style.left  = mx + "px"; dot.style.top  = my + "px"; }
      if (ring) { ring.style.left = rx + "px"; ring.style.top = ry + "px"; }
      raf = requestAnimationFrame(animate);
    };
    animate();

    const addHover = () => document.body.classList.add("hovering");
    const rmHover  = () => document.body.classList.remove("hovering");
    document.querySelectorAll("a, button, .project-row").forEach(el => {
      el.addEventListener("mouseenter", addHover);
      el.addEventListener("mouseleave", rmHover);
    });

    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  // Scroll nav
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const projects = [
    {
      idx: "01",
      name: "ConsistPay",
      desc: "A real coding accountability platform — not a tutorial project. Students deposit money, submit daily proof, and earn it back. Built full-stack: JWT auth, Razorpay payments, Gemini AI insights, streak engine, and GitHub-style analytics.",
      tags: ["Node.js", "Express", "MongoDB", "JWT", "Razorpay", "Gemini AI", "React"],
      live: "https://daily-coding-habit-tracker.vercel.app",
      repo: "https://github.com/vanshinatorr/Daily-coding-habit-tracker",
      badge: "60+ users",
    },
    {
      idx: "02",
      name: "Chess Multiplayer",
      desc: "Real-time multiplayer chess platform. Room-based matchmaking, live move sync across clients, turn management, and game timers — all over WebSockets.",
      tags: ["Socket.IO", "Node.js", "WebSockets", "JavaScript"],
      live: "https://chess-multiplayer-y54n.onrender.com",
      repo: "https://github.com/vanshinatorr/chess-multiplayer",
      badge: "Live",
    },
    {
      idx: "03",
      name: "Backend Interview Prep",
      desc: "Active study repo documenting Node.js internals, REST API patterns, auth flows, Express architecture, and system design fundamentals. 18+ commits in June.",
      tags: ["Node.js", "Express", "REST", "System Design"],
      repo: "https://github.com/vanshinatorr/backend-interview-prep",
      badge: "Active",
    },
  ];

  const skills = [
    {
      title: "Backend",
      items: ["Node.js", "Express.js", "REST APIs", "JWT Auth", "Socket.IO", "Razorpay", "Gemini AI"],
      primary: true,
    },
    {
      title: "Frontend",
      items: ["React.js", "JavaScript", "Tailwind CSS", "HTML / CSS"],
    },
    {
      title: "Database & Tools",
      items: ["MongoDB", "Mongoose", "Postman", "Git", "Vercel", "Render", "VS Code"],
    },
    {
      title: "CS Fundamentals",
      items: ["DSA — 300+ problems", "OOPs", "DBMS", "Operating Systems"],
    },
  ];

  const achievements = [
    { icon: "🥇", title: "Top 50 on Codolio", sub: "Ranked among top 50 coding profiles out of 2000+ students at JECRC University" },
    { icon: "♟️", title: "1500+ ELO — Chess.com", sub: "Runner-Up in college chess tournament. Strategic thinker on and off the board." },
    { icon: "🧩", title: "300+ DSA Problems", sub: "Solved across LeetCode & GFG — arrays, trees, DP, hashing, recursion, graphs." },
    { icon: "💼", title: "Full Stack Intern", sub: "Plasmid Innovation — Jul to Sep 2025. Real-world MERN development." },
  ];

  return (
    <>
      <FontLoader />

      {/* Cursor */}
      <div id="cursor-dot" />
      <div id="cursor-ring" />

      {/* Nav */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href="#hero" className="nav-logo">VV<span>.</span></a>
        <ul className="nav-links">
          {["About", "Projects", "Skills", "Contact"].map(l => (
            <li key={l}><a href={`#${l.toLowerCase()}`}>{l}</a></li>
          ))}
        </ul>
        <a href="mailto:vanshvijay9784@gmail.com" className="nav-cta">Hire Me</a>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="noise">
        <p className="hero-eyebrow">vansh vijay — full stack developer</p>
        <h1 className="hero-name">
          Building<br />
          <span className="accent-line">products,</span>
          not projects.
        </h1>
        <p className="hero-statement">
          <strong>MERN stack developer & founder of ConsistPay</strong> — a real platform used by 60+ students with live Razorpay payments and Gemini AI.{" "}
          <Typewriter lines={["Pre-final year CSE @ JECRC.", "Open to SDE internships.", "Shipping real things."]} />
        </p>
        <div className="hero-actions">
          <a href="#projects" className="btn-primary">View Projects ↓</a>
          <a href="https://github.com/vanshinatorr" target="_blank" rel="noreferrer" className="btn-ghost">GitHub →</a>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-num"><Counter to={60} suffix="+" /></span>
            <span className="stat-label">ConsistPay Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-num"><Counter to={300} suffix="+" /></span>
            <span className="stat-label">DSA Problems</span>
          </div>
          <div className="stat-item">
            <span className="stat-num"><Counter to={1500} suffix="+" /></span>
            <span className="stat-label">Chess ELO</span>
          </div>
          <div className="stat-item">
            <span className="stat-num"><Counter to={204} /></span>
            <span className="stat-label">GitHub Contributions</span>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── ABOUT ── */}
      <section id="about">
        <p className="section-label reveal">About</p>
        <div className="about-grid">
          <div className="reveal">
            <h2 className="about-headline">
              CSE student.<br />
              <span className="line2">Product founder.</span><br />
              Backend engineer.
            </h2>
            <div className="about-body">
              <p>
                I'm a pre-final year Computer Science student at JECRC University, Jaipur. I build full-stack products with the MERN stack — from REST APIs and JWT authentication to real-time WebSocket systems and payment integrations.
              </p>
              <p>
                <strong>ConsistPay</strong> is my flagship product — a coding accountability platform where students put real money on the line for daily consistency. It has 60+ active users, live Razorpay transactions, and Gemini AI-powered insights. I built and deployed every part of it.
              </p>
              <p>
                I also interned at <strong>Plasmid Innovation</strong> where I worked on real MERN projects. Currently solving DSA daily and prepping for SDE placements.
              </p>
            </div>
          </div>
          <div className="about-cards reveal">
            <div className="about-card">
              <div className="about-card-label">Currently Building</div>
              <div className="about-card-val">ConsistPay</div>
              <div className="about-card-sub">60+ users · Live payments · AI insights</div>
            </div>
            <div className="about-card">
              <div className="about-card-label">University</div>
              <div className="about-card-val">JECRC, Jaipur</div>
              <div className="about-card-sub">B.Tech CSE · 2023–2027 · CGPA 7.52</div>
            </div>
            <div className="about-card">
              <div className="about-card-label">Experience</div>
              <div className="about-card-val">Plasmid Innovation</div>
              <div className="about-card-sub">Full Stack Intern · Jul–Sep 2025</div>
            </div>
            <div className="about-card">
              <div className="about-card-label">Chess Rating</div>
              <div className="about-card-val">1500+ ELO</div>
              <div className="about-card-sub">Runner-Up · College Tournament</div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── PROJECTS ── */}
      <section id="projects">
        <p className="section-label reveal">Projects</p>
        <div className="projects-list">
          {projects.map((p, i) => (
            <div className="project-row reveal" key={p.idx} style={{ transitionDelay: `${i * 0.08}s` }}>
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
                  <a href={p.live} target="_blank" rel="noreferrer" className="proj-link">
                    Live Demo ↗
                  </a>
                )}
                <a href={p.repo} target="_blank" rel="noreferrer" className="proj-link">
                  GitHub ↗
                </a>
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
                  <span key={s} className={`skill-chip${g.primary ? " primary" : ""}`}>{s}</span>
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
            <div key={a.title} className="ach-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="ach-icon">{a.icon}</div>
              <div className="ach-title">{a.title}</div>
              <div className="ach-sub">{a.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* ── CONTACT ── */}
      <section id="contact">
        <p className="section-label reveal">Contact</p>
        <div className="contact-wrap">
          <div className="reveal">
            <h2 className="contact-headline">
              Let's build<br />something real.
            </h2>
            <p className="contact-sub">
              Open to SDE internships, full-stack roles, and startup opportunities. If you're building something interesting, I want to hear about it.
            </p>
            <div className="contact-links">
              {[
                { icon: "✉️", label: "vanshvijay9784@gmail.com", href: "mailto:vanshvijay9784@gmail.com" },
                { icon: "💼", label: "linkedin.com/in/vansh-vijay", href: "https://www.linkedin.com/in/vansh-vijay/" },
                { icon: "🐙", label: "github.com/vanshinatorr", href: "https://github.com/vanshinatorr" },
                { icon: "🐦", label: "x.com/vanshvijay9", href: "https://x.com/vanshvijay9" },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="contact-link">
                  <span className="contact-link-icon">{l.icon}</span>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
          <div className="reveal">
            <div className="availability-card">
              <div className="avail-dot-wrap">
                <span className="avail-dot" />
                <span className="avail-label">Available for hire</span>
              </div>
              <div className="avail-title">Open to opportunities</div>
              <div className="avail-sub">Looking for roles starting mid-2025 onwards. Prefer startups and product companies.</div>
              <div className="avail-types">
                <span className="avail-type">SDE Internship (6 months)</span>
                <span className="avail-type">Full Stack Developer</span>
                <span className="avail-type">Backend Developer</span>
                <span className="avail-type">Startup / Early-stage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <p className="footer-copy">
          Built by <span>Vansh Vijay</span> · 2026
        </p>
        <a href="#hero" className="footer-back">Back to top ↑</a>
      </footer>
    </>
  );
}