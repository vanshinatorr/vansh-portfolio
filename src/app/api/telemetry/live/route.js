import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const HITS_FILE = path.join(process.cwd(), 'telemetry_hits.json');

let globalHits = null;

function incrementHits() {
  if (globalHits === null) {
    try {
      if (fs.existsSync(HITS_FILE)) {
        const data = fs.readFileSync(HITS_FILE, 'utf8');
        const json = JSON.parse(data);
        globalHits = json.hits || 1024;
      } else {
        globalHits = 1024;
      }
    } catch (e) {
      globalHits = 1024;
    }
  }
  
  globalHits += 1;
  
  // Non-blocking asynchronous background write to disk
  try {
    fs.writeFile(HITS_FILE, JSON.stringify({ hits: globalHits }), 'utf8', () => {});
  } catch (e) {}
  
  return globalHits;
}

// Global start time to compute uptime
const startTime = Date.now();

export async function GET() {
  // 1. Increment hits
  const hits = incrementHits();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 285" width="100%" height="100%">
  <rect x="0.5" y="0.5" width="799" height="284" fill="#0d0e12" stroke="#1e293b" stroke-width="1" rx="8" ry="8" />
  
  <style>
    .label-meta {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 10px;
      fill: #94a3b8;
      letter-spacing: 0.08em;
      font-weight: bold;
    }
    .text-header {
      font-family: 'JetBrains Mono', monospace;
      font-weight: bold;
      font-size: 13px;
      fill: #ffffff;
      letter-spacing: 0.05em;
    }
    .text-status {
      font-family: 'JetBrains Mono', monospace;
      font-weight: bold;
      font-size: 10px;
      fill: #38bdf8;
      letter-spacing: 0.08em;
    }
    .box-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      fill: #ffffff;
      font-weight: bold;
    }
    .box-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      fill: #38bdf8;
      font-weight: 500;
    }
    .spec-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      fill: #94a3b8;
    }
    .spec-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      fill: #ffffff;
      font-weight: bold;
    }
    .spec-accent {
      fill: #38bdf8;
    }
    .telemetry-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9.5px;
      fill: #94a3b8;
      letter-spacing: 0.06em;
      font-weight: bold;
    }
    .telemetry-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      fill: #ffffff;
      font-weight: bold;
    }
    .stat-accent {
      fill: #38bdf8;
    }
  </style>

  <!-- Header Bar -->
  <line x1="0" y1="34" x2="800" y2="34" stroke="#1e293b" stroke-width="1" />
  <text x="20" y="22" class="text-header">VANSH VIJAY // SYSTEM ARCHITECTURE &amp; TELEMETRY</text>
  <text x="780" y="22" class="text-status" text-anchor="end">STATUS: ACTIVE</text>

  <!-- Middle Grid: Architecture + Specs -->
  <line x1="395" y1="34" x2="395" y2="198" stroke="#1e293b" stroke-width="1" />

  <!-- Left Column: System Stack Pipeline -->
  <text x="20" y="54" class="label-meta">01 / SYSTEM STACK PIPELINE</text>

  <!-- Box 1: Client UI -->
  <rect x="20" y="62" width="355" height="26" fill="#0f172a" stroke="#1e293b" stroke-width="1" rx="4" />
  <text x="32" y="79" class="box-label">CLIENT UI</text>
  <text x="363" y="79" class="box-val" text-anchor="end">React.js • Next.js • Tailwind CSS</text>

  <!-- Box 2: Backend API -->
  <rect x="20" y="96" width="355" height="26" fill="#0f172a" stroke="#1e293b" stroke-width="1" rx="4" />
  <text x="32" y="113" class="box-label">BACKEND API</text>
  <text x="363" y="113" class="box-val" text-anchor="end">Node.js • Express • REST APIs</text>

  <!-- Box 3: Database Layer -->
  <rect x="20" y="130" width="355" height="26" fill="#0f172a" stroke="#1e293b" stroke-width="1" rx="4" />
  <text x="32" y="147" class="box-label">DATABASE LAYER</text>
  <text x="363" y="147" class="box-val" text-anchor="end">MongoDB • Mongoose ODM</text>

  <!-- Box 4: Integrations -->
  <rect x="20" y="164" width="355" height="26" fill="#0f172a" stroke="#1e293b" stroke-width="1" rx="4" />
  <text x="32" y="181" class="box-label">INTEGRATIONS</text>
  <text x="363" y="181" class="box-val" text-anchor="end">Razorpay • Gemini AI API</text>

  <!-- Right Column: Core Specifications -->
  <text x="415" y="54" class="label-meta">02 / CORE SPECIFICATIONS</text>

  <text x="415" y="78" class="spec-label">DEVELOPER   :</text>
  <text x="525" y="78" class="spec-val">Vansh Vijay</text>

  <text x="415" y="104" class="spec-label">EDUCATION   :</text>
  <text x="525" y="104" class="spec-val">B.Tech CSE (CGPA: 7.75)</text>

  <text x="415" y="130" class="spec-label">EXPERIENCE  :</text>
  <text x="525" y="130" class="spec-val">Full-Stack Intern @ Plasmid</text>

  <text x="415" y="156" class="spec-label">ACTIVE BUILD:</text>
  <text x="525" y="156" class="spec-val spec-accent">ConsistPay (100+ Active Users)</text>

  <text x="415" y="182" class="spec-label">CREDENTIALS :</text>
  <text x="525" y="182" class="spec-val">GCP &amp; MongoDB Certified</text>

  <!-- Bottom Telemetry Section -->
  <line x1="0" y1="198" x2="800" y2="198" stroke="#1e293b" stroke-width="1" />
  <text x="20" y="215" class="label-meta">03 / LIVE METRICS TELEMETRY</text>

  <!-- Metric 1: Target Role -->
  <text x="20" y="236" class="telemetry-label">TARGET_ROLE</text>
  <text x="20" y="260" class="telemetry-val">MERN / FULL-STACK DEV</text>

  <line x1="205" y1="220" x2="205" y2="268" stroke="#1e293b" stroke-dasharray="2 2" />

  <!-- Metric 2: Current Focus -->
  <text x="220" y="236" class="telemetry-label">CURRENT_FOCUS</text>
  <text x="220" y="260" class="telemetry-val stat-accent">BUILDING CONSISTPAY</text>

  <line x1="405" y1="220" x2="405" y2="268" stroke="#1e293b" stroke-dasharray="2 2" />

  <!-- Metric 3: DSA Engine -->
  <text x="420" y="236" class="telemetry-label">DSA_ENGINE</text>
  <text x="420" y="260" class="telemetry-val stat-accent">300+ SOLVED [C++]</text>

  <line x1="605" y1="220" x2="605" y2="268" stroke="#1e293b" stroke-dasharray="2 2" />

  <!-- Metric 4: Profile Views -->
  <text x="620" y="236" class="telemetry-label">PROFILE_VIEWS</text>
  <text x="620" y="260" class="telemetry-val">${hits} VISITS</text>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
