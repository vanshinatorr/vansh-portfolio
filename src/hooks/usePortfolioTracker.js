import { useEffect, useRef } from 'react';
import { logSessionStart, logSessionEnd } from '@/app/actions';

// Helper to format milliseconds to readable format
const formatDuration = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

// Helper to get query parameters
const getRefParameter = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref') || params.get('name') || params.get('from') || 'Direct Visit';
  } catch (e) {
    return 'Direct Visit';
  }
};

const DEVICE_DATABASE = {
  'CPH2381': 'OnePlus Nord CE 2 Lite',
  'CPH2467': 'OnePlus Nord CE 3 Lite',
  'CPH2569': 'OnePlus Nord CE 4',
  'CPH2609': 'OnePlus Nord CE 4 Lite',
  'CPH2447': 'OnePlus 11',
  'CPH2581': 'OnePlus 12',
  'CPH2573': 'OnePlus 12R',
  'CPH2409': 'OnePlus 10R',
  'CPH2411': 'OnePlus 10 Pro',
  'CPH2263': 'OnePlus Nord 2',
  'CPH2401': 'OnePlus Nord 2T',
  'CPH2307': 'OnePlus Nord CE 2',
  'V2246': 'Vivo V27',
  'V2303': 'Vivo V29',
  'V2318': 'Vivo V30',
  'V2350': 'Vivo V30 Pro',
  'V2109': 'Vivo Y21',
  'V2111': 'Vivo Y21s',
  'V2204': 'Vivo Y22',
  'V2205': 'Vivo Y16',
  'V2312': 'Vivo T2 5G',
  'V2336': 'Vivo T3 5G',
  'SM-S901B': 'Samsung Galaxy S22',
  'SM-S906B': 'Samsung Galaxy S22+',
  'SM-S908B': 'Samsung Galaxy S22 Ultra',
  'SM-S911B': 'Samsung Galaxy S23',
  'SM-S916B': 'Samsung Galaxy S23+',
  'SM-S918B': 'Samsung Galaxy S23 Ultra',
  'SM-S921B': 'Samsung Galaxy S24',
  'SM-S926B': 'Samsung Galaxy S24+',
  'SM-S928B': 'Samsung Galaxy S24 Ultra',
  'SM-F711B': 'Samsung Galaxy Z Flip 3',
  'SM-F721B': 'Samsung Galaxy Z Flip 4',
  'SM-F731B': 'Samsung Galaxy Z Flip 5',
  'SM-F926B': 'Samsung Galaxy Z Fold 3',
  'SM-F936B': 'Samsung Galaxy Z Fold 4',
  'SM-F946B': 'Samsung Galaxy Z Fold 5',
  'SM-A546B': 'Samsung Galaxy A54 5G',
  'SM-A346B': 'Samsung Galaxy A34 5G',
  'SM-A146B': 'Samsung Galaxy A14 5G',
  'SM-A536B': 'Samsung Galaxy A53 5G',
  'SM-A336B': 'Samsung Galaxy A33 5G',
  'SM-M346B': 'Samsung Galaxy M34 5G',
  'SM-M546B': 'Samsung Galaxy M54 5G',
  'SM-F346B': 'Samsung Galaxy F34 5G',
};

const getDeviceDetails = () => {
  try {
    const ua = navigator.userAgent;
    if (/Windows/i.test(ua)) return 'Windows PC';
    if (/Macintosh/i.test(ua)) return 'Mac';
    if (/iPhone/i.test(ua)) return 'iPhone';
    if (/iPad/i.test(ua)) return 'iPad';
    if (/Android/i.test(ua)) {
      const match = ua.match(/\(([^)]+)\)/);
      if (match && match[1]) {
        const parts = match[1].split(';');
        if (parts.length >= 3) {
          const rawModel = parts[2].trim().split('Build/')[0].trim();
          if (DEVICE_DATABASE[rawModel]) return `${DEVICE_DATABASE[rawModel]} (${rawModel})`;
          if (/^SM-/i.test(rawModel)) return `Samsung (${rawModel})`;
          if (/^CPH|^OP4|^OPD/i.test(rawModel)) return `OnePlus/Oppo (${rawModel})`;
          if (/^RMX/i.test(rawModel)) return `Realme (${rawModel})`;
          if (/^V[0-9]{4}/i.test(rawModel) || /^VIVO/i.test(rawModel)) return `Vivo (${rawModel})`;
          if (/Pixel/i.test(rawModel)) return `Google ${rawModel}`;
          if (/POCO|Redmi|Xiaomi|Mi\s/i.test(rawModel)) return `Xiaomi/Redmi (${rawModel})`;
          return `Android (${rawModel})`;
        }
      }
      return 'Android Device';
    }
    if (/Linux/i.test(ua)) return 'Linux PC';
    return 'Unknown Device';
  } catch (e) {
    return 'Unknown Device';
  }
};

