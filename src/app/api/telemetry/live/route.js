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

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 105" width="100%" height="100%">
  <rect x="0.5" y="0.5" width="799" height="104" fill="#0d0e12" stroke="#1e293b" stroke-width="1" rx="6" ry="6" />
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
  <line x1="0" y1="26" x2="800" y2="26" stroke="#1e293b" stroke-width="1" />
  <text x="25" y="17" class="text-title">LIVE DEVELOPER TELEMETRY</text>

  <!-- Grid Layout -->
  <!-- Column 1: Role & Project Focus -->
  <text x="25" y="46" class="stat-label">TARGET_ROLE</text>
  <text x="25" y="58" class="stat-val">MERN / FULL-STACK DEV</text>

  <text x="25" y="80" class="stat-label">CURRENT_FOCUS</text>
  <text x="25" y="92" class="stat-val stat-accent">BUILDING CONSISTPAY</text>

  <!-- Column 2: Engineering Metrics -->
  <text x="425" y="46" class="stat-label">DSA_ENGINE</text>
  <text x="425" y="58" class="stat-val stat-accent">300+ SOLVED [C++]</text>

  <text x="425" y="80" class="stat-label">PROFILE_VIEWS</text>
  <text x="425" y="92" class="stat-val">${hits} VISITS</text>

  <!-- Vertical Column Divider -->
  <line x1="400" y1="26" x2="400" y2="105" stroke="#1e293b" stroke-dasharray="2 2" stroke-width="1" />
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
