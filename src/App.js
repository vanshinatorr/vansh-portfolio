import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// ── Fonts ─────────────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:      #080810;
      --surface: #13131f;
      --border:  #1e1e30;
      --accent:  #7c3aed;
      --accent2: #a78bfa;
      --text:    #f0f0f5;
      --muted:   #6b6b80;
      --dim:     #2a2a3d;
      --green:   #22c55e;
    }

    html { scroll-behavior: auto; }
    body {
      background: var(--bg); color: var(--text);
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
    }

    /* ─── INTRO ─────────────────────────────────────── */
    #intro-screen {
      position: fixed; inset: 0; z-index: 10000;
      pointer-events: none;
    }
    /* Two curtain panels ─ top and bottom half */
    .intro-panel {
      position: absolute; left: 0; right: 0;
      background: #05050d; z-index: 1; will-change: transform;
    }
    .intro-panel-top    { top: 0;    height: 56.5%; }
    .intro-panel-bottom { bottom: 0; height: 56.5%; }
    /* Content sits above panels */
    .intro-content {
      position: absolute; inset: 0; z-index: 2;
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; pointer-events: none;
    }
    /* Horizontal rule that draws outward */
    .intro-rule {
      height: 1px; width: clamp(180px, 32vw, 360px);
      background: linear-gradient(90deg, transparent, var(--accent2), transparent);
      transform-origin: center; transform: scaleX(0);
      box-shadow: 0 0 10px rgba(167,139,250,.45);
      margin-bottom: 1.8rem; flex-shrink: 0;
    }
    /* Each letter sits in an overflow:hidden mask */
    .intro-mask {
      display: inline-block; overflow: hidden; line-height: 1.1;
    }
    .intro-mask.mirror-n {
      transform: scaleX(-1);
    }
    .intro-char {
      display: inline-block;
      font-family: 'Outfit', sans-serif;
      font-size: clamp(3.8rem, 14vw, 11rem);
      font-weight: 800; letter-spacing: -0.01em;
      
      /* Liquid Platinum Chrome Sweep (high contrast slate white & metallic purple reflection) */
      background: linear-gradient(120deg, 
        #f8fafc 0%, 
        #cbd5e1 25%, 
        #8b5cf6 40%, 
        #ffffff 50%, 
        #8b5cf6 60%, 
        #cbd5e1 75%, 
        #f8fafc 100%
      );
      background-size: 260% 100%;
      background-position: 180% 0%;
      background-clip: text;
      -webkit-background-clip: text;
      
      color: transparent;
      -webkit-text-stroke: 1.2px rgba(167, 139, 250, 0.45);
      line-height: 1; user-select: none;
      will-change: transform;
    }
    .intro-char.dot {
      display: inline-block;
      width: clamp(10px, 2.5vw, 18px);
      height: clamp(10px, 2.5vw, 18px);
      border-radius: 50%;
      background: transparent;
      border: 1.5px solid rgba(167, 139, 250, 0.72);
      margin-left: 0.12em;
      margin-bottom: clamp(4px, 0.8vw, 8px);
      transform-origin: center;
      will-change: transform, background-color, border-color, box-shadow;
    }
    .intro-shockwave {
      position: absolute;
      top: 50%; left: 50%;
      width: 40px; height: 40px;
      border: 1.8px solid var(--accent2);
      border-radius: 50%;
      pointer-events: none;
      box-shadow: 0 0 25px rgba(167,139,250,0.65), inset 0 0 15px rgba(167,139,250,0.4);
      z-index: 5;
      display: none;
      will-change: transform, opacity;
    }
    .intro-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: clamp(0.6rem, 1.3vw, 0.78rem);
      letter-spacing: 0.28em; text-transform: uppercase;
      color: var(--muted); margin-top: 1.5rem;
      opacity: 0; will-change: transform;
    }
    @keyframes fadeIn { to { opacity: 1; } }


    /* ─── SCROLLBAR ──────────────────────────────────────── */
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: linear-gradient(var(--accent), var(--accent2)); border-radius: 3px; }

    /* ─── ORBS ───────────────────────────────────────────── */
    @keyframes orbFloat  { 0%,100%{transform:translate(0,0) scale(1)}  33%{transform:translate(40px,-30px) scale(1.07)} 66%{transform:translate(-20px,20px) scale(0.95)} }
    @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)}  33%{transform:translate(-50px,30px) scale(1.1)} 66%{transform:translate(30px,-20px) scale(0.93)} }
    @keyframes orbFloat3 { 0%,100%{transform:translate(0,0) scale(1)}  50%{transform:translate(25px,40px) scale(1.05)} }
    .orb { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; will-change:transform; }
    .orb-1 { width:500px; height:500px; background:radial-gradient(circle,rgba(124,58,237,.22) 0%,transparent 70%); top:-100px; left:-100px; animation:orbFloat 12s ease-in-out infinite; }
    .orb-2 { width:400px; height:400px; background:radial-gradient(circle,rgba(167,139,250,.15) 0%,transparent 70%); top:200px; right:-80px; animation:orbFloat2 15s ease-in-out infinite; }
    .orb-3 { width:300px; height:300px; background:radial-gradient(circle,rgba(99,102,241,.12) 0%,transparent 70%); bottom:0; left:40%; animation:orbFloat3 10s ease-in-out infinite; }

    /* ─── NOISE ──────────────────────────────────────────── */
    .noise::before {
      content:''; position:fixed; inset:0; z-index:0;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events:none; opacity:0.35;
    }

    /* ─── KEYFRAMES ──────────────────────────────────────── */
    @keyframes fadeUp    { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
    @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes pulseRing { 0%{box-shadow:0 0 0 0 rgba(124,58,237,.4)} 70%{box-shadow:0 0 0 14px rgba(124,58,237,0)} 100%{box-shadow:0 0 0 0 rgba(124,58,237,0)} }

    /* ─── SCROLL PROGRESS ────────────────────────────────── */
    #scroll-progress {
      position:fixed; top:0; left:0; z-index:200;
      height:2px; width:0%;
      background:linear-gradient(90deg,var(--accent),var(--accent2));
      box-shadow:0 0 8px rgba(124,58,237,.5);
      transition:width .1s linear;
    }

    /* ─── NAV ────────────────────────────────────────────── */
    nav {
      position:fixed; top:0; left:0; right:0; z-index:100;
      display:flex; align-items:center; justify-content:space-between;
      padding:1.25rem 2.5rem;
      border-bottom:1px solid transparent;
      transition:border-color .4s, background .4s, padding .4s;
    }
    nav.scrolled {
      background:rgba(8,8,16,.82);
      backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
      border-color:var(--border); padding:.9rem 2.5rem;
    }
    .nav-logo {
      font-family:'Space Grotesk',sans-serif;
      font-weight:700; font-size:1.1rem; letter-spacing:-.02em;
      color:var(--text); text-decoration:none; transition:color .2s;
    }
    .nav-logo:hover { color:var(--accent2); }
    .nav-logo span { color:var(--accent2); }
    .nav-links { display:flex; gap:2rem; list-style:none; }
    .nav-links a {
      font-size:.85rem; font-weight:500; letter-spacing:.04em;
      color:var(--muted); text-decoration:none; text-transform:uppercase;
      transition:color .2s; position:relative; padding-bottom:2px;
    }
    .nav-links a::after {
      content:''; position:absolute; bottom:-2px; left:0; right:0;
      height:1.5px; background:var(--accent2); border-radius:2px;
      transform:scaleX(0); transform-origin:left; transition:transform .3s cubic-bezier(.22,1,.36,1);
    }
    .nav-links a:hover { color:var(--text); }
    .nav-links a:hover::after, .nav-links a.active::after { transform:scaleX(1); }
    .nav-links a.active { color:var(--text); }
    .nav-right { display:flex; align-items:center; gap:.75rem; }
    .nav-resume {
      font-size:.8rem; font-weight:500; letter-spacing:.05em;
      padding:.5rem 1.1rem; border-radius:6px;
      border:1px solid var(--border); color:var(--muted);
      text-decoration:none; text-transform:uppercase;
      transition:border-color .2s, color .2s;
      display:flex; align-items:center; gap:.4rem;
    }
    .nav-resume:hover { border-color:var(--accent2); color:var(--accent2); }
    .nav-cta {
      font-size:.8rem; font-weight:600; letter-spacing:.05em;
      padding:.5rem 1.25rem; border-radius:6px;
      border:1px solid var(--border); color:var(--muted); text-decoration:none;
      text-transform:uppercase;
      transition:border-color .2s, color .2s, transform .2s;
    }
    .nav-cta:hover { border-color:var(--accent2); color:var(--accent2); transform:translateY(-1px); }

    /* ─── SECTION ────────────────────────────────────────── */
    section { position:relative; z-index:1; padding:7rem 2.5rem; max-width:1100px; margin:0 auto; }
    .section-label {
      font-family:'JetBrains Mono',monospace;
      font-size:.72rem; font-weight:500; letter-spacing:.18em; text-transform:uppercase;
      color:var(--accent2); margin-bottom:1.5rem;
      display:flex; align-items:center; gap:.75rem;
    }
    .section-label::after { content:''; flex:1; max-width:60px; height:1px; background:var(--accent2); opacity:.4; }

    /* ─── HERO ───────────────────────────────────────────── */
    #hero {
      min-height:100vh; display:flex; flex-direction:column;
      justify-content:center; padding-top:8rem; padding-bottom:4rem;
      max-width:1100px; margin:0 auto; overflow:hidden;
    }
    .hero-eyebrow {
      font-family:'JetBrains Mono',monospace;
      font-size:.8rem; letter-spacing:.14em; text-transform:uppercase;
      color:var(--accent2); margin-bottom:1.5rem;
      animation:fadeUp .6s .1s both;
    }
    .hero-name {
      font-family:'Space Grotesk',sans-serif;
      font-size:clamp(3.5rem,9vw,7.5rem);
      font-weight:700; line-height:.95; letter-spacing:-.04em;
      color:var(--text); animation:fadeUp .7s .2s both;
    }
    .hero-name .accent-line {
      display:block;
      background:linear-gradient(135deg,#7c3aed 0%,#a78bfa 40%,#c4b5fd 65%,#7c3aed 100%);
      background-size:250% 250%;
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
      animation:fadeUp .7s .2s both, gradientShift 5s ease infinite .9s;
    }
    .hero-statement {
      margin-top:2.5rem; font-size:clamp(1rem,2vw,1.2rem);
      font-weight:400; color:var(--muted); line-height:1.75; max-width:520px;
      animation:fadeUp .7s .35s both;
    }
    .hero-statement strong { color:var(--text); font-weight:500; }
    .hero-actions {
      margin-top:3rem; display:flex; gap:1rem; flex-wrap:wrap;
      animation:fadeUp .7s .45s both;
    }
    .btn-primary {
      display:inline-flex; align-items:center; gap:.5rem;
      padding:.875rem 2.1rem; border-radius:8px;
      background:var(--accent); color:#fff;
      font-family:'Space Grotesk',sans-serif;
      font-size:.9rem; font-weight:600; text-decoration:none;
      transition:opacity .2s, transform .2s, box-shadow .3s;
      position:relative; overflow:hidden;
    }
    .btn-primary::before {
      content:''; position:absolute; inset:0;
      background:linear-gradient(135deg,rgba(255,255,255,.15) 0%,transparent 60%);
      opacity:0; transition:opacity .3s;
    }
    .btn-primary:hover::before { opacity:1; }
    .btn-primary:hover { box-shadow:0 8px 30px rgba(124,58,237,.55); transform:translateY(-2px); }
    .btn-ghost {
      display:inline-flex; align-items:center; gap:.5rem;
      padding:.875rem 2.1rem; border-radius:8px;
      border:1px solid var(--border); color:var(--text);
      font-family:'Space Grotesk',sans-serif;
      font-size:.9rem; font-weight:500; text-decoration:none;
      transition:border-color .2s, transform .2s, background .2s, box-shadow .3s;
    }
    .btn-ghost:hover { border-color:var(--accent2); background:rgba(167,139,250,.06); box-shadow:0 0 20px rgba(167,139,250,.15); transform:translateY(-2px); }


    .hero-stats {
      margin-top:5rem; display:flex; gap:3rem; flex-wrap:wrap;
      border-top:1px solid var(--border); padding-top:2.5rem;
      animation:fadeUp .7s .55s both;
    }
    .stat-item { display:flex; flex-direction:column; gap:.3rem; }
    .stat-num { font-family:'Space Grotesk',sans-serif; font-size:2rem; font-weight:700; letter-spacing:-.03em; color:var(--text); line-height:1; }
    .stat-label { font-size:.78rem; color:var(--muted); letter-spacing:.04em; text-transform:uppercase; }

    /* ─── DIVIDER ────────────────────────────────────────── */
    .divider { width:100%; height:1px; background:linear-gradient(90deg,transparent,var(--border),transparent); max-width:1100px; margin:0 auto; }

    /* ─── ABOUT ──────────────────────────────────────────── */
    .about-grid { display:grid; grid-template-columns:1.1fr .9fr; gap:5rem; align-items:start; }
    .about-headline { font-family:'Space Grotesk',sans-serif; font-size:clamp(2rem,4vw,3rem); font-weight:700; letter-spacing:-.03em; line-height:1.15; color:var(--text); margin-bottom:1.5rem; }
    .about-headline .line2 { color:var(--accent2); }
    .about-body { font-size:1rem; line-height:1.8; color:var(--muted); }
    .about-body p+p { margin-top:1rem; }
    .about-body strong { color:var(--text); font-weight:500; }
    .about-cards { display:flex; flex-direction:column; gap:1rem; }
    /* 3D tilt cards */
    .about-card {
      background: radial-gradient(180px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(167, 139, 250, 0.08) 0%, transparent 100%), var(--surface);
      border:1px solid var(--border);
      border-radius:10px; padding:1.25rem 1.5rem;
      transform-style:preserve-3d; will-change:transform;
      transition:border-color .3s, box-shadow .3s, transform .3s;
      position:relative; overflow:hidden;
    }
    .about-card-sheen {
      position:absolute; inset:0; border-radius:10px;
      background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.07) 50%,transparent 70%);
      opacity:0; pointer-events:none;
      transition:opacity .3s;
    }
    .about-card:hover .about-card-sheen { opacity:1; }
    .about-card-label { font-size:.7rem; letter-spacing:.12em; text-transform:uppercase; color:var(--accent2); margin-bottom:.4rem; font-family:'JetBrains Mono',monospace; }
    .about-card-val { font-family:'Space Grotesk',sans-serif; font-size:1.4rem; font-weight:700; color:var(--text); letter-spacing:-.02em; }
    .about-card-sub { font-size:.8rem; color:var(--muted); margin-top:.2rem; }

    /* ─── PROJECTS ───────────────────────────────────────── */
    .projects-list { display:flex; flex-direction:column; }
    .project-row {
      display:grid; grid-template-columns:3fr 1fr 1fr;
      align-items:center; padding:2rem 1.5rem;
      border-bottom:1px solid var(--border); gap:2rem;
      transition:background .3s, border-radius .3s, border-color .3s, box-shadow .3s;
      position:relative; overflow:hidden;
    }
    .project-row::before {
      content:''; position:absolute; left:0; top:0; bottom:0; width:2px;
      background:var(--accent2); transform:scaleY(0); transform-origin:bottom;
      transition:transform .4s cubic-bezier(.22,1,.36,1);
    }
    .project-row:first-child { border-top:1px solid var(--border); }
    .project-row:hover { background:rgba(19,19,31,.8); border-radius:10px; border-color:rgba(167,139,250,.15); box-shadow:0 4px 32px rgba(0,0,0,.35); }
    .project-row:hover::before { transform:scaleY(1); }
    .project-index { font-family:'JetBrains Mono',monospace; font-size:.7rem; color:var(--muted); margin-bottom:.5rem; }
    .project-name { font-family:'Space Grotesk',sans-serif; font-size:1.4rem; font-weight:700; letter-spacing:-.02em; color:var(--text); margin-bottom:.6rem; transition:color .2s; }
    .project-row:hover .project-name { color:var(--accent2); }
    .project-desc { font-size:.88rem; color:var(--muted); line-height:1.6; }
    .project-tags { display:flex; flex-wrap:wrap; gap:.4rem; }
    .tag {
      font-size:.68rem; font-weight:500; letter-spacing:.06em; text-transform:uppercase;
      padding:.3rem .7rem; border-radius:4px; background:var(--dim); color:var(--muted);
      font-family:'JetBrains Mono',monospace; transition:background .2s, color .2s;
    }
    .project-row:hover .tag { background:rgba(124,58,237,.1); color:var(--accent2); }
    .project-links { display:flex; flex-direction:column; gap:.6rem; align-items:flex-end; }
    .proj-link { font-size:.78rem; font-weight:600; letter-spacing:.06em; text-decoration:none; color:var(--accent2); text-transform:uppercase; display:flex; align-items:center; gap:.3rem; transition:color .2s, gap .2s; }
    .proj-link:hover { color:var(--text); gap:.5rem; }
    .proj-live-badge { display:inline-flex; align-items:center; gap:.4rem; font-size:.68rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; padding:.3rem .75rem; border-radius:99px; background:rgba(124,58,237,.15); border:1px solid rgba(124,58,237,.3); color:var(--accent2); }
    .live-dot { width:5px; height:5px; border-radius:50%; background:var(--green); animation:pulseRing 2.5s infinite; display:inline-block; }

    /* ─── 3D TILT CARDS (ach) ────────────────────────────── */
    .ach-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1.5rem; }
    .ach-card {
      background: radial-gradient(180px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(167, 139, 250, 0.08) 0%, transparent 100%), var(--surface);
      border:1px solid var(--border);
      border-radius:12px; padding:1.75rem;
      transform-style:preserve-3d; will-change:transform;
      transition:border-color .3s, box-shadow .3s, transform .3s;
      position:relative; overflow:hidden;
      cursor:default;
    }
    .ach-card-sheen {
      position:absolute; inset:0; border-radius:12px;
      background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.09) 50%,transparent 70%);
      opacity:0; pointer-events:none; transition:opacity .3s;
    }
    .ach-card:hover { border-color:rgba(124,58,237,.5); box-shadow:0 12px 40px rgba(0,0,0,.4),0 0 0 1px rgba(124,58,237,.1); }
    .ach-card:hover .ach-card-sheen { opacity:1; }
    .ach-icon { font-size:1.75rem; margin-bottom:.85rem; }
    .ach-title { font-family:'Space Grotesk',sans-serif; font-size:1.05rem; font-weight:700; color:var(--text); margin-bottom:.4rem; letter-spacing:-.01em; }
    .ach-sub { font-size:.82rem; color:var(--muted); line-height:1.5; }

    /* ─── SKILLS ─────────────────────────────────────────── */
    .skills-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:2.5rem; }
    .skill-group-title { font-family:'Space Grotesk',sans-serif; font-size:.75rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); margin-bottom:1rem; }
    .skill-chips { display:flex; flex-wrap:wrap; gap:.5rem; }
    .skill-chip {
      font-family:'JetBrains Mono',monospace; font-size:.78rem; padding:.45rem .9rem;
      border-radius:6px; border:1px solid var(--border); color:var(--text); background:var(--surface);
      transition:border-color .2s, color .2s, transform .2s, box-shadow .2s;
      cursor:default; position:relative; overflow:hidden;
    }
    .skill-chip::after { 
      content:''; position:absolute; inset:0; 
      background:radial-gradient(45px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(167,139,250,.24) 0%, transparent 100%); 
      opacity:0; transition:opacity .3s; 
      pointer-events: none;
    }
    .skill-chip:hover { border-color:var(--accent2); color:var(--accent2); transform:translateY(-2px); box-shadow:0 4px 12px rgba(167,139,250,.15); }
    .skill-chip:hover::after { opacity:1; }
    .skill-chip.primary { border-color:rgba(124,58,237,.4); color:var(--accent2); background:rgba(124,58,237,.08); }
    .skill-chip.primary:hover { border-color:var(--accent2); box-shadow:0 4px 16px rgba(124,58,237,.25); }

    /* ─── CONTACT ────────────────────────────────────────── */
    .contact-wrap { display:grid; grid-template-columns:1.2fr .8fr; gap:5rem; align-items:start; }
    .contact-headline { font-family:'Space Grotesk',sans-serif; font-size:clamp(2rem,4vw,3.2rem); font-weight:700; letter-spacing:-.03em; line-height:1.1; color:var(--text); margin-bottom:1.25rem; }
    .contact-sub { font-size:.95rem; color:var(--muted); line-height:1.7; }
    .contact-links { display:flex; flex-direction:column; gap:.85rem; margin-top:2rem; }
    .contact-link { display:flex; align-items:center; gap:.85rem; font-size:.88rem; color:var(--muted); text-decoration:none; transition:color .2s, transform .2s; padding:.5rem; border-radius:8px; }
    .contact-link:hover { color:var(--text); transform:translateX(4px); }
    .contact-link-icon { width:38px; height:38px; border-radius:9px; background:var(--surface); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; transition:border-color .2s, box-shadow .2s; }
    .contact-link:hover .contact-link-icon { border-color:var(--accent2); box-shadow:0 0 12px rgba(167,139,250,.2); }
    .availability-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:1.75rem; position:relative; overflow:hidden; transition:border-color .3s, box-shadow .3s; }
    .availability-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--green),transparent); }
    .availability-card:hover { border-color:rgba(34,197,94,.3); box-shadow:0 8px 32px rgba(0,0,0,.3); }
    .avail-dot-wrap { display:flex; align-items:center; gap:.6rem; margin-bottom:1rem; }
    .avail-dot { width:8px; height:8px; border-radius:50%; background:var(--green); animation:pulseRing 2s infinite; }
    .avail-label { font-family:'JetBrains Mono',monospace; font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; color:var(--green); }
    .avail-title { font-family:'Space Grotesk',sans-serif; font-size:1.1rem; font-weight:700; color:var(--text); margin-bottom:.5rem; }
    .avail-sub { font-size:.82rem; color:var(--muted); line-height:1.6; }
    .avail-types { display:flex; flex-direction:column; gap:.4rem; margin-top:1.25rem; }
    .avail-type { font-size:.8rem; color:var(--muted); display:flex; align-items:center; gap:.5rem; transition:color .2s; }
    .avail-type:hover { color:var(--text); }
    .avail-type::before { content:'→'; color:var(--accent2); font-size:.75rem; }

    /* ─── FOOTER ─────────────────────────────────────────── */
    footer { border-top:1px solid var(--border); padding:2rem 2.5rem; display:flex; align-items:center; justify-content:space-between; max-width:1100px; margin:0 auto; }
    .footer-copy { font-size:.78rem; color:var(--muted); }
    .footer-copy span { color:var(--accent2); }
    .footer-back { font-size:.78rem; color:var(--muted); text-decoration:none; letter-spacing:.06em; text-transform:uppercase; transition:color .2s, transform .2s; display:inline-flex; align-items:center; gap:.4rem; }
    .footer-back:hover { color:var(--text); transform:translateY(-2px); }

    /* ─── REVEAL ─────────────────────────────────────────── */
    .reveal { opacity:0; transform:translateY(28px); transition:opacity .75s cubic-bezier(.22,1,.36,1), transform .75s cubic-bezier(.22,1,.36,1); }
    .reveal.visible { opacity:1; transform:translateY(0); }

    /* ─── PROJECTS HOVER PORTAL ─── */
    .project-preview-portal {
      width: 230px; height: 140px;
      perspective: 1000px;
      will-change: transform;
    }
    .portal-inner {
      width: 100%; height: 100%;
      border-radius: 10px;
      background: rgba(9, 9, 16, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
      padding: 10px;
      overflow: hidden;
      transform: rotateX(5deg) rotateY(-5deg);
      transform-origin: center;
      transition: transform 0.3s ease;
    }
    .portal-mockup {
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      gap: 6px;
    }
    .mock-header {
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding-bottom: 5px;
    }
    .mock-dots { display: flex; gap: 4px; }
    .mock-dots span {
      width: 5px; height: 5px; border-radius: 50%; background: rgba(255, 255, 255, 0.15);
    }
    .mock-dots span:nth-child(1) { background: #ef4444; opacity: 0.85; }
    .mock-dots span:nth-child(2) { background: #eab308; opacity: 0.85; }
    .mock-dots span:nth-child(3) { background: #22c55e; opacity: 0.85; }
    .mock-url {
      font-family: 'JetBrains Mono', monospace; font-size: 0.48rem; color: var(--muted);
      opacity: 0.55; letter-spacing: 0.02em;
    }
    .mock-layout {
      flex: 1; display: flex; gap: 8px; align-items: center; overflow: hidden;
    }
    
    /* ConsistPay layout details */
    .cp-dashboard {
      flex: 0.45; display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 6px; padding: 6px; height: 100%;
    }
    .cp-ring {
      position: relative; width: 36px; height: 36px; border-radius: 50%;
      background: conic-gradient(var(--accent2) 0% 84%, rgba(255, 255, 255, 0.05) 84% 100%);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 10px rgba(167, 139, 250, 0.2);
    }
    .cp-ring::after {
      content: '84%'; position: absolute; inset: 3px; border-radius: 50%;
      background: #090910; display: flex; align-items: center; justify-content: center;
      font-family: 'Space Grotesk', sans-serif; font-size: 0.55rem; font-weight: 700; color: #fff;
    }
    .cp-lbl {
      font-size: 0.46rem; color: var(--muted); margin-top: 4px; letter-spacing: 0.04em; text-transform: uppercase;
    }
    .cp-grid {
      flex: 0.55; display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px;
      height: 100%; align-content: center;
    }
    .cp-box {
      aspect-ratio: 1; border-radius: 1.5px; background: rgba(255, 255, 255, 0.02);
      border: 0.5px solid rgba(255, 255, 255, 0.04);
    }
    .cp-box.g1 { background: rgba(34, 197, 94, 0.15); border-color: rgba(34, 197, 94, 0.3); }
    .cp-box.g2 { background: rgba(34, 197, 94, 0.4); border-color: rgba(34, 197, 94, 0.6); }
    .cp-box.p1 { background: rgba(167, 139, 250, 0.18); border-color: rgba(167, 139, 250, 0.35); }
    .cp-box.p2 { background: rgba(167, 139, 250, 0.45); border-color: rgba(167, 139, 250, 0.7); }
    
    /* Chess Multiplayer layout details */
    .chess-players {
      flex: 0.45; display: flex; flex-direction: column; gap: 4px;
    }
    .player-card {
      background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 4px; padding: 4px; display: flex; flex-direction: column; gap: 1px;
    }
    .player-card.active { border-color: rgba(167, 139, 250, 0.25); background: rgba(167, 139, 250, 0.02); }
    .player-name {
      font-size: 0.5rem; font-weight: 600; color: #fff;
    }
    .player-elo {
      font-family: 'JetBrains Mono', monospace; font-size: 0.42rem; color: var(--accent2);
    }
    .chess-board-mock {
      flex: 0.55; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5px;
      background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 4px; padding: 3px; aspect-ratio: 1; height: 100%;
    }
    .chess-sq {
      border-radius: 1px; display: flex; align-items: center; justify-content: center; font-size: 0.5rem;
    }
    .chess-sq.dark { background: rgba(255, 255, 255, 0.02); }
    .chess-sq.light { background: rgba(255, 255, 255, 0.06); }
    .chess-sq.highlight { background: rgba(167, 139, 250, 0.2); box-shadow: 0 0 5px rgba(167, 139, 250, 0.35); }
    .chess-p { color: rgba(255,255,255,0.7); }
    
    /* Hotel landing page layout details */
    .hotel-hero-mock {
      flex: 1; display: flex; flex-direction: column; justify-content: space-between;
      height: 100%; padding: 2px 0;
    }
    .hotel-title {
      font-family: 'Space Grotesk', sans-serif; font-size: 0.72rem; font-weight: 700;
      color: #fff; line-height: 1.1; letter-spacing: -0.01em;
    }
    .hotel-title span {
      background: linear-gradient(90deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .hotel-sub {
      font-size: 0.48rem; color: var(--muted); opacity: 0.65; line-height: 1.2;
    }
    .hotel-preview-img {
      width: 100%; height: 30px; border-radius: 4px;
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(245, 158, 11, 0.03) 100%);
      border: 1px dashed rgba(251, 191, 36, 0.15);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.42rem; color: #fbbf24; letter-spacing: 0.04em; text-transform: uppercase;
    }

    /* ─── RESPONSIVE ─────────────────────────────────────── */
    @media(max-width:768px){
      .project-preview-portal { display:none!important; }
      nav{padding:1rem 1.25rem;} .nav-links{display:none;}
      section{padding:5rem 1.25rem;} #hero{padding:7rem 1.25rem 3rem;}
      .about-grid,.contact-wrap{grid-template-columns:1fr;gap:3rem;}
      .skills-grid{grid-template-columns:1fr;} .ach-grid{grid-template-columns:1fr;}
      .project-row{grid-template-columns:1fr;}
      .project-links{align-items:flex-start;flex-direction:row;}
      .hero-stats{gap:2rem;}
      footer{flex-direction:column;gap:1rem;text-align:center;}
    }
    @media(prefers-reduced-motion:reduce){
      .orb,.hero-name .accent-line{animation:none!important;}
      .reveal{transition:opacity .4s ease;}
    }
  `}</style>
);

// ── Counter ───────────────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let v = 0; const step = Math.ceil(to / 50);
        const t = setInterval(() => { v += step; if (v >= to) { setVal(to); clearInterval(t); } else setVal(v); }, 28);
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
      else { setDel(false); setLi(i => (i + 1) % lines.length); }
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
        p.vx *= 0.98; p.vy *= 0.98;
        // Speed cap
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 2) { p.vx = (p.vx / spd) * 2; p.vy = (p.vy / spd) * 2; }

        p.x += p.vx; p.y += p.vy;
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

// ── Magnetic Button ───────────────────────────────────────────────────────────
function useMagnetic(strength = 0.38) {
  const ref = useRef(null);
  const handleMouseMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) * strength;
    const dy = (e.clientY - rect.top - rect.height / 2) * strength;
    el.style.transform = `translate(${dx}px,${dy}px)`;
  }, [strength]);
  const handleMouseLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)";
    el.style.transform = "translate(0,0)";
    setTimeout(() => { if (el) el.style.transition = ""; }, 500);
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
      // 1. Futuristic noise bandpass sweep for laser line
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
      // 2. High-end carbon mechanical click for letter lock
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
      // 3. Cinematic deep sub-bass drop + high crystalline ping
      const oscSub = ctx.createOscillator();
      const oscPing = ctx.createOscillator();
      const gainSub = ctx.createGain();
      const gainPing = ctx.createGain();
      
      // Sub-bass sweep
      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(80, ctx.currentTime);
      oscSub.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.85);
      gainSub.gain.setValueAtTime(0.24, ctx.currentTime);
      gainSub.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
      oscSub.connect(gainSub);
      gainSub.connect(ctx.destination);
      
      // Glass/sine bell ping
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
    // Fail silently on browsers blocking early AudioContext
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
      // 2. Alternate assembly (starts after a brief pause once laser line is fully drawn)
      .to(charsRef.current, {
        y: 0, scale: 1, filter: 'blur(0px)', opacity: 1,
        stagger: 0.15, duration: 1.45, ease: 'power3.out'
      }, '+=0.2');

    // 2.5. Sliding Decryption Scramble effect (clean and throttled flicker)
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
            // Throttle character swap rate to only 8 state-changes
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
      // 3. Hollow-to-Solid Liquid Chrome Reflection Sweep (slower, liquid metallic wave)
      .to(charsRef.current.slice(0, INTRO_LETTERS.length), {
        backgroundPosition: '0% 0%', webkitTextStroke: '0px transparent',
        scale: 1.1, stagger: 0.08, duration: 0.95, ease: 'power3.out'
      }, '-=0.25')
      .to(charsRef.current.slice(0, INTRO_LETTERS.length), {
        scale: 1, stagger: 0.08, duration: 0.72, ease: 'power3.inOut'
      }, '-=0.88')
      
      // Pop the final dot & trigger long-echoing shockwave ripple
      .to(charsRef.current[INTRO_LETTERS.length], {
        backgroundColor: 'var(--accent2)', borderColor: 'transparent',
        boxShadow: '0 0 25px rgba(167,139,250,0.95), 0 0 50px rgba(167,139,250,0.5)',
        scale: 1.25, duration: 0.65, ease: 'power3.out',
        onStart: () => playSynthSFX('impact')
      }, '<')
      .fromTo(shockwaveRef.current, 
        { display: 'block', scale: 0.1, opacity: 0.95 },
        { scale: 8.5, opacity: 0, duration: 1.45, ease: 'power3.out' },
        '<'
      )
      .to(charsRef.current[INTRO_LETTERS.length], {
        scale: 1, duration: 0.45, ease: 'power3.inOut'
      }, '-=0.28')
      
      // 4. Subtitle fades up
      .to(subRef.current, {
        opacity: 1, y: 0, duration: 0.88, ease: 'power3.out'
      }, '-=0.38')
      // 5. Hold for reading
      .to({}, { duration: 1.2 })
      // 6. IMPLOSION: Letters pull into center, scale down, and blur away (heavy gravity-well collapse)
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
      // 8. SKEWED DIAGONAL CURTAIN WIPE — majestic shutter exit
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
      <a href={href} className={active ? "active" : ""} {...m} style={{ display: 'inline-block' }}>
        {label}
      </a>
    </li>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [introDone, setIntroDone] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [hoveredProject, setHoveredProject] = useState(null);
  const m1 = useMagnetic(0.4);
  const m2 = useMagnetic(0.4);
  const portalRef = useRef(null);

  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  const handleProjectMouseMove = useCallback((e) => {
    if (portalRef.current) {
      gsap.to(portalRef.current, {
        x: e.clientX + 22,
        y: e.clientY + 22,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    }
  }, []);

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.85,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1.18,
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    const rafId = requestAnimationFrame(raf);
    return () => { lenis.destroy(); cancelAnimationFrame(rafId); };
  }, []);





  // Scroll Progress
  useEffect(() => {
    const bar = document.getElementById("scroll-progress");
    const ids = ["hero", "about", "projects", "skills", "achievements", "contact"];
    const fn = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (bar) bar.style.width = `${(y / (document.body.scrollHeight - window.innerHeight)) * 100}%`;
      for (const id of [...ids].reverse()) {
        const el = document.getElementById(id);
        if (el && y >= el.offsetTop - 200) { setActiveSection(id); break; }
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
      <FontLoader />
      <IntroScreen onDone={handleIntroDone} />

      <div id="scroll-progress" />

      {/* ── NAV ── */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href="#hero" className="nav-logo">VV<span>.</span></a>
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
          <a href="https://drive.google.com/file/d/1GyHChavEDZVK24a2ADnrQPKTnfp3HYp6/view?usp=sharing" target="_blank" rel="noreferrer" className="nav-resume">↓ Resume</a>
          <a href="mailto:vanshvijay9784@gmail.com" className="nav-cta">Hire Me</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="noise" style={{ position: "relative" }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <ParticleCanvas />

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
          <a href="#projects" className="btn-primary" {...m1}>View Projects ↓</a>
          <a href="https://github.com/vanshinatorr" target="_blank" rel="noreferrer" className="btn-ghost" {...m2}>GitHub →</a>
        </div>
        <div className="hero-stats" style={{ position: "relative", zIndex: 1 }}>
          {[{ to: 60, suffix: "+", label: "ConsistPay Users" }, { to: 300, suffix: "+", label: "DSA Problems" }, { to: 1500, suffix: "+", label: "Chess ELO" }, { to: 204, suffix: "", label: "GitHub Contributions" }].map(s => (
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
              className="project-row reveal" 
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
                <span className="proj-live-badge"><span className="live-dot" />{p.badge}</span>
                {p.live && <a href={p.live} target="_blank" rel="noreferrer" className="proj-link">Live Demo ↗</a>}
                <a href={p.repo} target="_blank" rel="noreferrer" className="proj-link">GitHub ↗</a>
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
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="contact-link">
                  <span className="contact-link-icon">{l.icon}</span>{l.label}
                </a>
              ))}
            </div>
          </div>
          <div className="reveal">
            <div className="availability-card">
              <div className="avail-dot-wrap"><span className="avail-dot" /><span className="avail-label">Available for hire</span></div>
              <div className="avail-title">Open to opportunities</div>
              <div className="avail-sub">Looking for roles starting 2026 onwards. Prefer startups and product companies.</div>
              <div className="avail-types">
                {["SDE Internship (6 months)", "Full Stack Developer", "Backend Developer", "Startup / Early-stage"].map(t => (
                  <span key={t} className="avail-type">{t}</span>
                ))}
              </div>
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
          display: hoveredProject !== null ? 'block' : 'none',
          position: 'fixed',
          top: 0, left: 0,
          pointerEvents: 'none',
          zIndex: 1000,
          transform: 'translate3d(-100px, -100px, 0)'
        }}
      >
        <div className="portal-inner">
          {hoveredProject === "01" && (
            <div className="portal-mockup consistpay-mock">
              <div className="mock-header">
                <div className="mock-dots"><span></span><span></span><span></span></div>
                <div className="mock-url">consistpay.dev</div>
              </div>
              <div className="mock-layout">
                <div className="cp-dashboard">
                  <div className="cp-ring"></div>
                  <div className="cp-lbl">Streak</div>
                </div>
                <div className="cp-grid">
                  <div className="cp-box g2"></div>
                  <div className="cp-box p1"></div>
                  <div className="cp-box g1"></div>
                  <div className="cp-box p2"></div>
                  <div className="cp-box p2"></div>
                  <div className="cp-box g2"></div>
                  <div className="cp-box"></div>
                  <div className="cp-box g1"></div>
                  <div className="cp-box g1"></div>
                  <div className="cp-box"></div>
                  <div className="cp-box p1"></div>
                  <div className="cp-box g2"></div>
                </div>
              </div>
            </div>
          )}
          {hoveredProject === "02" && (
            <div className="portal-mockup chess-mock">
              <div className="mock-header">
                <div className="mock-dots"><span></span><span></span><span></span></div>
                <div className="mock-url">chess.vanshvijay.dev</div>
              </div>
              <div className="mock-layout">
                <div className="chess-players">
                  <div className="player-card active">
                    <span className="player-name">Vanshh</span>
                    <span className="player-elo">1500 ELO</span>
                  </div>
                  <div className="player-card">
                    <span className="player-name">Opponent</span>
                    <span className="player-elo">1480 ELO</span>
                  </div>
                </div>
                <div className="chess-board-mock">
                  <div className="chess-sq light"></div><div className="chess-sq dark"></div><div className="chess-sq light"></div><div className="chess-sq dark"></div>
                  <div className="chess-sq dark"></div><div className="chess-sq light highlight"><span className="chess-p">♞</span></div><div className="chess-sq dark"></div><div className="chess-sq light"></div>
                  <div className="chess-sq light"></div><div className="chess-sq dark"></div><div className="chess-sq light highlight"></div><div className="chess-sq dark"></div>
                  <div className="chess-sq dark"></div><div className="chess-sq light"></div><div className="chess-sq dark"></div><div className="chess-sq light"><span className="chess-p">♟</span></div>
                </div>
              </div>
            </div>
          )}
          {hoveredProject === "03" && (
            <div className="portal-mockup hotel-mock">
              <div className="mock-header">
                <div className="mock-dots"><span></span><span></span><span></span></div>
                <div className="mock-url">grandplaza.co</div>
              </div>
              <div className="mock-layout">
                <div className="hotel-hero-mock">
                  <div>
                    <div className="hotel-title">Grand <span>Plaza</span></div>
                    <div className="hotel-sub">Luxury boutique hotels & suites experience.</div>
                  </div>
                  <div className="hotel-preview-img">
                    [ Wireframe Showcase ]
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}