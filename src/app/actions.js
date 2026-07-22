"use server";

import { headers } from "next/headers";

export async function logSessionStart({ sessionId, refName, deviceName, clientReferrer }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || process.env.REACT_APP_DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("Discord Webhook URL not configured.");
    return { success: false };
  }

  const reqHeaders = await headers();
  const rawIp = reqHeaders.get("x-forwarded-for")?.split(",")[0] || reqHeaders.get("x-real-ip") || "127.0.0.1";
  
  let locationStr = "Unknown Location";
  let ipStr = rawIp;
  let orgStr = "Unknown ISP";

  if (rawIp && rawIp !== "127.0.0.1" && rawIp !== "::1") {
    try {
      const res = await fetch(`https://ipapi.co/${rawIp}/json/`);
      if (res.ok) {
        const data = await res.json();
        ipStr = data.ip || ipStr;
        locationStr = `${data.city || ""}, ${data.region || ""}, ${data.country_name || ""}`;
        orgStr = data.org || orgStr;
      }
    } catch (e) {
      console.warn("Server-side IP API call failed:", e.message);
    }
  }

  const payload = {
    username: "Portfolio Tracker",
    avatar_url: "https://i.imgur.com/gS84yWw.png",
    embeds: [
      {
        title: "📥 Portfolio Opened 🚀",
        color: 3066993,
        fields: [
          { name: "Session ID", value: sessionId, inline: true },
          { name: "Viewer Ref / Target", value: refName, inline: true },
          { name: "Device / Model", value: deviceName, inline: true },
          { name: "Location", value: locationStr, inline: true },
          { name: "IP Address", value: ipStr, inline: true },
          { name: "ISP / Provider", value: orgStr, inline: false },
          { name: "Referrer", value: clientReferrer || "Direct / None", inline: true },
          { name: "User Agent", value: reqHeaders.get("user-agent")?.substring(0, 120) + "..." || "Unknown", inline: false }
        ],
        timestamp: new Date().toISOString(),
      }
    ]
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { success: true };
  } catch (error) {
    console.error("Session start log failed:", error);
    return { success: false };
  }
}

export async function logSessionEnd({ sessionId, refName, deviceName, finalActiveTime, totalTimeOpen, clickSummary }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || process.env.REACT_APP_DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return { success: false };

  const reqHeaders = await headers();
  const rawIp = reqHeaders.get("x-forwarded-for")?.split(",")[0] || reqHeaders.get("x-real-ip") || "127.0.0.1";
  
  let locationStr = "Unknown Location";
  if (rawIp && rawIp !== "127.0.0.1" && rawIp !== "::1") {
    try {
      const res = await fetch(`https://ipapi.co/${rawIp}/json/`);
      if (res.ok) {
        const data = await res.json();
        locationStr = `${data.city || ""}, ${data.region || ""}, ${data.country_name || ""}`;
      }
    } catch (e) {
      console.warn("Server-side IP API call failed during session end:", e.message);
    }
  }

  const payload = {
    username: "Portfolio Tracker",
    avatar_url: "https://i.imgur.com/gS84yWw.png",
    embeds: [
      {
        title: "📤 Portfolio Session Ended ⏳",
        color: 15158332,
        fields: [
          { name: "Session ID", value: sessionId, inline: true },
          { name: "Viewer Ref / Target", value: refName, inline: true },
          { name: "Device / Model", value: deviceName, inline: true },
          { name: "Location", value: locationStr, inline: true },
          { name: "Active Duration", value: finalActiveTime, inline: true },
          { name: "Total Tab Duration", value: totalTimeOpen, inline: true },
          {
            name: "Interactions / Clicks",
            value: clickSummary.length > 1024 ? clickSummary.substring(0, 1000) + "..." : clickSummary,
            inline: false
          }
        ],
        timestamp: new Date().toISOString(),
      }
    ]
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { success: true };
  } catch (error) {
    console.error("Session end log failed:", error);
    return { success: false };
  }
}

export async function fetchGithubContributions() {
  try {
    const res = await fetch("https://github-contributions.vercel.app/api/v1/vanshinatorr", {
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.years && data.years.length > 0) {
        const total = data.years[0].total;
        if (typeof total === 'number' && total > 0) {
          return total;
        }
      }
    }
  } catch (e) {
    console.warn("Server action failed to fetch Github contributions:", e.message);
  }
  return 204;
}
