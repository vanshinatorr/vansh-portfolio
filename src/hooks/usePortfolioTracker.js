import { useEffect, useRef } from 'react';

const DISCORD_WEBHOOK_URL = process.env.REACT_APP_DISCORD_WEBHOOK_URL;

// Helper to format milliseconds to readable format (e.g., 2m 15s)
const formatDuration = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

// Helper to get query parameters (e.g. ?ref=Google)
const getRefParameter = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref') || params.get('name') || params.get('from') || 'Direct Visit';
  } catch (e) {
    return 'Direct Visit';
  }
};

// Helper to extract clean OS and brand/device model from User Agent
const getDeviceDetails = () => {
  try {
    const ua = navigator.userAgent;
    
    if (/Windows/i.test(ua)) {
      return 'Windows PC';
    }
    if (/Macintosh/i.test(ua)) {
      return 'Mac';
    }
    if (/iPhone/i.test(ua)) {
      return 'iPhone';
    }
    if (/iPad/i.test(ua)) {
      return 'iPad';
    }
    if (/Android/i.test(ua)) {
      const match = ua.match(/\(([^)]+)\)/);
      if (match && match[1]) {
        const parts = match[1].split(';');
        if (parts.length >= 3) {
          const rawModel = parts[2].trim().split('Build/')[0].trim();
          
          // Specific device mappings for your device
          if (rawModel === 'CPH2381') {
            return `OnePlus Nord CE 2 Lite (${rawModel})`;
          }
          
          // Brand detection mappings based on common model prefixes
          if (/^SM-/i.test(rawModel)) {
            return `Samsung (${rawModel})`;
          }
          if (/^CPH|^OP4|^OPD/i.test(rawModel)) {
            return `OnePlus/Oppo (${rawModel})`;
          }
          if (/^RMX/i.test(rawModel)) {
            return `Realme (${rawModel})`;
          }
          if (/^V[0-9]{4}/i.test(rawModel) || /^VIVO/i.test(rawModel)) {
            return `Vivo (${rawModel})`;
          }
          if (/Pixel/i.test(rawModel)) {
            return `Google ${rawModel}`;
          }
          if (/POCO|Redmi|Xiaomi|Mi\s/i.test(rawModel)) {
            return `Xiaomi/Redmi (${rawModel})`;
          }
          return `Android (${rawModel})`;
        }
      }
      return 'Android Device';
    }
    if (/Linux/i.test(ua)) {
      return 'Linux PC';
    }
    return 'Unknown Device';
  } catch (e) {
    return 'Unknown Device';
  }
};

