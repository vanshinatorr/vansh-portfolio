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

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 255" width="100%" height="100%">
  <rect x="0.5" y="0.5" width="799" height="254" fill="#0d0e12" stroke="#1e293b" stroke-width="1" rx="8" ry="8" />
  
  <style>
    .label-meta {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 10.5px;
      fill: #94a3b8;
      letter-spacing: 0.06em;
      font-weight: bold;
    }
    .box-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      fill: #f8fafc;
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
      fill: #f8fafc;
      font-weight: bold;
    }
    .spec-accent {
      fill: #38bdf8;
    }
    .spec-green {
      fill: #34d399;
      font-weight: bold;
    }
    .telemetry-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9.5px;
      fill: #94a3b8;
      letter-spacing: 0.05em;
      font-weight: bold;
    }
    .telemetry-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      fill: #f8fafc;
      font-weight: bold;
    }
    .stat-accent {
      fill: #38bdf8;
    }
    .stat-green {
      fill: #34d399;
      font-weight: bold;
    }
  </style>

  <!-- Middle Divider -->
  <line x1="395" y1="0" x2="395" y2="196" stroke="#1e293b" stroke-width="1" />

  <!-- Left Column: Tech Stack -->
  <text x="20" y="30" class="label-meta">TECH STACK</text>

  <!-- Box 1: Frontend -->
  <rect x="20" y="42" width="355" height="28" fill="#0f172a" stroke="#334155" stroke-width="1" rx="4" />
  <text x="32" y="60" class="box-label">FRONTEND</text>
  <text x="363" y="60" class="box-val" text-anchor="end">React.js • Next.js • Tailwind CSS</text>

  <!-- Box 2: Backend -->
  <rect x="20" y="80" width="355" height="28" fill="#0f172a" stroke="#334155" stroke-width="1" rx="4" />
  <text x="32" y="98" class="box-label">BACKEND</text>
  <text x="363" y="98" class="box-val" text-anchor="end">Node.js • Express • REST APIs</text>

  <!-- Box 3: Database -->
  <rect x="20" y="118" width="355" height="28" fill="#0f172a" stroke="#334155" stroke-width="1" rx="4" />
  <text x="32" y="136" class="box-label">DATABASE</text>
  <text x="363" y="136" class="box-val" text-anchor="end">MongoDB • Mongoose ODM</text>

  <!-- Box 4: Services -->
  <rect x="20" y="156" width="355" height="28" fill="#0f172a" stroke="#334155" stroke-width="1" rx="4" />
  <text x="32" y="174" class="box-label">SERVICES</text>
  <text x="363" y="174" class="box-val" text-anchor="end">Razorpay • Gemini AI API</text>

  <!-- Right Column: Core Specifications -->
  <text x="415" y="30" class="label-meta">OVERVIEW</text>

  <text x="415" y="54" class="spec-label">DEVELOPER   :</text>
  <text x="525" y="54" class="spec-val">Vansh Vijay</text>

  <text x="415" y="84" class="spec-label">EDUCATION   :</text>
  <text x="525" y="84" class="spec-val">B.Tech CSE</text>

  <text x="415" y="114" class="spec-label">EXPERIENCE  :</text>
  <text x="525" y="114" class="spec-val">Full-Stack Intern @ <tspan class="spec-accent">Plasmid Innovation</tspan></text>

  <text x="415" y="144" class="spec-label">ACTIVE BUILD:</text>
  <text x="525" y="144" class="spec-val"><tspan class="spec-accent">ConsistPay</tspan> <tspan class="spec-green">(100+ Active Users)</tspan></text>

  <text x="415" y="174" class="spec-label">CREDENTIALS :</text>
  <text x="525" y="174" class="spec-val"><tspan class="spec-green">GCP</tspan> &amp; <tspan class="spec-green">MongoDB</tspan> Certified</text>

  <!-- Bottom Telemetry Section -->
  <line x1="0" y1="196" x2="800" y2="196" stroke="#1e293b" stroke-width="1" />

  <!-- Metric 1: Target Role -->
  <text x="20" y="216" class="telemetry-label">TARGET ROLE</text>
  <text x="20" y="238" class="telemetry-val">MERN / FULL-STACK DEV</text>

  <line x1="205" y1="206" x2="205" y2="246" stroke="#1e293b" stroke-dasharray="2 2" />

  <!-- Metric 2: Current Focus -->
  <text x="220" y="216" class="telemetry-label">CURRENT FOCUS</text>
  <text x="220" y="238" class="telemetry-val stat-accent">BUILDING CONSISTPAY</text>

  <line x1="405" y1="206" x2="405" y2="246" stroke="#1e293b" stroke-dasharray="2 2" />

  <!-- Metric 3: DSA Engine -->
  <text x="420" y="216" class="telemetry-label">DSA ENGINE</text>
  <text x="420" y="238" class="telemetry-val stat-green">300+ SOLVED</text>

  <line x1="605" y1="206" x2="605" y2="246" stroke="#1e293b" stroke-dasharray="2 2" />

  <!-- Metric 4: Profile Views -->
  <text x="620" y="216" class="telemetry-label">PROFILE VIEWS</text>
  <text x="620" y="238" class="telemetry-val stat-accent">${hits} VISITS</text>
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
