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

  // 2. Compute Jaipur time (IST = UTC+5:30)
  const utcDate = new Date();
  const utcMs = utcDate.getTime() + utcDate.getTimezoneOffset() * 60000;
  const jaipurTimeMs = utcMs + (3600000 * 5.5);
  const jaipurDate = new Date(jaipurTimeMs);
  
  let hh = jaipurDate.getHours();
  const mm = String(jaipurDate.getMinutes()).padStart(2, '0');
  const ss = String(jaipurDate.getSeconds()).padStart(2, '0');
  const ampm = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12;
  hh = hh ? hh : 12; // the hour '0' should be '12'
  const hhStr = String(hh).padStart(2, '0');
  const jaipurTimeStr = `${hhStr}:${mm}:${ss} ${ampm}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 130" width="100%" height="100%">
  <rect x="0.5" y="0.5" width="599" height="129" fill="#0d0e12" stroke="#1e293b" stroke-width="1" rx="6" ry="6" />
  <style>
    .label-header {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 10px;
      fill: #94a3b8;
      letter-spacing: 0.08em;
      font-weight: bold;
    }
    .text-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      fill: #ffffff;
      font-weight: bold;
      letter-spacing: 0.05em;
    }
    .stat-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      fill: #94a3b8;
    }
    .stat-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      fill: #ffffff;
      font-weight: bold;
    }
    .stat-accent {
      fill: #38bdf8; /* Flat slate blue */
    }
  </style>

  <!-- Top Bar -->
  <line x1="0" y1="32" x2="600" y2="32" stroke="#1e293b" stroke-width="1" />
  <text x="20" y="21" class="text-title">LIVE DEVELOPER TELEMETRY</text>
  <text x="580" y="21" class="label-header" text-anchor="end">CANDIDATE_STATUS: ACTIVE</text>

  <!-- Grid Layout -->
  <!-- Column 1: Role & Project Info -->
  <text x="20" y="55" class="stat-label">TARGET_ROLE</text>
  <text x="20" y="70" class="stat-val">MERN / FULL-STACK DEV</text>

  <text x="20" y="95" class="stat-label">CURRENT_FOCUS</text>
  <text x="20" y="110" class="stat-val stat-accent">BUILDING CONSISTPAY</text>

  <!-- Column 2: Core Engineering Metrics -->
  <text x="220" y="55" class="stat-label">DSA_ENGINE</text>
  <text x="220" y="70" class="stat-val stat-accent">300+ SOLVED [C++]</text>

  <text x="220" y="95" class="stat-label">PROFILE_VIEWS</text>
  <text x="220" y="110" class="stat-val">${hits} VISITS</text>

  <!-- Column 3: Regional Context -->
  <text x="420" y="55" class="stat-label">LOCAL_TIME_IST</text>
  <text x="420" y="70" class="stat-val">${jaipurTimeStr}</text>

  <text x="420" y="95" class="stat-label">LOCATION</text>
  <text x="420" y="110" class="stat-val">JAIPUR, INDIA</text>

  <!-- Vertical Column Dividers -->
  <line x1="200" y1="32" x2="200" y2="130" stroke="#1e293b" stroke-dasharray="2 2" stroke-width="1" />
  <line x1="400" y1="32" x2="400" y2="130" stroke="#1e293b" stroke-dasharray="2 2" stroke-width="1" />
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