export const usePortfolioTracker = () => {
  const startTime = useRef(Date.now());
  const activeTime = useRef(0);
  const lastActiveStamp = useRef(Date.now());
  const clickCounts = useRef({}); // Tracks click frequencies { 'Resume Clicked': 3 }
  const visitorInfo = useRef(null);
  const sessionId = useRef(Math.random().toString(36).substring(2, 9).toUpperCase());
  const hasSentSummary = useRef(false);
  const refName = useRef(getRefParameter());
  const isExternalTransition = useRef(false); // Flag to temporarily ignore unloads on mailto/tel/external link triggers
  const deviceName = useRef(getDeviceDetails());
  const transitionTimeout = useRef(null);

  // Helper to send data to Discord Webhook
  const sendToDiscord = (title, fields, color = 3066993) => {
    if (!DISCORD_WEBHOOK_URL) {
      return; // Silently ignore if webhook is not configured
    }

    const payload = {
      username: 'Portfolio Tracker',
      avatar_url: 'https://i.imgur.com/gS84yWw.png', // Radar icon
      embeds: [
        {
          title,
          color,
          fields: [
            { name: 'Session ID', value: sessionId.current, inline: true },
            { name: 'Viewer Ref / Target', value: refName.current, inline: true },
            { name: 'Device / Model', value: deviceName.current, inline: true },
            ...fields
          ],
          timestamp: new Date().toISOString(),
        }
      ]
    };

    const bodyData = JSON.stringify(payload);

    // Use keepalive: true fetch as the primary modern way to send telemetry on page close
    fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyData,
      keepalive: true,
    }).catch((err) => {
      // Fallback to sendBeacon if fetch fails or is unsupported
      if (navigator.sendBeacon) {
        const blob = new Blob([bodyData], { type: 'application/json' });
        navigator.sendBeacon(DISCORD_WEBHOOK_URL, blob);
      } else {
        console.error("Error sending analytics to Discord:", err);
      }
    });
  };

  useEffect(() => {
    let isMounted = true;

    // Send session summary function
    const handleUnload = () => {
      if (hasSentSummary.current) return;
      hasSentSummary.current = true;

      // Calculate final active time
      let finalActiveTime = activeTime.current;
      if (lastActiveStamp.current) {
        finalActiveTime += Date.now() - lastActiveStamp.current;
      }
      const totalTimeOpen = Date.now() - startTime.current;

      const locationStr = visitorInfo.current
        ? `${visitorInfo.current.city || ''}, ${visitorInfo.current.region || ''}, ${visitorInfo.current.country_name || ''}`
        : 'Unknown Location';

      // Format click lists cleanly with counters: e.g., "• Resume Clicked (2x)"
      const clicksArray = Object.entries(clickCounts.current);
      const clickSummary = clicksArray.length > 0
        ? clicksArray.map(([item, count]) => `• ${item} (${count}x)`).join('\n')
        : 'No clicks recorded (just browsed)';

      const fields = [
        { name: 'Location', value: locationStr, inline: true },
        { name: 'Active Duration', value: formatDuration(finalActiveTime), inline: true },
        { name: 'Total Tab Duration', value: formatDuration(totalTimeOpen), inline: true },
        {
          name: 'Interactions / Clicks',
          value: clickSummary.length > 1024 ? clickSummary.substring(0, 1000) + '...' : clickSummary,
          inline: false
        }
      ];

      sendToDiscord('📤 Portfolio Session Ended ⏳', fields, 15158332); // Red / Orange
    };

    // 1. Fetch Location/IP details on mount
    const fetchLocationAndStart = async () => {
      let locationStr = 'Unknown Location';
      let ipStr = 'Unknown IP';
      let orgStr = 'Unknown ISP';

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout

        const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            visitorInfo.current = data;
            ipStr = data.ip || ipStr;
            locationStr = `${data.city || ''}, ${data.region || ''}, ${data.country_name || ''}`;
            orgStr = data.org || orgStr;
          }
        }
      } catch (error) {
        console.warn("Failed to fetch location info (using fallbacks):", error.message);
      }

      if (!isMounted) return;

      // Send Session Started notification
      sendToDiscord(
        '📥 Portfolio Opened 🚀',
        [
          { name: 'Location', value: locationStr, inline: true },
          { name: 'IP Address', value: ipStr, inline: true },
          { name: 'ISP / Provider', value: orgStr, inline: false },
          { name: 'Referrer', value: document.referrer || 'Direct / None', inline: true },
          { name: 'Browser / Device', value: navigator.userAgent.substring(0, 80) + '...', inline: false }
        ],
        3066993 // Green / Teal
      );
    };

    fetchLocationAndStart();

    // 2. Track Page active duration (handling tab focus/blur)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is backgrounded (accumulate active time spent so far)
        if (lastActiveStamp.current) {
          activeTime.current += Date.now() - lastActiveStamp.current;
          lastActiveStamp.current = null;
        }

        // If the tab went hidden because they clicked an external link, bypass this trigger
        if (isExternalTransition.current) {
          return;
        }

        // Trigger unload report immediately for normal closes / WebView exits
        handleUnload();
      } else {
        // Tab became visible again
        lastActiveStamp.current = Date.now();
        
        // If we already sent the summary (because they closed/minimized) but returned,
        // reset the state and session timing so we can log their resumed session.
        if (hasSentSummary.current) {
          hasSentSummary.current = false;
          startTime.current = Date.now();
          activeTime.current = 0;
          clickCounts.current = {};
          sessionId.current = Math.random().toString(36).substring(2, 9).toUpperCase();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Instant touch/mousedown interception to bypass transition timing race conditions
    const handleTrigger = (e) => {
      const anchor = e.target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href) {
          const isExternal = href.startsWith('mailto:') || 
                             href.startsWith('tel:') || 
                             href.startsWith('sms:') ||
                             (href.startsWith('http') && !href.includes(window.location.hostname));
                             
          if (isExternal) {
            isExternalTransition.current = true;
            if (transitionTimeout.current) {
              clearTimeout(transitionTimeout.current);
            }
            // Hold flag as true for 3 seconds to be safe on slower intents
            transitionTimeout.current = setTimeout(() => {
              isExternalTransition.current = false;
            }, 3000);
          }
        }
      }
    };

    document.addEventListener('touchstart', handleTrigger, { capture: true, passive: true });
    document.addEventListener('mousedown', handleTrigger, { capture: true, passive: true });

    // 3. Track clicks using event delegation (for telemetry logs)
    const handleDocumentClick = (e) => {
      const trackEl = e.target.closest('[data-track]');
      if (trackEl) {
        const itemName = trackEl.getAttribute('data-track');
        if (itemName) {
          clickCounts.current[itemName] = (clickCounts.current[itemName] || 0) + 1;
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);

    // 4. Send session summary on actual page unload/exits
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    // Handle Back-Forward cache restores cleanly
    const handlePageShow = (e) => {
      if (e.persisted) {
        hasSentSummary.current = false;
        startTime.current = Date.now();
        activeTime.current = 0;
        lastActiveStamp.current = Date.now();
        clickCounts.current = {};
        sessionId.current = Math.random().toString(36).substring(2, 9).toUpperCase();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('touchstart', handleTrigger, { capture: true });
      document.removeEventListener('mousedown', handleTrigger, { capture: true });
      document.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('pageshow', handlePageShow);
      if (transitionTimeout.current) {
        clearTimeout(transitionTimeout.current);
      }
    };
  }, []);

  // Expose trackClick manually in case they need it
  const trackClick = (name) => {
    if (name) {
      clickCounts.current[name] = (clickCounts.current[name] || 0) + 1;
    }
  };

  return { trackClick };
};