export const usePortfolioTracker = () => {
  const startTime = useRef(Date.now());
  const activeTime = useRef(0);
  const lastActiveStamp = useRef(Date.now());
  const clickCounts = useRef({});
  const sessionId = useRef(Math.random().toString(36).substring(2, 9).toUpperCase());
  const hasSentSummary = useRef(false);
  const refName = useRef(getRefParameter());
  const isExternalTransition = useRef(false);
  const deviceName = useRef('Parsing Device...');
  const transitionTimeout = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const handleUnload = () => {
      if (isExternalTransition.current) return;
      if (hasSentSummary.current) return;
      hasSentSummary.current = true;

      let finalActiveTime = activeTime.current;
      if (lastActiveStamp.current) {
        finalActiveTime += Date.now() - lastActiveStamp.current;
      }
      const totalTimeOpen = Date.now() - startTime.current;

      const clicksArray = Object.entries(clickCounts.current);
      const clickSummary = clicksArray.length > 0
        ? clicksArray.map(([item, count]) => `• ${item} (${count}x)`).join('\n')
        : 'No clicks recorded';

      // Send to server-side logging action
      logSessionEnd({
        sessionId: sessionId.current,
        refName: refName.current,
        deviceName: deviceName.current,
        finalActiveTime: formatDuration(finalActiveTime),
        totalTimeOpen: formatDuration(totalTimeOpen),
        clickSummary
      });
    };

    const fetchDeviceAndStart = async () => {
      let details = getDeviceDetails();
      try {
        if (navigator.userAgentData && typeof navigator.userAgentData.getHighEntropyValues === 'function') {
          const entropy = await navigator.userAgentData.getHighEntropyValues(['model']);
          if (entropy.model) {
            const rawModel = entropy.model;
            if (rawModel && rawModel !== 'K' && rawModel !== 'U') {
              if (DEVICE_DATABASE[rawModel]) details = `${DEVICE_DATABASE[rawModel]} (${rawModel})`;
              else if (/^SM-/i.test(rawModel)) details = `Samsung (${rawModel})`;
              else if (/^CPH|^OP4|^OPD/i.test(rawModel)) details = `OnePlus/Oppo (${rawModel})`;
              else if (/^RMX/i.test(rawModel)) details = `Realme (${rawModel})`;
              else if (/^V[0-9]{4}/i.test(rawModel) || /^VIVO/i.test(rawModel)) details = `Vivo (${rawModel})`;
              else if (/Pixel/i.test(rawModel)) details = `Google ${rawModel}`;
              else if (/POCO|Redmi|Xiaomi|Mi\s/i.test(rawModel)) details = `Xiaomi/Redmi (${rawModel})`;
              else details = `Android (${rawModel})`;
            }
          }
        }
      } catch (e) {
        console.warn("Client Hints lookup failed:", e);
      }

      deviceName.current = details;

      if (!isMounted) return;

      logSessionStart({
        sessionId: sessionId.current,
        refName: refName.current,
        deviceName: deviceName.current,
        clientReferrer: document.referrer || 'Direct / None'
      });
    };

    fetchDeviceAndStart();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (lastActiveStamp.current) {
          activeTime.current += Date.now() - lastActiveStamp.current;
          lastActiveStamp.current = null;
        }
        if (isExternalTransition.current) return;
        handleUnload();
      } else {
        lastActiveStamp.current = Date.now();
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
            if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
            transitionTimeout.current = setTimeout(() => {
              isExternalTransition.current = false;
            }, 3000);
          }
        }
      }
    };

    document.addEventListener('touchstart', handleTrigger, { capture: true, passive: true });
    document.addEventListener('mousedown', handleTrigger, { capture: true, passive: true });

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

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

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
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
    };
  }, []);

  const trackClick = (name) => {
    if (name) {
      clickCounts.current[name] = (clickCounts.current[name] || 0) + 1;
    }
  };

  return { trackClick };
};
